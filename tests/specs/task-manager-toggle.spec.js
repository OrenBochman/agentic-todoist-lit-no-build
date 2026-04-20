import {
  expect,
  getFixture,
  mountSeededFixture,
  mountEmptyFixture,
  clearFixture,
  addTaskWithHostInput,
  getBoardItem,
  getToggleControl,
  waitForRender,
} from './task-manager-test-helpers.js';

describe('Task Manager Toggle Regression', () => {
  afterEach(() => {
    clearFixture();
  });

  describe('toggle interaction', () => {
    beforeEach(async () => {
      await mountSeededFixture();
    });

    it('toggle control exists and is initially unchecked', async () => {
      const fixture = getFixture();
      const firstItem = getBoardItem();
      const toggle = getToggleControl(firstItem);

      await waitForRender();

      expect(toggle, 'Toggle control should exist in first task-item.').to.exist;
      expect(
        fixture.app.tasks[0]?.completed,
        'First task should be incomplete before toggle.',
      ).to.equal(false);
    });

    it('clicking toggle updates app state and task-item', async () => {
      const fixture = getFixture();
      const firstItem = getBoardItem();
      const toggle = getToggleControl(firstItem);

      expect(toggle, 'Toggle control should exist before toggling.').to.exist;
      await waitForRender();
      toggle.click();
      await waitForRender();

      expect(
        fixture.app.tasks[0]?.completed,
        'App state should reflect completed after toggle.',
      ).to.equal(true);
      expect(
        getBoardItem()?.task?.completed,
        'Task-item property should reflect completed after toggle.',
      ).to.equal(true);
    });

    it('completed status is visible in task meta after toggle', async () => {
      const firstItem = getBoardItem();
      const toggle = getToggleControl(firstItem);

      expect(toggle, 'Toggle control should exist before toggling.').to.exist;
      await waitForRender();
      toggle.click();
      await waitForRender();

      expect(
        getBoardItem()?.shadowRoot?.querySelector('.task-meta')?.textContent?.trim() ?? '',
        'Task meta should display "Completed" after toggle.',
      ).to.equal('Completed');
    });
  });

  it('should toggle completed on first and last tasks', async () => {
    const fixture = await mountEmptyFixture();

    for (let i = 0; i < 3; i++) {
      await addTaskWithHostInput(`edge${i}`);
    }

    const firstToggle = getToggleControl(getBoardItem(0));
    expect(firstToggle, 'First task should expose a toggle control.').to.exist;
    firstToggle.click();
    await waitForRender();
    expect(fixture.app.tasks[0]?.completed, 'First task should be marked completed.').to.equal(true);

    const lastToggle = getToggleControl(getBoardItem(2));
    expect(lastToggle, 'Last task should expose a toggle control.').to.exist;
    lastToggle.click();
    await waitForRender();
    expect(fixture.app.tasks[2]?.completed, 'Last task should be marked completed.').to.equal(true);
  });
});
