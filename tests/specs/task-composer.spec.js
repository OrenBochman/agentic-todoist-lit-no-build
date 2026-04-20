import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import { mountTaskComposer, waitForTaskAdd } from '../fixtures/task-composer.fixture.js';

describe('Task Composer Regression', () => {
  let fixture;

  beforeEach(async () => {
    fixture = await mountTaskComposer();
    // Diagnostic: fail fast if input or button missing
    if (!fixture.input || !fixture.button) {
      // Log the shadow DOM for debugging
      // eslint-disable-next-line no-console
      console.error('[diagnostic] composer shadow:', fixture.shadow.innerHTML);
      throw new Error('wa-input or wa-button not found in composer shadow DOM');
    }
  });


  it('add click emits entered task', async () => {
    const addedTask = waitForTaskAdd(fixture.composer);
    fixture.input.value = 'test 123';
    fixture.button.click();
    await waitForRender();
    expect(await addedTask, 'Add click should emit the entered task.').to.deep.equal({
      text: 'test 123',
      dueDate: null,
      project: null,
      importance: null,
      dependsOn: [],
      workloadEstimate: 4,
      workloadUncertainty: 1,
      tags: [],
    });
  });

  it('add click clears validation and resets input', async () => {
    const addedTask = waitForTaskAdd(fixture.composer);
    fixture.input.value = 'test 123';
    fixture.button.click();
    await waitForRender();
    expect(fixture.shadow.querySelector('.validation'), 'Validation message should be cleared after add.').to.equal(null);
    expect(fixture.input.value, 'Input should be reset after add.').to.equal('');
    // Drain the promise to avoid unhandled rejection
    await addedTask;
  });


  it('native input: add click emits live value', async () => {
    const addedTask = waitForTaskAdd(fixture.composer);
    const internalInput = fixture.input.shadowRoot?.querySelector('input');
    expect(internalInput, 'Native input should exist in wa-input shadowRoot.').to.exist;
    internalInput.value = 'native typed submit';
    internalInput.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        composed: true,
        data: 't',
        inputType: 'insertText',
      }),
    );
    await waitForRender();
    fixture.button.click();
    await waitForRender();
    expect(await addedTask, 'Add click should emit the live native input value.').to.deep.equal({
      text: 'native typed submit',
      dueDate: null,
      project: null,
      importance: null,
      dependsOn: [],
      workloadEstimate: 4,
      workloadUncertainty: 1,
      tags: [],
    });
  });

  it('native input: add click resets input', async () => {
    const addedTask = waitForTaskAdd(fixture.composer);
    const internalInput = fixture.input.shadowRoot?.querySelector('input');
    expect(internalInput, 'Native input should exist in wa-input shadowRoot.').to.exist;
    internalInput.value = 'native typed submit';
    internalInput.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        composed: true,
        data: 't',
        inputType: 'insertText',
      }),
    );
    await waitForRender();
    fixture.button.click();
    await waitForRender();
    expect(fixture.input.value, 'Input should be reset after native add.').to.equal('');
    // Drain the promise to avoid unhandled rejection
    await addedTask;
  });


  it('form submit emits entered value', async () => {
    const addedTask = waitForTaskAdd(fixture.composer);
    fixture.input.value = 'enter submit';
    fixture.input.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
    await waitForRender();
    fixture.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await waitForRender();
    expect(await addedTask, 'Form submit should emit the entered value.').to.deep.equal({
      text: 'enter submit',
      dueDate: null,
      project: null,
      importance: null,
      dependsOn: [],
      workloadEstimate: 4,
      workloadUncertainty: 1,
      tags: [],
    });
  });

  it('form submit resets input after submit', async () => {
    const addedTask = waitForTaskAdd(fixture.composer);
    fixture.input.value = 'enter submit';
    fixture.input.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
    await waitForRender();
    fixture.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await waitForRender();
    expect(fixture.input.value, 'Input should be reset after form submit.').to.equal('');
    // Drain the promise to avoid unhandled rejection
    await addedTask;
  });


  it('empty submit shows required validation', async () => {
    fixture.input.value = '';
    fixture.button.click();
    await waitForRender();
    expect(
      fixture.shadow.querySelector('.validation')?.textContent?.trim(),
      'Validation message should appear for empty submit.'
    ).to.equal('Enter a task before adding it.');
  });


  it('validation message clears when text is re-entered', async () => {
    fixture.input.value = '';
    fixture.button.click();
    await waitForRender();
    fixture.input.value = 'test 123';
    fixture.input.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
    await waitForRender();
    expect(
      fixture.shadow.querySelector('.validation'),
      'Validation message should clear when text is re-entered.'
    ).to.equal(null);
  });
});