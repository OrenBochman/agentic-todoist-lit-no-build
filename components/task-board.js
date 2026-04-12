import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './task-filter-bar.js';
import './task-item.js';

/**
 * @typedef {Object} TaskRecord
 * @property {boolean} completed
 * @property {string} createdAt
 * @property {string} id
 * @property {string} text
 */

/**
 * Task list and filter surface.
 * Receives serialized tasks from the parent and emits filter, toggle, and delete events.
 */
class TaskBoard extends LitElement {
  static properties = {
    filter: { type: String },
    tasks: { type: Array },
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

    .list {
      display: grid;
      gap: 16px;
      margin-top: 24px;
    }

    .empty {
      padding: 34px 28px;
      border-radius: 24px;
      text-align: center;
      color: var(--text-muted);
      background: color-mix(in srgb, var(--panel-background) 82%, transparent);
      border: 1px dashed color-mix(in srgb, var(--text-strong) 16%, transparent);
    }

  `;

  constructor() {
    super();
    this.filter = 'all';
    /** @type {TaskRecord[]} */
    this.tasks = [];
  }

  render() {
    const visibleTasks = this.getVisibleTasks();

    return html`
      <div class="board-header">
        <div>
          <h2 class="panel-title">Current tasks</h2>
          <p class="panel-copy">Filter the list to focus on pending or completed work.</p>
        </div>
        <task-filter-bar .filter=${this.filter} @filter-change=${this.emitFilterChange}></task-filter-bar>
      </div>

      <div class="list">
        ${visibleTasks.length
          ? visibleTasks.map(
              (task) => html`
                <task-item .task=${task} @task-toggle=${this.emitToggle} @task-delete=${this.emitDelete}></task-item>
              `,
            )
          : html`<div class="empty">No tasks match this filter yet.</div>`}
      </div>
    `;
  }

  /**
   * Applies the active filter without mutating the underlying task collection.
   */
  getVisibleTasks() {
    const tasks = Array.isArray(this.tasks) ? this.tasks : [];

    if (this.filter === 'pending') {
      return tasks.filter((task) => !task.completed);
    }

    if (this.filter === 'completed') {
      return tasks.filter((task) => task.completed);
    }

    return tasks;
  }

  /**
   * Emits a filter update request so the parent can keep filter state centralized.
   */
  emitFilterChange(event) {
    const filter = event.detail.filter;
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
  emitToggle(event) {
    const taskId = event.detail.taskId;
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
  emitDelete(event) {
    const taskId = event.detail.taskId;
    this.dispatchEvent(
      new CustomEvent('task-delete', {
        bubbles: true,
        composed: true,
        detail: { taskId },
      }),
    );
  }

}

customElements.define('task-board', TaskBoard);