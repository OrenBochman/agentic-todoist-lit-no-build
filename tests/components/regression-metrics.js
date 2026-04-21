import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class RegressionMetrics extends LitElement {
  static properties = {
    duration: { state: true },
    failures: { state: true },
    filtered: { state: true },
    slowest: { state: true },
    topFailure: { state: true },
    total: { state: true },
  };
  static styles = css`
    :host {
      display: contents;
    }

    .metric-card {
      padding: 16px;
      border-radius: 18px;
      border: 1px solid var(--panel-border);
      background: rgba(15, 23, 42, 0.44);
    }

    .metric-label {
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .metric-value {
      margin-top: 8px;
      font-size: 1.75rem;
      font-weight: 800;
      line-height: 1;
    }

    .metric-value.fail {
      color: #f87171;
    }

    .metric-value.duration {
      color: #38bdf8;
    }

    .metric-subcopy {
      margin-top: 8px;
      font-size: 0.92rem;
      color: var(--text-muted);
    }
  `;

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

customElements.define('regression-metrics', RegressionMetrics);
