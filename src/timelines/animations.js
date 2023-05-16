import anime from 'animejs/lib/anime.es.js';
import { getResponseTop, getTargetTop } from './utils';

import minionImg from '../assets/images/minion.png';
import overlordImg from '../assets/images/overlord.png';
import explosionGif from '../assets/images/explosion.gif';

function getTimeline(jspsych, isOverlord, isHit, settings) {
  const enemyID = isOverlord ? '#overlord' : '#minion';
  const arrow = document.getElementById('arrow');
  const enemy = document.getElementById(isOverlord ? 'overlord' : 'minion');

  // This is the animation timeline
  const timeline = anime
    .timeline({
      duration: settings.animation.arrowDuration,
      easing: 'linear',
      direction: 'normal',
      loop: false,
      autoplay: false,
      complete: (anim) => {
        anim.reset();
        jspsych.finishTrial();
      },
    })
    // The arrow flies
    .add({
      targets: '#arrow',
      translateX: 800,
      complete: () => {
        arrow.style.visibility = 'hidden';
      },
    })
    // The enemy comes next after a delay
    .add(
      {
        targets: enemyID,
        translateX: -800,
      },
      settings.animation.enemyDelay
    );

  // If it's determined from the locations of the response and the target
  // that there is a hit, calculate when the arrow and enemy collide
  // and then play the explosion animation.
  if (isHit) {
    timeline.update = (anim) => {
      const arrowLeft = arrow.offsetLeft + parseInt(anime.get(arrow, 'translateX', 'px'), 10);
      const enemyLeft = enemy.offsetLeft + parseInt(anime.get(enemy, 'translateX', 'px'), 10);

      if (arrowLeft - 10 >= enemyLeft && arrowLeft - 10 <= enemyLeft + 10) {
        let runButton = document.getElementById('run-button');
        if (runButton) runButton.disabled = true;
        anim.pause();

        arrow.style.visibility = 'hidden';
        enemy.firstElementChild.style.filter = 'invert(0)';
        enemy.firstElementChild.src = explosionGif;

        setTimeout(() => {
          anim.reset();
          jspsych.finishTrial();
        }, settings.animation.explosionDuration);
      }
    };
  }

  return timeline;
}

// Resets the animation to the initial location
// and hides all elements
const animationReset = (jspsych, data, settings) => {
  const { arrowSize, minionSize, overlordSize } = settings.interface;

  const arrow = document.getElementById('arrow');
  const minion = document.getElementById('minion');
  const overlord = document.getElementById('overlord');

  const all = [arrow, minion, overlord];

  let archerValue;
  let targetValue;

  if (data.type === 'feedback') {
    archerValue = jspsych.data.getLastTrialData().trials[0].response;
    targetValue = jspsych.data.getLastTrialData().trials[0].targetValue;
  } else {
    archerValue = data.response;
    targetValue = data.targetValue;
  }

  // Get the user selected archer value and the generated targetValue
  all.forEach((e) => (e.style.visibility = 'hidden'));

  arrow.style.top = getResponseTop(archerValue, arrowSize) + 'px';
  arrow.style.left = '125px';

  minion.style.top = getTargetTop(targetValue, false, minionSize, overlordSize) - 6 + 'px';
  minion.style.left = '1000px';

  overlord.style.top = getTargetTop(targetValue, true, minionSize, overlordSize) + 'px';
  overlord.style.left = '1000px';

  minion.firstElementChild.src = minionImg;
  minion.firstElementChild.style.filter = 'invert(1)';
  overlord.firstElementChild.src = overlordImg;
  overlord.firstElementChild.style.filter = 'invert(1)';
};

// Plays the animation
const playAnimation = (jspsych, isOverlord, isHit, settings) => {
  const arrow = document.getElementById('arrow');
  const minion = document.getElementById('minion');
  const overlord = document.getElementById('overlord');
  const enemy = isOverlord ? overlord : minion;

  const timeline = getTimeline(jspsych, isOverlord, isHit, settings);

  setTimeout(() => {
    arrow.style.visibility = 'visible';
    setTimeout(() => (enemy.style.visibility = 'visible'), settings.animation.enemyDelay);
    timeline.play();
  }, settings.animation.arrowDelay);
};

export { playAnimation, animationReset };
