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

  getEntryLabel(entry) {
    return entry.fullTitle || entry.title || 'Unnamed test';
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
