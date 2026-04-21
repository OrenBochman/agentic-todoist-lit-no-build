import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './task-filter-bar.js';
import './task-item.js';
import { ALL_PROJECTS_FILTER, matchesProjectFilter } from './task-project.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_TIMELINE_DAYS = 7;

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  const dateToken = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateToken) {
    const [, year, month, day] = dateToken;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const formatHeaderDate = (date) => date.toLocaleDateString(undefined, {
  month: 'short',
  day: 'numeric',
});

const getDayOffset = (left, right) => Math.round((right.getTime() - left.getTime()) / DAY_MS);

class GanttView extends LitElement {
  static properties = {
    filter: { type: String },
    projectFilter: { type: String, attribute: 'project-filter' },
    tasks: { type: Array },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .toolbar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    .surface {
      border: 1px solid var(--panel-border);
      border-radius: 28px;
      overflow: hidden;
      background: color-mix(in srgb, var(--panel-background) 96%, transparent);
      box-shadow: var(--panel-shadow);
    }

    .header,
    .row {
      display: grid;
      grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
      gap: 0;
    }

    .header {
      border-bottom: 1px solid var(--panel-border);
      background: color-mix(in srgb, var(--panel-background) 90%, transparent);
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .header-title,
    .lane {
      padding: 18px 20px;
    }

    .header-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-strong);
      border-right: 1px solid var(--panel-border);
      display: flex;
      align-items: center;
    }

    .timeline-grid {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(56px, 1fr);
    }

    .tick {
      padding: 10px 8px;
      border-right: 1px solid color-mix(in srgb, var(--text-strong) 10%, transparent);
      text-align: center;
      color: var(--text-muted);
      font-size: 0.82rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .row + .row {
      border-top: 1px solid color-mix(in srgb, var(--text-strong) 8%, transparent);
    }

    .task-cell {
      padding: 16px;
      border-right: 1px solid var(--panel-border);
      background: color-mix(in srgb, var(--panel-background) 98%, transparent);
    }

    .lane {
      min-height: 112px;
      position: relative;
      background:
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent calc((100% / var(--day-count)) - 1px),
          color-mix(in srgb, var(--text-strong) 8%, transparent) calc((100% / var(--day-count)) - 1px),
          color-mix(in srgb, var(--text-strong) 8%, transparent) calc(100% / var(--day-count))
        );
    }

    .bar {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 18px;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 68%, white));
      box-shadow: 0 8px 20px color-mix(in srgb, var(--accent) 28%, transparent);
      min-width: 14px;
    }

    .bar[data-completed='true'] {
      background: linear-gradient(90deg, #36a269, #7acb98);
      box-shadow: 0 8px 20px rgba(54, 162, 105, 0.2);
    }

    .bar-label {
      position: absolute;
      top: calc(50% - 28px);
      font-size: 0.8rem;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .empty {
      padding: 40px 28px;
      text-align: center;
      color: var(--text-muted);
    }

    @media (max-width: 900px) {
      .header,
      .row {
        grid-template-columns: 1fr;
      }

      .header-title,
      .task-cell {
        border-right: 0;
        border-bottom: 1px solid var(--panel-border);
      }
    }
  `;

  constructor() {
    super();
    this.filter = 'all';
    this.projectFilter = ALL_PROJECTS_FILTER;
    this.tasks = [];
  }

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

  _bubbleEvent = (event) => {
    if (event.target !== this) {
      event.stopPropagation();
      this.dispatchEvent(new CustomEvent(event.type, {
        bubbles: true,
        composed: true,
        detail: event.detail,
      }));
    }
  };

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

  getTaskSchedule(task) {
    const createdDate = parseDateValue(task?.createdAt);
    const dueDate = parseDateValue(task?.dueDate);
    const fallbackDate = createdDate || dueDate || new Date();

    let startDate = createdDate || dueDate || fallbackDate;
    let endDate = dueDate || startDate;

    if (endDate.getTime() < startDate.getTime()) {
      startDate = endDate;
    }

    return { startDate, endDate };
  }

  getTimelineModel() {
    const visibleTasks = this.getVisibleTasks()
      .map((task) => ({
        task,
        ...this.getTaskSchedule(task),
      }))
      .sort((left, right) => left.startDate.getTime() - right.startDate.getTime());

    if (!visibleTasks.length) {
      const today = parseDateValue(new Date()) ?? new Date();
      return {
        visibleTasks,
        startDate: today,
        endDate: new Date(today.getTime() + (MIN_TIMELINE_DAYS - 1) * DAY_MS),
        totalDays: MIN_TIMELINE_DAYS,
      };
    }

    const earliestStart = visibleTasks.reduce(
      (current, entry) => (entry.startDate.getTime() < current.getTime() ? entry.startDate : current),
      visibleTasks[0].startDate,
    );
    const latestEnd = visibleTasks.reduce(
      (current, entry) => (entry.endDate.getTime() > current.getTime() ? entry.endDate : current),
      visibleTasks[0].endDate,
    );
    const totalDays = Math.max(MIN_TIMELINE_DAYS, getDayOffset(earliestStart, latestEnd) + 1);

    return {
      visibleTasks,
      startDate: earliestStart,
      endDate: new Date(earliestStart.getTime() + (totalDays - 1) * DAY_MS),
      totalDays,
    };
  }

  buildTimelineTicks(startDate, totalDays) {
    return Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(startDate.getTime() + index * DAY_MS);
      return {
        iso: date.toISOString(),
        label: formatHeaderDate(date),
      };
    });
  }

  getBarStyle(schedule, timelineStart, totalDays) {
    const startOffset = getDayOffset(timelineStart, schedule.startDate);
    const durationDays = Math.max(1, getDayOffset(schedule.startDate, schedule.endDate) + 1);
    const left = (startOffset / totalDays) * 100;
    const width = (durationDays / totalDays) * 100;

    return `left:${left}%;width:${width}%;`;
  }

  render() {
    const timeline = this.getTimelineModel();
    const ticks = this.buildTimelineTicks(timeline.startDate, timeline.totalDays);

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

      <section class="surface">
        ${timeline.visibleTasks.length
          ? html`
              <div class="header">
                <div class="header-title">Task Timeline</div>
                <div class="timeline-grid header-title">
                  ${ticks.map((tick) => html`<div class="tick">${tick.label}</div>`)}
                </div>
              </div>
              ${timeline.visibleTasks.map((entry) => html`
                <div class="row">
                  <div class="task-cell">
                    <task-item .task=${entry.task}></task-item>
                  </div>
                  <div class="lane" style=${`--day-count:${timeline.totalDays};`}>
                    <div
                      class="bar-label"
                      style=${`left:${(getDayOffset(timeline.startDate, entry.startDate) / timeline.totalDays) * 100}%;`}
                    >
                      ${formatHeaderDate(entry.startDate)}${entry.endDate.getTime() !== entry.startDate.getTime() ? ` - ${formatHeaderDate(entry.endDate)}` : ''}
                    </div>
                    <div
                      class="bar"
                      data-completed=${String(Boolean(entry.task.completed))}
                      style=${this.getBarStyle(entry, timeline.startDate, timeline.totalDays)}
                    ></div>
                  </div>
                </div>
              `)}
            `
          : html`<div class="empty">No tasks available for the current filters.</div>`}
      </section>
    `;
  }
}

customElements.define('gantt-view', GanttView);
