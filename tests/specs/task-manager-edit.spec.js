import {
  expect,
  getFixture,
  mountEmptyFixture,
  mountSeededFixture,
  clearFixture,
  addTaskWithHostInput,
  getBoardItem,
  getEditableTaskMain,
  getSaveButton,
  getNativeInput,
  openEditMode,
  waitForRender,
} from './task-manager-test-helpers.js';

describe('Task Manager Edit Regression', () => {
  afterEach(() => {
    clearFixture();
  });

  describe('long-press edit', () => {
    beforeEach(async () => {
      await mountSeededFixture();
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

      expect(firstItem.shadowRoot.querySelector('wa-input'), 'wa-input should be present in edit mode.').to.exist;
    });

    it('edit mode reconstructs the full task input text', async () => {
      const fixture = getFixture();
      fixture.app.tasks = [{
        id: 'seed-task',
        text: 'Review roadmap',
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: '2026-05-01',
        project: 'Work',
        importance: 2,
        dependsOn: [],
        workloadEstimate: 4,
        workloadUncertainty: 1,
        tags: ['planning', 'team'],
        inProgress: true,
        sectionShortcut: '/in',
        section: 'in',
      }];
      await waitForRender();

      const firstItem = getBoardItem();
      await openEditMode(firstItem);

      const editInput = firstItem.shadowRoot.querySelector('wa-input');
      expect(editInput?.value, 'Edit input should reconstruct text plus metadata tokens.').to.equal(
        'Review roadmap 2026-05-01 #Work @planning @team p2 /in',
      );
    });

    it('edit mode preserves date-only due values without adding a time', async () => {
      const fixture = getFixture();
      fixture.app.tasks = [{
        id: 'seed-task',
        text: 'meeting',
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: '1987-12-12',
        project: null,
        importance: null,
        dependsOn: [],
        workloadEstimate: 4,
        workloadUncertainty: 1,
        tags: [],
        inProgress: false,
        sectionShortcut: '/up',
        section: 'up',
      }];
      await waitForRender();

      const firstItem = getBoardItem();
      await openEditMode(firstItem);

      const editInput = firstItem.shadowRoot.querySelector('wa-input');
      expect(editInput?.value, 'Date-only tasks should stay date-only in edit mode.').to.equal('meeting 1987-12-12 /up');
    });

    it('edit mode: save button is present', async () => {
      const firstItem = getBoardItem();

      await openEditMode(firstItem);

      expect(getSaveButton(firstItem), 'Save button should be present in edit mode.').to.exist;
    });

    it('edit mode: saving host wa-input value updates app state and board', async () => {
      const fixture = getFixture();
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

      expect(fixture.app.tasks[0]?.text, 'App state should update after save.').to.equal('edited task text');
      expect(
        getBoardItem()?.shadowRoot?.querySelector('.task-text')?.textContent?.trim() ?? '',
        'Board should render updated text after save.',
      ).to.equal('edited task text');
    });

    it('edit mode reparses metadata when saving', async () => {
      const fixture = getFixture();
      const firstItem = getBoardItem();

      await openEditMode(firstItem);

      const editInput = firstItem.shadowRoot.querySelector('wa-input');
      const saveButton = getSaveButton(firstItem);
      expect(editInput, 'wa-input should be present in edit mode.').to.exist;
      expect(saveButton, 'Save button should be present in edit mode.').to.exist;

      editInput.value = 'edited task 2026-05-02 #Work @home p2 /in';
      editInput.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
      await waitForRender();
      saveButton.click();
      await waitForRender();

      expect(fixture.app.tasks[0]?.text, 'App state should update parsed title after save.').to.equal('edited task');
      expect(fixture.app.tasks[0]?.project, 'Project should be reparsed after save.').to.equal('Work');
      expect(fixture.app.tasks[0]?.tags, 'Tags should be reparsed after save.').to.deep.equal(['home']);
      expect(fixture.app.tasks[0]?.importance, 'Priority should be reparsed after save.').to.equal(2);
      expect(fixture.app.tasks[0]?.sectionShortcut, 'Section shortcut should be reparsed after save.').to.equal('/in');
      expect(fixture.app.tasks[0]?.inProgress, 'Section state should be reparsed after save.').to.equal(true);
    });

    it('edit mode saves updated due date, section, and tags together', async () => {
      const fixture = getFixture();
      const firstItem = getBoardItem();

      await openEditMode(firstItem);

      const editInput = firstItem.shadowRoot.querySelector('wa-input');
      const saveButton = getSaveButton(firstItem);
      expect(editInput, 'wa-input should be present in edit mode.').to.exist;
      expect(saveButton, 'Save button should be present in edit mode.').to.exist;

      editInput.value = 'meeting 2020-12-12 /up @toc';
      editInput.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
      await waitForRender();
      saveButton.click();
      await waitForRender();

      expect(fixture.app.tasks[0]?.text, 'Edited task title should save.').to.equal('meeting');
      expect(fixture.app.tasks[0]?.dueDate, 'Edited due date should save without a time shift.').to.equal('2020-12-12');
      expect(fixture.app.tasks[0]?.sectionShortcut, 'Edited section should save.').to.equal('/up');
      expect(fixture.app.tasks[0]?.tags, 'Edited tags should save.').to.deep.equal(['toc']);
    });

    it('edit mode: saving native input value updates app state and board', async () => {
      const fixture = getFixture();
      const firstItem = getBoardItem();

      await openEditMode(firstItem);

      const internalEditInput = getNativeInput(firstItem.shadowRoot.querySelector('wa-input'));
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

      expect(fixture.app.tasks[0]?.text, 'App state should update after saving native input.').to.equal('edited through native input');
      expect(
        getBoardItem()?.shadowRoot?.querySelector('.task-text')?.textContent?.trim() ?? '',
        'Board should render updated text after saving native input.',
      ).to.equal('edited through native input');
    });
  });

  it('should not allow editing a task to empty or whitespace (unit: edge case)', async () => {
    await mountEmptyFixture();
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
});
