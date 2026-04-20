import {
  expect,
  getFixture,
  mountEmptyFixture,
  clearFixture,
  addTaskWithHostInput,
  getBoardItems,
  getBoardItem,
  getToggleControl,
  getDeleteButton,
  setTasks,
  setFilter,
  waitForRender,
} from './task-manager-test-helpers.js';

describe('Task Manager Edge Cases', () => {
  beforeEach(async () => {
    await mountEmptyFixture();
  });

  afterEach(() => {
    clearFixture();
  });

  it('should not add a task with only newline or tab characters (unit: edge case)', async () => {
    const fixture = getFixture();
    const beforeCount = fixture.app.tasks.length;
    fixture.input.value = '\n\t';
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks.length, 'No task should be added for newline/tab-only input.').to.equal(beforeCount);
  });

  it('should trim leading/trailing whitespace from task input (unit: edge case)', async () => {
    const fixture = getFixture();
    fixture.input.value = '   trimmed task   ';
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.text, 'Task text should be trimmed.').to.equal('trimmed task');
  });

  it('should add a task with a very large Unicode string (unit: edge case)', async () => {
    const fixture = getFixture();
    const unicodeText = '🚀'.repeat(100) + 'שלום' + 'مرحبا' + '漢字' + '👩‍💻';
    fixture.input.value = unicodeText;
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.text, 'Large Unicode string should be added and visible.').to.equal(unicodeText);
  });

  it('should not allow duplicate IDs in state (unit: edge case)', async () => {
    const fixture = getFixture();
    const dupeId = 'dupe-id';
    await setTasks(fixture.app, [
      { id: dupeId, text: 'first', completed: false, createdAt: new Date().toISOString(), dueDate: null, project: null, importance: null, dependsOn: [], workloadEstimate: 4, workloadUncertainty: 1, tags: [] },
      { id: dupeId, text: 'second', completed: false, createdAt: new Date().toISOString(), dueDate: null, project: null, importance: null, dependsOn: [], workloadEstimate: 4, workloadUncertainty: 1, tags: [] },
    ]);
    fixture.app.handleTaskDelete({ detail: { taskId: dupeId } });
    await waitForRender();
    expect(fixture.app.tasks.filter((task) => task.id === dupeId).length, 'Should not allow duplicate IDs after delete.').to.be.lessThan(2);
  });

  it('should update filtered and full list correctly when deleting in filtered view (unit: edge case)', async () => {
    const fixture = getFixture();
    await addTaskWithHostInput('pending task');
    await addTaskWithHostInput('completed');

    const completedItem = getBoardItems().find((item) =>
      item.shadowRoot.querySelector('.task-main')?.textContent?.includes('completed'));
    const completedToggle = getToggleControl(completedItem);
    expect(completedToggle, 'Completed task should expose a toggle control.').to.exist;
    completedToggle.click();
    await waitForRender();

    await setFilter(fixture.app, 'completed');

    const deleteBtn = getDeleteButton(getBoardItem());
    expect(deleteBtn, 'Filtered completed task should expose a delete button.').to.exist;
    deleteBtn.click();
    await waitForRender();

    expect(fixture.app.tasks.length, 'Only pending task should remain after deleting in filtered view.').to.equal(1);
    expect(fixture.app.tasks[0]?.text, 'Pending task should remain.').to.equal('pending task');
  });

  it('should allow toggle then immediate delete without error (unit: edge case)', async () => {
    const fixture = getFixture();
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

  it('should allow rapid toggle of the same task without state inconsistency (unit: edge case)', async () => {
    const fixture = getFixture();
    await addTaskWithHostInput('rapid-toggle');

    const toggle = getToggleControl(getBoardItem());
    expect(toggle, 'Toggle should exist before rapid toggles.').to.exist;

    for (let i = 0; i < 10; i++) {
      toggle.click();
      await waitForRender();
    }

    expect(fixture.app.tasks[0]?.completed, 'Task completed state should be consistent after rapid toggles.').to.equal(false);
  });

  it('should not throw or break when deleting a non-existent task (unit: edge case)', async () => {
    const fixture = getFixture();
    fixture.input.value = 'real task';
    fixture.button.click();
    await waitForRender();

    let errorCaught = null;
    try {
      fixture.app.handleTaskDelete({ detail: { taskId: 'not-a-real-id' } });
    } catch (err) {
      errorCaught = err;
    }

    expect(errorCaught, 'Deleting non-existent task should not throw.').to.be.null;
    expect(fixture.app.tasks.length, 'Real task should still exist after fake delete.').to.equal(1);
  });

  it('should persist tasks to localStorage and restore after reload (unit: edge case)', async () => {
    const fixture = getFixture();
    fixture.input.value = 'persisted task';
    fixture.button.click();
    await waitForRender();

    const newApp = document.createElement('task-manager-app');
    document.getElementById('mount').replaceChildren(newApp);
    await customElements.whenDefined('task-manager-app');
    await waitForRender();

    expect(newApp.tasks.length, 'Persisted task should be restored after reload.').to.equal(1);
    expect(newApp.tasks[0]?.text, 'Persisted task text should match.').to.equal('persisted task');
  });

  it('should not add a task with only whitespace (unit: edge case)', async () => {
    const fixture = getFixture();
    const beforeCount = fixture.app.tasks.length;
    fixture.input.value = '   ';
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks.length, 'No task should be added for whitespace-only input.').to.equal(beforeCount);
  });

  it('should add a very long task name (256+ chars) and display it (unit: edge case)', async () => {
    const fixture = getFixture();
    const longText = 'A'.repeat(260);
    fixture.input.value = longText;
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.text, 'Very long task name should be added and visible.').to.equal(longText);
    expect(getBoardItems()[0]?.task?.text, 'Board should render very long task name.').to.equal(longText);
  });

  it('should add a task with special characters and emoji (unit: edge case)', async () => {
    const fixture = getFixture();
    const specialText = 'Task!@#$%^&*()_+🚀✨';
    fixture.input.value = specialText;
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.text, 'Special character/emoji task should be added and visible.').to.equal(specialText);
    expect(getBoardItems()[0]?.task?.text, 'Board should render special character/emoji task.').to.equal(specialText);
  });

  it('should allow duplicate task names and treat them independently (unit: edge case)', async () => {
    const fixture = getFixture();
    fixture.input.value = 'duplicate';
    fixture.button.click();
    await waitForRender();
    fixture.input.value = 'duplicate';
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks.filter((task) => task.text === 'duplicate').length, 'Should allow two tasks with the same name.').to.equal(2);
  });

  it('should handle rapid add and delete of tasks without error (unit: edge case)', async () => {
    const fixture = getFixture();
    expect(fixture.app.tasks.length, 'Fixture should start with zero tasks.').to.equal(0);

    for (let i = 0; i < 5; i++) {
      fixture.app.handleTaskAdd({ detail: { text: `rapid${i}` } });
    }
    await waitForRender();

    expect(fixture.app.tasks.length, 'Fixture should have 5 tasks after rapid add.').to.equal(5);
    expect(getBoardItems().length, 'Board should render all rapidly added tasks.').to.equal(5);

    for (let i = 0; i < 5; i++) {
      const taskId = fixture.app.tasks[0]?.id;
      expect(taskId, `Task ${i + 1} should exist before delete.`).to.be.a('string');
      fixture.app.handleTaskDelete({ detail: { taskId } });
      await waitForRender();
      expect(
        fixture.app.tasks.length,
        `After delete ${i + 1}, app state task count should decrease by 1.`,
      ).to.equal(4 - i);
    }

    expect(fixture.app.tasks.length, 'All rapidly added tasks should be deleted.').to.equal(0);
    expect(getBoardItems().length, 'Board should be empty after deleting all rapidly added tasks.').to.equal(0);
  });

  it('should handle localStorage failure gracefully when adding a task', async () => {
    const fixture = getFixture();
    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
    fixture.input.value = 'fail persist';
    fixture.button.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.text, 'Task should still appear in UI after localStorage failure.').to.equal('fail persist');
    window.localStorage.setItem = originalSetItem;
  });
});
