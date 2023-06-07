import jsPsychInstructions from '@jspsych/plugin-instructions';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import prompts from '../config/prompts';
import { createSection } from './section';

// Add your jsPsych timeline here.
// Honeycomb will call this function for us after the subject logs in, and run the resulting timeline.
// The instance of jsPsych passed in will include jsPsychOptions above, plus other options needed by Honeycomb.
function buildTimeline(jspsych, settings) {
  const sectionConfigs = settings.sections;
  const { maxArrows, maxMinions, maxWaves } = sectionConfigs.minions;
  const allPrompts = prompts(maxArrows, maxMinions, maxWaves);

  const createSectionCurried = (prompt, sectionConfig) => {
    const { type, maxArrows, maxMinions, maxWaves, showStatus, showRunButton, showWaveStimulus } =
      sectionConfig;
    return createSection(
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
    );
  };

  const instructionSections = allPrompts.instructions.map((pages) => {
    return {
      type: jsPsychInstructions,
      pages,
      show_clickable_nav: true,
    };
  });

  const allSections = [1, 2, 3, 4]
    .map((d) => 'practice' + d)
    .concat(['minions', 'overlord'])
    .map((name) => createSectionCurried(allPrompts[name], sectionConfigs[name]));

  const timeline = [0, 1, 2, 3]
    .map((i) => [instructionSections[i], allSections[i]])
    .flat()
    .concat(allSections.slice(4, 6));

  const outro = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: allPrompts.outro,
  };

  timeline.push(outro);

  return timeline;
}

// Honeycomb, please include these options, and please get the timeline from this function.
export { buildTimeline };
