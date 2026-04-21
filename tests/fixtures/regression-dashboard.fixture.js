import '../components/regression-dashboard.js';
import '../components/regression-failure-list.js';
import '../components/regression-metrics.js';
import '../components/regression-summary.js';
import '../components/regression-toolbar.js';

export const clearRegressionDashboardFixture = () => {
  const mount = document.getElementById('mount');
  mount?.replaceChildren();
};

export const mountRegressionComponent = async (tagName) => {
  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();
  const element = document.createElement(tagName);
  mount.append(element);
  await customElements.whenDefined(tagName);
  await element.updateComplete;

  return { mount, element };
};

export const mountRegressionDashboard = async () => {
  const fixture = await mountRegressionComponent('regression-dashboard');
  return {
    ...fixture,
    dashboard: fixture.element,
  };
};
