
// Task Manager Add/Edit: Regression and Unit Tests
//
// This file contains both regression tests (to catch feature breakage) and unit tests for edge cases (to ensure robust handling of unusual or boundary input).
//
// Edge case tests are marked in comments and are not regressions—they are unit tests that validate the app's behavior under rare or extreme conditions.

import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import {
  clearTaskManagerStorage,
  mountTaskManagerApp,
  waitForLongPress,
} from '../fixtures/task-manager-app.fixture.js';

describe('Task Manager Add And Edit Regression', () => {

  // --- Unit tests for edge cases (not regressions) ---

  it('should not add a task with only whitespace (unit: edge case)', async () => {
    const beforeCount = fixture.app.tasks.length;
    fixture.input.value = '   ';
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks.length, 'No task should be added for whitespace-only input.').to.equal(beforeCount);
  });

  it('should add a very long task name (256+ chars) and display it (unit: edge case)', async () => {
    const longText = 'A'.repeat(260);
    fixture.input.value = longText;
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.text, 'Very long task name should be added and visible.').to.equal(longText);
    const boardItems = [...fixture.board.shadowRoot.querySelectorAll('task-item')];
    expect(boardItems[0]?.task?.text, 'Board should render very long task name.').to.equal(longText);
  });

  it('should add a task with special characters and emoji (unit: edge case)', async () => {
    const specialText = 'Task!@#$%^&*()_+🚀✨';
    fixture.input.value = specialText;
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.text, 'Special character/emoji task should be added and visible.').to.equal(specialText);
    const boardItems = [...fixture.board.shadowRoot.querySelectorAll('task-item')];
    expect(boardItems[0]?.task?.text, 'Board should render special character/emoji task.').to.equal(specialText);
  });

  it('should allow duplicate task names and treat them independently (unit: edge case)', async () => {
    fixture.input.value = 'duplicate';
    fixture.button.click();
    await waitForRender();
    fixture.input.value = 'duplicate';
    fixture.button.click();
    await waitForRender();
    const allTasks = fixture.app.tasks.filter(t => t.text === 'duplicate');
    expect(allTasks.length, 'Should allow two tasks with the same name.').to.equal(2);
  });

  it('should handle rapid add and delete of tasks without error (unit: edge case)', async () => {
    // Edge case: stress test for rapid add/delete
    for (let i = 0; i < 5; i++) {
      fixture.input.value = `rapid${i}`;
      fixture.button.click();
      await waitForRender();
    }
    for (let i = 0; i < 5; i++) {
      const firstDelete = fixture.board.shadowRoot.querySelector('task-item')?.shadowRoot?.querySelector('.delete');
      if (firstDelete) {
        firstDelete.click();
        await waitForRender();
      }
    }
    expect(fixture.app.tasks.length, 'All rapidly added tasks should be deleted.').to.equal(0);
  });

  it('should toggle completed on first and last tasks', async () => {
    // Add three tasks
    for (let i = 0; i < 3; i++) {
      fixture.input.value = `edge${i}`;
      fixture.button.click();
      await waitForRender();
    }
    // Toggle first
    let firstItem = fixture.board.shadowRoot.querySelectorAll('task-item')[0];
    let firstToggle = firstItem?.shadowRoot?.querySelector('.toggle');
    firstToggle.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.completed, 'First task should be marked completed.').to.equal(true);
    // Toggle last
    let lastItem = fixture.board.shadowRoot.querySelectorAll('task-item')[2];
    let lastToggle = lastItem?.shadowRoot?.querySelector('.toggle');
    lastToggle.click();
    await waitForRender();
    expect(fixture.app.tasks[2]?.completed, 'Last task should be marked completed.').to.equal(true);
  });

  it('should handle localStorage failure gracefully when adding a task', async () => {
    // Simulate quota exceeded
    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
    fixture.input.value = 'fail persist';
    fixture.button.click();
    await waitForRender();
    // App should not crash, and task should still appear in UI (but not persist)
    expect(fixture.app.tasks[0]?.text, 'Task should still appear in UI after localStorage failure.').to.equal('fail persist');
    window.localStorage.setItem = originalSetItem;
  });

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


  it('add flow: clicking add increases task count', async () => {
    const beforeCount = fixture.app.tasks.length;
    fixture.input.value = 'test 123';
    fixture.input.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
    await waitForRender();
    fixture.button.click();
    await waitForRender();
    expect(
      fixture.app.tasks.length,
      'Task count should increase by 1 after add click.'
    ).to.equal(beforeCount + 1);
  });

  it('add flow: new task appears at top of app state and board', async () => {
    fixture.input.value = 'test 123';
    fixture.input.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
    await waitForRender();
    fixture.button.click();
    await waitForRender();
    expect(
      fixture.app.tasks[0]?.text,
      'First task in app state should match entered text.'
    ).to.equal('test 123');
    const boardItems = [...fixture.board.shadowRoot.querySelectorAll('task-item')];
    const firstTaskText = boardItems[0]?.task?.text ?? '';
    expect(
      firstTaskText,
      'First rendered task in board should match entered text.'
    ).to.equal('test 123');
  });

  it('add flow: composer input resets after add', async () => {
    fixture.input.value = 'test 123';
    fixture.input.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
    await waitForRender();
    fixture.button.click();
    await waitForRender();
    expect(
      fixture.input.value,
      'Composer input should be cleared after adding a task.'
    ).to.equal('');
  });


  it('native input add: clicking add increases task count', async () => {
    const beforeCount = fixture.app.tasks.length;
    const internalInput = fixture.input.shadowRoot?.querySelector('input');
    expect(internalInput, 'Native input should exist in wa-input shadowRoot.').to.exist;
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
    expect(
      fixture.app.tasks.length,
      'Task count should increase by 1 after native input add.'
    ).to.equal(beforeCount + 1);
  });

  it('native input add: new task appears at top of app state and board', async () => {
    const internalInput = fixture.input.shadowRoot?.querySelector('input');
    expect(internalInput, 'Native input should exist in wa-input shadowRoot.').to.exist;
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
    expect(
      fixture.app.tasks[0]?.text,
      'First task in app state should match native input value.'
    ).to.equal('native add task');
    const firstTaskText = fixture.board.shadowRoot.querySelector('task-item')?.task?.text;
    expect(
      firstTaskText,
      'First rendered task in board should match native input value.'
    ).to.equal('native add task');
  });

  it('native input add: board renders the live native input value', async () => {
    const internalInput = fixture.input.shadowRoot?.querySelector('input');
    expect(internalInput, 'Native input should exist in wa-input shadowRoot.').to.exist;
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
    const firstTaskText = fixture.board.shadowRoot.querySelector('task-item')?.task?.text;
    expect(
      firstTaskText,
      'Board should render the live native input value after add.'
    ).to.equal('native add task');
  });


  describe('toggle interaction', () => {
    const SEEDED_TASKS = [
      { id: 'seed-task', text: 'Seed task', completed: false, createdAt: new Date().toISOString() },
    ];
    beforeEach(async () => {
      fixture = await mountTaskManagerApp({ tasks: SEEDED_TASKS });
    });

    it('toggle control exists and is initially unchecked', async () => {
      const firstItem = fixture.board.shadowRoot.querySelector('task-item');
      const toggle = firstItem?.shadowRoot?.querySelector('.toggle');
      if (!toggle) {
        console.error('[diagnostic] toggle not found. firstItem:', firstItem, 'firstItem shadow:', firstItem?.shadowRoot?.innerHTML);
      }
      await waitForRender();
      expect(toggle, 'Toggle control should exist in first task-item.').to.exist;
      expect(
        fixture.app.tasks[0]?.completed,
        'First task should be incomplete before toggle.'
      ).to.equal(false);
    });

    it('clicking toggle updates app state and task-item', async () => {
      const firstItem = fixture.board.shadowRoot.querySelector('task-item');
      const toggle = firstItem?.shadowRoot?.querySelector('.toggle');
      await waitForRender();
      toggle.click();
      await waitForRender();
      const updatedFirstItem = fixture.board.shadowRoot.querySelector('task-item');
      expect(
        fixture.app.tasks[0]?.completed,
        'App state should reflect completed after toggle.'
      ).to.equal(true);
      expect(
        updatedFirstItem?.task?.completed,
        'Task-item property should reflect completed after toggle.'
      ).to.equal(true);
    });

    it('completed status is visible in task meta after toggle', async () => {
      const firstItem = fixture.board.shadowRoot.querySelector('task-item');
      const toggle = firstItem?.shadowRoot?.querySelector('.toggle');
      await waitForRender();
      toggle.click();
      await waitForRender();
      const updatedFirstItem = fixture.board.shadowRoot.querySelector('task-item');
      const meta = updatedFirstItem?.shadowRoot?.querySelector('.task-meta')?.textContent?.trim() ?? '';
      expect(
        meta,
        'Task meta should display "Completed" after toggle.'
      ).to.equal('Completed');
    });
  });

  describe('long-press edit', () => {
    const SEEDED_TASKS = [
      { id: 'seed-task', text: 'Seed task', completed: false, createdAt: new Date().toISOString() },
    ];
    beforeEach(async () => {
      fixture = await mountTaskManagerApp({ tasks: SEEDED_TASKS });
    });

    it('host wa-input is present and editable', async () => {
      const firstItem = fixture.board.shadowRoot.querySelector('task-item');
      const taskMain = firstItem?.shadowRoot?.querySelector('.task-main[data-editable="true"]');
      await waitForRender();
      expect(taskMain, 'Editable task-main should exist for long-press.').to.exist;
    });

    it('edit mode can be entered and wa-input is present', async () => {
      const firstItem = fixture.board.shadowRoot.querySelector('task-item');
      const taskMain = firstItem?.shadowRoot?.querySelector('.task-main[data-editable="true"]');
      await waitForRender();
      taskMain.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
      await waitForLongPress();
      const editInput = firstItem.shadowRoot.querySelector('wa-input');
      expect(editInput, 'wa-input should be present in edit mode.').to.exist;
    });

    it('edit mode: save button is present', async () => {
      const firstItem = fixture.board.shadowRoot.querySelector('task-item');
      const taskMain = firstItem?.shadowRoot?.querySelector('.task-main[data-editable="true"]');
      await waitForRender();
      taskMain.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
      await waitForLongPress();
      const saveButton = [...firstItem.shadowRoot.querySelectorAll('wa-button')].find((control) => control.textContent?.trim() === 'Save');
      expect(saveButton, 'Save button should be present in edit mode.').to.exist;
    });

    it('edit mode: saving host wa-input value updates app state and board', async () => {
      const firstItem = fixture.board.shadowRoot.querySelector('task-item');
      const taskMain = firstItem?.shadowRoot?.querySelector('.task-main[data-editable="true"]');
      await waitForRender();
      taskMain.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
      await waitForLongPress();
      const editInput = firstItem.shadowRoot.querySelector('wa-input');
      const saveButton = [...firstItem.shadowRoot.querySelectorAll('wa-button')].find((control) => control.textContent?.trim() === 'Save');
      editInput.value = 'edited task text';
      editInput.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
      await waitForRender();
      saveButton.click();
      await waitForRender();
      const updatedFirstItem = fixture.board.shadowRoot.querySelector('task-item');
      const updatedText = updatedFirstItem?.shadowRoot?.querySelector('.task-text')?.textContent?.trim() ?? '';
      expect(fixture.app.tasks[0]?.text, 'App state should update after save.').to.equal('edited task text');
      expect(updatedText, 'Board should render updated text after save.').to.equal('edited task text');
    });

    it('edit mode: saving native input value updates app state and board', async () => {
      const firstItem = fixture.board.shadowRoot.querySelector('task-item');
      const taskMain = firstItem?.shadowRoot?.querySelector('.task-main[data-editable="true"]');
      await waitForRender();
      taskMain.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
      await waitForLongPress();
      const editInput = firstItem.shadowRoot.querySelector('wa-input');
      const internalEditInput = editInput?.shadowRoot?.querySelector('input');
      const saveButton = [...firstItem.shadowRoot.querySelectorAll('wa-button')].find((control) => control.textContent?.trim() === 'Save');
      expect(internalEditInput, 'Native input should exist in wa-input shadowRoot.').to.exist;
      expect(saveButton, 'Save button should be present in edit mode.').to.exist;
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
      expect(fixture.app.tasks[0]?.text, 'App state should update after saving native input.').to.equal('edited through native input');
      expect(updatedText, 'Board should render updated text after saving native input.').to.equal('edited through native input');
    });
  });
});