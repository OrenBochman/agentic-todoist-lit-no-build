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

  it('check that add click submits typed text in task-composer', async () => {
    const addedTask = waitForTaskAdd(fixture.composer);

    fixture.input.value = 'test 123';
    fixture.button.click();
    await waitForRender();

    // Assert: clicking the visible add button emits the entered task, 
    // clears validation, and resets the control.
    expect(await addedTask).to.deep.equal({ text: 'test 123' });
    expect(fixture.shadow.querySelector('.validation')).to.equal(null);
    expect(fixture.input.value).to.equal('');
  });

  it('native input sync submits live value on plus click in task-composer', async () => {
    const addedTask = waitForTaskAdd(fixture.composer);
    const internalInput = fixture.input.shadowRoot?.querySelector('input');

    // Assert: the Web Awesome input exposes a native input so the regression 
    // can be tested at the real typing surface.
    expect(internalInput).to.exist;

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

    // Assert: clicking add uses the live native input value and 
    // clears the wa-input control afterward.
    expect(await addedTask).to.deep.equal({ text: 'native typed submit' });
    expect(fixture.input.value).to.equal('');
  });

  it('form submit keeps enter behavior working in task-composer', async () => {
    const addedTask = waitForTaskAdd(fixture.composer);

    fixture.input.value = 'enter submit';
    fixture.input.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
    await waitForRender();

    fixture.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await waitForRender();

    // Assert: submit propagates the current typed value then resets the wa-input field on success.
    expect(await addedTask).to.deep.equal({ text: 'enter submit' });
    expect(fixture.input.value).to.equal('');
  });

  it('empty submit shows required validation in task-composer', async () => {
    fixture.input.value = '';
    fixture.button.click();
    await waitForRender();

    // Assert: empty submission still surfaces the user-facing validation copy.
    expect(fixture.shadow.querySelector('.validation')?.textContent?.trim()).to.equal(
      'Enter a task before adding it.',
    );
  });

  it('validation recovery clears once text is re-entered in task-composer', async () => {
    fixture.input.value = '';
    fixture.button.click();
    await waitForRender();

    fixture.input.value = 'test 123';
    fixture.input.dispatchEvent(new CustomEvent('wa-input', { bubbles: true, composed: true }));
    await waitForRender();

    // Assert: the validation message disappears as soon as the control has non-empty text again.
    expect(fixture.shadow.querySelector('.validation')).to.equal(null);
  });
});