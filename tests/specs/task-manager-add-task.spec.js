import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import {
  clearTaskManagerStorage,
  mountTaskManagerApp,
  waitForLongPress,
} from '../fixtures/task-manager-app.fixture.js';

describe('Task Manager Add And Edit Regression', () => {

  let fixture;
  // Default seeded task for tests that require a task-item
  const SEEDED_TASKS = [
    { id: 'seed-task', text: 'Seed task', completed: false, createdAt: new Date().toISOString() },
  ];

  beforeEach(async function() {
    // For tests that require a task-item, seed with a default task
    if ([
      'toggle interaction marks the first task completed in task-manager-app and task-item',
      'long-press edit flow saves host wa-input text in task-item within task-manager-app',
      'long-press edit uses native input fidelity and persists the live inner value in task-item',
    ].includes(this.currentTest.title)) {
      fixture = await mountTaskManagerApp({ tasks: SEEDED_TASKS });
    } else {
      fixture = await mountTaskManagerApp();
    }
  });

  afterEach(() => {
    clearTaskManagerStorage();
  });

  it('add flow uses wa-input host value and renders the new task in task-manager-app', async () => {
    const beforeCount = fixture.app.tasks.length;

    fixture.input.value = 'test 123';
    fixture.input.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
    await waitForRender();

    fixture.button.click();
    await waitForRender();

    const boardItems = [...fixture.board.shadowRoot.querySelectorAll('task-item')];
    const firstTaskText = boardItems[0]?.task?.text ?? '';

    // Assert: clicking add inserts a new task at the top of app state, renders it in the board, and clears the composer.
    expect(fixture.app.tasks.length).to.equal(beforeCount + 1);
    expect(fixture.app.tasks[0]?.text).to.equal('test 123');
    expect(firstTaskText).to.equal('test 123');
    expect(fixture.input.value).to.equal('');
  });

  it('add flow uses native typing fidelity and renders the live inner input value in task-manager-app', async () => {
    const beforeCount = fixture.app.tasks.length;
    const internalInput = fixture.input.shadowRoot?.querySelector('input');

    expect(internalInput).to.exist;

    internalInput.value = 'native add task';
    internalInput.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        composed: true,
        data: 'k',
        inputType: 'insertText',
      }),
    );
    await waitForRender();

    fixture.button.click();
    await waitForRender();

    // Assert: the real native typing surface feeds the app state and the board with the same submitted task text.
    expect(fixture.app.tasks.length).to.equal(beforeCount + 1);
    expect(fixture.app.tasks[0]?.text).to.equal('native add task');
    expect(fixture.board.shadowRoot.querySelector('task-item')?.task?.text).to.equal('native add task');
  });

  it('toggle interaction marks the first task completed in task-manager-app and task-item', async () => {
    const firstItem = fixture.board.shadowRoot.querySelector('task-item');
    const toggle = firstItem?.shadowRoot?.querySelector('.toggle');
    if (!toggle) {
      console.error('[diagnostic] toggle not found. firstItem:', firstItem, 'firstItem shadow:', firstItem?.shadowRoot?.innerHTML);
    }
    await waitForRender();
    expect(toggle).to.exist;
    expect(fixture.app.tasks[0]?.completed).to.equal(false);

    toggle.click();
    await waitForRender();

    const updatedFirstItem = fixture.board.shadowRoot.querySelector('task-item');
    const meta = updatedFirstItem?.shadowRoot?.querySelector('.task-meta')?.textContent?.trim() ?? '';
    if (!updatedFirstItem) {
      console.error('[diagnostic] updatedFirstItem not found. board shadow:', fixture.board.shadowRoot.innerHTML);
    }
    // Assert: toggling completion updates the root app state, flows into task-item props, and updates the visible status copy.
    expect(fixture.app.tasks[0]?.completed).to.equal(true);
    expect(updatedFirstItem?.task?.completed).to.equal(true);
    expect(meta).to.equal('Completed');
  });

  it('long-press edit flow saves host wa-input text in task-item within task-manager-app', async () => {
    const firstItem = fixture.board.shadowRoot.querySelector('task-item');
    const taskMain = firstItem?.shadowRoot?.querySelector('.task-main[data-editable="true"]');
    if (!taskMain) {
      console.error('[diagnostic] taskMain not found. firstItem:', firstItem, 'firstItem shadow:', firstItem?.shadowRoot?.innerHTML);
    }
    await waitForRender();
    expect(taskMain).to.exist;

    taskMain.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
    await waitForLongPress();

    const editInput = firstItem.shadowRoot.querySelector('wa-input');
    const saveButton = [...firstItem.shadowRoot.querySelectorAll('wa-button')].find((control) => control.textContent?.trim() === 'Save');
    if (!editInput) {
      console.error('[diagnostic] editInput not found. firstItem shadow:', firstItem.shadowRoot.innerHTML);
    }
    if (!saveButton) {
      console.error('[diagnostic] saveButton not found. firstItem shadow:', firstItem.shadowRoot.innerHTML);
    }
    await waitForRender();
    expect(editInput).to.exist;
    expect(saveButton).to.exist;

    editInput.value = 'edited task text';
    editInput.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
    await waitForRender();

    saveButton.click();
    await waitForRender();

    const updatedFirstItem = fixture.board.shadowRoot.querySelector('task-item');
    const updatedText = updatedFirstItem?.shadowRoot?.querySelector('.task-text')?.textContent?.trim() ?? '';
    if (!updatedFirstItem) {
      console.error('[diagnostic] updatedFirstItem not found. board shadow:', fixture.board.shadowRoot.innerHTML);
    }
    // Assert: saving edit mode persists the new host-level wa-input value to app state and the rendered task row.
    expect(fixture.app.tasks[0]?.text).to.equal('edited task text');
    expect(updatedText).to.equal('edited task text');
  });

  it('long-press edit uses native input fidelity and persists the live inner value in task-item', async () => {
    const firstItem = fixture.board.shadowRoot.querySelector('task-item');
    const taskMain = firstItem?.shadowRoot?.querySelector('.task-main[data-editable="true"]');
    if (!taskMain) {
      console.error('[diagnostic] taskMain not found. firstItem:', firstItem, 'firstItem shadow:', firstItem?.shadowRoot?.innerHTML);
    }
    await waitForRender();
    expect(taskMain).to.exist;

    taskMain.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
    await waitForLongPress();

    const editInput = firstItem.shadowRoot.querySelector('wa-input');
    const internalEditInput = editInput?.shadowRoot?.querySelector('input');
    const saveButton = [...firstItem.shadowRoot.querySelectorAll('wa-button')].find((control) => control.textContent?.trim() === 'Save');
    if (!editInput) {
      console.error('[diagnostic] editInput not found. firstItem shadow:', firstItem.shadowRoot.innerHTML);
    }
    if (!internalEditInput) {
      console.error('[diagnostic] internalEditInput not found. editInput shadow:', editInput?.shadowRoot?.innerHTML);
    }
    if (!saveButton) {
      console.error('[diagnostic] saveButton not found. firstItem shadow:', firstItem.shadowRoot.innerHTML);
    }
    await waitForRender();
    expect(internalEditInput).to.exist;
    expect(saveButton).to.exist;

    internalEditInput.value = 'edited through native input';
    internalEditInput.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        composed: true,
        data: 't',
        inputType: 'insertText',
      }),
    );
    await waitForRender();

    saveButton.click();
    await waitForRender();

    const updatedText = fixture.board.shadowRoot.querySelector('task-item')?.shadowRoot?.querySelector('.task-text')?.textContent?.trim() ?? '';
    // Assert: the native inner edit input remains the source of truth for save and the board renders the persisted value.
    expect(fixture.app.tasks[0]?.text).to.equal('edited through native input');
    expect(updatedText).to.equal('edited through native input');
  });
});