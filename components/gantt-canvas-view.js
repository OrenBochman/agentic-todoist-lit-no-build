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

    // Example: Draw grid and bars for visible tasks
    const rowHeight = 36;
    const barHeight = 20;
    const leftPad = 160;
    const topPad = 40;
    const dayWidth = 32;
    // TODO: Compute start/end from props or tasks
    const startDate = this.startDate || new Date();
    const endDate = this.endDate || new Date(Date.now() + 7*86400000);
    const days = Math.ceil((endDate - startDate) / 86400000) + 1;

    // Draw header
    ctx.font = 'bold 15px Atkinson Hyperlegible, sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText('Task', 12, topPad - 12);
    for (let d = 0; d < days; ++d) {
      const x = leftPad + d * dayWidth;
      const date = new Date(startDate.getTime() + d * 86400000);
      ctx.fillStyle = '#888';
      ctx.font = '12px Atkinson Hyperlegible, sans-serif';
      ctx.fillText(date.getDate(), x + 8, topPad - 12);
      // Vertical grid line
      ctx.strokeStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(x, topPad - 20);
      ctx.lineTo(x, topPad + rowHeight * this.tasks.length);
      ctx.stroke();
    }

    // Draw rows and bars
    this.tasks.forEach((task, i) => {
      const y = topPad + i * rowHeight;
      // Row background
      ctx.fillStyle = i % 2 ? '#fafbff' : '#fff';
      ctx.fillRect(0, y, canvas.width, rowHeight);
      // Task label
      ctx.fillStyle = '#333';
      ctx.font = '14px Atkinson Hyperlegible, sans-serif';
      ctx.fillText(task.text || task.title || '', 12, y + barHeight);
      // Bar (example: random start/duration)
      const startOffset = Math.floor(Math.random() * days * 0.5);
      const duration = Math.max(1, Math.floor(Math.random() * (days - startOffset)));
      const barX = leftPad + startOffset * dayWidth;
      const barW = duration * dayWidth;
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
    });
  }
}

customElements.define('gantt-canvas-view', GanttCanvasView);
