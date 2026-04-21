import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

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
  static styles = css`
    :host {
      display: block;
      color: var(--text-strong);
    }

    .summary-layout {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 18px;
      align-items: center;
    }

    .summary-ring {
      --progress: 0deg;
      width: 92px;
      height: 92px;
      border-radius: 50%;
      background:
        radial-gradient(circle at center, rgba(9, 17, 29, 0.98) 58%, transparent 59%),
        conic-gradient(
          color-mix(in srgb, var(--accent) 88%, white) 0deg,
          color-mix(in srgb, var(--accent) 88%, white) var(--progress),
          rgba(148, 163, 184, 0.14) var(--progress),
          rgba(148, 163, 184, 0.14) 360deg
        );
      display: grid;
      place-items: center;
      border: 1px solid color-mix(in srgb, var(--text-strong) 12%, transparent);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
    }

    .summary-ring-value {
      font-size: 1.15rem;
      font-weight: 800;
      line-height: 1;
    }

    .summary-copy {
      min-width: 0;
    }

    .summary-heading {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
    }

    .summary-body {
      margin-top: 6px;
      color: var(--text-muted);
    }

    .summary-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 12px;
    }

    .summary-chip {
      border: 1px solid color-mix(in srgb, var(--text-strong) 12%, transparent);
      border-radius: 999px;
      padding: 7px 12px;
      font-size: 0.9rem;
      color: var(--text-strong);
      background: rgba(15, 23, 42, 0.52);
    }

    .summary-chip.fail {
      color: #fca5a5;
      border-color: rgba(248, 113, 113, 0.28);
    }

    @media (max-width: 640px) {
      .summary-layout {
        grid-template-columns: 1fr;
      }
    }
  `;

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
