/**
 * Connect to Firestore using a service account, and download participant response data.
 *
 * Usage:
 *   npm run firebase:download -- studyID participantID [sessionNumber] [outputRoot]
 *
 *   studyID        must be one of the study Ids that a participant can log in with
 *   participantID  must be one of the participant Ids that a participant can log in with
 *   sessionNumber  optional number to select which session to download, defaults to "latest", ie the most recent session
 *   outputRoot     optional path to the folder where data should be saved, defaults to ".", ie the current folder
 *
 * Before using this, you have to do a little setup.
 *
 * You must be a project owner for the Firebase project that you want to get data from.
 * Then you must set up a service account to allow your local machine to access the data.
 * The official docs for this are here: https://cloud.google.com/docs/authentication/production
 *
 * And here's a summary:
 *  - Visit the Firebase console at https://console.firebase.google.com/
 *  - Click on the Firebase project you want to get data from
 *  - In the top left, click on the gear next to "Project Overview"
 *  - Click on "Users and permissions"
 *  - Click on the "Service accounts" tab
 *  - Near the bottom click "Generate new Private key"
 *  - Save the key on your local machine and remember where you put it (don't save it inside this repo)
 *
 * This Private key is a secret, so be careful with it!
 * Do not save it inside this repo or commit it to git.
 * Do not share it.
 * You may wish to restrict the file permissions on it so only you can access it.
 * For example: "chmod 600 path/to/serviceAccountKey.json".
 * You may also wish to delete it when you're done.
 * Do not share it!
 *
 * In this repo:
 *  - Edit the file env/.env.firebase-download
 *  - Paste in the path to your private key file on your local machine.  For example:
 *      GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
 *
 * Now you can run this script, and it will automatically connect to Firebase using your service account.
 *
 * You can run this with two arguments, studyID and participantID, like this:
 *   npm run firebase:download -- myStudyId myParticipantId
 *
 * This will save data from the last available session for that study and participant.
 * It will also list out all the available sessions.  For example:
 *   Found 3 sessions:
 *     0: 2022-07-26T22:04:55.544Z
 *     1: 2022-07-27T14:16:36.301Z
 *     2: 2022-07-27T19:56:26.229Z
 *
 * If you want to save a different session, you can choose it by passing in the session number as a third argument.  For example:
 *   npm run firebase:download -- myStudyId myParticipantId 0
 *
 * By default, this will save response data in a subfolder of the current folder.
 * The subfolder and file name will be chosen to avoid naming collisions, for example:
 *   ./participant_responses/{session Id}/{participant Id}/{session date}.json
 *
 * Instead of the current folder, you can specify an alternative place to store data.  For example:
 *  npm run firebase:download -- myStudyId myParticipantId latest /path/to/my/data
 *
 * This will result in data saved to
 *  /path/to/my/data/participant_responses/{session Id}/{participant Id}/{session date}.json
 */

// TODO 172: Refactor to a CJS module
const fs = require('fs-extra');
const firebase = require('firebase-admin');
const { program } = require('commander');

program
  .description(
    'Connect to Firestore using a service account, and download participant response data.'
  )
  .argument('<study_id>', `Must be one of the study Ids that a participant can log in with.`)
  .argument(
    '<participant_id>',
    'Must be one of the participant Ids that a participant can log in with.'
  )
  .argument(
    '[session_number]',
    'Optional number to select which session to download, defaults to "latest", ie the most recent session.',
    'latest'
  )
  .argument(
    '[output_root]',
    'Optional path to the folder where data should be saved, defaults to ".", ie the current folder.',
    '.'
  )
  .action(downloadResponseData)
  .parseAsync();

async function downloadResponseData(studyID, participantID, sessionNumber, outputRoot) {
  if (sessionNumber !== 'latest') {
    sessionNumber = parseInt(sessionNumber);
  }

  if (studyID === undefined || participantID === undefined) {
    // Note that throwing an Error will halt execution of this script
    throw Error(
      'studyID and participantID not given\n' +
        'Usage: npm run firebase:download -- studyID participantID [sessionNumber] [outputRoot]\n'
    );
  } else {
    console.log(
      `Looking for response data for study <${studyID}>, participant <${participantID}>, ` +
        `sessionNumber <${sessionNumber}>, outputRoot <${outputRoot}>.\n`
    );
  }

  let firebaseCredential;
  try {
    firebaseCredential = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  } catch (err) {
    console.error(
      'Unable to locate firebase credential specified in .env.firebase-download, using "firebase-service-account.json" in your repo instead'
    );
  }

  // Initialize Firestore
  let db;
  try {
    firebaseCredential = firebaseCredential
      ? firebaseCredential
      : require('./firebase-service-account.json');
    db = firebase
      .initializeApp({
        credential: firebase.credential.cert(firebaseCredential),
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

  // Query Firestore for the participantID on the given studyID
  const dataRef = db.collection(
    `participant_responses/${studyID}/participants/${participantID}/data`
  );
  const dataSnapshot = await dataRef.get();
  const experiments = dataSnapshot.docs;

  // Summarize results
  if (experiments) {
    console.log(`Found ${experiments.length} session(s):`);
  } else {
    throw new Error('No sessions found.');
  }
  dataSnapshot.docs.forEach((experiment, idx) => console.log(`\t${idx}: ${experiment.id}`));
  console.log();

  let experimentDoc;

  // TODO 172: Convert to new regex check for ID?
  if (isNaN(sessionNumber) || sessionNumber > dataSnapshot.size - 1) {
    console.log('Invalid session number, retrieving latest session');
    experimentDoc = dataSnapshot.docs[dataSnapshot.size - 1];
  } else if (sessionNumber === 'latest') {
    console.log('Session number is set to "latest", retrieving latest session');
    experimentDoc = dataSnapshot.docs[sessionNumber];
  }

  console.log(`Reading document data for ${experimentDoc.id}`);

  // Query Firestore for the experiment's trials (sorted by trial_index)
  const trialsSnapshot = await db
    .collection(`${dataRef.path}/${experimentDoc.id}/trials`)
    .orderBy('trial_index')
    .get();
  // Get the data out of each trial document
  // Add trials to experiment object as "results" array
  const results = trialsSnapshot.docs.map((trial) => trial.data());

  const experimentData = experimentDoc.data();
  experimentData.results = results;
  // Save the session to a unique JSON file.
  const outputFile =
    `${outputRoot}/participant_responses/` +
    `${studyID}/${participantID}/${experimentDoc.id}.json`.replaceAll(':', '_');
  // TODO 172: Check for overwriting file?
  // TODO 172: More compatible file name? (replaced : with _ for ISO date)
  try {
    await fs.outputJson(outputFile, experimentData, { spaces: 2 });
    console.log('OK:', outputFile);
  } catch (error) {
    throw new Error('Unable to write JSON file\n\n' + error.stack);
  }
}
