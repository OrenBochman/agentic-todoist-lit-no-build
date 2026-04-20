const mocha = globalThis.mocha;
const chai = globalThis.chai;

if (!mocha || !chai) {
  throw new Error('Mocha and Chai must be loaded before the browser test harness.');
}

mocha.setup({
  ui: 'bdd',
  checkLeaks: true,
  slow: 1,
  timeout: 15000,
});

export const expect = chai.expect;

export const waitForRender = async () => {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
};

export const runBrowserTests = async () =>
  new Promise((resolve) => {
    mocha.run((failures) => {
      globalThis.__testFailures = failures;
      globalThis.__testsDone = true;
      resolve(failures);
    });
  });
