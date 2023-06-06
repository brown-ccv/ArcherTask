import anime from 'animejs/lib/anime.es.js';
import htmlSliderResponse from './archer';
import { animationReset } from './animations';
import { handleKeyPress, getArcher } from './utils';

// Utility function to end the current wave
function endWave(jspsych) {
  jspsych.endCurrentTimeline();
  jspsych.finishTrial();
}

// Creates a htmlSliderResponse trial
function createSlider(jspsych, settings, type, data, onLoad, onFinish, status, showRunButton) {
  const { localStd, sliderMax } = settings.common;

  let runPressed = false;

  // Hanlder function for the run button
  // resets the animation and ends the current wave
  function runHandler() {
    runPressed = true;
    anime.running.forEach((anim) => {
      anim.pause();
      anim.reset();
    });
    endWave(jspsych);
    runPressed = false;
  }

  // The stimulus repurposed for displaying the
  // Run button and the current stats.
  let stimulus = () => `
<div id="html-slider-response">
  <div id="top-bar">
<div id="run-wrapper" class="pt-3">${
    showRunButton()
      ? '<button type="button" id="run-button" class="btn btn-light">RUN!</button>'
      : ''
  }</div>
    <div id="status" class="p-3"><div>
  </div>
</div>
`;

  // This function runs every time a slider loads.
  // It also calls the onLoad function passed to the enclosing function.
  function trialOnLoad() {
    // Shows the run button and adds an event listener to it
    if (showRunButton()) {
      let runButton = document.getElementById('run-button');
      runButton.disabled = false;
      runButton.addEventListener('click', runHandler);
    }

    // Determines whether a status message should be shown.
    if (status) status();

    let archer = getArcher();

    // For `feedback` types, disable interactions for the archer
    // so it only displays the results
    if (type !== 'feedback') {
      window.addEventListener('keypress', handleKeyPress);
      archer.disabled = false;
    } else {
      window.removeEventListener('keypress', handleKeyPress);
      archer.disabled = true;
    }

    // Other things that should be done when the trial loads
    if (onLoad) onLoad();
  }

  // This function runs every time a slider trial finishes
  // It also calls the onFinish function passed to the enclosing function
  function trialOnFinish(data) {
    data.runPressed = runPressed;

    // Do other stuff in the onFinish function
    if (onFinish) onFinish(data);

    // Resets the animations
    animationReset(jspsych, data, settings);

    // For feedback types, end the wave if run button is pressed
    if (data.runPressed) endWave(jspsych);
  }

  return {
    type: htmlSliderResponse,
    stimulus,
    slider_start: () => {
      // If this is feedback, simply return the last trial value
      // which is guaranteed to be a response type
      if (type === 'feedback' || !data.firstTrial()) {
        return jspsych.data.getLastTrialData().trials[0].response;
      }

      // Reset slider position only at the beginning of a wave
      return Math.round(sliderMax / 2);
    },
    max: sliderMax,
    data: {
      ...data,
      localStd,
      type,
    },
    on_finish: trialOnFinish,
    on_load: trialOnLoad,
  };
}

export default createSlider;
