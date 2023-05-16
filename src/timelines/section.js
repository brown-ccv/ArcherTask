import createSlider from './slider';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { isHit, handleKeyPress, getArcher, normalRandomInRange } from './utils';
import { playAnimation } from './animations';
import { numberState, runButtonState, inputsState } from './hooks';

function createSection(
  jspsych,
  settings,
  prompt,
  type,
  maxArrows,
  maxMinions,
  maxWaves,
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

  const { grand_mean, grand_sd, sd, max, waveStimulusDuration, sectionStimulusDuration } =
    settings.common;

  const [getArrows, setArrows] = numberState(maxArrows);

  function createWave(mean, sd, type, waveNumber) {
    // The state of whether the run button should be shown is shared in each wave
    // This function mimics useState in React that allows
    // individual trials to get and mutate the show button state.
    const [getRunButtonState, setRunButtonState] = runButtonState(false);

    // Sets up another state to log events
    const [getInputs, addInputs, resetInputs] = inputsState([]);
    const [getMinions, setMinions] = numberState(0);

    const isOverlord = type === 'overlord';

    // Decides which data to log in each input event
    function logInputs(e) {
      const interactiveData = {
        type: e.type,
        timestamp: e.timeStamp,
        value: parseInt(e.target.value, 10),
      };
      addInputs(interactiveData);
    }

    // Determines which events to log
    const watchedEvents = ['input', 'mousedown', 'mouseup', 'keydown', 'keyup'];

    function enableEventLogging() {
      resetInputs();
      let archer = getArcher();

      watchedEvents.forEach((d) => archer.addEventListener(d, logInputs));
    }

    function disableEventLogging() {
      let archer = getArcher();

      watchedEvents.forEach((d) => archer.removeEventListener(d, logInputs));
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
      if (showRunButton) setRunButtonState(true);
      data.targetValue = normalRandomInRange(data.mean, data.sd, 0, max);
      data.hit = isHit(
        data.response,
        data.targetValue,
        type === 'overlord',
        arrowSize,
        minionSize,
        overlordSize
      );
      let events = getInputs();
      if (events && events.length > settings.data.maxEvents) {
        events = events.slice(500);
      }
      data.events = events;
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
      setMinions(getMinions() + 1);
    }

    // Creates a trial and a feedback respectively
    let response = createSlider(
      jspsych,
      mean,
      sd,
      max,
      type,
      responseOnLoad,
      responseOnFinish,
      getArrows,
      setArrows,
      maxArrows,
      waveNumber,
      maxWaves,
      showStatus,
      getRunButtonState,
      settings
    );

    let feedback = createSlider(
      jspsych,
      mean,
      sd,
      max,
      'feedback',
      feedbackOnLoad,
      feedbackOnFinish,
      getArrows,
      setArrows,
      maxArrows,
      waveNumber,
      maxWaves,
      showStatus,
      getRunButtonState,
      settings
    );

    // The timeline that loops forever as long as there are still arrows left
    let loopedTimeline = {
      timeline: [response, feedback],
      conditional_function: () => getArrows() > 0 && getMinions() < maxMinions,
      loop_function: () => getArrows() > 0 && getMinions() < maxMinions,
    };

    if (!showWaveStimulus) {
      return loopedTimeline;
    }

    // The trial for the prompt of each wave
    let wavePrompt = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `Wave ${waveNumber + 1}!`,
      prompt: 'Press any key to continue...',
      trial_duration: waveStimulusDuration,
    };

    return {
      timeline: [wavePrompt, loopedTimeline],
      conditional_function: () => getArrows() > 0,
      timeline_on_load: () => {
        window.removeEventListener('keypress', handleKeyPress);
      },
    };

    // A wave consists of a prompt for the wave and the response-feedback loop
  }

  // The trial for the prompt of each section
  let sectionPrompt = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: prompt,
    prompt: 'Press any key to continue...',
    trial_duration: sectionStimulusDuration,
  };

  // A section is just its prompt and maxWave number of waves
  let waves = Array.from({ length: maxWaves }, (_, i) => {
    return createWave(normalRandomInRange(grand_mean, grand_sd, 0, max), sd, type, i);
  });

  return {
    timeline: [sectionPrompt].concat(waves),
  };
}

export { createSection };
