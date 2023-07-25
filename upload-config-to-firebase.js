const firebase = require('firebase-admin');
const { program } = require('commander');

const REGISTERED_COLLECTION_NAME = 'registered_studies';

program
  .description('Add a config file to the firestore database.')
  .argument('<study_id>', 'The ID of the study')
  .argument('<participant_id>', 'The ID of the participant')
  .argument('<config_path>', 'The path to the config file in JSON')
  .action(uploadToFirebase)
  .parseAsync();

async function uploadToFirebase(studyID, participantID, configPath) {
  if (!studyID || !participantID || !configPath) {
    // Note that throwing an Error will halt execution of this script
    throw Error('Study ID, ParticipantID, or path to the config file not given');
  } else {
    console.log(`Study <${studyID}>, participant <${participantID}> specified.\n`);
  }

  const config = require(configPath);
  console.log(`Located config JSON file at ${configPath}`);

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

  async function uploadConfigToFirebase(participantID, studyID, config) {
    console.log('Adding config to Firebase');

    let studyDoc;

    try {
      studyDoc = await db.collection(REGISTERED_COLLECTION_NAME).doc(studyID);
    } catch (error) {
      throw new Error(`${studyID} does not exist in firebase. You must create the study first.`);
    }

    let registeredParticipants;

    try {
      registeredParticipants = await studyDoc.get();
    } catch (error) {
      console.log(`"registered_participants" field does not exist in firebase.`);
      console.log('Creating one...');
      await studyDoc.set({ registered_participants: [] });
      registeredParticipants = await studyDoc.get('registered_participants');
    }

    let participants = registeredParticipants.data().registered_participants;
    if (!participants.includes(participantID)) {
      console.log(`${participantID} does not exist in the "registered_participants" field.\n`);
      console.log(`Adding ${participantID} to the field...\n`);
      participants.push(participantID);
      await studyDoc.set({ registered_participants: participants });
    }

    await studyDoc.collection('config').doc(participantID).set({ config: config });
  }

  await uploadConfigToFirebase(participantID, studyID, config);
}
