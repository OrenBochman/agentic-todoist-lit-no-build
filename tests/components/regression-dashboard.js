import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class RegressionSummary extends LitElement {
  static properties = {
    body: { state: true },
    durationLabel: { state: true },
    failuresLabel: { state: true },
    heading: { state: true },
    passRate: { state: true },
    status: { state: true },
    totalLabel: { state: true },
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.body = 'Collecting results from the browser suite.';
    this.durationLabel = '0 ms';
    this.failuresLabel = '0 failures';
    this.heading = 'Running regression suite...';
    this.passRate = 0;
    this.status = 'running';
    this.totalLabel = '0 tests';
  }

  setStatus(status) {
    this.status = status;
  }

  setValues({ passRate, totalLabel, failuresLabel, durationLabel, heading, body }) {
    this.passRate = passRate;
    this.totalLabel = totalLabel;
    this.failuresLabel = failuresLabel;
    this.durationLabel = durationLabel;
    this.heading = heading;
    this.body = body;
  }

  render() {
    return html`
      <div class="summary-layout">
        <div class="summary-ring" id="summary-ring" style=${`--progress: ${(this.passRate / 100) * 360}deg;`}>
          <div class="summary-ring-value" id="summary-percent">${this.passRate}%</div>
        </div>
        <div class="summary-copy">
          <h2 class="summary-heading" id="summary-heading">${this.heading}</h2>
          <div class="summary-body" id="summary-body">${this.body}</div>
          <div class="summary-meta">
            <span class="summary-chip" id="summary-tests-chip">${this.totalLabel}</span>
            <span class="summary-chip fail" id="summary-failures-chip">${this.failuresLabel}</span>
            <span class="summary-chip" id="summary-duration-chip">${this.durationLabel}</span>
          </div>
        </div>
      </div>
    `;
  }

  updated() {
    this.dataset.status = this.status;
  }
}

class RegressionMetrics extends LitElement {
  static properties = {
    duration: { state: true },
    failures: { state: true },
    filtered: { state: true },
    slowest: { state: true },
    topFailure: { state: true },
    total: { state: true },
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.duration = '0 ms';
    this.failures = 0;
    this.filtered = 'No results yet';
    this.slowest = 'No timing data yet';
    this.topFailure = 'No failures recorded';
    this.total = 0;
  }

  setValues({ total, filtered, failures, duration, slowest, topFailure }) {
    this.total = total;
    this.filtered = filtered;
    this.failures = failures;
    this.duration = duration;
    this.slowest = slowest;
    this.topFailure = topFailure;
  }

  render() {
    return html`
      <article class="metric-card">
        <div class="metric-label">Registered</div>
        <div class="metric-value" id="metric-total">${this.total}</div>
        <div class="metric-subcopy" id="metric-filtered">${this.filtered}</div>
      </article>
      <article class="metric-card">
        <div class="metric-label">Failing</div>
        <div class="metric-value fail" id="metric-failures">${this.failures}</div>
        <div class="metric-subcopy" id="metric-top-failure">${this.topFailure}</div>
      </article>
      <article class="metric-card">
        <div class="metric-label">Duration</div>
        <div class="metric-value duration" id="metric-duration">${this.duration}</div>
        <div class="metric-subcopy" id="metric-slowest">${this.slowest}</div>
      </article>
    `;
  }
}

class RegressionToolbar extends LitElement {
  static properties = {
    activeFilter: { state: true },
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.activeFilter = 'all';
  }

  get filterButtons() {
    return [...this.querySelectorAll('.filter-button')];
  }

  get searchInput() {
    return this.querySelector('#test-search');
  }

  setActiveFilter(filter) {
    this.activeFilter = filter;
  }

  render() {
    return html`
      <div class="toolbar-group">
        <button class="filter-button" type="button" data-filter="all" data-active=${String(this.activeFilter === 'all')}>All</button>
        <button class="filter-button" type="button" data-filter="fail" data-active=${String(this.activeFilter === 'fail')}>Failures</button>
        <button class="filter-button" type="button" data-filter="pass" data-active=${String(this.activeFilter === 'pass')}>Passing</button>
      </div>
      <div class="toolbar-group">
        <input id="test-search" type="search" placeholder="Filter tests by title or suite" aria-label="Filter tests by title or suite" />
      </div>
    `;
  }
}

class RegressionFailureList extends LitElement {
  static properties = {
    visible: { state: true },
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.visible = false;
  }

  get listElement() {
    return this.querySelector('#failure-list');
  }

  setVisible(isVisible) {
    this.visible = isVisible;
  }

  render() {
    return html`
      <h2 class="failure-title">Failure List</h2>
      <ol id="failure-list" class="failure-list"></ol>
    `;
  }

  updated() {
    this.dataset.visible = String(this.visible);
  }
}

export class RegressionDashboard extends LitElement {
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

  setStatus(status) {
    this.summary?.setStatus(status);
  }

  setSummary(values) {
    this.summary?.setValues(values);
  }

  setToolbarFilter(filter) {
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

customElements.define('regression-summary', RegressionSummary);
customElements.define('regression-metrics', RegressionMetrics);
customElements.define('regression-toolbar', RegressionToolbar);
customElements.define('regression-failure-list', RegressionFailureList);
customElements.define('regression-dashboard', RegressionDashboard);
