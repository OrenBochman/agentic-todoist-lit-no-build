import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

/**
 * @typedef {Object} TaskRecord
 * @property {boolean} completed
 * @property {string} createdAt
 * @property {string} id
 * @property {string} text
 */

/**
 * Single task row with toggle and delete actions.
 */
class TaskItem extends LitElement {
  static properties = {
    task: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
    }

    .task {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 16px;
      align-items: start;
      padding: 20px;
      border-radius: 22px;
      background: color-mix(in srgb, var(--panel-background) 96%, transparent);
      border: 1px solid var(--panel-border);
      box-shadow: 0 14px 40px color-mix(in srgb, var(--text-strong) 8%, transparent);
    }

    .task[data-completed='true'] {
      background: linear-gradient(180deg, var(--success-soft), color-mix(in srgb, var(--panel-background) 96%, transparent));
    }

    .toggle {
      inline-size: 24px;
      block-size: 24px;
      min-inline-size: 24px;
      min-block-size: 24px;
      margin-top: 0;
      padding: 0;
      border-radius: 50%;
      border: 2px solid color-mix(in srgb, var(--accent) 44%, transparent);
      background: transparent;
      cursor: pointer;
      appearance: none;
      display: inline-block;
      flex: 0 0 24px;
      align-self: center;
      box-sizing: border-box;
      transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease;
    }

    .toggle:hover,
    .toggle:focus-visible {
      transform: scale(1.08);
      outline: none;
      border-color: var(--accent);
    }

    .toggle[data-completed='true'] {
      background: var(--accent);
      border-color: var(--accent);
      box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.95);
    }

    .task-main {
      min-width: 0;
    }

    .task-text {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.45;
      color: var(--text-strong);
      overflow-wrap: anywhere;
    }

    .task[data-completed='true'] .task-text {
      color: var(--text-muted);
      text-decoration: line-through;
      text-decoration-thickness: 2px;
    }

    .task-meta {
      display: block;
      margin-top: 8px;
      color: var(--text-muted);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .button {
      border: 0;
      border-radius: 999px;
      padding: 10px 14px;
      font: inherit;
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 160ms ease, background-color 160ms ease, color 160ms ease;
      background: color-mix(in srgb, var(--text-strong) 8%, transparent);
      color: var(--text-strong);
    }

    .button:hover,
    .button:focus-visible {
      transform: translateY(-1px);
      outline: none;
      background: color-mix(in srgb, var(--text-strong) 14%, transparent);
    }

    @media (max-width: 640px) {
      .task {
        grid-template-columns: auto 1fr;
      }

      .task-actions {
        grid-column: 1 / -1;
        display: flex;
        justify-content: flex-end;
      }
    }
  `;

  constructor() {
    super();
    /** @type {TaskRecord | null} */
    this.task = null;
  }

  render() {
    if (!this.task) {
      return '';
    }

    return html`
      <article class="task" data-completed=${String(this.task.completed)}>
        <button
          class="toggle"
          type="button"
          data-completed=${String(this.task.completed)}
          aria-label=${this.task.completed ? 'Mark task as pending' : 'Mark task as completed'}
          @click=${this.emitToggle}
        ></button>
        <div class="task-main">
          <p class="task-text">${this.task.text}</p>
          <span class="task-meta">${this.task.completed ? 'Completed' : 'Pending'}</span>
        </div>
        <div class="task-actions">
          <button class="button" type="button" @click=${this.emitDelete}>Delete</button>
        </div>
      </article>
    `;
  }

  emitDelete = () => {
    this.dispatchEvent(
      new CustomEvent('task-delete', {
        bubbles: true,
        composed: true,
        detail: { taskId: this.task.id },
      }),
    );
  };

  emitToggle = () => {
    this.dispatchEvent(
      new CustomEvent('task-toggle', {
        bubbles: true,
        composed: true,
        detail: { taskId: this.task.id },
      }),
    );
  };
}

customElements.define('task-item', TaskItem);