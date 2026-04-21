import { expect } from '../helpers/browser-test-harness.js';
import {
  clearRegressionDashboardFixture,
  mountRegressionComponent,
  mountRegressionDashboard,
} from '../fixtures/regression-dashboard.fixture.js';

describe('Regression Dashboard Components', () => {
  afterEach(() => {
    clearRegressionDashboardFixture();
  });

  it('renders summary values and status state', async () => {
    const { element: summary } = await mountRegressionComponent('regression-summary');

    summary.setStatus('passed');
    summary.setValues({
      passRate: 100,
      totalLabel: '12 registered',
      failuresLabel: '0 failures',
      durationLabel: '340 ms',
      heading: 'Regression suite passed',
      body: 'No failures detected.',
    });
    await summary.updateComplete;

    expect(summary.dataset.status).to.equal('passed');
    expect(summary.querySelector('#summary-heading')?.textContent).to.equal('Regression suite passed');
    expect(summary.querySelector('#summary-percent')?.textContent).to.equal('100%');
    expect(summary.querySelector('#summary-tests-chip')?.textContent).to.equal('12 registered');
  });

  it('updates toolbar active filter state declaratively', async () => {
    const { element: toolbar } = await mountRegressionComponent('regression-toolbar');

    toolbar.setActiveFilter('fail');
    await toolbar.updateComplete;

    expect(toolbar.querySelector('[data-filter="all"]')?.dataset.active).to.equal('false');
    expect(toolbar.querySelector('[data-filter="fail"]')?.dataset.active).to.equal('true');
    expect(toolbar.querySelector('[data-filter="pass"]')?.dataset.active).to.equal('false');
  });

  it('shows and hides the failure panel state', async () => {
    const { element: panel } = await mountRegressionComponent('regression-failure-list');

    panel.setVisible(true);
    await panel.updateComplete;
    expect(panel.dataset.visible).to.equal('true');

    panel.setVisible(false);
    await panel.updateComplete;
    expect(panel.dataset.visible).to.equal('false');
  });

  it('filters mocha test rows by active filter and search term', async () => {
    const { dashboard } = await mountRegressionDashboard();

    dashboard.querySelector('#mocha').innerHTML = `
      <ul id="mocha-report">
        <li class="suite">
          <h1>Task Suite</h1>
          <ul>
            <li class="test pass">Task Suite passes alpha</li>
            <li class="test fail">Task Suite fails beta</li>
          </ul>
        </li>
      </ul>
    `;

    dashboard.setExecutedCount(2);
    dashboard.setToolbarFilter('fail');
    dashboard.searchInput.value = 'beta';
    dashboard.applyFilters();
    await dashboard.metrics.updateComplete;

    const rows = dashboard.querySelectorAll('#mocha li.test');
    expect(rows[0].classList.contains('is-hidden')).to.equal(true);
    expect(rows[1].classList.contains('is-hidden')).to.equal(false);
    expect(dashboard.metrics.querySelector('#metric-filtered')?.textContent).to.equal('1 visible • 2 executed');
  });

  it('finalizeRun updates summary, metrics, failure list, and row metadata', async () => {
    const { dashboard } = await mountRegressionDashboard();

    dashboard.querySelector('#mocha').innerHTML = `
      <ul id="mocha-report">
        <li class="suite">
          <h1>Kanban Board Unit Tests</h1>
          <ul>
            <li class="test pass">groups upcoming tasks</li>
            <li class="test fail">moves tasks between columns</li>
          </ul>
        </li>
      </ul>
    `;

    dashboard.finalizeRun({
      failures: 1,
      runMetrics: {
        registeredTests: 2,
        allTests: [
          { index: 0, title: 'groups upcoming tasks', fullTitle: 'Kanban Board Unit Tests groups upcoming tasks', duration: 3, state: 'passed' },
          { index: 1, title: 'moves tasks between columns', fullTitle: 'Kanban Board Unit Tests moves tasks between columns', duration: 7, state: 'failed' },
        ],
        passedTests: [
          { index: 0, title: 'groups upcoming tasks', fullTitle: 'Kanban Board Unit Tests groups upcoming tasks', duration: 3 },
        ],
        failedTests: [
          { index: 1, title: 'moves tasks between columns', fullTitle: 'Kanban Board Unit Tests moves tasks between columns', duration: 7 },
        ],
      },
    });
    await dashboard.updateComplete;
    await dashboard.summary.updateComplete;
    await dashboard.metrics.updateComplete;
    await dashboard.failurePanel.updateComplete;

    expect(dashboard.summary.dataset.status).to.equal('failed');
    expect(dashboard.summary.querySelector('#summary-heading')?.textContent).to.equal('1 failure need attention');
    expect(dashboard.metrics.querySelector('#metric-total')?.textContent).to.equal('2');
    expect(dashboard.metrics.querySelector('#metric-failures')?.textContent).to.equal('1');
    expect(dashboard.failurePanel.dataset.visible).to.equal('true');
    expect(dashboard.failureList.children).to.have.length(1);
    expect(dashboard.failureList.textContent).to.contain('Kanban Board Unit Tests moves tasks between columns');
    expect(dashboard.mochaMount?.dataset.hidden).to.equal('true');
    expect(dashboard.querySelector('#test-row-0')?.dataset.testIndex).to.equal('0');
    expect(dashboard.querySelector('#test-row-1')?.dataset.testIndex).to.equal('1');
  });
});
