const arrowsState = (n_arrows) => {
  let arrows = n_arrows;

  return [() => arrows, (n) => (arrows = n)];
};

const runButtonState = (state) => {
  let buttonState = state;

  return [() => buttonState, (state) => (buttonState = state)];
};

const inputsState = (initState) => {
  let state = initState;

  return [() => state, (e) => state.push(e), () => (state = [])];
};

export { arrowsState, runButtonState, inputsState };
