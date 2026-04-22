import { LitElement, html, css } from 'https://unpkg.com/lit?module';
import { ALL_PROJECTS_FILTER, matchesProjectFilter } from './task-project.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_TIMELINE_DAYS = 7;
const HANDLE_RADIUS = 7;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const pad = (value) => String(value).padStart(2, '0');

const formatDateToken = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

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

const sameDateToken = (left, right) => String(left || '').slice(0, 10) === String(right || '').slice(0, 10);

export class GanttCanvasView extends LitElement {
  static properties = {
    tasks: { type: Array },
    startDate: { type: Object },
    endDate: { type: Object },
    projectFilter: { type: String },
    filter: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .viewport {
      width: 100%;
      height: 420px;
      overflow: auto;
      background: var(--wa-surface, #fff);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    canvas {
      display: block;
      background: var(--wa-surface, #fff);
    }
  `;

  constructor() {
    super();
    this.tasks = [];
    this.startDate = null;
    this.endDate = null;
    this.projectFilter = ALL_PROJECTS_FILTER;
    this.filter = 'all';
    this._layout = null;
    this._dragState = null;
    this._resizeObserver = null;
  }

  render() {
    return html`
      <div class="viewport">
        <canvas id="ganttCanvas"></canvas>
      </div>
    `;
  }

  firstUpdated() {
    const canvas = this._getCanvas();
    if (canvas) {
      canvas.addEventListener('pointerdown', this._onPointerDown);
    }

    const viewport = this._getViewport();
    if (viewport && 'ResizeObserver' in window) {
      this._resizeObserver = new ResizeObserver(() => this._draw());
      this._resizeObserver.observe(viewport);
    }

    this._draw();
  }

  updated() {
    this._draw();
  }

  disconnectedCallback() {
    this._endDrag();
    this._resizeObserver?.disconnect();
    const canvas = this._getCanvas();
    if (canvas) {
      canvas.removeEventListener('pointerdown', this._onPointerDown);
    }
    super.disconnectedCallback();
  }

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
        return Boolean(task.completed);
      }

      return true;
    });
  }

  getTaskSchedule(task, overrides = {}) {
    const startDate = parseDateValue(overrides.createdAt ?? task?.createdAt)
      || parseDateValue(task?.dueDate)
      || parseDateValue(new Date())
      || new Date();

    const workloadFromTask = overrides.workloadEstimate ?? task?.workloadEstimate;
    const workloadFromDueDate = parseDateValue(task?.dueDate)
      ? Math.max(1, Math.round((parseDateValue(task.dueDate).getTime() - startDate.getTime()) / DAY_MS) + 1)
      : 1;
    const workloadEstimate = Math.max(
      1,
      Math.round(Number.isFinite(workloadFromTask) ? workloadFromTask : workloadFromDueDate),
    );
    const endDate = addDays(startDate, workloadEstimate - 1);

    return { startDate, endDate, workloadEstimate };
  }

  getTimelineModel(visibleTasks) {
    const rows = visibleTasks.map((task) => ({
      task,
      ...this.getTaskSchedule(task),
    }));

    if (!rows.length) {
      const today = parseDateValue(new Date()) ?? new Date();
      return {
        rows,
        startDate: today,
        totalDays: MIN_TIMELINE_DAYS,
      };
    }

    const earliestStart = rows.reduce(
      (current, entry) => (entry.startDate.getTime() < current.getTime() ? entry.startDate : current),
      rows[0].startDate,
    );
    const latestEnd = rows.reduce(
      (current, entry) => (entry.endDate.getTime() > current.getTime() ? entry.endDate : current),
      rows[0].endDate,
    );

    const totalDays = Math.max(MIN_TIMELINE_DAYS, Math.round((latestEnd.getTime() - earliestStart.getTime()) / DAY_MS) + 1);

    return {
      rows,
      startDate: earliestStart,
      totalDays,
    };
  }

  _getCanvas() {
    return this.renderRoot?.getElementById('ganttCanvas') ?? null;
  }

  _getViewport() {
    return this.renderRoot?.querySelector('.viewport') ?? null;
  }

  _getPreviewOverrides(taskId) {
    if (!this._dragState || this._dragState.taskId !== taskId) {
      return null;
    }

    const taskGeometry = this._layout?.bars?.get(taskId);
    if (!taskGeometry) {
      return null;
    }

    const dayIndex = this._getDayIndexForX(this._dragState.pointer.x);
    const previewDate = addDays(this._layout.timelineStart, dayIndex);

    if (this._dragState.type === 'start') {
      return {
        createdAt: formatDateToken(previewDate),
      };
    }

    if (this._dragState.type === 'workload') {
      const workloadEstimate = Math.max(1, dayIndex - taskGeometry.startIndex + 1);
      return { workloadEstimate };
    }

    return null;
  }

  _draw() {
    const canvas = this._getCanvas();
    const viewport = this._getViewport();
    if (!canvas || !viewport) {
      return;
    }

    const visibleTasks = [...this.getVisibleTasks()].reverse();
    const timeline = this.getTimelineModel(visibleTasks);

    const rowHeight = 40;
    const barHeight = 20;
    const taskColWidth = 220;
    const statusColWidth = 120;
    const leftPad = taskColWidth + statusColWidth;
    const topPad = 44;
    const bottomPad = 16;
    const dayWidth = 34;
    const timelineWidth = Math.max(viewport.clientWidth - leftPad, timeline.totalDays * dayWidth);
    const width = leftPad + timelineWidth;
    const height = Math.max(220, topPad + visibleTasks.length * rowHeight + bottomPad);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const bars = new Map();
    timeline.rows.forEach((entry, rowIndex) => {
      const previewOverrides = this._getPreviewOverrides(entry.task.id);
      const schedule = previewOverrides ? this.getTaskSchedule(entry.task, previewOverrides) : entry;
      const startIndex = Math.round((schedule.startDate.getTime() - timeline.startDate.getTime()) / DAY_MS);
      const barX = leftPad + startIndex * dayWidth;
      const barWidth = schedule.workloadEstimate * dayWidth;
      const barY = topPad + rowIndex * rowHeight + 9;
      const centerY = barY + barHeight / 2;
      bars.set(entry.task.id, {
        task: entry.task,
        rowIndex,
        x: barX,
        y: barY,
        width: barWidth,
        height: barHeight,
        startIndex,
        workloadEstimate: schedule.workloadEstimate,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        startHandle: { x: barX, y: centerY, radius: HANDLE_RADIUS },
        endHandle: { x: barX + barWidth, y: centerY, radius: HANDLE_RADIUS },
        dependencyHandle: { x: barX + barWidth / 2, y: centerY, radius: HANDLE_RADIUS },
      });
    });

    this._layout = {
      width,
      height,
      leftPad,
      topPad,
      rowHeight,
      dayWidth,
      timelineStart: timeline.startDate,
      totalDays: timeline.totalDays,
      bars,
    };

    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    this._drawGrid(ctx, width, height, leftPad, topPad, rowHeight, dayWidth, timeline);
    this._drawRows(ctx, width, rowHeight, topPad, taskColWidth, visibleTasks, bars);
    this._drawDependencies(ctx, bars);
    this._drawDependencyPreview(ctx, bars);
  }

  _drawGrid(ctx, width, height, leftPad, topPad, rowHeight, dayWidth, timeline) {
    ctx.save();
    ctx.font = '600 14px Atkinson Hyperlegible, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Task', 16, 28);
    ctx.fillText('Status', 236, 28);

    ctx.font = '12px Atkinson Hyperlegible, sans-serif';
    ctx.textAlign = 'center';
    for (let dayIndex = 0; dayIndex < timeline.totalDays; dayIndex += 1) {
      const x = leftPad + dayIndex * dayWidth;
      const date = addDays(timeline.startDate, dayIndex);
      ctx.fillStyle = '#64748b';
      ctx.fillText(pad(date.getDate()), x + dayWidth / 2, 28);
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(x, topPad - 18);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(220, topPad - 18);
    ctx.lineTo(220, height);
    ctx.moveTo(leftPad, topPad - 18);
    ctx.lineTo(leftPad, height);
    ctx.stroke();

    for (let row = 0; row <= this._layout.bars.size; row += 1) {
      const y = topPad + row * rowHeight;
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawRows(ctx, width, rowHeight, topPad, taskColWidth, visibleTasks, bars) {
    visibleTasks.forEach((task, rowIndex) => {
      const rowY = topPad + rowIndex * rowHeight;
      const bar = bars.get(task.id);
      const isDependencyTarget = this._dragState?.type === 'dependency' && this._dragState.hoverTaskId === task.id;

      ctx.save();
      ctx.fillStyle = rowIndex % 2 ? '#f8fafc' : '#fff';
      ctx.fillRect(0, rowY, width, rowHeight);
      ctx.restore();

      ctx.save();
      ctx.font = '14px Atkinson Hyperlegible, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'left';
      ctx.fillText(task.text || task.title || '', 16, rowY + 25);
      ctx.fillStyle = '#64748b';
      ctx.fillText(task.section || task.status || '', taskColWidth + 16, rowY + 25);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#e0e7ff';
      ctx.strokeStyle = isDependencyTarget ? '#f97316' : '#a5b4fc';
      ctx.lineWidth = isDependencyTarget ? 3 : 1.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bar.x, bar.y, bar.width, bar.height, 10);
      } else {
        ctx.rect(bar.x, bar.y, bar.width, bar.height);
      }
      ctx.fill();
      ctx.stroke();

      this._drawHandle(ctx, bar.startHandle, '#1976d2');
      this._drawHandle(ctx, bar.endHandle, '#ffd43b');
      this._drawHandle(ctx, bar.dependencyHandle, '#64748b');
      ctx.restore();
    });
  }

  _drawHandle(ctx, handle, fillStyle) {
    ctx.beginPath();
    ctx.arc(handle.x, handle.y, handle.radius, 0, 2 * Math.PI);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  _drawDependencies(ctx, bars) {
    bars.forEach((dependentBar) => {
      const dependencies = Array.isArray(dependentBar.task.dependsOn) ? dependentBar.task.dependsOn : [];

      dependencies.forEach((dependencyId) => {
        const sourceBar = bars.get(dependencyId);
        if (!sourceBar) {
          return;
        }

        const start = sourceBar.dependencyHandle;
        const end = dependentBar.startHandle;
        const elbowX = start.x <= end.x - 24
          ? start.x + Math.max(20, (end.x - start.x) / 2)
          : Math.max(start.x, end.x) + 24;

        ctx.save();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(elbowX, start.y);
        ctx.lineTo(elbowX, end.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        this._drawArrowHead(ctx, { x: elbowX, y: end.y }, end, '#475569');
        ctx.restore();
      });
    });
  }

  _drawDependencyPreview(ctx, bars) {
    if (this._dragState?.type !== 'dependency') {
      return;
    }

    const sourceBar = bars.get(this._dragState.taskId);
    if (!sourceBar) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(sourceBar.dependencyHandle.x, sourceBar.dependencyHandle.y);
    ctx.lineTo(this._dragState.pointer.x, this._dragState.pointer.y);
    ctx.stroke();
    ctx.restore();
  }

  _drawArrowHead(ctx, from, to, fillStyle) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLength = 11;

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - arrowLength * Math.cos(angle - 0.38),
      to.y - arrowLength * Math.sin(angle - 0.38),
    );
    ctx.lineTo(
      to.x - arrowLength * Math.cos(angle + 0.38),
      to.y - arrowLength * Math.sin(angle + 0.38),
    );
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  _getCanvasPoint(event) {
    const canvas = this._getCanvas();
    if (!canvas || !this._layout) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = this._layout.width / rect.width;
    const scaleY = this._layout.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  _getDayIndexForX(x) {
    if (!this._layout) {
      return 0;
    }

    return clamp(
      Math.round((x - this._layout.leftPad) / this._layout.dayWidth),
      0,
      this._layout.totalDays - 1,
    );
  }

  _findHitTarget(point) {
    if (!this._layout) {
      return null;
    }

    for (const [taskId, bar] of this._layout.bars.entries()) {
      if (Math.hypot(point.x - bar.startHandle.x, point.y - bar.startHandle.y) <= bar.startHandle.radius + 2) {
        return { type: 'start', taskId };
      }

      if (Math.hypot(point.x - bar.endHandle.x, point.y - bar.endHandle.y) <= bar.endHandle.radius + 2) {
        return { type: 'workload', taskId };
      }

      if (Math.hypot(point.x - bar.dependencyHandle.x, point.y - bar.dependencyHandle.y) <= bar.dependencyHandle.radius + 2) {
        return { type: 'dependency', taskId };
      }
    }

    return null;
  }

  _findBarAtPoint(point, excludedTaskId = null) {
    if (!this._layout) {
      return null;
    }

    for (const [taskId, bar] of this._layout.bars.entries()) {
      if (taskId === excludedTaskId) {
        continue;
      }

      if (
        point.x >= bar.x
        && point.x <= bar.x + bar.width
        && point.y >= bar.y - 8
        && point.y <= bar.y + bar.height + 8
      ) {
        return taskId;
      }
    }

    return null;
  }

  _onPointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    const hit = this._findHitTarget(this._getCanvasPoint(event));
    if (!hit) {
      return;
    }

    event.preventDefault();
    const canvas = this._getCanvas();
    const point = this._getCanvasPoint(event);
    canvas?.setPointerCapture?.(event.pointerId);
    this._dragState = {
      pointerId: event.pointerId,
      type: hit.type,
      taskId: hit.taskId,
      pointer: point,
      hoverTaskId: null,
    };
    canvas?.addEventListener('pointermove', this._onPointerMove);
    canvas?.addEventListener('pointerup', this._onPointerUp);
    canvas?.addEventListener('pointercancel', this._onPointerCancel);
    this._draw();
  };

  _onPointerMove = (event) => {
    if (!this._dragState || event.pointerId !== this._dragState.pointerId) {
      return;
    }

    const point = this._getCanvasPoint(event);
    this._dragState = {
      ...this._dragState,
      pointer: point,
      hoverTaskId: this._dragState.type === 'dependency'
        ? this._findBarAtPoint(point, this._dragState.taskId)
        : null,
    };
    this._draw();
  };

  _onPointerUp = (event) => {
    if (!this._dragState || event.pointerId !== this._dragState.pointerId) {
      return;
    }

    this._commitDrag();
    this._endDrag();
    this._draw();
  };

  _onPointerCancel = (event) => {
    if (!this._dragState || event.pointerId !== this._dragState.pointerId) {
      return;
    }

    this._endDrag();
    this._draw();
  };

  _commitDrag() {
    if (!this._dragState || !this._layout) {
      return;
    }

    const task = this.tasks.find((entry) => entry.id === this._dragState.taskId);
    const bar = this._layout.bars.get(this._dragState.taskId);
    if (!task || !bar) {
      return;
    }

    if (this._dragState.type === 'dependency') {
      if (!this._dragState.hoverTaskId) {
        return;
      }

      this.dispatchEvent(new CustomEvent('dependency-create', {
        detail: {
          sourceTaskId: this._dragState.taskId,
          targetTaskId: this._dragState.hoverTaskId,
        },
        bubbles: true,
        composed: true,
      }));
      return;
    }

    const previewOverrides = this._getPreviewOverrides(this._dragState.taskId);
    if (!previewOverrides) {
      return;
    }

    if (this._dragState.type === 'start') {
      const nextStartDate = parseDateValue(previewOverrides.createdAt);
      const nextDueDate = formatDateToken(addDays(nextStartDate, bar.workloadEstimate - 1));

      if (sameDateToken(task.createdAt, previewOverrides.createdAt) && sameDateToken(task.dueDate, nextDueDate)) {
        return;
      }

      this.dispatchEvent(new CustomEvent('task-update', {
        detail: {
          taskId: task.id,
          updates: {
            createdAt: previewOverrides.createdAt,
            dueDate: nextDueDate,
          },
        },
        bubbles: true,
        composed: true,
      }));
      return;
    }

    if (this._dragState.type === 'workload') {
      const workloadEstimate = Math.max(1, previewOverrides.workloadEstimate);
      const nextDueDate = formatDateToken(addDays(bar.startDate, workloadEstimate - 1));

      if (Number(task.workloadEstimate) === workloadEstimate && sameDateToken(task.dueDate, nextDueDate)) {
        return;
      }

      this.dispatchEvent(new CustomEvent('task-update', {
        detail: {
          taskId: task.id,
          updates: {
            workloadEstimate,
            dueDate: nextDueDate,
          },
        },
        bubbles: true,
        composed: true,
      }));
    }
  }

  _endDrag() {
    const canvas = this._getCanvas();
    if (canvas) {
      canvas.removeEventListener('pointermove', this._onPointerMove);
      canvas.removeEventListener('pointerup', this._onPointerUp);
      canvas.removeEventListener('pointercancel', this._onPointerCancel);
    }
    this._dragState = null;
  }
}

customElements.define('gantt-canvas-view', GanttCanvasView);
