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