import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './task-item.js';
import { getTaskStatus } from './task-status.js';

/**
 * Kanban board with four columns: Upcoming, In Progress, Review, Done
 * Tasks are grouped by their status field (or fallback to completed/pending)
 *
 * Props:
 *   tasks: Array of TaskRecord
 *   onTaskMove: function({taskId, toColumn})
 */
class KanbanBoard extends LitElement {
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('task-delete', this._bubbleEvent);
    this.addEventListener('task-toggle', this._bubbleEvent);
    this.addEventListener('task-edit', this._bubbleEvent);
  }

  disconnectedCallback() {
    this.removeEventListener('task-delete', this._bubbleEvent);
    this.removeEventListener('task-toggle', this._bubbleEvent);
    this.removeEventListener('task-edit', this._bubbleEvent);
    super.disconnectedCallback();
  }

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
  static properties = {
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
    this.tasks = [];
  }

  getColumns() {
    const columns = {
      upcoming: [],
      'in-progress': [],
      done: [],
    };
    for (const task of this.tasks) {
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

  render() {
    const columns = this.getColumns();
    const renderColumnTitle = (label, shortcut) => html`
      <div class="column-title">
        <span>${label}</span>
        <wa-badge class="column-shortcut" pill>${shortcut}</wa-badge>
      </div>
    `;
    return html`
      <div class="kanban">
        <div class="column">
          ${renderColumnTitle('Upcoming', '/up')}
          <div class="task-list">
            ${columns.upcoming.length
              ? columns.upcoming.map(
                  (task) => html`<task-item .task=${task} .showStatusBadge=${false}></task-item>`
                )
              : html`<div class="empty">No upcoming tasks</div>`}
          </div>
        </div>
        <div class="column">
          ${renderColumnTitle('In Progress', '/in')}
          <div class="task-list">
            ${columns['in-progress'].length
              ? columns['in-progress'].map(
                  (task) => html`<task-item .task=${task} .showStatusBadge=${false}></task-item>`
                )
              : html`<div class="empty">No tasks in progress</div>`}
          </div>
        </div>
        <div class="column">
          ${renderColumnTitle('Done', '/done')}
          <div class="task-list">
            ${columns.done.length
              ? columns.done.map(
                  (task) => html`<task-item .task=${task} .showStatusBadge=${false}></task-item>`
                )
              : html`<div class="empty">No completed tasks</div>`}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('kanban-board', KanbanBoard);
