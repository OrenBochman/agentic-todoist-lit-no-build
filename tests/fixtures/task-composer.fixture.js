import '../../components/task-composer.js';
import { waitForRender } from '../helpers/browser-test-harness.js';
import { discoverWebAwesome } from '../helpers/webawesome-test-setup.js';

// Fixture: mount a fresh task-composer with its Web Awesome input and button ready for each test.
export const mountTaskComposer = async () => {
  console.log('[diagnostic] mountTaskComposer: start');
  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();

  const composer = document.createElement('task-composer');
  // Set data-wa-preload on the custom element before discovery
  composer.setAttribute('data-wa-preload', 'wa-button wa-input');
  mount.append(composer);

  await customElements.whenDefined('task-composer');
  await discoverWebAwesome(composer, ['wa-button', 'wa-input']);
  await customElements.whenDefined('wa-input');
  await customElements.whenDefined('wa-button');
  await waitForRender();

  const shadow = composer.shadowRoot;
  // Diagnostic logs for DOM queries
  const input = shadow.querySelector('wa-input');
  const button = shadow.querySelector('wa-button');
  console.log('[diagnostic] wa-input in shadow:', !!input);
  console.log('[diagnostic] wa-button in shadow:', !!button);

  return {
    composer,
    shadow,
    input,
    button,
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