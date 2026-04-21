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

  it('renders gantt-view when the active view is gantt', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.tasks = [
      { id: '1', text: 'Plan roadmap', completed: false, createdAt: '2026-04-01', dueDate: '2026-04-04' },
    ];
    app.activeView = 'gantt';
    document.body.append(app);
    await app.updateComplete;

    expect(app.shadowRoot.querySelector('gantt-view')).to.exist;

    app.remove();
  });

  it('restores gantt from persisted view storage', async () => {
    await customElements.whenDefined('task-manager-app');

    window.localStorage.setItem('task-manager-view', 'gantt');
    const app = document.createElement('task-manager-app');

    expect(app.activeView).to.equal('gantt');
  });
});
