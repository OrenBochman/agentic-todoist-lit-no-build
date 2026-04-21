import '../../script.js';
import { expect, clearFixture } from './task-manager-test-helpers.js';

describe('Task Manager Kanban Drag Regression', () => {
  afterEach(() => {
    clearFixture();
  });

  it('updates task status fields when the kanban board emits task-move', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.tasks = [
      {
        id: 'task-1',
        text: 'Ship drag and drop',
        completed: false,
        createdAt: new Date().toISOString(),
        inProgress: false,
        sectionShortcut: '/up',
        section: 'up',
      },
    ];

    app.handleTaskMove({
      detail: {
        taskId: 'task-1',
        fromColumn: 'upcoming',
        toColumn: 'done',
      },
    });

    expect(app.tasks[0]?.completed).to.equal(true);
    expect(app.tasks[0]?.inProgress).to.equal(false);
    expect(app.tasks[0]?.sectionShortcut).to.equal('/done');
    expect(app.tasks[0]?.section).to.equal('done');
  });
});
