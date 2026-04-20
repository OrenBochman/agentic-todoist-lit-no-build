
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
  setTasks,
  setFilter,
} from '../fixtures/task-manager-app.fixture.js';

let fixture;

const getBoardItems = () => [...fixture.board.shadowRoot.querySelectorAll('task-item')];

const getBoardItem = (index = 0) => getBoardItems()[index] ?? null;

const getToggleControl = (item) => item?.shadowRoot?.querySelector('.toggle') ?? null;

const getDeleteButton = (item) => item?.shadowRoot?.querySelector('.button') ?? null;

const getEditableTaskMain = (item) => item?.shadowRoot?.querySelector('.task-main[data-editable="true"]') ?? null;

const getSaveButton = (item) => [...(item?.shadowRoot?.querySelectorAll('wa-button') ?? [])]
  .find((control) => control.textContent?.trim() === 'Save') ?? null;

const getNativeInput = (waInput) => waInput?.shadowRoot?.querySelector('input') ?? null;

const setComposerHostValue = async (value) => {
  fixture.input.value = value;
  fixture.input.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
  await waitForRender();
};

const setComposerNativeValue = async (value, data = 'k') => {
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

const clickAddButton = async () => {
  fixture.button.click();
  await waitForRender();
};

const addTaskWithHostInput = async (text) => {
  await setComposerHostValue(text);
  await clickAddButton();
};

const addTaskWithNativeInput = async (text, data = 'k') => {
  await setComposerNativeValue(text, data);
  await clickAddButton();
};

const openEditMode = async (item) => {
  const taskMain = getEditableTaskMain(item);
  expect(taskMain, 'Editable task-main should exist for long-press.').to.exist;
  taskMain.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
  await waitForLongPress();
};

describe('Task Manager Add And Edit Regression', () => {

  it('should not add a task with only newline or tab characters (unit: edge case)', async () => {
    const beforeCount = fixture.app.tasks.length;
    fixture.input.value = '\n\t';
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks.length, 'No task should be added for newline/tab-only input.').to.equal(beforeCount);
  });

  it('should trim leading/trailing whitespace from task input (unit: edge case)', async () => {
    fixture.input.value = '   trimmed task   ';
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.text, 'Task text should be trimmed.').to.equal('trimmed task');
  });

  it('should add a task with a very large Unicode string (unit: edge case)', async () => {
    const unicodeText = '🚀'.repeat(100) + 'שלום' + 'مرحبا' + '漢字' + '👩‍💻';
    fixture.input.value = unicodeText;
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.text, 'Large Unicode string should be added and visible.').to.equal(unicodeText);
  });

  it('should not allow duplicate IDs in state (unit: edge case)', async () => {
    // Simulate direct state injection with duplicate IDs
    const dupeId = 'dupe-id';
    await setTasks(fixture.app, [
      {
        id: dupeId,
        text: 'first',
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: null,
        project: null,
        importance: null,
        dependsOn: [],
        workloadEstimate: 4,
        workloadUncertainty: 1,
        tags: [],
      },
      {
        id: dupeId,
        text: 'second',
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: null,
        project: null,
        importance: null,
        dependsOn: [],
        workloadEstimate: 4,
        workloadUncertainty: 1,
        tags: [],
      },
    ]);
    // Try to delete by ID, should only remove one
    fixture.app.handleTaskDelete({ detail: { taskId: dupeId } });
    await waitForRender();
    const remaining = fixture.app.tasks.filter(t => t.id === dupeId);
    expect(remaining.length, 'Should not allow duplicate IDs after delete.').to.be.lessThan(2);
  });

  it('should update filtered and full list correctly when deleting in filtered view (unit: edge case)', async () => {
    await addTaskWithHostInput('pending task');
    await addTaskWithHostInput('completed');

    const completedItem = getBoardItems().find((item) =>
      item.shadowRoot.querySelector('.task-main')?.textContent?.includes('completed'));
    const completedToggle = getToggleControl(completedItem);
    expect(completedToggle, 'Completed task should expose a toggle control.').to.exist;
    completedToggle.click();
    await waitForRender();

    await setFilter(fixture.app, 'completed');

    const filteredCompletedItem = getBoardItem();
    const deleteBtn = getDeleteButton(filteredCompletedItem);
    expect(deleteBtn, 'Filtered completed task should expose a delete button.').to.exist;
    deleteBtn.click();
    await waitForRender();

    expect(fixture.app.tasks.length, 'Only pending task should remain after deleting in filtered view.').to.equal(1);
    expect(fixture.app.tasks[0]?.text, 'Pending task should remain.').to.equal('pending task');
  });

  it('should allow toggle then immediate delete without error (unit: edge case)', async () => {
    await addTaskWithHostInput('toggle-delete');

    const item = getBoardItem();
    expect(item, 'A task-item should exist before toggle/delete.').to.exist;

    const toggle = getToggleControl(item);
    expect(toggle, 'Toggle should exist before clicking.').to.exist;
    toggle.click();
    await waitForRender();

    const deleteBtn = getDeleteButton(item);
    expect(deleteBtn, 'Delete button should exist before clicking.').to.exist;
    deleteBtn.click();
    await waitForRender();
    expect(fixture.app.tasks.length, 'Task should be deleted after toggle and delete.').to.equal(0);
  });

  it('should not allow editing a task to empty or whitespace (unit: edge case)', async () => {
    await addTaskWithHostInput('edit-me');

    const item = getBoardItem();
    expect(item, 'A task-item should exist before edit.').to.exist;

    await openEditMode(item);

    const editInput = item.shadowRoot.querySelector('wa-input');
    const saveBtn = getSaveButton(item);
    expect(editInput, 'wa-input should be present in edit mode.').to.exist;
    expect(saveBtn, 'Save button should be present in edit mode.').to.exist;

    editInput.value = '   ';
    editInput.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
    await waitForRender();
    saveBtn.click();
    await waitForRender();
    const editError = item.shadowRoot.querySelector('.edit-error');
    expect(editError, 'Invalid edit save should render an edit error.').to.exist;
    expect(editError.textContent, 'Should show validation error for empty edit.').to.match(/enter a task/i);
  });

  it('should allow rapid toggle of the same task without state inconsistency (unit: edge case)', async () => {
    await addTaskWithHostInput('rapid-toggle');

    const item = getBoardItem();
    expect(item, 'A task-item should exist before rapid toggles.').to.exist;

    const toggle = getToggleControl(item);
    expect(toggle, 'Toggle should exist before rapid toggles.').to.exist;

    for (let i = 0; i < 10; i++) {
      toggle.click();
      await waitForRender();
    }

    expect(fixture.app.tasks[0]?.completed, 'Task completed state should be consistent after rapid toggles.').to.equal(false);
  });

  it('should not throw or break when deleting a non-existent task (unit: edge case)', async () => {
    // Add a task, then try to delete a fake ID
    fixture.input.value = 'real task';
    fixture.button.click();
    await waitForRender();
    let errorCaught = null;
    try {
      fixture.app.handleTaskDelete({ detail: { taskId: 'not-a-real-id' } });
    } catch (err) {
      errorCaught = err;
      console.error('[diagnostic] Error thrown when deleting non-existent task:', err, 'Tasks:', JSON.stringify(fixture.app.tasks));
    }
    expect(errorCaught, 'Deleting non-existent task should not throw.').to.be.null;
    expect(fixture.app.tasks.length, 'Real task should still exist after fake delete.').to.equal(1);
  });

  it('should persist tasks to localStorage and restore after reload (unit: edge case)', async () => {
    fixture.input.value = 'persisted task';
    fixture.button.click();
    await waitForRender();
    // Simulate reload
    const newApp = document.createElement('task-manager-app');
    document.getElementById('mount').replaceChildren(newApp);
    await customElements.whenDefined('task-manager-app');
    await waitForRender();
    expect(newApp.tasks.length, 'Persisted task should be restored after reload.').to.equal(1);
    expect(newApp.tasks[0]?.text, 'Persisted task text should match.').to.equal('persisted task');
  });

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
    expect(fixture.app.tasks.length, 'Fixture should start with zero tasks.').to.equal(0);

    for (let i = 0; i < 5; i++) {
      await addTaskWithHostInput(`rapid${i}`);
    }

    expect(fixture.app.tasks.length, 'Fixture should have 5 tasks after rapid add.').to.equal(5);

    for (let i = 0; i < 5; i++) {
      const items = getBoardItems();
      const firstDelete = getDeleteButton(items[0]);
      expect(firstDelete, `Delete button should exist before delete ${i + 1}.`).to.exist;

      firstDelete.click();
      await waitForRender();

      expect(
        getBoardItems().length,
        `After delete ${i + 1}, task-item count should decrease by 1.`,
      ).to.equal(items.length - 1);
    }

    expect(fixture.app.tasks.length, 'All rapidly added tasks should be deleted.').to.equal(0);
  });

  it('should toggle completed on first and last tasks', async () => {
    for (let i = 0; i < 3; i++) {
      await addTaskWithHostInput(`edge${i}`);
    }

    const firstItem = getBoardItem(0);
    const firstToggle = getToggleControl(firstItem);
    expect(firstToggle, 'First task should expose a toggle control.').to.exist;
    firstToggle.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.completed, 'First task should be marked completed.').to.equal(true);

    const lastItem = getBoardItem(2);
    const lastToggle = getToggleControl(lastItem);
    expect(lastToggle, 'Last task should expose a toggle control.').to.exist;
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
    await addTaskWithHostInput('test 123');

    expect(
      fixture.app.tasks.length,
      'Task count should increase by 1 after add click.'
    ).to.equal(beforeCount + 1);
  });

  it('add flow: new task appears at top of app state and board', async () => {
    await addTaskWithHostInput('test 123');

    expect(
      fixture.app.tasks[0]?.text,
      'First task in app state should match entered text.'
    ).to.equal('test 123');
    const firstTaskText = getBoardItem()?.task?.text ?? '';
    expect(
      firstTaskText,
      'First rendered task in board should match entered text.'
    ).to.equal('test 123');
  });

  it('add flow: composer input resets after add', async () => {
    await addTaskWithHostInput('test 123');

    expect(
      fixture.input.value,
      'Composer input should be cleared after adding a task.'
    ).to.equal('');
  });


  it('native input add: clicking add increases task count', async () => {
    const beforeCount = fixture.app.tasks.length;
    await addTaskWithNativeInput('native add task');

    expect(
      fixture.app.tasks.length,
      'Task count should increase by 1 after native input add.'
    ).to.equal(beforeCount + 1);
  });

  it('native input add: new task appears at top of app state and board', async () => {
    await addTaskWithNativeInput('native add task');

    expect(
      fixture.app.tasks[0]?.text,
      'First task in app state should match native input value.'
    ).to.equal('native add task');
    const firstTaskText = getBoardItem()?.task?.text;
    expect(
      firstTaskText,
      'First rendered task in board should match native input value.'
    ).to.equal('native add task');
  });

  it('native input add: board renders the live native input value', async () => {
    await addTaskWithNativeInput('native add task');

    const firstTaskText = getBoardItem()?.task?.text;
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
      const firstItem = getBoardItem();
      const toggle = getToggleControl(firstItem);
      await waitForRender();
      expect(toggle, 'Toggle control should exist in first task-item.').to.exist;
      expect(
        fixture.app.tasks[0]?.completed,
        'First task should be incomplete before toggle.'
      ).to.equal(false);
    });

    it('clicking toggle updates app state and task-item', async () => {
      const firstItem = getBoardItem();
      const toggle = getToggleControl(firstItem);
      expect(toggle, 'Toggle control should exist before toggling.').to.exist;
      await waitForRender();
      toggle.click();
      await waitForRender();
      const updatedFirstItem = getBoardItem();
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
      const firstItem = getBoardItem();
      const toggle = getToggleControl(firstItem);
      expect(toggle, 'Toggle control should exist before toggling.').to.exist;
      await waitForRender();
      toggle.click();
      await waitForRender();
      const updatedFirstItem = getBoardItem();
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
      const firstItem = getBoardItem();
      const taskMain = getEditableTaskMain(firstItem);
      await waitForRender();
      expect(taskMain, 'Editable task-main should exist for long-press.').to.exist;
    });

    it('edit mode can be entered and wa-input is present', async () => {
      const firstItem = getBoardItem();
      await openEditMode(firstItem);
      const editInput = firstItem.shadowRoot.querySelector('wa-input');
      expect(editInput, 'wa-input should be present in edit mode.').to.exist;
    });

    it('edit mode: save button is present', async () => {
      const firstItem = getBoardItem();
      await openEditMode(firstItem);
      const saveButton = getSaveButton(firstItem);
      expect(saveButton, 'Save button should be present in edit mode.').to.exist;
    });

    it('edit mode: saving host wa-input value updates app state and board', async () => {
      const firstItem = getBoardItem();
      await openEditMode(firstItem);
      const editInput = firstItem.shadowRoot.querySelector('wa-input');
      const saveButton = getSaveButton(firstItem);
      expect(editInput, 'wa-input should be present in edit mode.').to.exist;
      expect(saveButton, 'Save button should be present in edit mode.').to.exist;
      editInput.value = 'edited task text';
      editInput.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
      await waitForRender();
      saveButton.click();
      await waitForRender();
      const updatedFirstItem = getBoardItem();
      const updatedText = updatedFirstItem?.shadowRoot?.querySelector('.task-text')?.textContent?.trim() ?? '';
      expect(fixture.app.tasks[0]?.text, 'App state should update after save.').to.equal('edited task text');
      expect(updatedText, 'Board should render updated text after save.').to.equal('edited task text');
    });

    it('edit mode: saving native input value updates app state and board', async () => {
      const firstItem = getBoardItem();
      await openEditMode(firstItem);
      const editInput = firstItem.shadowRoot.querySelector('wa-input');
      const internalEditInput = getNativeInput(editInput);
      const saveButton = getSaveButton(firstItem);
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
      const updatedText = getBoardItem()?.shadowRoot?.querySelector('.task-text')?.textContent?.trim() ?? '';
      expect(fixture.app.tasks[0]?.text, 'App state should update after saving native input.').to.equal('edited through native input');
      expect(updatedText, 'Board should render updated text after saving native input.').to.equal('edited through native input');
    });
  });
});
