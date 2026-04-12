import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

/**
 * Hero overview for task counts, WebMCP status, and theme controls.
 */
class TaskHero extends LitElement {
  static properties = {
    completedTasks: { type: Number, attribute: 'completed-tasks' },
    pendingTasks: { type: Number, attribute: 'pending-tasks' },
    theme: { type: String },
    totalTasks: { type: Number, attribute: 'total-tasks' },
    webMcpStatus: { type: String, attribute: 'webmcp-status' },
  };

  static styles = css`
    :host {
      display: block;
    }

    .card {
      display: block;
      border-radius: 28px;
      overflow: hidden;
      backdrop-filter: blur(20px);
      border: 1px solid var(--panel-border);
      box-shadow: var(--panel-shadow);
      background: var(--panel-background);
      position: relative;
    }

    .panel {
      padding: 28px;
    }

    .hero-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 16px;
    }

    .hero-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .eyebrow {
      margin: 0 0 12px;
      font-size: 0.8rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 700;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.4rem, 5vw, 4.3rem);
      line-height: 0.95;
      letter-spacing: -0.05em;
      color: var(--text-strong);
    }

    .hero-copy {
      margin: 18px 0 0;
      max-width: 30rem;
      color: var(--text-muted);
      font-size: 1.05rem;
      line-height: 1.6;
    }

    .stats {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-top: 28px;
    }

    .stat {
      border-radius: 20px;
      padding: 18px;
      background: linear-gradient(180deg, var(--accent-soft), color-mix(in srgb, var(--panel-background) 84%, transparent));
      border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
    }

    .stat-label {
      display: block;
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .stat-value {
      display: block;
      margin-top: 8px;
      font-size: 2rem;
      line-height: 1;
      font-weight: 700;
      color: var(--text-strong);
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 999px;
      font-size: 0.88rem;
      font-weight: 600;
      background: color-mix(in srgb, var(--text-strong) 8%, transparent);
      color: var(--text-strong);
    }

    .status-pill::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9194a2;
    }

    .status-pill[data-status='ready']::before {
      background: #1ea85f;
    }

    .status-pill[data-status='loaded']::before {
      background: #2563eb;
    }

    .status-pill[data-status='failed']::before {
      background: #d33a4a;
    }

    .button {
      border: 0;
      border-radius: 999px;
      padding: 12px 18px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      transition: transform 160ms ease, background-color 160ms ease, color 160ms ease;
    }

    .button:hover,
    .button:focus-visible {
      transform: translateY(-1px);
      outline: none;
    }

    .button-ghost {
      background: color-mix(in srgb, var(--panel-background) 72%, transparent);
      color: var(--text-strong);
      border: 1px solid var(--panel-border);
    }

    .button-ghost:hover,
    .button-ghost:focus-visible {
      background: color-mix(in srgb, var(--panel-background) 90%, transparent);
    }

    @media (max-width: 820px) {
      .hero-header {
        flex-direction: column;
      }

      .stats {
        grid-template-columns: 1fr;
      }

      .hero-actions {
        justify-content: flex-start;
      }
    }

    @media (max-width: 640px) {
      .panel {
        padding: 20px;
      }

      .hero-actions {
        width: 100%;
      }

      .hero-actions > * {
        width: 100%;
        justify-content: center;
      }
    }
  `;

  constructor() {
    super();
    this.completedTasks = 0;
    this.pendingTasks = 0;
    this.theme = 'light';
    this.totalTasks = 0;
    this.webMcpStatus = 'loading';
  }

  render() {
    return html`
      <article class="card">
        <div class="panel">
          <div class="hero-header">
            <p class="eyebrow">ToDo&gt;</p>
            <div class="hero-actions">
              <span class="status-pill" data-status=${this.webMcpStatus}>
                ${this.getWebMcpLabel()}
              </span>
              <button class="button button-ghost" type="button" @click=${this.emitThemeToggle}>
                ${this.theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
          <h1>Agentic Task Flow</h1>
          <p class="hero-copy">
            Capture work quickly, mark progress as you move, and keep the view focused with simple
            status filters.
          </p>
          <div class="stats" aria-label="Task statistics">
            <div class="stat">
              <span class="stat-label">All tasks</span>
              <span class="stat-value">${this.totalTasks}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Pending</span>
              <span class="stat-value">${this.pendingTasks}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Completed</span>
              <span class="stat-value">${this.completedTasks}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  emitThemeToggle = () => {
    this.dispatchEvent(
      new CustomEvent('theme-toggle', {
        bubbles: true,
        composed: true,
      }),
    );
  };

  getWebMcpLabel() {
    if (this.webMcpStatus === 'ready') {
      return 'WebMCP ready';
    }

    if (this.webMcpStatus === 'loaded') {
      return 'WebMCP script loaded';
    }

    if (this.webMcpStatus === 'failed') {
      return 'WebMCP failed';
    }

    return 'WebMCP loading';
  }
}

customElements.define('task-hero', TaskHero);