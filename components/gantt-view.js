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
      buildMonthTicks(startDate, totalDays) {
        // Returns array of {label, span} for each month in the visible range
        const months = [];
        let current = new Date(startDate);
        let lastMonth = current.getMonth();
        let lastYear = current.getFullYear();
        let monthStartIdx = 0;
        for (let i = 0; i < totalDays; i++) {
          const d = new Date(startDate.getTime() + i * DAY_MS);
          if (d.getMonth() !== lastMonth || d.getFullYear() !== lastYear) {
            const span = i - monthStartIdx;
            months.push({
              label: new Date(startDate.getTime() + monthStartIdx * DAY_MS).toLocaleString(undefined, { month: 'short', year: 'numeric' }),
              span,
            });
            monthStartIdx = i;
            lastMonth = d.getMonth();
            lastYear = d.getFullYear();
          }
        }
        // Push the last month
        if (monthStartIdx < totalDays) {
          const d = new Date(startDate.getTime() + monthStartIdx * DAY_MS);
          months.push({
            label: d.toLocaleString(undefined, { month: 'short', year: 'numeric' }),
            span: totalDays - monthStartIdx,
          });
        }
        return months;
      }
    // Drag state for handles
    _dragTaskIdx = null;
    _dragStartX = null;
    _dragOrigDate = null;
    _dragPx = 0;
    _dragType = null; // 'left' or 'right'

    _onLeftHandlePointerDown(idx, event, entry, timeline, laneWidthPx) {
      event.preventDefault();
      this._dragTaskIdx = idx;
      this._dragStartX = event.clientX;
      this._dragOrigDate = new Date(entry.startDate);
      this._dragPx = 0;
      this._dragType = 'left';
      window.addEventListener('pointermove', this._onPointerMove);
      window.addEventListener('pointerup', this._onPointerUp);
      this.requestUpdate();
    }

    _onRightHandlePointerDown(idx, event, entry, timeline, laneWidthPx) {
      event.preventDefault();
      this._dragTaskIdx = idx;
      this._dragStartX = event.clientX;
      this._dragOrigDate = new Date(entry.endDate);
      this._dragPx = 0;
      this._dragType = 'right';
      window.addEventListener('pointermove', this._onPointerMove);
      window.addEventListener('pointerup', this._onPointerUp);
      this.requestUpdate();
    }

    _onPointerMove = (event) => {
      if (this._dragTaskIdx == null) return;
      this._dragPx = event.clientX - this._dragStartX;
      this.requestUpdate();
    };

    _onPointerUp = () => {
      if (this._dragTaskIdx == null) return;
      const timeline = this.getTimelineModel();
      const laneWidthPx = 1200;
      const totalDays = timeline.totalDays;
      const pxPerDay = laneWidthPx / totalDays;
      const dayDelta = Math.round(this._dragPx / pxPerDay);
      const entry = timeline.visibleTasks[this._dragTaskIdx];
      if (entry && dayDelta !== 0) {
        if (this._dragType === 'left') {
          const newDate = new Date(this._dragOrigDate.getTime() + dayDelta * 24 * 60 * 60 * 1000);
          if (newDate.getTime() <= entry.endDate.getTime()) {
            this.dispatchEvent(new CustomEvent('task-edit', {
              detail: { id: entry.task.id, createdAt: newDate.toISOString().slice(0, 10) },
              bubbles: true,
              composed: true
            }));
          }
        } else if (this._dragType === 'right') {
          const newDate = new Date(this._dragOrigDate.getTime() + dayDelta * 24 * 60 * 60 * 1000);
          if (newDate.getTime() >= entry.startDate.getTime()) {
            this.dispatchEvent(new CustomEvent('task-edit', {
              detail: { id: entry.task.id, dueDate: newDate.toISOString().slice(0, 10) },
              bubbles: true,
              composed: true
            }));
          }
        }
      }
      this._dragTaskIdx = null;
      this._dragStartX = null;
      this._dragOrigDate = null;
      this._dragPx = 0;
      this._dragType = null;
      window.removeEventListener('pointermove', this._onPointerMove);
      window.removeEventListener('pointerup', this._onPointerUp);
      this.requestUpdate();
    };
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
    .gantt-outer {
      width: 100%;
      overflow-x: auto;
      background: var(--wa-surface, #fff);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      margin: 0 auto;
      padding: 0;
    }
    .gantt-grid {
      display: grid;
      align-items: center;
      width: max-content;
      min-width: 100%;
    }
    .gantt-header {
      position: sticky;
      top: 0;
      z-index: 2;
      background: var(--wa-surface, #fff);
      border-bottom: 1px solid var(--wa-border, #e0e0e0);
    }
    .gantt-header-cell, .gantt-body-cell {
      border-bottom: 1px solid var(--wa-border, #e0e0e0);
      background: var(--wa-surface, #fff);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 6px 8px;
    }
    .gantt-header-cell.task-col, .gantt-body-cell.task-col {
      font-weight: 500;
      width: 140px;
      min-width: 140px;
      max-width: 140px;
    }
    .gantt-header-cell.status-col, .gantt-body-cell.status-col {
      font-weight: 400;
      width: 80px;
      min-width: 80px;
      max-width: 80px;
    }
    .gantt-header-cell.month-col {
      font-weight: 600;
      text-align: center;
      background: var(--wa-surface, #f9f9f9);
      border-bottom: none;
    }
    .gantt-header-cell.day-col, .gantt-body-cell.day-col {
      font-size: 0.82rem;
      text-align: center;
      color: var(--text-muted);
      border-bottom: 1px solid var(--wa-border, #e0e0e0);
    }
    .gantt-row {
      border-bottom: 1px solid var(--wa-border, #e0e0e0);
    }
    .gantt-bar {
      grid-row: 1;
      z-index: 1;
      position: relative;
      height: 28px;
      display: flex;
      align-items: center;
    }
    .empty {
      padding: 40px 28px;
      color: #888;
      text-align: center;
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

  getBarGeometry(schedule, timelineStart, totalDays, laneWidthPx = 1000) {
    // Returns {x, width} in px for SVG rendering
    const startOffset = getDayOffset(timelineStart, schedule.startDate);
    const durationDays = Math.max(1, getDayOffset(schedule.startDate, schedule.endDate) + 1);
    const left = (startOffset / totalDays) * laneWidthPx;
    const width = (durationDays / totalDays) * laneWidthPx;
    return { x: left, width };
  }

  render() {
    const timeline = this.getTimelineModel();
    const ticks = this.buildTimelineTicks(timeline.startDate, timeline.totalDays);
    const months = this.buildMonthTicks(timeline.startDate, timeline.totalDays);
    const laneWidthPx = Math.max(700, timeline.totalDays * 40); // 40px per day, min 700px
    const barHeight = 20;
    const handleRadius = 7;
    const svgHeight = 48;
    const timelineCols = timeline.totalDays;
    // CSS grid template: 140px (Task) 80px (Status) then 40px per day
    const gridTemplate = `140px 80px repeat(${timelineCols}, 40px)`;

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
      <div class="gantt-outer">
        <div class="gantt-grid gantt-header" style="grid-template-columns:${gridTemplate};">
          <div class="gantt-header-cell task-col">Task</div>
          <div class="gantt-header-cell status-col">Status</div>
          ${months.map(month => html`<div class="gantt-header-cell month-col" style="grid-column: span ${month.span};">${month.label}</div>`)}
          ${ticks.map((tick) => html`<div class="gantt-header-cell day-col">${tick.label}</div>`)}
        </div>
        ${timeline.visibleTasks.map((entry, idx) => {
          const { x, width } = this.getBarGeometry(entry, timeline.startDate, timeline.totalDays, timelineCols * 40);
          const barColStart = 3 + getDayOffset(timeline.startDate, entry.startDate);
          const barColEnd = barColStart + Math.max(1, getDayOffset(entry.startDate, entry.endDate) + 1);
          return html`
            <div class="gantt-grid gantt-row" style="grid-template-columns:${gridTemplate};">
              <div class="gantt-body-cell task-col">${entry.task.text}</div>
              <div class="gantt-body-cell status-col">${entry.task.section || entry.task.status || ''}</div>
              ${Array.from({length: timelineCols}).map((_, i) => html`<div class="gantt-body-cell day-col"></div>`)}
              <div class="gantt-bar" style="grid-column:${barColStart} / ${barColEnd};">
                <svg width="${width}" height="${barHeight}" style="display:block;overflow:visible;">
                  <rect x="0" y="0" width="${width}" height="${barHeight}" rx="12" fill="#ECECFE" stroke="#bfc7e6" stroke-width="2" />
                  <circle
                    cx="0"
                    cy="${barHeight/2}"
                    r="${handleRadius}"
                    fill="#facc15" stroke="#fff" stroke-width="2"
                    style="cursor:ew-resize;"
                    @pointerdown=${(ev) => this._onLeftHandlePointerDown(idx, ev, entry, timeline, timelineCols * 40)}
                  />
                  <circle
                    cx="${width/2}"
                    cy="${barHeight/2}"
                    r="${handleRadius}"
                    fill="#ef4444" stroke="#fff" stroke-width="2"
                  />
                  <circle
                    cx="${width}"
                    cy="${barHeight/2}"
                    r="${handleRadius}"
                    fill="#3b82f6" stroke="#fff" stroke-width="2"
                    style="cursor:pointer;"
                    @pointerdown=${(ev) => this._onRightHandlePointerDown(idx, ev, entry, timeline, timelineCols * 40)}
                  />
                  <text x="${width/2}" y="${barHeight/2+4}" text-anchor="middle" font-size="13" fill="#333">${entry.task.text}</text>
                </svg>
              </div>
            </div>
          `;
        })}
        ${!timeline.visibleTasks.length ? html`<div class="empty">No tasks available for the current filters.</div>` : ''}
      </div>
    `;
  }

  firstUpdated() {
    // Sync scroll between header and body timeline
    const headerScroll = this.renderRoot.querySelector('.gantt-header-scroll');
    const bodyScroll = this.renderRoot.querySelector('.gantt-body-scroll');
    if (headerScroll && bodyScroll) {
      bodyScroll.addEventListener('scroll', () => {
        headerScroll.scrollLeft = bodyScroll.scrollLeft;
      });
      headerScroll.addEventListener('scroll', () => {
        bodyScroll.scrollLeft = headerScroll.scrollLeft;
      });
    }
  }
}

customElements.define('gantt-view', GanttView);
