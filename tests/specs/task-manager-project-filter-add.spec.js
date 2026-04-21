import '../../script.js';
import { expect } from '../helpers/browser-test-harness.js';

describe('Task Manager Project Filter Add Regression', () => {
  it('inherits the active named project filter when adding a task without a project', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.projectFilter = 'Work';

    app.handleTaskAdd({
      detail: {
        text: 'follow up',
        project: null,
      },
    });

    expect(app.tasks[0]?.project).to.equal('Work');
  });

  it('keeps tasks unassigned when the default project filter is active', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.projectFilter = 'default-project';

    app.handleTaskAdd({
      detail: {
        text: 'inbox item',
        project: null,
      },
    });

    expect(app.tasks[0]?.project).to.equal(null);
  });

  it('preserves an explicit project over the active project filter', async () => {
    await customElements.whenDefined('task-manager-app');

    const app = document.createElement('task-manager-app');
    app.projectFilter = 'Work';

    app.handleTaskAdd({
      detail: {
        text: 'review notes',
        project: 'Personal',
      },
    });

    expect(app.tasks[0]?.project).to.equal('Personal');
  });
});
