import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class RegressionSummary extends LitElement {
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

customElements.define('regression-summary', RegressionSummary);
