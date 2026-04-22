import '../../script.js';
import { expect } from '../helpers/browser-test-harness.js';

describe('Task Manager Gantt View Regression', () => {
  it('cycles list, kanban, and gantt views in order', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');

    expect(app.activeView).to.equal('list');

    app.toggleTaskView();
    expect(app.activeView).to.equal('kanban');
    expect(app.showKanban).to.equal(true);

    app.toggleTaskView();
    expect(app.activeView).to.equal('gantt');
    expect(app.showKanban).to.equal(false);

    app.toggleTaskView();
    expect(app.activeView).to.equal('list');
  });

  it('renders gantt-canvas-view when the active view is gantt', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.tasks = [
      { id: '1', text: 'Plan roadmap', completed: false, createdAt: '2026-04-01', dueDate: '2026-04-04' },
    ];
    app.activeView = 'gantt';
    document.body.append(app);
    await app.updateComplete;

    expect(app.shadowRoot.querySelector('gantt-canvas-view')).to.exist;

    app.remove();
  });

  it('applies gantt canvas task updates to persisted task state', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.tasks = [
      { id: '1', text: 'Plan roadmap', completed: false, createdAt: '2026-04-01', dueDate: '2026-04-04', workloadEstimate: 4, dependsOn: [] },
    ];
    app.activeView = 'gantt';
    document.body.append(app);
    await app.updateComplete;

    const gantt = app.shadowRoot.querySelector('gantt-canvas-view');
    gantt.dispatchEvent(new CustomEvent('task-update', {
      detail: {
        taskId: '1',
        updates: {
          createdAt: '2026-04-03',
          dueDate: '2026-04-08',
          workloadEstimate: 6,
        },
      },
      bubbles: true,
      composed: true,
    }));
    await app.updateComplete;

    expect(app.tasks[0].createdAt).to.equal('2026-04-03');
    expect(app.tasks[0].dueDate).to.equal('2026-04-08');
    expect(app.tasks[0].workloadEstimate).to.equal(6);
    app.remove();
  });

  it('creates gantt dependencies from canvas events', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.tasks = [
      { id: '1', text: 'Plan roadmap', completed: false, createdAt: '2026-04-01', dueDate: '2026-04-04', workloadEstimate: 4, dependsOn: [] },
      { id: '2', text: 'Ship feature', completed: false, createdAt: '2026-04-05', dueDate: '2026-04-09', workloadEstimate: 5, dependsOn: [] },
    ];
    app.activeView = 'gantt';
    document.body.append(app);
    await app.updateComplete;

    const gantt = app.shadowRoot.querySelector('gantt-canvas-view');
    gantt.dispatchEvent(new CustomEvent('dependency-create', {
      detail: {
        sourceTaskId: '1',
        targetTaskId: '2',
      },
      bubbles: true,
      composed: true,
    }));
    await app.updateComplete;

    expect(app.tasks.find((task) => task.id === '2').dependsOn).to.deep.equal(['1']);

    app.remove();
  });

  it('renders gantt zoom controls bounded between 14 and 30 days', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.tasks = [
      { id: '1', text: 'Plan roadmap', completed: false, createdAt: '2026-04-01', dueDate: '2026-04-20', workloadEstimate: 20, dependsOn: [] },
    ];
    app.activeView = 'gantt';
    document.body.append(app);
    await app.updateComplete;

    const gantt = app.shadowRoot.querySelector('gantt-canvas-view');
    const zoomIn = gantt.shadowRoot.querySelector('button[aria-label="Zoom in gantt timeline"]');
    const zoomOut = gantt.shadowRoot.querySelector('button[aria-label="Zoom out gantt timeline"]');
    const zoomLabel = gantt.shadowRoot.querySelector('.zoom-label');

    expect(zoomLabel.textContent).to.include('21 days');

    for (let index = 0; index < 10; index += 1) {
      zoomIn.click();
    }
    await gantt.updateComplete;
    expect(gantt.zoomDays).to.equal(14);
    expect(zoomLabel.textContent).to.include('14 days');

    for (let index = 0; index < 20; index += 1) {
      zoomOut.click();
    }
    await gantt.updateComplete;
    expect(gantt.zoomDays).to.equal(30);
    expect(zoomLabel.textContent).to.include('30 days');

    app.remove();
  });

  it('pads the visible timeline with three days before the earliest task', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.tasks = [
      { id: '1', text: 'Plan roadmap', completed: false, createdAt: '2026-04-20', dueDate: '2026-04-27', workloadEstimate: 8, dependsOn: [] },
    ];
    app.activeView = 'gantt';
    document.body.append(app);
    await app.updateComplete;

    const gantt = app.shadowRoot.querySelector('gantt-canvas-view');
    const timeline = gantt.getTimelineModel([...gantt.getVisibleTasks()].reverse());

    expect(timeline.startDate.getFullYear()).to.equal(2026);
    expect(timeline.startDate.getMonth()).to.equal(3);
    expect(timeline.startDate.getDate()).to.equal(17);
    expect(timeline.totalDays).to.equal(21);

    app.remove();
  });

  it('includes workload uncertainty in the computed gantt schedule', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.tasks = [
      { id: '1', text: 'Plan roadmap', completed: false, createdAt: '2026-04-20', dueDate: '2026-04-27', workloadEstimate: 8, workloadUncertainty: 3, dependsOn: [] },
    ];
    app.activeView = 'gantt';
    document.body.append(app);
    await app.updateComplete;

    const gantt = app.shadowRoot.querySelector('gantt-canvas-view');
    const schedule = gantt.getTaskSchedule(app.tasks[0]);

    expect(schedule.workloadEstimate).to.equal(8);
    expect(schedule.workloadUncertainty).to.equal(3);
    expect(schedule.uncertainEndDate.getFullYear()).to.equal(2026);
    expect(schedule.uncertainEndDate.getMonth()).to.equal(3);
    expect(schedule.uncertainEndDate.getDate()).to.equal(30);

    app.remove();
  });

  it('treats zero workload as a milestone schedule', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.tasks = [
      { id: '1', text: 'Launch', completed: false, createdAt: '2026-04-20', dueDate: '2026-04-20', workloadEstimate: 0, workloadUncertainty: 0, dependsOn: [] },
    ];
    app.activeView = 'gantt';
    document.body.append(app);
    await app.updateComplete;

    const gantt = app.shadowRoot.querySelector('gantt-canvas-view');
    const schedule = gantt.getTaskSchedule(app.tasks[0]);

    expect(schedule.workloadEstimate).to.equal(0);
    expect(schedule.isMilestone).to.equal(true);
    expect(schedule.startDate.getDate()).to.equal(20);
    expect(schedule.endDate.getDate()).to.equal(20);

    app.remove();
  });

  it('applies gantt uncertainty updates to persisted task state', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.tasks = [
      { id: '1', text: 'Plan roadmap', completed: false, createdAt: '2026-04-20', dueDate: '2026-04-27', workloadEstimate: 8, workloadUncertainty: 1, dependsOn: [] },
    ];
    app.activeView = 'gantt';
    document.body.append(app);
    await app.updateComplete;

    const gantt = app.shadowRoot.querySelector('gantt-canvas-view');
    gantt.dispatchEvent(new CustomEvent('task-update', {
      detail: {
        taskId: '1',
        updates: {
          workloadUncertainty: 4,
        },
      },
      bubbles: true,
      composed: true,
    }));
    await app.updateComplete;

    expect(app.tasks[0].workloadUncertainty).to.equal(4);

    app.remove();
  });

  it('restores gantt from persisted view storage', async () => {
    await customElements.whenDefined('task-manager-app');

    window.localStorage.setItem('task-manager-view', 'gantt');
    const app = document.createElement('task-manager-app');

    expect(app.activeView).to.equal('gantt');
  });
});
