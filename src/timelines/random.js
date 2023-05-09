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

export { normalRandomInRange };
