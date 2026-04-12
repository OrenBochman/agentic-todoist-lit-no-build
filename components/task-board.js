import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

const FILTER_OPTIONS = ['all', 'pending', 'completed'];

/**
 * Task list and filter surface.
 * Receives serialized tasks from the parent and emits filter, toggle, and delete events.
 */
class TaskBoard extends LitElement {
  static properties = {
    filter: { type: String },
    tasksJson: { attribute: 'tasks-json', type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    .panel-title {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-strong);
    }

    .panel-copy {
      margin: 8px 0 0;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: inline-flex;
      gap: 10px;
      flex-wrap: wrap;
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

    .button-brand {
      background: var(--accent);
      color: white;
    }

    .button-brand:hover,
    .button-brand:focus-visible {
      background: var(--accent-strong);
    }

    .button-neutral {
      background: color-mix(in srgb, var(--text-strong) 8%, transparent);
      color: var(--text-strong);
    }

    .button-neutral:hover,
    .button-neutral:focus-visible {
      background: color-mix(in srgb, var(--text-strong) 14%, transparent);
    }

    .button-small {
      padding: 10px 14px;
      font-size: 0.92rem;
    }

    .list {
      display: grid;
      gap: 16px;
      margin-top: 24px;
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

    .empty {
      padding: 34px 28px;
      border-radius: 24px;
      text-align: center;
      color: var(--text-muted);
      background: color-mix(in srgb, var(--panel-background) 82%, transparent);
      border: 1px dashed color-mix(in srgb, var(--text-strong) 16%, transparent);
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
    this.filter = 'all';
    this.tasksJson = '[]';
  }

  render() {
    const visibleTasks = this.getVisibleTasks();

    return html`
      <div class="board-header">
        <div>
          <h2 class="panel-title">Current tasks</h2>
          <p class="panel-copy">Filter the list to focus on pending or completed work.</p>
        </div>
        <div class="filter-group" role="tablist" aria-label="Task filters">
          ${FILTER_OPTIONS.map(
            (option) => html`
              <button
                class="button button-small ${this.filter === option ? 'button-brand' : 'button-neutral'}"
                type="button"
                @click=${() => this.emitFilterChange(option)}
              >
                ${this.getFilterLabel(option)}
              </button>
            `,
          )}
        </div>
      </div>

      <div class="list">
        ${visibleTasks.length
          ? visibleTasks.map((task) => this.renderTask(task))
          : html`<div class="empty">No tasks match this filter yet.</div>`}
      </div>
    `;
  }

  /**
   * Applies the active filter without mutating the underlying task collection.
   */
  getVisibleTasks() {
    const tasks = this.getTasks();

    if (this.filter === 'pending') {
      return tasks.filter((task) => !task.completed);
    }

    if (this.filter === 'completed') {
      return tasks.filter((task) => task.completed);
    }

    return tasks;
  }

  /**
   * Parses the serialized task payload passed in from the root component.
   */
  getTasks() {
    try {
      const parsedTasks = JSON.parse(this.tasksJson || '[]');
      return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch {
      return [];
    }
  }

  getFilterLabel(option) {
    if (option === 'pending') {
      return 'Pending';
    }

    if (option === 'completed') {
      return 'Completed';
    }

    return 'All';
  }

  /**
   * Emits a filter update request so the parent can keep filter state centralized.
   */
  emitFilterChange(filter) {
    this.dispatchEvent(
      new CustomEvent('filter-change', {
        bubbles: true,
        composed: true,
        detail: { filter },
      }),
    );
  }

  /**
   * Emits a toggle request for a specific task id.
   */
  emitToggle(taskId) {
    this.dispatchEvent(
      new CustomEvent('task-toggle', {
        bubbles: true,
        composed: true,
        detail: { taskId },
      }),
    );
  }

  /**
   * Emits a delete request for a specific task id.
   */
  emitDelete(taskId) {
    this.dispatchEvent(
      new CustomEvent('task-delete', {
        bubbles: true,
        composed: true,
        detail: { taskId },
      }),
    );
  }

  formatTaskStatus(task) {
    return task.completed ? 'Completed' : 'Pending';
  }

  /**
   * Renders a single task row with completion and delete controls.
   */
  renderTask(task) {
    return html`
      <article class="task" data-completed=${String(task.completed)}>
        <button
          class="toggle"
          type="button"
          data-completed=${String(task.completed)}
          aria-label=${task.completed ? 'Mark task as pending' : 'Mark task as completed'}
          @click=${() => this.emitToggle(task.id)}
        ></button>
        <div class="task-main">
          <p class="task-text">${task.text}</p>
          <span class="task-meta">${this.formatTaskStatus(task)}</span>
        </div>
        <div class="task-actions">
          <button class="button button-small button-neutral" type="button" @click=${() => this.emitDelete(task.id)}>
            Delete
          </button>
        </div>
      </article>
    `;
  }
}

customElements.define('task-board', TaskBoard);