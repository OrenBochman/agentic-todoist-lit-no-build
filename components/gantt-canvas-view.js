import { LitElement, html, css } from 'https://unpkg.com/lit?module';

/**
 * <gantt-canvas-view>
 * Canvas-based Gantt chart for high-performance rendering and interaction.
 * This is a scaffold for incremental migration from the grid-based Gantt view.
 */
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
      height: 400px;
      background: var(--wa-surface, #fff);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      position: relative;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
      background: var(--wa-surface, #fff);
      border-radius: 8px;
    }
  `;

  constructor() {
    super();
    this.tasks = [];
    this.startDate = null;
    this.endDate = null;
    this.projectFilter = '';
    this.filter = '';
  }

  firstUpdated() {
    this._draw();
  }

  updated() {
    this._draw();
  }

  render() {
    return html`
      <canvas id="ganttCanvas" width="1200" height="400"></canvas>
    `;
  }

  _draw() {
    const canvas = this.renderRoot.getElementById('ganttCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Layout constants
    const rowHeight = 36;
    const barHeight = 20;
    const taskColWidth = 140;
    const statusColWidth = 80;
    const leftPad = taskColWidth + statusColWidth;
    const topPad = 40;
    const dayWidth = 32; // enough for '00'

    // Compute timeline
    const startDate = this.startDate || new Date();
    const endDate = this.endDate || new Date(Date.now() + 7*86400000);
    const days = Math.ceil((endDate - startDate) / 86400000) + 1;
    const totalWidth = leftPad + days * dayWidth;
    canvas.width = totalWidth;

    // 1. Draw grid (header and verticals)
    ctx.save();
    ctx.font = 'bold 15px Atkinson Hyperlegible, sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText('Task', 12, topPad - 12);
    ctx.fillText('Status', taskColWidth + 12, topPad - 12);
    ctx.font = '12px Atkinson Hyperlegible, sans-serif';
    ctx.textAlign = 'center';
    for (let d = 0; d < days; ++d) {
      const x = leftPad + d * dayWidth;
      const date = new Date(startDate.getTime() + d * 86400000);
      ctx.fillStyle = '#888';
      ctx.fillText(date.getDate().toString().padStart(2, '0'), x + dayWidth/2, topPad - 12);
      // Vertical grid line
      ctx.strokeStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(x, topPad - 20);
      ctx.lineTo(x, topPad + rowHeight * this.tasks.length);
      ctx.stroke();
    }
    // Draw left grid verticals (Task, Status)
    ctx.strokeStyle = '#bfc7e6';
    ctx.beginPath();
    ctx.moveTo(taskColWidth, topPad - 20);
    ctx.lineTo(taskColWidth, topPad + rowHeight * this.tasks.length);
    ctx.moveTo(leftPad, topPad - 20);
    ctx.lineTo(leftPad, topPad + rowHeight * this.tasks.length);
    ctx.stroke();
    ctx.restore();

    // Draw horizontal grid lines (rows)
    ctx.save();
    for (let i = 0; i <= this.tasks.length; ++i) {
      const y = topPad + i * rowHeight;
      ctx.strokeStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(totalWidth, y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Draw text and bars row by row
    this.tasks.forEach((task, i) => {
      const y = topPad + i * rowHeight;
      // Row background
      ctx.save();
      ctx.fillStyle = i % 2 ? '#fafbff' : '#fff';
      ctx.fillRect(0, y, totalWidth, rowHeight);
      ctx.restore();
      // Task label
      ctx.save();
      ctx.font = '14px Atkinson Hyperlegible, sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.fillText(task.text || task.title || '', 12, y + barHeight);
      ctx.fillStyle = '#666';
      ctx.fillText(task.section || task.status || '', taskColWidth + 12, y + barHeight);
      ctx.restore();
      // Bar: use dueDate (or createdAt) as start, default duration 1 day
      let barStart = null;
      if (task.dueDate) {
        barStart = new Date(task.dueDate);
      } else if (task.createdAt) {
        barStart = new Date(task.createdAt);
      }
      // Clamp barStart to timeline
      let startOffset = 0;
      if (barStart && barStart >= startDate && barStart <= endDate) {
        startOffset = Math.floor((barStart - startDate) / 86400000);
      } else if (barStart && barStart < startDate) {
        startOffset = 0;
      } else if (barStart && barStart > endDate) {
        startOffset = days - 1;
      }
      // Duration: use workloadEstimate if present, else 1 day
      let duration = 1;
      if (typeof task.workloadEstimate === 'number' && task.workloadEstimate > 0) {
        duration = Math.min(days - startOffset, Math.max(1, Math.round(task.workloadEstimate)));
      }
      const barX = leftPad + startOffset * dayWidth;
      const barW = duration * dayWidth;
      ctx.save();
      ctx.fillStyle = '#ECECFE';
      ctx.strokeStyle = '#bfc7e6';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(barX, y + 6, barW, barHeight, 10);
      } else {
        ctx.rect(barX, y + 6, barW, barHeight);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // 3. Draw dependency arrows (placeholder)
    // TODO: Draw arrows after all bars are rendered
  }
}

customElements.define('gantt-canvas-view', GanttCanvasView);
