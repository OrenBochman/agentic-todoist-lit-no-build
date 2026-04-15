import {
  discover,
  setBasePath,
  startLoader,
} from 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/webawesome.loader.js';
import '../../components/task-composer.js';
import { waitForRender } from '../helpers/browser-test-harness.js';

setBasePath('https://esm.sh/@awesome.me/webawesome@3.5.0/dist/');
startLoader();

// Fixture: mount a fresh task-composer with its Web Awesome input and button ready for each test.
export const mountTaskComposer = async () => {
  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();

  const composer = document.createElement('task-composer');
  mount.append(composer);

  await customElements.whenDefined('task-composer');
  await discover(mount);
  await customElements.whenDefined('wa-input');
  await customElements.whenDefined('wa-button');
  await waitForRender();

  const shadow = composer.shadowRoot;

  return {
    composer,
    shadow,
    input: shadow.querySelector('wa-input'),
    button: shadow.querySelector('wa-button'),
    form: shadow.querySelector('.composer-form'),
  };
};

// Fixture helper: capture the next task-add event so tests can assert on the emitted payload.
export const waitForTaskAdd = (composer) =>
  new Promise((resolve) => {
    composer.addEventListener(
      'task-add',
      (event) => {
        resolve(event.detail);
      },
      { once: true },
    );
  });