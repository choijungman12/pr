jest.mock('p-limit', () => {
  return jest.fn(() => {
    const fn = (fn) => fn();
    fn.clearQueue = jest.fn();
    return fn;
  });
});