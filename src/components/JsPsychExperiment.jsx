import { initJsPsych } from 'jspsych';
import React, { useEffect, useMemo } from 'react';

import { config } from '../config/main';
import { initParticipant, firestoreConfig, addConfigToFirebase } from '../firebase';
import { buildTimeline } from '../timelines/main';

import settings from '../config/settings.json';
import minionImg from '../assets/images/minion.png';
import overlordImg from '../assets/images/overlord.png';
import explosionGif from '../assets/images/explosion.gif';

function JsPsychExperiment({
  participantId,
  studyId,
  taskVersion,
  dataUpdateFunction,
  dataFinishFunction,
}) {
  // This will be the div in the dom that holds the experiment.
  // We reference it explicitly here so we can do some plumbing with react, jspsych, and events.
  const experimentDivId = 'jspsych-main';

  // Combine custom options imported from timelines/main.js, with necessary Honeycomb options.
  const combinedOptions = {
    display_element: experimentDivId,
    experiment_width: 1000,
    on_data_update: (data) => dataUpdateFunction(data),
    on_finish: (data) => dataFinishFunction(data),
  };

  // Start date of the experiment - used as the UID
  // TODO 169: JsPsych has a built in timestamp function
  const startDate = new Date().toISOString();

  // Create the instance of jsPsych that we'll reuse within the scope of this JsPsychExperiment component.
  // As of jspsych 7, we create our own jspsych instance(s) where needed instead of importing one global instance.
  const jsPsych = useMemo(() => {
    // Write the initial record to Firestore
    if (config.USE_FIREBASE) initParticipant(participantId, studyId, startDate);

    const jsPsych = initJsPsych(combinedOptions);
    // Add experiment properties into jsPsych directly
    jsPsych.data.addProperties({
      participant_id: participantId,
      study_id: studyId,
      start_date: startDate,
      task_version: taskVersion,
    });
    return jsPsych;
  }, [participantId, studyId, taskVersion]);

  // These useEffect callbacks are similar to componentDidMount / componentWillUnmount.
  // If necessary, useLayoutEffect callbacks might be even more similar.
  useEffect(async () => {
    let tlConfig;
    if (config.USE_FIREBASE) {
      tlConfig = await firestoreConfig(studyId, participantId);
      if (!tlConfig) {
        tlConfig = settings;
      }
    }

    addConfigToFirebase(participantId, studyId, startDate, tlConfig);

    const timeline = buildTimeline(jsPsych, tlConfig);
    jsPsych.run(timeline);

    return () => {
      try {
        jsPsych.endExperiment('Ended Experiment');
      } catch (e) {
        console.error('Experiment closed before unmount');
      }
    };
  }, []);

  return (
    <div id='jspsych-container' className='rounded-5 bg-white mt-5 shadow-sm'>
      <div id='jspsych-main'></div>
      <div id='arrow'></div>
      <div id='minion'>
        <img src={minionImg} width='13px' height='13px' />
      </div>
      <div id='overlord'>
        <img src={overlordImg} width='17px' height='17px' />
      </div>
      <div id='explosion'>
        <img src={explosionGif} width='0px' height='0px' />
      </div>
    </div>
  );
}

export default JsPsychExperiment;
