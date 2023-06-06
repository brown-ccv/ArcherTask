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
  prompt,
  { type, maxArrows, maxWaves, maxTrials, showStatus, showRunButton, showWaveStimulus }
) {
  return createSection(
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
  );
}

function createLevel(
  jspsych,
  settings,
  globalMean,
  levelNumber,
  overlordPrompt,
  minionsConfig,
  overlordConfig
) {
  const minionsSection = createSectionSpread(
    jspsych,
    settings,
    globalMean,
    levelNumber,
    null,
    minionsConfig
  );
  const overlordSection = createSectionSpread(
    jspsych,
    settings,
    globalMean,
    levelNumber,
    overlordPrompt,
    overlordConfig
  );

  return [minionsSection, overlordSection];
}

function createLevels(
  jspsych,
  settings,
  globalMeans,
  minionsPrompt,
  overlordPrompt,
  minionsConfig,
  overlordConfig
) {
  const shuffledMeans = shuffleArray(globalMeans);

  let levels = shuffledMeans.map((globalMean, levelNumber) => {
    const levelPrompt = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `Level ${levelNumber + 1}!`,
      prompt: 'Press any key to continue...',
      data: {
        levelNumber: levelNumber + 1,
      },
    };
    const level = createLevel(
      jspsych,
      settings,
      globalMean,
      levelNumber + 1,
      overlordPrompt,
      minionsConfig,
      overlordConfig
    );

    level.unshift(levelPrompt);

    return level;
  });

  const sectionPrompt = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: minionsPrompt,
    prompt: 'Press any key to continue...',
    trial_duration: settings.common.sectionStimulusDuration,
  };

  levels = levels.flat();
  levels.unshift(sectionPrompt);

  return levels;
}

export { createLevels };
