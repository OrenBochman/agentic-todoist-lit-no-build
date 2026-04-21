import { html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { LitReduxElement } from '../../components/lit-redux-element.js';
import { store, resetStoreState } from '../../components/redux-store.js';
const TEST_TAG = 'test-lit-redux-element';

if (!customElements.get(TEST_TAG)) {
  class TestLitReduxElement extends LitReduxElement {
    render() {
      return html`
        <div class="state">
          ${this.reduxState.tasks.length}|${this.reduxState.filter}|${this.reduxState.theme}
        </div>
      `;
    }
  }

  customElements.define(TEST_TAG, TestLitReduxElement);
}

export const resetReduxFixtureState = () => {
  const maybeMountedElement = document.getElementById('mount')?.querySelector(TEST_TAG);
  resetStoreState();
  return maybeMountedElement?.updateComplete ?? Promise.resolve();
};

export const clearLitReduxFixture = () => {
  document.getElementById('mount')?.replaceChildren();
};

export const mountLitReduxElement = async () => {
  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();

  const element = document.createElement(TEST_TAG);
  mount.append(element);

  await customElements.whenDefined(TEST_TAG);
  await element.updateComplete;

  return {
    mount,
    element,
    shadow: element.shadowRoot,
  };
};

export { store };
