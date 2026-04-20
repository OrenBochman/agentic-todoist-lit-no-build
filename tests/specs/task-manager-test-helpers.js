import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import {
  clearTaskManagerStorage,
  mountTaskManagerApp,
  setTasks,
  setFilter,
} from '../fixtures/task-manager-app.fixture.js';

let fixture;

export const DEFAULT_SEEDED_TASKS = [
  { id: 'seed-task', text: 'Seed task', completed: false, createdAt: new Date().toISOString() },
];

export const setFixture = (nextFixture) => {
  fixture = nextFixture;
  return fixture;
};

export const getFixture = () => fixture;

export const mountEmptyFixture = async () => setFixture(await mountTaskManagerApp());

export const mountSeededFixture = async (tasks = DEFAULT_SEEDED_TASKS) =>
  setFixture(await mountTaskManagerApp({ tasks }));

export const clearFixture = () => {
  clearTaskManagerStorage();
  fixture = null;
};

export const getBoardItems = () => [...fixture.board.shadowRoot.querySelectorAll('task-item')];

export const getBoardItem = (index = 0) => getBoardItems()[index] ?? null;

export const getToggleControl = (item) => item?.shadowRoot?.querySelector('.toggle') ?? null;

export const getDeleteButton = (item) => item?.shadowRoot?.querySelector('.button') ?? null;

export const getEditableTaskMain = (item) => item?.shadowRoot?.querySelector('.task-main[data-editable="true"]') ?? null;

export const getSaveButton = (item) => [...(item?.shadowRoot?.querySelectorAll('wa-button') ?? [])]
  .find((control) => control.textContent?.trim() === 'Save') ?? null;

export const getNativeInput = (waInput) => waInput?.shadowRoot?.querySelector('input') ?? null;

export const setComposerHostValue = async (value) => {
  fixture.input.value = value;
  fixture.input.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
  await waitForRender();
};

export const setComposerNativeValue = async (value, data = 'k') => {
  const internalInput = getNativeInput(fixture.input);
  expect(internalInput, 'Native input should exist in wa-input shadowRoot.').to.exist;
  internalInput.value = value;
  internalInput.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      composed: true,
      data,
      inputType: 'insertText',
    }),
  );
  await waitForRender();
  return internalInput;
};

export const clickAddButton = async () => {
  fixture.button.click();
  await waitForRender();
};

export const addTaskWithHostInput = async (text) => {
  await setComposerHostValue(text);
  await clickAddButton();
};

export const addTaskWithNativeInput = async (text, data = 'k') => {
  await setComposerNativeValue(text, data);
  await clickAddButton();
};

export const openEditMode = async (item) => {
  const taskMain = getEditableTaskMain(item);
  expect(taskMain, 'Editable task-main should exist for long-press.').to.exist;

  const originalSetTimeout = window.setTimeout;
  window.setTimeout = (callback, _delay, ...args) => {
    callback(...args);
    return 1;
  };

  try {
    taskMain.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
    await waitForRender();
  } finally {
    window.setTimeout = originalSetTimeout;
  }
};

export {
  expect,
  waitForRender,
  setTasks,
  setFilter,
};
