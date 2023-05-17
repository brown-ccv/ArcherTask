/*
A level contains one minions section and one overlord section 
*/

import { createSection } from './section';
import { shuffleArray } from './utils';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

function createSectionSpread(
  jspsych,
  settings,
  globalMean,
  levelNumber,
  { prompt, type, maxArrows, maxMinions, maxWaves, showStatus, showRunButton, showWaveStimulus }
) {
  return createSection(
    jspsych,
    settings,
    prompt,
    type,
    globalMean,
    levelNumber,
    maxArrows,
    maxMinions,
    maxWaves,
    showStatus,
    showRunButton,
    showWaveStimulus
  );
}

function createLevel(jspsych, settings, globalMean, levelNumber, minionsConfig, overlordConfig) {
  const sections = [minionsConfig, overlordConfig].map((config) =>
    createSectionSpread(jspsych, settings, globalMean, levelNumber, config)
  );

  const levelPrompt = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `Level ${levelNumber}!`,
    prompt: 'Press any key to continue...',
  };

  sections.unshift(levelPrompt);

  return sections;
}

function createLevels(jspsych, settings, globalMeans, minionsConfig, overlordConfig) {
  const shuffledMeans = shuffleArray(globalMeans);

  const levels = shuffledMeans.map((globalMean, levelNumber) =>
    createLevel(jspsych, settings, globalMean, levelNumber, minionsConfig, overlordConfig)
  );

  return levels.flat();
}

export { createLevels };
