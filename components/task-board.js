import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './task-filter-bar.js';
import './task-item.js';
import { ALL_PROJECTS_FILTER, matchesProjectFilter } from './task-project.js';

/**
 * @typedef {Object} TaskRecord
 * @property {boolean} completed
 * @property {string} createdAt
 * @property {string} id
 * @property {string} text
 * @property {string|null} dueDate - ISO date string or null
 * @property {string|null} project - Freeform project name or null
 * @property {string|null} importance - Importance (e.g., 'P1'-'P5'), nullable
 * @property {string[]} dependsOn - Array of task IDs (default: [])
 * @property {number} workloadEstimate - Estimated hours (default: 4)
 * @property {number} workloadUncertainty - Uncertainty in hours (default: 1)
 * @property {string[]} tags - Array of tags (default: [])
 */

/**
 * Task list and filter surface.
 * Receives serialized tasks from the parent and emits filter, toggle, and delete events.
 */
class TaskBoard extends LitElement {
  static properties = {
    filter: { type: String },
    projectFilter: { type: String, attribute: 'project-filter' },
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
    this.projectFilter = ALL_PROJECTS_FILTER;
    /** @type {TaskRecord[]} */
    this.tasks = [];
  }

  render() {
    const visibleTasks = this.getVisibleTasks();

    return html`
      <div class="board-header">
        <div>
          <h2 class="panel-title">Current tasks</h2>
        </div>
        <task-filter-bar
          .filter=${this.filter}
          .projectFilter=${this.projectFilter}
          .tasks=${this.tasks}
          @filter-change=${this.emitFilterChange}
          @project-filter-change=${this.emitProjectFilterChange}
        ></task-filter-bar>
      </div>

      <div class="list">
        ${visibleTasks.length
          ? visibleTasks.map(
              (task) => html`
                <task-item
                  .task=${task}
                  @task-toggle=${this.emitToggle}
                  @task-delete=${this.emitDelete}
                  @task-edit=${this.emitEdit}
                ></task-item>
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

    return tasks.filter((task) => {
      if (!matchesProjectFilter(task, this.projectFilter)) {
        return false;
      }

      if (this.filter === 'pending') {
        return !task.completed;
      }

      if (this.filter === 'completed') {
        return task.completed;
      }

      return true;
    });
  }

  /**
   * Emits a filter update request so the parent can keep filter state centralized.
   */
  emitFilterChange(event) {
    event.stopPropagation();
    const filter = event.detail.filter;
    this.dispatchEvent(
      new CustomEvent('filter-change', {
        bubbles: true,
        composed: true,
        detail: { filter },
      }),
    );
  }

  emitProjectFilterChange(event) {
    event.stopPropagation();
    const projectFilter = event.detail.projectFilter;
    this.dispatchEvent(
      new CustomEvent('project-filter-change', {
        bubbles: true,
        composed: true,
        detail: { projectFilter },
      }),
    );
  }

  /**
   * Emits a toggle request for a specific task id.
   */
  emitToggle(event) {
    event.stopPropagation();
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
    event.stopPropagation();
    const taskId = event.detail.taskId;
    this.dispatchEvent(
      new CustomEvent('task-delete', {
        bubbles: true,
        composed: true,
        detail: { taskId },
      }),
    );
  }

  /**
   * Emits an edit request for a specific task id.
   */
  emitEdit(event) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('task-edit', {
        bubbles: true,
        composed: true,
        detail: {
          taskId: event.detail.taskId,
          input: event.detail.input,
        },
      }),
    );
  }

}

customElements.define('task-board', TaskBoard);
