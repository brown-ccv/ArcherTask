// Performs integer division
function intDiv(a, b) {
  return Math.floor(a / b);
}

// Converts the slider value to on-screen pixel value of the center of the object
function sliderToPixel(sliderValue) {
  const sliderWidth = 500 - 100;
  const sliderTop = 100;
  const sliderMax = 200;

  const pixelY = Math.round(50 + ((sliderMax - sliderValue) / sliderMax) * sliderWidth) + sliderTop;

  return pixelY;
}

// Gets the top location of the response
function getResponseTop(response, arrowSize) {
  return sliderToPixel(response) - intDiv(arrowSize, 2);
}

// Gets the top location of the target
function getTargetTop(targetValue, isOverlord, minionSize, overlordSize) {
  return (
    sliderToPixel(targetValue) - (isOverlord ? intDiv(overlordSize, 2) : intDiv(minionSize, 2))
  );
}

// Determines if the arrow is colliding with the target
function isCollision(responseTop, targetTop, isOverlord, arrowSize, minionSize, overlordSize) {
  const height = isOverlord ? overlordSize : minionSize;

  return responseTop > targetTop - arrowSize && responseTop < targetTop + height;
}

// Determines if there was a hit
// Makes use of the 3 functions above
// The functions are separate to make unit tests easier
function isHit(response, targetValue, isOverlord, arrowSize, minionSize, overlordSize) {
  const responseTop = getResponseTop(response, arrowSize);
  const targetTop = getTargetTop(targetValue, isOverlord, minionSize, overlordSize);

  return isCollision(responseTop, targetTop, isOverlord, arrowSize, minionSize, overlordSize);
}

// Handles click space event
function handleKeyPress(e) {
  e.preventDefault();
  if (e.keyCode === 32) {
    let nextButton = document.getElementById('jspsych-html-slider-response-next');
    if (nextButton) nextButton.dispatchEvent(new MouseEvent('click'));
  }
}

// Returns the archer element
// Has to be a closure because the archer element is not always rendered on screen
const getArcher = () => document.getElementById('jspsych-html-slider-response-response');

// This code is taken from
// https://gist.github.com/bluesmoon/7925696

let spareRandom = null;

function normalRandom() {
  let val, u, v, s, mul;

  if (spareRandom !== null) {
    val = spareRandom;
    spareRandom = null;
  } else {
    do {
      u = Math.random() * 2 - 1;
      v = Math.random() * 2 - 1;

      s = u * u + v * v;
    } while (s === 0 || s >= 1);

    mul = Math.sqrt((-2 * Math.log(s)) / s);

    val = u * mul;
    spareRandom = v * mul;
  }

  return val;
}

function normalRandomScaled(mean, stddev) {
  let r = normalRandom();

  r = r * stddev + mean;

  return Math.round(r);
}

function normalRandomInRange(mean, stdev, min, max) {
  let val;
  do {
    val = normalRandomScaled(mean, stdev);
  } while (val < min || val > max);

  return val;
}

const shuffleArray = (arr) =>
  arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

export {
  sliderToPixel as calculateByValue,
  getResponseTop,
  getTargetTop,
  isCollision,
  isHit,
  handleKeyPress,
  getArcher,
  normalRandomInRange,
  shuffleArray,
};
