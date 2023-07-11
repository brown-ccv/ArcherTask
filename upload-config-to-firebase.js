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
  db.collection(REGISTERED_COLLECTION_NAME)
    .doc(studyID)
    .collection('config')
    .doc(participantID)
    .set({ config: config });
};

uploadConfigToFirebase(participantID, studyID, config);
