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
