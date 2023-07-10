import jsPsychInstructions from '@jspsych/plugin-instructions';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import prompts from '../config/prompts';
import { createSection } from './section';
import { createLevels } from './level';
import { normalRandomInRange } from './utils';

// Add your jsPsych timeline here.
// Honeycomb will call this function for us after the subject logs in, and run the resulting timeline.
// The instance of jsPsych passed in will include jsPsychOptions above, plus other options needed by Honeycomb.
function buildTimeline(jspsych, settings) {
  const sectionConfigs = settings.sections;
  const { globalMeans, globalStd, sliderMax } = settings.common;
  const { maxArrows, maxWaves, maxTrials } = sectionConfigs.minions;
  const allPrompts = prompts(maxArrows, maxWaves, maxTrials, globalMeans.length);
  const globalMeanForPractice = normalRandomInRange(
    Math.round(sliderMax / 2),
    globalStd,
    0,
    sliderMax
  );

  const createSectionCurried = (
    prompt,
    { type, maxArrows, maxWaves, maxTrials, showStatus, showRunButton, showWaveStimulus }
  ) =>
    createSection(
      jspsych,
      settings,
      type,
      prompt,
      globalMeanForPractice,
      0,
      maxArrows,
      maxWaves,
      maxTrials,
      showStatus,
      showRunButton,
      showWaveStimulus
    );

  const instructionTrials = allPrompts.instructions.map((pages) => {
    return {
      type: jsPsychInstructions,
      pages,
      show_clickable_nav: true,
    };
  });

  const practiceSections = [1, 2, 3, 4]
    .map((d) => 'practice' + d)
    .map((name) => createSectionCurried(allPrompts[name], sectionConfigs[name]));

  const levels = createLevels(
    jspsych,
    settings,
    globalMeans,
    allPrompts.minions,
    allPrompts.overlord,
    sectionConfigs.minions,
    sectionConfigs.overlord
  );

  const timeline = [0, 1, 2, 3]
    .map((i) => [instructionTrials[i], practiceSections[i]])
    .flat()
    .concat(levels);

  const outro = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: allPrompts.outro,
  };

  timeline.push(outro);

  return timeline;
}

// Honeycomb, please include these options, and please get the timeline from this function.
export { buildTimeline };
