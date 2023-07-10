# How to use ArcherTask

Below is a tutorial that walks you through setting up ArcherTask for local development and publishing to firebase. All steps are specific to this repo. If you have questions about Honeycomb in general, [the Honeycomb documentation](https://brown-ccv.github.io/honeycomb-docs/) provides a more comprehensive overview on how to use Honeycomb.

## Minimum requirements

This tutorial assumes that you have the latest version of `git` and `node.js` installed. If you don't already have them, please follow the links below to install the appropriate versions for your operating system:

- [git](https://git-scm.com/)
- [node](https://nodejs.org/en)

To verify you have these installed, you can run these commands:

```shell
git --version
node --version
```

## Clone the repo and install dependencies

Run the following command to clone this repo and install all dependencies:

```shell
git clone https://github.com/brown-ccv/ArcherTask
cd ArcherTask

npm install
```

This will clone this repo and install all JavaScript dependencies required for ArcherTask

## Local development for firebase

To develop ArcherTask locally, you need to enable a local firebase emulator. So in your command line, run:

```shell
npm run firebase:emulators:start
```

Then you can start a local development server by running

```shell
npm run dev:firebase
```

The local development server supports hot-reload: whenever your code is updated, the server will instantly reload the latest version of the code.

## Work with firebase

Once your code works locally, you can test if firebase works. You will first follow [these instructions](https://brown-ccv.github.io/honeycomb-docs/docs/firebase#deploying-on-firebase) to prepare your repo for firebase deployment. You also need to do the following:

### Populate participants and studies

You might need to populate some `participant` and `study` ids before you get started. Please follow these instructions [here](https://brown-ccv.github.io/honeycomb-docs/docs/firebase#registering-studies) for more details.

### Upload configs

After creating participants and studies, you may also need to add configurations to different `participant`s and `studies`. By default, there is a `settings.json` under `./src/config` file. You can make a copy of this file and then add the config to firebase with

```shell
npm run firebase:upload study_id [participant_id] /path/to/config.json
```

You can set `participant_id` to `default` to add a default config to the study shared by all participants. If Honeycomb cannot find `participant_id`, it will use the default for the study.

Once this is all done, you will be able to test your code with firebase. You can start a new branch, and submit a PR from that branch. Github will automatically run the continuous integration (CI) workflow and generate a temporary test link for the PR.

Whenever a PR is merged into the `main` branch, a new version of ArcherTask will be created at [https://frank-archertask.web.app/](https://frank-archertask.web.app/). This is the product version of ArcherTask.

## Changing configs

You can always sign into [Firebase Console](https://console.firebase.google.com) and go to `Firestore Database` to view the data currently hosted in Firebase. You can change the config for each participant and study by going to `/registered_studies/[study_id]/config/[participant_id]` to change the config for the participant. You can also change `/registered_studies/[study_id]/config/default` to change the default config for the study.

# Honeycomb

This repo is based on Honeycomb.

[![DOI:10.1590/1516-4446-2020-1675](https://img.shields.io/badge/DOI-10.1590%2F1516--4446--2020--1675-orange)](https://doi.org/10.1590/1516-4446-2020-1675) [![docs](https://img.shields.io/badge/docs-stable-blue)](https://brown-ccv.github.io/honeycomb-docs/)

Honeycomb is a template for reproducible psychophysiological tasks for clinic, laboratory, and home use. It is maintained by members of the [Center for Computation and Visualization](https://ccv.brown.edu) and the [Neuromotion Lab](http://borton.engin.brown.edu/) at Brown University. To learn about installation, usage and deployment please [visit our documentation](https://brown-ccv.github.io/honeycomb-docs/).

*Note: previously named Neuro Task Starter, some references may still refer to it as such.*

If you use Honeycomb in your work, please cite:

[Provenza, N.R., Gelin, L.F.F., Mahaphanit, W., McGrath, M.C., Dastin-van Rijn, E.M., Fan, Y., Dhar, R., Frank, M.J., Restrepo, M.I., Goodman, W.K. and Borton, D.A., 2021. Honeycomb: a template for reproducible psychophysiological tasks for clinic, laboratory, and home use. Brazilian Journal of Psychiatry, 44, pp.147-155.](https://doi.org/10.1590/1516-4446-2020-1675)
