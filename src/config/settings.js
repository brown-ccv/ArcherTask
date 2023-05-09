export const settings = {
  grand_mean: 100,
  grand_sd: 20,
  sd: 5,
  maxArrows: 200,
  waves: 30,
  showStatusMessage: true,
  sectionStimulusDuration: 5000,
  waveStimulus: (waveNumber) => `Wave ${waveNumber + 1}!`,
  waveStimulusDuration: 2000,
  slider: {
    min: 0,
    max: 200,
    start: 100,
  },
  animation: {
    arrowDuration: 2000,
    explosionDuration: 1000,
    arrowDelay: 100,
    enemyDelay: 300,
  },
  data: {
    maxEvents: 500,
  },
  interface: {
    arrowSize: 3,
    minionSize: 13,
    overlordSize: 17,
  },
};

export default settings;

// things to customize
// make a new screen after pressing run (and customize duration of that screen)
// bacground
