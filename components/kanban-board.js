import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './drop-target-element.js';
import './task-filter-bar.js';
import './task-item.js';
import { getTaskStatus } from './task-status.js';
import { ALL_PROJECTS_FILTER, matchesProjectFilter } from './task-project.js';


/**
 * <kanban-board>
 * LitElement-based Kanban board with three columns: Upcoming, In Progress, Done.
 * Tasks are grouped by their status field (or fallback to completed/pending).
 *
 * Properties:
 *   tasks: Array of TaskRecord
 *   filter: Task status filter string
 *   projectFilter: Project filter string
 *
 * Emits:
 *   'task-move' when a task is moved between columns
 *   'task-delete', 'task-toggle', 'task-edit' bubbled from children
 */
class KanbanBoard extends LitElement {
  /**
   * Lifecycle: Called when element is added to the DOM. Sets up event listeners.
   */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('task-delete', this._bubbleEvent);
    this.addEventListener('task-toggle', this._bubbleEvent);
    this.addEventListener('task-edit', this._bubbleEvent);
  }


  /**
   * Lifecycle: Called when element is removed from the DOM. Cleans up listeners.
   */
  disconnectedCallback() {
    this.removeEventListener('task-delete', this._bubbleEvent);
    this.removeEventListener('task-toggle', this._bubbleEvent);
    this.removeEventListener('task-edit', this._bubbleEvent);
    super.disconnectedCallback();
  }

  /**
   * Helper to re-dispatch events from child components.
   * @param {Event} e
   */
  _bubbleEvent(e) {
    // Only re-dispatch if the event originated from a child (not already bubbled)
    if (e.target !== this) {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent(e.type, {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }));
    }
  }
  /**
   * LitElement reactive properties.
   */
  static properties = {
    filter: { type: String },
    projectFilter: { type: String, attribute: 'project-filter' },
    tasks: { type: Array },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      overflow-x: auto;
    }
    .kanban {
      display: flex;
      gap: 24px;
      align-items: flex-start;
      min-height: 320px;
    }
    .toolbar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }
    .column {
      background: var(--panel-background, #23272e);
      border-radius: 16px;
      padding: 12px 8px 24px 8px;
      min-width: 240px;
      flex: 1 1 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      max-width: 320px;
    }
    .column-drop-target {
      display: block;
      min-width: 240px;
      flex: 1 1 0;
      max-width: 320px;
    }
    .column-drop-target[active] .column {
      border: 1px dashed color-mix(in srgb, var(--accent) 56%, transparent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 14%, transparent);
      transform: translateY(-2px);
    }
    .column-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text-strong);
      letter-spacing: 0.01em;
    }
    .column-shortcut {
      flex: 0 0 auto;
    }
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 40px;
    }
    .empty {
      color: var(--text-muted);
      font-size: 0.95em;
      text-align: center;
      margin-top: 16px;
    }
  `;

  constructor() {
    super();
    /** @type {string} */
    this.filter = 'all';
    /** @type {string} */
    this.projectFilter = ALL_PROJECTS_FILTER;
    /** @type {Array} */
    this.tasks = [];
  }

  /**
   * Handler for drop-receive event from drop-target-element.
   * Dispatches 'task-move' event if valid.
   * @param {CustomEvent} event
   */
  handleDropReceive(event) {
    const taskId = event.detail?.payload?.taskId;
    const fromColumn = event.detail?.payload?.fromColumn;
    const toColumn = event.detail?.targetValue;
    if (!taskId || !toColumn || fromColumn === toColumn) {
      return;
    }
    this.dispatchEvent(new CustomEvent('task-move', {
      bubbles: true,
      composed: true,
      detail: {
        taskId,
        fromColumn,
        toColumn,
      },
    }));
  }

  /**
   * Groups tasks into columns based on their status and current filters.
   * @returns {object} columns
   */
  getColumns() {
    const columns = {
      upcoming: [],
      'in-progress': [],
      done: [],
    };
    for (const task of this.tasks) {
      if (!matchesProjectFilter(task, this.projectFilter)) {
        continue;
      }
      if (this.filter === 'pending' && task.completed) {
        continue;
      }
      if (this.filter === 'completed' && !task.completed) {
        continue;
      }
      const status = getTaskStatus(task);
      if (status === 'done') {
        columns.done.push(task);
      } else if (status === 'in-progress') {
        columns['in-progress'].push(task);
      } else {
        columns.upcoming.push(task);
      }
    }
    return columns;
  }

  /**
   * Renders the Kanban board columns and filter bar.
   * @returns {import('lit').TemplateResult}
   */
  render() {
    const columns = this.getColumns();
    const renderColumnTitle = (label, shortcut) => html`
      <div class="column-title">
        <span>${label}</span>
        <wa-badge class="column-shortcut" pill>${shortcut}</wa-badge>
      </div>
    `;
    const renderColumn = (columnKey, label, shortcut, tasks, emptyMessage) => html`
      <drop-target-element
        class="column-drop-target"
        target-value=${columnKey}
        @drop-receive=${this.handleDropReceive}
      >
        <div class="column">
          ${renderColumnTitle(label, shortcut)}
          <div class="task-list">
            ${tasks.length
              ? tasks.map(
                  (task) => html`<task-item
                    .task=${task}
                    .dragEnabled=${true}
                    .showStatusBadge=${false}
                  ></task-item>`
                )
              : html`<div class="empty">${emptyMessage}</div>`}
          </div>
        </div>
      </drop-target-element>
    `;

    return html`
      <div class="toolbar">
        <task-filter-bar
          .filter=${this.filter}
          .projectFilter=${this.projectFilter}
          .tasks=${this.tasks}
          @filter-change=${this._bubbleEvent}
          @project-filter-change=${this._bubbleEvent}
        ></task-filter-bar>
      </div>
      <div class="kanban">
        ${renderColumn('upcoming', 'Upcoming', '/up', columns.upcoming, 'No upcoming tasks')}
        ${renderColumn('in-progress', 'In Progress', '/in', columns['in-progress'], 'No tasks in progress')}
        ${renderColumn('done', 'Done', '/done', columns.done, 'No completed tasks')}
      </div>
    `;
  }
}

customElements.define('kanban-board', KanbanBoard);
