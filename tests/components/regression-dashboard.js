import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './regression-failure-list.js';
import './regression-metrics.js';
import './regression-summary.js';
import './regression-toolbar.js';

export class RegressionDashboard extends LitElement {
  static properties = {
    activeFilter: { state: true },
    executedCount: { state: true },
  };

  constructor() {
    super();
    this.activeFilter = 'all';
    this.executedCount = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleToolbarClick);
    this.addEventListener('input', this.handleToolbarInput);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleToolbarClick);
    this.removeEventListener('input', this.handleToolbarInput);
    super.disconnectedCallback();
  }

  get failureList() {
    return this.querySelector('regression-failure-list')?.listElement ?? null;
  }

  get filterButtons() {
    return this.querySelector('regression-toolbar')?.filterButtons ?? [];
  }

  get mochaMount() {
    return this.querySelector('#mount');
  }

  get searchInput() {
    return this.querySelector('regression-toolbar')?.searchInput ?? null;
  }

  get summary() {
    return this.querySelector('regression-summary');
  }

  get toolbar() {
    return this.querySelector('regression-toolbar');
  }

  get failurePanel() {
    return this.querySelector('regression-failure-list');
  }

  get metrics() {
    return this.querySelector('regression-metrics');
  }

  createRenderRoot() {
    return this;
  }

  countRegisteredTests(suite) {
    if (!suite) {
      return 0;
    }

    const childSuites = Array.isArray(suite.suites) ? suite.suites : [];
    const ownTests = Array.isArray(suite.tests) ? suite.tests.length : 0;
    return ownTests + childSuites.reduce((total, childSuite) => total + this.countRegisteredTests(childSuite), 0);
  }

  formatDuration(duration) {
    if (!Number.isFinite(duration)) {
      return '0 ms';
    }

    return duration >= 1000 ? `${(duration / 1000).toFixed(2)} s` : `${Math.round(duration)} ms`;
  }

  getEntryLabel(entry) {
    return entry.fullTitle || entry.title || 'Unnamed test';
  }

  assignTestRowIds() {
    const testRows = [...this.querySelectorAll('#mocha-report > li.test, #mocha-report li.test')];
    testRows.forEach((row, index) => {
      row.dataset.testIndex = String(index);
      if (!row.id) {
        row.id = `test-row-${index}`;
      }
    });
  }

  handleToolbarClick = (event) => {
    const button = event.target.closest('.filter-button');
    if (!button || !this.contains(button)) {
      return;
    }

    this.setToolbarFilter(button.dataset.filter || 'all');
    this.applyFilters();
  };

  handleToolbarInput = (event) => {
    if (event.target?.id !== 'test-search' || !this.contains(event.target)) {
      return;
    }

    this.applyFilters();
  };

  renderFailureEntries(entries) {
    const failureList = this.failureList;
    if (!failureList) {
      return;
    }

    failureList.replaceChildren();

    if (!entries.length) {
      this.setFailureListVisible(false);
      return;
    }

    const testRowsByIndex = new Map();
    this.querySelectorAll('#mocha [data-test-index]').forEach((row) => {
      const index = Number.parseInt(row.dataset.testIndex || '', 10);
      if (Number.isInteger(index)) {
        testRowsByIndex.set(index, row);
      }
    });

    entries.forEach((entry, index) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const row = testRowsByIndex.get(entry.index) ?? null;

      link.href = row ? `#${row.id}` : '#mocha';
      link.textContent = `${index + 1}. ${this.getEntryLabel(entry)}`;
      link.addEventListener('click', () => {
        this.querySelectorAll('#mocha .test.highlighted').forEach((node) => {
          node.classList.remove('highlighted');
        });
        if (row) {
          row.classList.add('highlighted');
        }
      });

      item.append(link);
      failureList.append(item);
    });

    this.setFailureListVisible(true);
  }

  applyFilters() {
    const searchTerm = this.searchInput?.value.trim().toLowerCase() || '';
    const testRows = [...this.querySelectorAll('#mocha li.test')];
    let visibleCount = 0;

    testRows.forEach((row) => {
      const isPass = row.classList.contains('pass');
      const isFail = row.classList.contains('fail');
      const text = row.textContent.toLowerCase();
      const matchesFilter = this.activeFilter === 'all'
        || (this.activeFilter === 'pass' && isPass)
        || (this.activeFilter === 'fail' && isFail);
      const matchesSearch = !searchTerm || text.includes(searchTerm);
      const visible = matchesFilter && matchesSearch;

      row.classList.toggle('is-hidden', !visible);
      if (visible) {
        visibleCount += 1;
      }
    });

    const suiteRows = [...this.querySelectorAll('#mocha-report li.suite')].reverse();
    suiteRows.forEach((suiteRow) => {
      const visibleChildTests = suiteRow.querySelectorAll(':scope > ul > li.test:not(.is-hidden)');
      const visibleChildSuites = suiteRow.querySelectorAll(':scope > ul > li.suite:not(.is-hidden)');
      const hasVisibleContent = visibleChildTests.length > 0 || visibleChildSuites.length > 0;
      suiteRow.classList.toggle('is-hidden', !hasVisibleContent);
    });

    this.setFilteredMetrics(`${visibleCount} visible • ${this.executedCount} executed`);
  }

  setFailureListVisible(isVisible) {
    this.failurePanel?.setVisible(isVisible);
  }

  setFilteredMetrics(filteredLabel) {
    const metrics = this.metrics;
    if (!metrics) {
      return;
    }

    metrics.setValues({
      total: metrics.total,
      filtered: filteredLabel,
      failures: metrics.failures,
      duration: metrics.duration,
      slowest: metrics.slowest,
      topFailure: metrics.topFailure,
    });
  }

  setMetrics(values) {
    this.metrics?.setValues(values);
  }

  setExecutedCount(count) {
    this.executedCount = count;
  }

  syncRunMetrics(runMetrics) {
    const total = runMetrics.registeredTests || runMetrics.allTests.length;
    const executed = runMetrics.allTests.length;
    const failures = runMetrics.failedTests.length;
    const passes = runMetrics.passedTests.length;
    const duration = runMetrics.allTests.reduce((sum, test) => sum + (test.duration || 0), 0);
    const passRate = total ? Math.round((passes / total) * 100) : 0;
    const durationLabel = this.formatDuration(duration);
    const slowest = [...runMetrics.allTests]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))[0];

    if (!total) {
      this.setSummary({
        passRate,
        totalLabel: `${total} registered`,
        failuresLabel: `${failures} ${failures === 1 ? 'failure' : 'failures'}`,
        durationLabel,
        heading: 'Running regression suite...',
        body: 'Collecting results from the browser suite.',
      });
    } else if (!failures) {
      this.setSummary({
        passRate,
        totalLabel: `${total} registered`,
        failuresLabel: `${failures} ${failures === 1 ? 'failure' : 'failures'}`,
        durationLabel,
        heading: 'Regression suite passed',
        body: 'No failures detected. The dashboard is focused on failure triage, so the test list can stay filtered unless you need to inspect passes.',
      });
    } else {
      this.setSummary({
        passRate,
        totalLabel: `${total} registered`,
        failuresLabel: `${failures} ${failures === 1 ? 'failure' : 'failures'}`,
        durationLabel,
        heading: `${failures} ${failures === 1 ? 'failure' : 'failures'} need attention`,
        body: 'The list below is filtered to failing tests by default so the useful information stays on screen.',
      });
    }

    this.setMetrics({
      total,
      filtered: `${this.querySelectorAll('#mocha li.test:not(.is-hidden)').length} visible • ${executed} executed`,
      failures,
      duration: durationLabel,
      slowest: slowest
        ? `${this.getEntryLabel(slowest)} • ${this.formatDuration(slowest.duration || 0)}`
        : 'No timing data yet',
      topFailure: runMetrics.failedTests.length
        ? this.getEntryLabel(runMetrics.failedTests[0])
        : 'No failures recorded',
    });
  }

  finalizeRun({ failures, runMetrics }) {
    this.setStatus(failures === 0 ? 'passed' : 'failed');
    this.setExecutedCount(runMetrics.allTests.length);
    this.hideMount();
    this.assignTestRowIds();
    this.syncRunMetrics(runMetrics);
    this.renderFailureEntries(runMetrics.failedTests);
    this.applyFilters();
  }

  setStatus(status) {
    this.summary?.setStatus(status);
  }

  setSummary(values) {
    this.summary?.setValues(values);
  }

  setToolbarFilter(filter) {
    this.activeFilter = filter;
    this.toolbar?.setActiveFilter(filter);
  }

  hideMount() {
    if (this.mochaMount) {
      this.mochaMount.dataset.hidden = 'true';
    }
  }

  render() {
    return html`
      <main>
        <section class="card">
          <h1>Task Manager Regression Dashboard</h1>
          <p>
            This page runs the full browser regression suite in one Mocha session so you can verify
            composer, app, hero, and transfer behavior from a single dashboard.
          </p>

          <regression-summary id="summary" data-status="running" aria-live="polite"></regression-summary>
          <regression-metrics class="dashboard-grid" aria-label="Regression metrics"></regression-metrics>
          <regression-toolbar class="dashboard-toolbar" aria-label="Dashboard controls"></regression-toolbar>
          <regression-failure-list id="failure-panel" class="failure-panel" aria-live="polite" data-visible="false"></regression-failure-list>

          <div id="mocha"></div>
          <div id="mount"></div>
        </section>
      </main>
    `;
  }
}

customElements.define('regression-dashboard', RegressionDashboard);
