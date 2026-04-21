import '../../components/gantt-view.js';
import { expect } from '../helpers/browser-test-harness.js';
import { DEFAULT_PROJECT_FILTER } from '../../components/task-project.js';

const createGanttView = (tasks = []) => {
  const view = document.createElement('gantt-view');
  view.tasks = tasks;
  return view;
};

describe('Gantt View Unit Tests', () => {
  afterEach(() => {
    document.body.querySelectorAll('gantt-view').forEach((view) => view.remove());
  });

  it('builds schedules from createdAt to dueDate', () => {
    const view = createGanttView();
    const schedule = view.getTaskSchedule({
      createdAt: '2026-04-01T10:00:00.000Z',
      dueDate: '2026-04-05',
    });

    expect(schedule.startDate.getFullYear()).to.equal(2026);
    expect(schedule.startDate.getMonth()).to.equal(3);
    expect(schedule.startDate.getDate()).to.equal(1);
    expect(schedule.endDate.getDate()).to.equal(5);
  });

  it('clamps schedules when dueDate falls before createdAt', () => {
    const view = createGanttView();
    const schedule = view.getTaskSchedule({
      createdAt: '2026-04-10T10:00:00.000Z',
      dueDate: '2026-04-05',
    });

    expect(schedule.startDate.getDate()).to.equal(5);
    expect(schedule.endDate.getDate()).to.equal(5);
  });

  it('filters visible gantt tasks by project and completion state', () => {
    const view = createGanttView([
      { id: '1', text: 'Inbox', completed: false, createdAt: '2026-04-01', project: null },
      { id: '2', text: 'Work done', completed: true, createdAt: '2026-04-02', project: 'Work' },
      { id: '3', text: 'Work open', completed: false, createdAt: '2026-04-03', project: 'Work' },
    ]);

    view.projectFilter = 'Work';
    view.filter = 'pending';

    expect(view.getVisibleTasks().map((task) => task.text)).to.deep.equal(['Work open']);

    view.projectFilter = DEFAULT_PROJECT_FILTER;
    view.filter = 'all';

    expect(view.getVisibleTasks().map((task) => task.text)).to.deep.equal(['Inbox']);
  });

  it('renders a gantt row for each visible task', async () => {
    const view = createGanttView([
      { id: '1', text: 'Plan', completed: false, createdAt: '2026-04-01', dueDate: '2026-04-03' },
      { id: '2', text: 'Ship', completed: false, createdAt: '2026-04-02', dueDate: '2026-04-04' },
    ]);
    document.body.append(view);
    await view.updateComplete;

    expect(view.shadowRoot.querySelectorAll('.row').length).to.equal(2);
    expect(view.shadowRoot.querySelectorAll('.bar').length).to.equal(2);
  });
});
