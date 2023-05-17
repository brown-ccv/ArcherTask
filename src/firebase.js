import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// TODO: Upgrade to modular SDK instead of compat

// Initialize Firebase and Firestore
const RESPONSE_COLLECTION_NAME = 'participant_responses';
const REGISTERED_COLLECTION_NAME = 'registered_studies';
firebase.initializeApp({
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  databaseURL: process.env.REACT_APP_databaseURL,
  projectId: process.env.REACT_APP_projectId || 'no-firebase',
  storageBucket: process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId,
});
const db = firebase.firestore();

// Use emulator if on localhost
// TODO 173: Refactor to use NODE_ENV
if (window.location.hostname === 'localhost') db.useEmulator('localhost', 8080);

// Get a reference to the Firebase document at
// "/participant_responses/{studyID}/participants/{participantID}"
const getParticipantRef = (studyID, participantID) =>
  db.doc(`/${RESPONSE_COLLECTION_NAME}/${studyID}/participants/${participantID}`);

// Get a reference to the Firebase document at
// "/participant_responses/{studyID}/participants/{participantID}/data/{startDate}"
const getExperimentRef = (studyID, participantID, startDate) =>
  db.doc(`${getParticipantRef(studyID, participantID).path}/data/${startDate}`);

/**
 * Validate the given studyID & participantID combo
 * @param {string} studyID The ID of a given study in Firebase
 * @param {string} participantID The ID of a given participant inside the studyID
 * @returns true if the given studyID & participantID combo is in Firebase, false otherwise
 */
// TODO 174: Reverse participantID and studyID order
async function validateParticipant(participantID, studyID) {
  try {
    // .get() will fail on an invalid path
    await getParticipantRef(studyID, participantID).get();
    return true;
  } catch (error) {
    console.error('Unable to validate the experiment:\n', error);
    return false;
  }
}

/**
 * Initialize a new experiment in Firebase
 * Each experiment is its own document in the "data" subcollection. startDate is used as the ID
 * @param {string} studyID The ID of a given study in Firebase
 * @param {string} participantID The ID of a given participant inside the studyID
 * @param {string} startDate The ID of a given participant inside the studyID and participantID
 * @returns true if able to initialize the new experiment, false otherwise
 */
// TODO 174: Reverse participantID and studyID order
async function initParticipant(participantID, studyID, startDate) {
  try {
    const experiment = getExperimentRef(studyID, participantID, startDate);
    await experiment.set({
      start_time: startDate,
      // TODO 173: app_version and app_platform are deprecated
      app_version: window.navigator.appVersion,
      app_platform: window.navigator.platform,
      // TODO 175: Store participantID and studyID here, not on each trial
    });
    console.log('Initialized experiment:', studyID, participantID, startDate);
    return true;
  } catch (error) {
    console.error('Unable to initialize the experiment:\n', error);
    return false;
  }
}

const getFirestoreConfig = (studyID, docName) => {
  return db
    .collection(REGISTERED_COLLECTION_NAME)
    .doc(studyID)
    .collection('config')
    .doc(docName)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return JSON.parse(doc.data().config);
      } else {
        console.log(`Document ${docName} does not exist`);
        return false;
      }
    })
    .catch((error) => console.log('Error in getting config:', error));
};

/**
 * Gets the config object for the logged-in participant, or uses the default for the study. The config object
 * is a string.
 * @param {string} studyID The study ID specified at login.
 * @param {string} participantID The logged in participant ID.
 */
const firestoreConfig = async (studyID, participantID) => {
  const pConfig = await getFirestoreConfig(studyID, participantID);
  const defaultConfig = await getFirestoreConfig(studyID, 'default');
  if (pConfig) {
    return pConfig;
  } else if (defaultConfig) {
    return defaultConfig;
  } else {
    return false;
  }
};

const addConfigToFirebase = (participantID, studyID, startDate, config) => {
  console.log('Adding config to Firebase');
  db.collection(RESPONSE_COLLECTION_NAME)
    .doc(studyID)
    .collection('participants')
    .doc(participantID)
    .collection('data')
    .doc(startDate)
    .update({ config: config });
};

/**
 * Adds a JsPsych trial to Firebase.
 * Each trial is its own document in the "trials" subcollection
 * @param {any} data The JsPsych data object from a single trial
 */
async function addToFirebase(data) {
  const studyID = data.study_id;
  const participantID = data.participant_id;
  const startDate = data.start_date;

  if (data.type === 'minions' || data.type === 'overlord') {
    console.log(data);
    try {
      const experiment = getExperimentRef(studyID, participantID, startDate);
      await experiment.collection('trials').add(data);
    } catch (error) {
      console.error('Unable to add trial:\n', error);
    }
  }
}

export {
  db,
  getExperimentRef,
  validateParticipant,
  initParticipant,
  addToFirebase,
  firestoreConfig,
  addConfigToFirebase,
};
export default firebase;
