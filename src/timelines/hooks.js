const numberState = (n) => {
  let n_internal = n;

  return [() => n_internal, (n) => (n_internal = n)];
};

const runButtonState = (state) => {
  let buttonState = state;

  return [() => buttonState, (state) => (buttonState = state)];
};

const inputsState = (initState) => {
  let state = initState;

  return [() => state, (e) => state.push(e), () => (state = [])];
};

export { numberState, runButtonState, inputsState };
