import createSlider from './slider';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { normalRandomInRange } from './random';
import { isHit, pressSpace, getArcher } from './utils';
import { playAnimation } from './animations';

function createSection(
  jspsych,
  grand_mean,
  grand_sd,
  sd,
  type,
  max,
  maxArrows,
  maxWave,
  showStatusMessage,
  waveStimulus,
  waveStimulusDuration,
  sectionStimulus,
  sectionStimulusDuration,
  settings
) {
  // A section consists of:
  // Section prompt: Shows only once at the beginning of the section
  // Wave prompt: shows at the beginning of each wave
  // Type: the type of the section, can be "practice", "minion", and "overlord"

  // The state of the number of arrows is shared in each section
  // This function mimics useState in React that allows
  // individual trials to get and mutate the number of arrows left.
  const arrowsState = (n_arrows) => {
    let arrows = n_arrows;

    return [() => arrows, (n) => (arrows = n)];
  };

  const [getArrows, setArrows] = arrowsState(maxArrows);

  function createWave(mean, sd, type, waveNumber) {
    // The state of whether the run button should be shown is shared in each wave
    // This function mimics useState in React that allows
    // individual trials to get and mutate the show button state.
    const runButtonState = (state) => {
      let buttonState = state;

      return [() => buttonState, (state) => (buttonState = state)];
    };
    const [getRunButtonState, setRunButtonState] = runButtonState(false);

    const isOverlord = type === 'overlord';

    // Sets up another state to log events
    const inputsState = (initState) => {
      let state = initState;

      return [() => state, (e) => state.push(e), () => (state = [])];
    };
    const [getInputs, addInputs, resetInputs] = inputsState([]);

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
      enableEventLogging();
    }

    function responseOnFinish(data) {
      const { arrowSize, minionSize, overlordSize } = settings.interface;
      const { min, max } = settings.slider;
      if (data.type && data.type !== 'practice1') setRunButtonState(true);
      data.targetValue = normalRandomInRange(data.mean, data.sd, min, max);
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
      maxWave,
      showStatusMessage,
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
      maxWave,
      showStatusMessage,
      getRunButtonState,
      settings
    );

    // The trial for the prompt of each wave
    let wavePrompt = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `Wave ${waveNumber + 1}!`,
      prompt: 'Press any key to continue...',
      trial_duration: waveStimulusDuration,
    };

    // The timeline that loops forever as long as there are still arrows left
    let loopedTimeline = {
      timeline: [response, feedback],
      loop_function: () => getArrows() > 0,
      conditional_function: () => getArrows() > 0,
    };

    // A wave consists of a prompt for the wave and the response-feedback loop
    return {
      timeline: [wavePrompt, loopedTimeline],
      conditional_function: () => getArrows() > 0,
      timeline_on_load: () => {
        window.removeEventListener('keypress', pressSpace);
      },
    };
  }

  // The trial for the prompt of each section
  let sectionPrompt = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: sectionStimulus,
    prompt: 'Press any key to continue...',
    trial_duration: sectionStimulusDuration,
  };

  // A section is just its prompt and maxWave number of waves
  let waves = Array.from({ length: maxWave }, (_, i) => {
    const { min, max } = settings.slider;
    return createWave(normalRandomInRange(grand_mean, grand_sd, min, max), sd, type, i);
  });

  return {
    timeline: [sectionPrompt].concat(waves),
  };
}

export { createSection };
