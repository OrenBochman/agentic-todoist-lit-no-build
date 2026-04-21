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
    .surface {
      border: 1px solid var(--panel-border);
      border-radius: 28px;
      overflow: hidden;
      background: color-mix(in srgb, var(--panel-background) 96%, transparent);
      box-shadow: var(--panel-shadow);
        .bar-handle-right {
          background: #3867d6;
          right: 0;
          transform: translateX(50%) translateY(-50%);
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
            background: #3867d6;
            position: absolute;
            top: 50%;
            right: 0;
            transform: translate(50%, -50%);
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
    .gantt-task-title {
      font-size: 1.02rem;
      font-weight: 600;
      color: var(--text-strong);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
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
      display: flex;
      align-items: center;
      z-index: 1;
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
    .bar-handle {
      display: inline-block;
      width: 14px;
      height: 18px;
      background: var(--panel-border);
      opacity: 0.7;
      .bar {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        height: 18px;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 68%, white));
        box-shadow: 0 8px 20px color-mix(in srgb, var(--accent) 28%, transparent);
        min-width: 14px;
        display: block;
        z-index: 1;
      }
      .bar-inner {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: stretch;
      }
    .bar-handle-center {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 14px;
        height: 18px;
        background: var(--panel-border);
        opacity: 0.7;
        cursor: pointer;
        border-radius: 3px;
        transition: background 0.2s, opacity 0.2s;
    .empty {
      padding: 40px 28px;
        background: #f7b731;
        left: -7px;
    }
    @media (max-width: 900px) {
        background: #3867d6;
        right: -7px;
        grid-template-columns: 1fr;
      }
        background: #20bf6b;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        border-radius: 50%;
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
                <div class="gantt-header-grid">
                  <div class="gantt-header-fixed">
                    <div class="tick" style="font-weight:700;">Task</div>
                    <div class="tick" style="font-weight:700;">Status</div>
                  </div>
                  <div class="gantt-header-scroll" style="width:${laneWidthPx}px;">
                    <div class="month-row">
                      ${months.map(month => html`<div class="month-cell" style="grid-column: span ${month.span};">${month.label}</div>`)}
                    </div>
                    <div class="day-row">
                      ${ticks.map((tick) => html`<div class="day-cell">${tick.label}</div>`)}
                    </div>
                  </div>
                </div>
              </div>
              <div class="gantt-body">
                <div class="gantt-body-fixed">
                  ${timeline.visibleTasks.map((entry) => html`
                    <div class="task-cell"><div class="gantt-task-title" title=${entry.task.text}>${entry.task.text}</div></div>
                    <div class="task-cell"><div class="gantt-task-status" title=${entry.task.section || entry.task.status || ''}>${entry.task.section || entry.task.status || ''}</div></div>
                  `)}
                </div>
                <div class="gantt-body-scroll" style="width:${laneWidthPx}px;">
                  ${timeline.visibleTasks.map((entry, idx) => {
                    const { x, width } = this.getBarGeometry(entry, timeline.startDate, timeline.totalDays, laneWidthPx);
                    const y = (svgHeight - barHeight) / 2;
                    const dragPx = (this._dragTaskIdx === idx) ? this._dragPx : 0;
                    const leftHandleX = x + dragPx;
                    const centerHandleX = x + width/2 + dragPx;
                    const rightHandleX = x + width + dragPx;
                    return html`
                      <div class="lane" style="position:relative;min-height:${svgHeight}px;">
                        <svg width="${laneWidthPx}" height="${svgHeight}" style="display:block;overflow:visible;">
                          <!-- Bar and handles -->
                          <rect x="${leftHandleX}" y="${y}" width="${width}" height="${barHeight}" rx="12" fill="#ECECFE" stroke="#bfc7e6" stroke-width="2" />
                          <circle
                            cx="${leftHandleX}"
                            cy="${y+barHeight/2}"
                            r="${handleRadius}"
                            fill="#facc15" stroke="#fff" stroke-width="2"
                            style="cursor:ew-resize;"
                            @pointerdown=${(ev) => this._onLeftHandlePointerDown(idx, ev, entry, timeline, laneWidthPx)}
                          />
                          <circle
                            cx="${centerHandleX}"
                            cy="${y+barHeight/2}"
                            r="${handleRadius}"
                            fill="#ef4444" stroke="#fff" stroke-width="2"
                          />
                          <circle
                            cx="${rightHandleX}"
                            cy="${y+barHeight/2}"
                            r="${handleRadius}"
                            fill="#3b82f6" stroke="#fff" stroke-width="2"
                            style="cursor:pointer;"
                            @pointerdown=${(ev) => this._onRightHandlePointerDown(idx, ev, entry, timeline, laneWidthPx)}
                          />
                          <text x="${centerHandleX}" y="${y+barHeight/2+4}" text-anchor="middle" font-size="13" fill="#333">${entry.task.text}</text>
                        </svg>
                      </div>
                    `;
                  })}
                </div>
              </div>
            `
          : html`<div class="empty">No tasks available for the current filters.</div>`}
      </section>
    `;
  }
}

customElements.define('gantt-view', GanttView);
