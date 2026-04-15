import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

/**
 * Hero overview for task counts, WebMCP status, and theme controls.
 */
class TaskHero extends LitElement {
    updated(changedProps) {
      if (changedProps.has('theme')) {
        this.setAttribute('theme', this.theme);
      }
    }
  static properties = {
    completedTasks: { type: Number, attribute: 'completed-tasks' },
    pendingTasks: { type: Number, attribute: 'pending-tasks' },
    totalTasks: { type: Number, attribute: 'total-tasks' },
  };

  static styles = css`
    :host {
      display: block;
    }
    .card {
      min-height: 120px;
      /* Metallic chrome gradient effect */
      background: linear-gradient(115deg,
        #e3e3e3 0%,
        #f7f7f7 12%,
        #bfc0c2 22%,
        #f5f5f5 32%,
        #a7a8aa 48%,
        #e3e3e3 60%,
        #f7f7f7 70%,
        #bfc0c2 80%,
        #f5f5f5 100%
      );
      outline: 2px dashed #e11d48;
      box-shadow:
        0 2px 12px 0 rgba(60,60,60,0.10),
        0 1.5px 0.5px 0 rgba(255,255,255,0.18) inset,
        0 0.5px 2px 0 rgba(180,180,180,0.10) inset;
      border: 1.5px solid #e0e0e0;
      /* Optional: subtle reflection highlight */
      position: relative;
      overflow: hidden;
    }
    .card::after {
      content: '';
      position: absolute;
      left: 0; right: 0; top: 0; height: 38%;
      background: linear-gradient(120deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 100%);
      pointer-events: none;
      z-index: 1;
    }
    :host([theme='dark']) .card,
    :host([theme='dark']) .stat,
    :host([theme='dark']) .status-pill {
      /* Example: dark mode overrides, real app should use CSS vars */
      background: #23283a;
      color: #f8fafc;
    }
    :host([theme='light']) .card,
    :host([theme='light']) .stat,
    :host([theme='light']) .status-pill {
      background: var(--panel-background);
      color: var(--text-strong);
    }

    .card {
      display: block;
      container-type: inline-size;
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
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 12px;
      font-size: 0.8rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 700;
    }

    wa-icon {
      flex: none;
      font-size: 1rem;
      color: rgb(255, 212, 59);
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
      width: 100%;
      min-width: 0;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-top: 28px;
    }

    .stat {
      border-radius: 20px;
      min-width: 0;
      overflow: hidden;
      padding: clamp(12px, 2vw, 18px);
      background: linear-gradient(180deg, var(--accent-soft), color-mix(in srgb, var(--panel-background) 84%, transparent));
      border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
    }

    .stat-label {
      display: block;
      color: var(--text-muted);
      font-size: clamp(0.68rem, 1.8vw, 0.8rem);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stat-value {
      display: block;
      margin-top: 8px;
      font-size: clamp(1.35rem, 4vw, 2rem);
      line-height: 1;
      font-weight: 700;
      color: var(--text-strong);
      min-width: 0;
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

    @container (max-width: 380px) {
      .stats {
        gap: 8px;
      }

      .stat {
        padding: 10px;
      }

      .stat-label {
        font-size: 0.64rem;
        letter-spacing: 0.06em;
      }

      .stat-value {
        margin-top: 6px;
        font-size: 1.65rem;
      }
    }

    @container (max-width: 300px) {
      .stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @container (max-width: 210px) {
      .stats {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 820px) {
      .hero-header {
        flex-direction: column;
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

      .stats {
        gap: 8px;
      }
    }

    @media (max-width: 420px) {
      .stats {
        gap: 8px;
      }

      .stat {
        border-radius: 16px;
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
            <div class="hero-actions"></div>
          </div>
          <h1>Agentic Task Flow</h1>
          <div class="stats" aria-label="Task statistics">
            <div class="stat">
              <span class="stat-label">All</span>
              <span class="stat-value">${this.totalTasks}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Pending</span>
              <span class="stat-value">${this.pendingTasks}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Done</span>
              <span class="stat-value">${this.completedTasks}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  emitThemeToggle = () => {
    // Removed theme toggle functionality
  };

  getWebMcpLabel() {
    // Removed WebMCP label functionality
  }
}

customElements.define('task-hero', TaskHero);