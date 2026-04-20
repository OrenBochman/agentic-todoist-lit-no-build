// Redux-compatible state helpers for test setup (xUnit pattern)
export const setTasks = async (app, tasks) => {
  app.tasks = tasks;
  await waitForRender();
};
export const setFilter = async (app, filter) => {
  app.filter = filter;
  await waitForRender();
};
export const setTheme = async (app, theme) => {
  app.theme = theme;
  await waitForRender();
};
// Fixture helper: force a window resize and reflow for layout-sensitive tests
export const forceLayoutReflow = async () => {
  window.dispatchEvent(new Event('resize'));
  await new Promise((resolve) => setTimeout(resolve, 20));
};
import '../../script.js';
import { waitForRender } from '../helpers/browser-test-harness.js';
import { discoverWebAwesome } from '../helpers/webawesome-test-setup.js';

const STORAGE_KEY = 'task-manager-items';
const THEME_STORAGE_KEY = 'task-manager-theme';

export const clearTaskManagerStorage = () => {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(THEME_STORAGE_KEY);
};

// Fixture: mount a fresh task-manager-app with composer, board, transfer controls, and snackbar ready.
export const mountTaskManagerApp = async ({ tasks = [] } = {}) => {
  console.log('[diagnostic] mountTaskManagerApp: start');
  clearTaskManagerStorage();

  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();

  const app = document.createElement('task-manager-app');
  // Set data-wa-preload on the custom element before discovery
  app.setAttribute('data-wa-preload', 'wa-button wa-icon wa-input');
  mount.append(app);

  await customElements.whenDefined('task-manager-app');
  await discoverWebAwesome(app, ['wa-button', 'wa-icon', 'wa-input']);
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
    // Extra flush: ensure Lit has finished all updates
    if (typeof app.updateComplete === 'function' || app.updateComplete) {
      await app.updateComplete;
    } else {
      await Promise.resolve();
    }
    // Also flush board if available
    const board = app.shadowRoot.querySelector('task-board');
    if (board && (typeof board.updateComplete === 'function' || board.updateComplete)) {
      await board.updateComplete;
    }
  }

  const appShadow = app.shadowRoot;
  const composer = appShadow.querySelector('task-composer');
  const composerShadow = composer?.shadowRoot;
  const transfer = appShadow.querySelector('task-transfer-controls');
  const transferShadow = transfer?.shadowRoot;

  // Diagnostic logs for DOM queries
  const input = composerShadow?.querySelector('wa-input');
  const button = composerShadow?.querySelector('wa-button');
  const board = appShadow.querySelector('task-board');
  console.log('[diagnostic] wa-input in composerShadow:', !!input);
  console.log('[diagnostic] wa-button in composerShadow:', !!button);
  console.log('[diagnostic] task-board in appShadow:', !!board);

  return {
    app,
    appShadow,
    composer,
    composerShadow,
    input,
    button,
    board,
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