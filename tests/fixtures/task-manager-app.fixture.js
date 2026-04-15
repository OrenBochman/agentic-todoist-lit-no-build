import '../../script.js';
import { waitForRender } from '../helpers/browser-test-harness.js';
import { ensureWebAwesomeLoader } from '../helpers/webawesome-test-setup.js';

const STORAGE_KEY = 'task-manager-items';
const THEME_STORAGE_KEY = 'task-manager-theme';
const APP_PRELOAD = 'wa-button wa-input wa-icon';

export const clearTaskManagerStorage = () => {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(THEME_STORAGE_KEY);
};

// Fixture: mount a fresh task-manager-app with composer, board, transfer controls, and snackbar ready.
export const mountTaskManagerApp = async ({ tasks = [] } = {}) => {
  ensureWebAwesomeLoader();
  clearTaskManagerStorage();

  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();

  const app = document.createElement('task-manager-app');
  app.setAttribute('data-wa-preload', APP_PRELOAD);
  mount.append(app);

  await customElements.whenDefined('task-manager-app');
  await customElements.whenDefined('task-composer');
  await customElements.whenDefined('task-board');
  await customElements.whenDefined('task-transfer-controls');
  await customElements.whenDefined('task-snackbar');
  await customElements.whenDefined('wa-input');
  await customElements.whenDefined('wa-button');
  await customElements.whenDefined('wa-icon');
  await waitForRender();

  if (tasks.length) {
    app.tasks = tasks.map((task) => ({ ...task }));
    app.saveTasks();
    await waitForRender();
  }

  const appShadow = app.shadowRoot;
  const composer = appShadow.querySelector('task-composer');
  const composerShadow = composer?.shadowRoot;
  const transfer = appShadow.querySelector('task-transfer-controls');
  const transferShadow = transfer?.shadowRoot;

  return {
    app,
    appShadow,
    composer,
    composerShadow,
    input: composerShadow?.querySelector('wa-input'),
    button: composerShadow?.querySelector('wa-button'),
    board: appShadow.querySelector('task-board'),
    transfer,
    transferShadow,
    snackbar: appShadow.querySelector('task-snackbar'),
  };
};

// Fixture helper: wait long enough for task-item long-press editing to open in browser tests.
export const waitForLongPress = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 500));
  await waitForRender();
};

// Fixture helper: inject a test FileList replacement into a hidden file input.
export const setFileList = (input, file) => {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: [file],
  });
};