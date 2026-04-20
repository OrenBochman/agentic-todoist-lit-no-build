import '../../components/task-transfer-controls.js';
import { waitForRender } from '../helpers/browser-test-harness.js';
import { discoverWebAwesome } from '../helpers/webawesome-test-setup.js';

export const mountTaskTransferControls = async () => {
  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();

  const transfer = document.createElement('task-transfer-controls');
  transfer.setAttribute('data-wa-preload', 'wa-button');
  mount.append(transfer);

  await customElements.whenDefined('task-transfer-controls');
  await discoverWebAwesome(transfer, ['wa-button']);
  await customElements.whenDefined('wa-button');
  await waitForRender();

  const shadow = transfer.shadowRoot;

  return {
    mount,
    transfer,
    shadow,
    fileInput: shadow.querySelector('#file-input'),
    buttons: [...shadow.querySelectorAll('wa-button')],
  };
};

export const setFileList = (input, file) => {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: file ? [file] : [],
  });
};
