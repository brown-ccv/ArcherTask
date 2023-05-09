import settings from '../config/settings';

const { arrowSize, minionSize, overlordSize } = settings.interface;

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
function getResponseTop(response) {
  return sliderToPixel(response) - intDiv(arrowSize, 2);
}

// Gets the top location of the target
function getTargetTop(targetValue, isOverlord) {
  return (
    sliderToPixel(targetValue) - (isOverlord ? intDiv(overlordSize, 2) : intDiv(minionSize, 2))
  );
}

// Determines if the arrow is colliding with the target
function isCollision(responseTop, targetTop, isOverlord) {
  const height = isOverlord ? overlordSize : minionSize;

  return responseTop > targetTop - arrowSize && responseTop < targetTop + height;
}

// Determines if there was a hit
// Makes use of the 3 functions above
// The functions are separate to make unit tests easier
function isHit(response, targetValue, isOverlord) {
  const responseTop = getResponseTop(response);
  const targetTop = getTargetTop(targetValue, isOverlord);

  return isCollision(responseTop, targetTop, isOverlord);
}

// Handles click space event
function pressSpace(e) {
  e.preventDefault();
  if (e.keyCode === 32) {
    let nextButton = document.getElementById('jspsych-html-slider-response-next');
    if (nextButton) nextButton.dispatchEvent(new MouseEvent('click'));
  }
}

// Returns the archer element
// Has to be a closure because the archer element is not always rendered on screen
const getArcher = () => document.getElementById('jspsych-html-slider-response-response');

export {
  sliderToPixel as calculateByValue,
  getResponseTop,
  getTargetTop,
  isCollision,
  isHit,
  pressSpace,
  getArcher,
};
