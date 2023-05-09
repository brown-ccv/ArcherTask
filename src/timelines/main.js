import jsPsychInstructions from '@jspsych/plugin-instructions';
import jsPsychKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import settings from '../config/settings';
import { createSection } from './section';

const {
  grand_mean,
  grand_sd,
  sd,
  slider,
  maxArrows,
  waves,
  showStatusMessage,
  waveStimulus,
  waveStimulusDuration,
  sectionStimulusDuration,
} = settings;

const max = slider.max;

const pages = [
  `<p>Welcome!</p>
  <p>Thank you for voluteering for this experiment.</p>`,
  `<p>You are going to play a computer game.</p>
  <p>Then next screens will show you instructions for what you have to do.</p>`,
];

const instruction = {
  type: jsPsychInstructions,
  pages,
  show_clickable_nav: true,
};

const createSectionCurried = (jspsych, type, maxArrows, maxWaves, sectionStimulus) => {
  return createSection(
    jspsych,
    grand_mean,
    grand_sd,
    sd,
    type,
    max,
    maxArrows,
    maxWaves,
    showStatusMessage,
    waveStimulus,
    waveStimulusDuration,
    sectionStimulus,
    sectionStimulusDuration
  );
};

const practiceSection1 = (jspsych) => {
  return createSectionCurried(
    jspsych,
    'practice1',
    10,
    3,
    'You will now practice shooting at several minions in a wave, and adjusting your aim'
  );
};

const practiceSection2 = (jspsych) => {
  return createSectionCurried(
    jspsych,
    'practice2',
    10,
    3,
    `<p>To end the current wave of minions by running away,<br />click the RUN button at the top left of the screen.</p>
  <p>This will immediately skip the rest of the minions, and advance you to a new wave.</p>`
  );
};

const minionSection = (jspsych) => {
  return createSectionCurried(
    jspsych,
    'minion',
    maxArrows,
    waves,
    'You are now ready to start! You will face ten waves of minions, followed by the overlord.'
  );
};

const overlordSection = (jspsych) => {
  return createSectionCurried(jspsych, 'overlord', 1, 1, 'The Overlord is coming!');
};

const outro = {
  type: jsPsychKeyboardResponse,
  stimulus: 'Thank you for participating in this experiment!',
};

// Add your jsPsych timeline here.
// Honeycomb will call this function for us after the subject logs in, and run the resulting timeline.
// The instance of jsPsych passed in will include jsPsychOptions above, plus other options needed by Honeycomb.
const buildTimeline = (jspsych) => [
  instruction,
  practiceSection1(jspsych),
  practiceSection2(jspsych),
  minionSection(jspsych),
  overlordSection(jspsych),
  outro,
];

// Honeycomb, please include these options, and please get the timeline from this function.
export { buildTimeline };
