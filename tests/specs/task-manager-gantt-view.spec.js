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

  it('restores gantt from persisted view storage', async () => {
    await customElements.whenDefined('task-manager-app');

    window.localStorage.setItem('task-manager-view', 'gantt');
    const app = document.createElement('task-manager-app');

    expect(app.activeView).to.equal('gantt');
  });
});
