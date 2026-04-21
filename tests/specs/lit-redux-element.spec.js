import { expect } from '../helpers/browser-test-harness.js';
import { setTheme, setTasks } from '../../components/redux-store.js';
import {
  clearLitReduxFixture,
  mountLitReduxElement,
  resetReduxFixtureState,
  store,
} from '../fixtures/lit-redux-element.fixture.js';

describe('Lit Redux Element Unit Tests', () => {
  beforeEach(async () => {
    await resetReduxFixtureState();
  });

  afterEach(async () => {
    clearLitReduxFixture();
    await resetReduxFixtureState();
  });

  it('captures the current store state in the constructor', () => {
    store.dispatch(setTheme('dark'));

    const element = document.createElement('test-lit-redux-element');

    expect(element.reduxState.theme, 'Constructor should snapshot the current store theme.').to.equal('dark');
  });

  it('refreshes its redux snapshot when connected after the store changes', async () => {
    const element = document.createElement('test-lit-redux-element');

    store.dispatch(setTheme('dark'));

    document.getElementById('mount').replaceChildren(element);
    await customElements.whenDefined('test-lit-redux-element');
    await element.updateComplete;

    expect(element.reduxState.theme, 'Connected element should refresh stale constructor state from the store.').to.equal('dark');
    expect(
      element.shadowRoot.querySelector('.state')?.textContent?.trim(),
      'Rendered state should reflect the refreshed store snapshot.',
    ).to.equal('0|all|dark');
  });

  it('updates when the store changes while connected', async () => {
    const { element } = await mountLitReduxElement();

    store.dispatch(setTasks([{ id: 'one', text: 'One', completed: false, createdAt: new Date().toISOString() }]));
    store.dispatch(setTheme('dark'));
    await element.updateComplete;

    expect(element.reduxState.tasks.length, 'Connected element should receive task updates from the store.').to.equal(1);
    expect(element.reduxState.theme, 'Connected element should receive theme updates from the store.').to.equal('dark');
    expect(
      element.shadowRoot.querySelector('.state')?.textContent?.trim(),
      'Rendered output should reflect the latest connected store state.',
    ).to.equal('1|all|dark');
  });

  it('dispatch forwards actions to the store and updates the local snapshot', async () => {
    const { element } = await mountLitReduxElement();

    element.dispatch(setTheme('dark'));

    expect(store.getState().theme, 'dispatch should forward the action to the Redux store.').to.equal('dark');
    expect(element.reduxState.theme, 'dispatch should refresh the element redux snapshot.').to.equal('dark');
  });

  it('stops receiving store updates after disconnect', async () => {
    const { element } = await mountLitReduxElement();

    element.remove();
    store.dispatch(setTheme('dark'));

    expect(element.reduxState.theme, 'Disconnected element should keep its last known redux snapshot.').to.equal('light');
  });
});
