import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import { mountTaskSnackbar } from '../fixtures/task-snackbar.fixture.js';

describe('Task Snackbar Unit Tests', () => {
  let fixture;

  beforeEach(async () => {
    fixture = await mountTaskSnackbar();
  });

  it('renders the provided message text', async () => {
    fixture.snackbar.message = 'Saved successfully.';
    await waitForRender();

    const message = fixture.shadow.querySelector('.message')?.textContent?.trim() ?? '';
    expect(message, 'Snackbar should render the current message text.').to.equal('Saved successfully.');
  });

  it('uses status semantics for non-error tones', async () => {
    fixture.snackbar.tone = 'success';
    fixture.snackbar.open = true;
    await waitForRender();

    const root = fixture.shadow.querySelector('.snackbar');
    expect(root?.getAttribute('role'), 'Non-error snackbar should use role=status.').to.equal('status');
    expect(root?.getAttribute('aria-live'), 'Non-error snackbar should announce politely.').to.equal('polite');
  });

  it('uses alert semantics for error tone', async () => {
    fixture.snackbar.tone = 'error';
    fixture.snackbar.open = true;
    await waitForRender();

    const root = fixture.shadow.querySelector('.snackbar');
    expect(root?.getAttribute('role'), 'Error snackbar should use role=alert.').to.equal('alert');
    expect(root?.getAttribute('aria-live'), 'Error snackbar should announce assertively.').to.equal('assertive');
  });

  it('updates aria-hidden based on open state', async () => {
    fixture.snackbar.open = false;
    await waitForRender();
    expect(
      fixture.shadow.querySelector('.snackbar')?.getAttribute('aria-hidden'),
      'Closed snackbar should be aria-hidden.',
    ).to.equal('true');

    fixture.snackbar.open = true;
    await waitForRender();
    expect(
      fixture.shadow.querySelector('.snackbar')?.getAttribute('aria-hidden'),
      'Open snackbar should not be aria-hidden.',
    ).to.equal('false');
  });

  it('emitDismiss dispatches snackbar-dismiss', async () => {
    let emitted = false;

    fixture.snackbar.addEventListener('snackbar-dismiss', () => {
      emitted = true;
    }, { once: true });

    fixture.snackbar.emitDismiss();
    await waitForRender();

    expect(emitted, 'emitDismiss should dispatch snackbar-dismiss.').to.equal(true);
  });
});
