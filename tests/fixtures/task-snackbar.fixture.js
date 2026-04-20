import '../../components/task-snackbar.js';
import { waitForRender } from '../helpers/browser-test-harness.js';

export const mountTaskSnackbar = async (opts = {}) => {
  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();

  const snackbar = document.createElement('task-snackbar');

  if (typeof opts.message === 'string') {
    snackbar.message = opts.message;
  }

  if (typeof opts.tone === 'string') {
    snackbar.tone = opts.tone;
  }

  if (typeof opts.open === 'boolean') {
    snackbar.open = opts.open;
  }

  mount.append(snackbar);
  await customElements.whenDefined('task-snackbar');
  await waitForRender();

  return {
    mount,
    snackbar,
    shadow: snackbar.shadowRoot,
  };
};
