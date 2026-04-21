const summaryTemplate = `
  <div class="summary-layout">
    <div class="summary-ring" id="summary-ring">
      <div class="summary-ring-value" id="summary-percent">0%</div>
    </div>
    <div class="summary-copy">
      <h2 class="summary-heading" id="summary-heading">Running regression suite...</h2>
      <div class="summary-body" id="summary-body">Collecting results from the browser suite.</div>
      <div class="summary-meta">
        <span class="summary-chip" id="summary-tests-chip">0 tests</span>
        <span class="summary-chip fail" id="summary-failures-chip">0 failures</span>
        <span class="summary-chip" id="summary-duration-chip">0 ms</span>
      </div>
    </div>
  </div>
`;

const metricsTemplate = `
  <article class="metric-card">
    <div class="metric-label">Registered</div>
    <div class="metric-value" id="metric-total">0</div>
    <div class="metric-subcopy" id="metric-filtered">No results yet</div>
  </article>
  <article class="metric-card">
    <div class="metric-label">Failing</div>
    <div class="metric-value fail" id="metric-failures">0</div>
    <div class="metric-subcopy" id="metric-top-failure">No failures recorded</div>
  </article>
  <article class="metric-card">
    <div class="metric-label">Duration</div>
    <div class="metric-value duration" id="metric-duration">0 ms</div>
    <div class="metric-subcopy" id="metric-slowest">No timing data yet</div>
  </article>
`;

const toolbarTemplate = `
  <div class="toolbar-group">
    <button class="filter-button" type="button" data-filter="all" data-active="true">All</button>
    <button class="filter-button" type="button" data-filter="fail" data-active="false">Failures</button>
    <button class="filter-button" type="button" data-filter="pass">Passing</button>
  </div>
  <div class="toolbar-group">
    <input id="test-search" type="search" placeholder="Filter tests by title or suite" aria-label="Filter tests by title or suite" />
  </div>
`;

const failureListTemplate = `
  <h2 class="failure-title">Failure List</h2>
  <ol id="failure-list" class="failure-list"></ol>
`;

const dashboardTemplate = `
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

class RegressionSummary extends HTMLElement {
  connectedCallback() {
    if (!this.childElementCount) {
      this.innerHTML = summaryTemplate;
    }
  }

  setStatus(status) {
    this.dataset.status = status;
  }

  setValues({ passRate, totalLabel, failuresLabel, durationLabel, heading, body }) {
    this.querySelector('#summary-percent').textContent = `${passRate}%`;
    this.querySelector('#summary-ring').style.setProperty('--progress', `${(passRate / 100) * 360}deg`);
    this.querySelector('#summary-tests-chip').textContent = totalLabel;
    this.querySelector('#summary-failures-chip').textContent = failuresLabel;
    this.querySelector('#summary-duration-chip').textContent = durationLabel;
    this.querySelector('#summary-heading').textContent = heading;
    this.querySelector('#summary-body').textContent = body;
  }
}

class RegressionMetrics extends HTMLElement {
  connectedCallback() {
    if (!this.childElementCount) {
      this.innerHTML = metricsTemplate;
    }
  }

  setValues({ total, filtered, failures, duration, slowest, topFailure }) {
    this.querySelector('#metric-total').textContent = String(total);
    this.querySelector('#metric-filtered').textContent = filtered;
    this.querySelector('#metric-failures').textContent = String(failures);
    this.querySelector('#metric-duration').textContent = duration;
    this.querySelector('#metric-slowest').textContent = slowest;
    this.querySelector('#metric-top-failure').textContent = topFailure;
  }
}

class RegressionToolbar extends HTMLElement {
  connectedCallback() {
    if (!this.childElementCount) {
      this.innerHTML = toolbarTemplate;
    }
  }

  get filterButtons() {
    return [...this.querySelectorAll('.filter-button')];
  }

  get searchInput() {
    return this.querySelector('#test-search');
  }

  setActiveFilter(filter) {
    this.filterButtons.forEach((button) => {
      button.dataset.active = String(button.dataset.filter === filter);
    });
  }
}

class RegressionFailureList extends HTMLElement {
  connectedCallback() {
    if (!this.childElementCount) {
      this.innerHTML = failureListTemplate;
    }
  }

  get listElement() {
    return this.querySelector('#failure-list');
  }

  setVisible(isVisible) {
    this.dataset.visible = String(isVisible);
  }
}

export class RegressionDashboard extends HTMLElement {
  connectedCallback() {
    if (!this.childElementCount) {
      this.innerHTML = dashboardTemplate;
    }
  }
}

customElements.define('regression-summary', RegressionSummary);
customElements.define('regression-metrics', RegressionMetrics);
customElements.define('regression-toolbar', RegressionToolbar);
customElements.define('regression-failure-list', RegressionFailureList);
customElements.define('regression-dashboard', RegressionDashboard);
