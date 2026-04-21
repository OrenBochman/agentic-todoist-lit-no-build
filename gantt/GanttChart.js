class GanttChart extends HTMLElement {
  connectedCallback() {
    const tasks = [
      { id: "t1", name: "Research", owner: "Dana", start: 2, duration: 6, color: "#60a5fa" },
      { id: "t2", name: "Wireframes", owner: "Oren", start: 11, duration: 7, color: "#34d399", dependsOn: "t1" },
      { id: "t3", name: "Web Component", owner: "Maya", start: 21, duration: 8, color: "#a78bfa", dependsOn: "t2" },
      { id: "t4", name: "Dependency Logic", owner: "Noam", start: 32, duration: 6, color: "#f59e0b", dependsOn: "t3" },
      { id: "t5", name: "Integration", owner: "Lia", start: 38, duration: 7, color: "#fb7185", dependsOn: "t4" },
      { id: "t6", name: "QA Pass", owner: "Avi", start: 47, duration: 6, color: "#22c55e", dependsOn: "t5" }
    ];

    const dayWidth = 20;
    const rowHeight = 60;
    const barHeight = 20;

    const leftPanel = 292;
    const svgX = 52;
    const timelineX = svgX + leftPanel;

    const top = 110;
    const rowsTop = top + 56;

    const taskMap = new Map(tasks.map((t, i) => [t.id, { ...t, row: i }]));

    const barGeom = (task) => {
      const x = timelineX + task.start * dayWidth;
      const y = rowsTop + task.row * rowHeight + 12;
      const w = task.duration * dayWidth;

      return {
        x, y, w, h: barHeight,
        left: { x, y: y + barHeight / 2 },
        mid: { x: x + w / 2, y: y + barHeight / 2 },
        right: { x: x + w, y: y + barHeight / 2 }
      };
    };

    const rows = tasks.map((task, i) => {
      const g = barGeom(task);

      return `
        <text x="64" y="${rowsTop + i * rowHeight + 24}" class="label">${task.name}</text>
        <text x="272" y="${rowsTop + i * rowHeight + 24}" text-anchor="end" class="small">${task.owner}</text>

        <rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="10" fill="${task.color}"/>
        <circle cx="${g.left.x}" cy="${g.left.y}" r="5.5" fill="#facc15" stroke="#fff" stroke-width="1.2"/>
        <circle cx="${g.mid.x}" cy="${g.mid.y}" r="5.5" fill="#ef4444" stroke="#fff" stroke-width="1.2"/>
        <circle cx="${g.right.x}" cy="${g.right.y}" r="5.5" fill="#2563eb" stroke="#fff" stroke-width="1.2"/>
      `;
    }).join("");

    const deps = tasks
      .filter(t => t.dependsOn)
      .map(task => {
        const source = barGeom(taskMap.get(task.dependsOn));
        const target = barGeom(task);

        const sx = source.right.x;
        const sy = source.right.y;
        const tx = target.left.x;
        const ty = target.left.y;

        // enforce rightward first, then down
        const elbow = Math.max(sx + 40, tx - 20);

        return `
          <path class="dep" marker-end="url(#arrowHead)"
            d="
              M${sx},${sy}
              H${elbow}
              Q${elbow + 10},${sy} ${elbow + 10},${sy + 10}
              V${ty - 10}
              Q${elbow + 10},${ty} ${tx - 10},${ty}
              H${tx}
            "
          />
        `;
      })
      .join("");

    this.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="620">
        <defs>
          <style>
            .label { font: 600 13px sans-serif; fill: #111; }
            .small { font: 500 11px sans-serif; fill: #666; }
            .dep { stroke: #64748b; stroke-width: 2; fill: none; }
          </style>
          <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#64748b"/>
          </marker>
        </defs>

        ${rows}
        ${deps}
      </svg>
    `;
  }
}

customElements.define("gantt-chart", GanttChart);