import createSlider from './slider';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { isHit, getArcher, normalRandomInRange } from './utils';
import { playAnimation } from './animations';

function createSection(
  jspsych,
  settings,
  type,
  prompt,
  globalMean,
  levelNumber,
  maxArrows,
  maxWaves,
  maxTrials,
  showStatus,
  showRunButton,
  showWaveStimulus
) {
  // A section consists of:
  // Section prompt: Shows only once at the beginning of the section
  // Wave prompt: shows at the beginning of each wave
  // Type: the type of the section, can be "practice", "minion", and "overlord"

  // The state of the number of arrows is shared in each section
  // This function mimics useState in React that allows
  // individual trials to get and mutate the number of arrows left.

  const { globalMeans, globalStd, sliderMax, sectionStimulusDuration, waveStimulusDuration } =
    settings.common;

  function calculateScore() {
    let score;

    if (type === 'minion' || type === 'overlord') {
      score = jspsych.data.get().filter({ type: 'minion', hit: true }).count();
      score += jspsych.data.get().filter({ type: 'overlord', hit: true }).count() * 50;

      return score;
    }

    return jspsych.data.get().filter({ type, hit: true }).count();
  }

  let score = calculateScore();
  let arrowsLeft;

  // arrowsLeft should carry over in game
  if (type === 'minion' || type === 'overlord') {
    let prevTrials = jspsych.data
      .get()
      .filterCustom((data) => data.type === 'minion' || data.type === 'overlord');

    if (prevTrials.count() > 0) {
      arrowsLeft = prevTrials.last(1).trials[0].arrowsLeft;
    } else {
      arrowsLeft = maxArrows;
    }
  } else {
    arrowsLeft = maxArrows;
  }

  let localMean = 0;
  let waveNumber = 0;
  let maxLevels = globalMeans.length;
  let firstTrialOfWave = false;

  function createTrials(type) {
    // The state of whether the run button should be shown is shared in each wave
    // This function mimics useState in React that allows
    // individual trials to get and mutate the show button state.

    // Sets up another state to log events
    let inputs = [];

    let trialNumber = 0;

    const isOverlord = type === 'overlord';

    // Decides which data to log in each input event
    function logInputs(e) {
      const interactiveData = {
        type: e.type,
        timestamp: e.timeStamp,
        value: parseInt(e.target.value, 10),
      };
      inputs.push(interactiveData);
    }

    // Determines which events to log
    const watchedEvents = ['input', 'mousedown', 'mouseup', 'keydown', 'keyup'];

    function enableEventLogging() {
      inputs = [];
      let archer = getArcher();

      watchedEvents.forEach((d) => archer.addEventListener(d, logInputs));
    }

    function disableEventLogging() {
      let archer = getArcher();

      watchedEvents.forEach((d) => archer.removeEventListener(d, logInputs));
    }

    // Sets the status message given current state
    function setStatus() {
      let status = document.getElementById('status');
      let statusMsg =
        `Score: ${score}&nbsp;&nbsp;&nbsp;Arrows: ${arrowsLeft}/${maxArrows}` + '<br />';
      if (maxTrials) {
        let trialNumber = jspsych.data.getLastTrialData().trials[0].trialNumber;
        if (!trialNumber || (type !== 'feedback' && trialNumber != maxTrials)) {
          trialNumber = 1;
        }
        statusMsg += `Trial ${trialNumber}/${maxTrials}&nbsp;&nbsp;&nbsp;`;
      }

      statusMsg += `Wave ${waveNumber}/${maxWaves}&nbsp;&nbsp;&nbsp;`;
      statusMsg += levelNumber ? `Level ${levelNumber}/${maxLevels}` : 'Practice Level';
      status.innerHTML = statusMsg;
    }

    // Creates the callback functions for the response trials
    function responseOnLoad() {
      let archer = getArcher();
      archer.focus({ focusVisible: false });
      archer.addEventListener('blur', () => archer.focus());
      enableEventLogging();
    }

    function responseOnFinish(data) {
      const { arrowSize, minionSize, overlordSize } = settings.interface;
      data.targetValue =
        type === 'overlord'
          ? globalMean
          : normalRandomInRange(data.localMean, data.localStd, 0, sliderMax);
      data.hit = isHit(
        data.response,
        data.targetValue,
        type === 'overlord',
        arrowSize,
        minionSize,
        overlordSize
      );
      data.scoreAfter = data.scoreBefore + data.hit * (type === 'overlord' ? 50 : 1);
      let events = inputs;
      if (events && events.length > settings.data.maxEvents) {
        events = events.slice(500);
      }
      data.events = events;
      firstTrialOfWave = false;
    }

    // Creates the callback functions for the feedback trials
    function feedbackOnLoad() {
      disableEventLogging();
      const isHit = jspsych.data.getLastTrialData().trials[0].hit;
      playAnimation(jspsych, isOverlord, isHit, settings);
    }

    function feedbackOnFinish(data) {
      const lastTrialData = jspsych.data.get().last(2).trials[0];
      data.hit = lastTrialData.hit;
      data.scoreAfter = data.scoreBefore + data.hit * (type === 'overlord' ? 50 : 1);
      data.response = lastTrialData.response;
    }

    const sharedData = {
      maxArrows,
      maxWaves,
      maxTrials,
      maxLevels,
      levelNumber,
      firstTrial: () => firstTrialOfWave,
      localMean: () => localMean,
      waveNumber: () => waveNumber,
      trialNumber: () => trialNumber,
      scoreBefore: () => score,
    };

    const responseData = {
      ...sharedData,
      arrowsLeft: () => arrowsLeft,
    };

    const feedbackData = {
      ...sharedData,
      arrowsLeft: () => --arrowsLeft,
    };

    // Creates a trial and a feedback respectively
    const response = createSlider(
      jspsych,
      settings,
      type,
      responseData,
      responseOnLoad,
      responseOnFinish,
      showStatus ? setStatus : null,
      () => showRunButton && !firstTrialOfWave
    );

    const feedback = createSlider(
      jspsych,
      settings,
      'feedback',
      feedbackData,
      feedbackOnLoad,
      feedbackOnFinish,
      showStatus ? setStatus : null,
      () => showRunButton && !firstTrialOfWave
    );

    const loop = [response, feedback];

    function continueTrials() {
      if (!maxTrials) {
        return arrowsLeft > 0;
      }
      return arrowsLeft > 0 && trialNumber < maxTrials;
    }

    // The timeline that loops forever as long as there are still arrows left
    const loopedTrials = {
      timeline: loop,
      loop_function: continueTrials,
      conditional_function: continueTrials,
      on_timeline_start: () => {
        trialNumber++;
        score = calculateScore();
      },
    };

    return loopedTrials;
  }

  // A section is just its prompt and maxWave number of waves
  const trials = createTrials(type);
  const continueWaves = () => arrowsLeft > 0 && waveNumber < maxWaves;

  const waves = {
    timeline: [trials],
    conditional_function: continueWaves,
    loop_function: continueWaves,
    on_timeline_start: () => {
      localMean = normalRandomInRange(globalMean, globalStd, 0, sliderMax);
      waveNumber++;
      firstTrialOfWave = true;
    },
  };

  if (showWaveStimulus) {
    const wavePrompt = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => `Wave ${waveNumber}`,
      prompt: 'Press any key to continue...',
      trial_duration: waveStimulusDuration,
    };

    waves.timeline.unshift(wavePrompt);
  }

  if (!prompt) {
    return waves;
  }

  // The trial for the prompt of each section
  const sectionPrompt = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: prompt,
    prompt: 'Press any key to continue...',
    trial_duration: sectionStimulusDuration,
  };

  return {
    timeline: [sectionPrompt, waves],
  };
}

export { createSection };
