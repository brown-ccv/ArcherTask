const firebase = require('firebase-admin');

// Get CLI arguments
const args = process.argv.slice(2);
const [studyID, participantID, configPath] = args;

const REGISTERED_COLLECTION_NAME = 'registered_studies';
const config = require(configPath);

if (studyID === undefined || participantID === undefined) {
  // Note that throwing an Error will halt execution of this script
  throw Error(
    'studyID and participantID not given\n' +
      'Usage: npm run firebase:upload -- studyID participantID\n'
  );
} else {
  console.log(`Looking for study <${studyID}>, participant <${participantID}>...\n`);
}

// Initialize Firestore
let db;
try {
  db = firebase
    .initializeApp({
      credential: firebase.credential.cert(require('./firebase-service-account.json')),
    })
    .firestore();
} catch (error) {
  throw new Error(
    'Unable to connect to Firebase\n\n' +
      'Your secret key must be called "firebase-service-account.json" ' +
      'and stored in the root of your repository.\n' +
      // TODO 42d: Add Firebase Service Account info to docs
      'More information: https://firebase.google.com/support/guides/service-accounts\n\n' +
      error.stack
  );
}

const uploadConfigToFirebase = (participantID, studyID, config) => {
  console.log('Adding config to Firebase');

  let studyDoc;

  try {
    studyDoc = db.collection(REGISTERED_COLLECTION_NAME).doc(studyID);
  } catch (error) {
    throw new Error(`${studyID} does not exist in firebase. You must create the study first.`);
  }

  let registeredParticipants;

  try {
    registeredParticipants = studyDoc.get('registered_participants');
  } catch (error) {
    console.log(`"registered_participants" field does not exist in firebase.`);
    console.log('Creating one...');
    studyDoc.set({ registered_participants: [] });
    registeredParticipants = studyDoc.get('registered_participants');
  }

  registeredParticipants.then((result) => {
    let participants = result.data().registered_participants;
    if (!participants.includes(participantID)) {
      console.log(`${participantID} does not "registered_participants" field.`);
      console.log(`Adding ${participantID} to the field...`);
      participants.push(participantID);
      studyDoc.set({ registered_participants: participants });
    }
  });

  studyDoc.collection('config').doc(participantID).set({ config: config });
};

uploadConfigToFirebase(participantID, studyID, config);
