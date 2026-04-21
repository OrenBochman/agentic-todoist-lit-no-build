import '../../components/kanban-board.js';
import { expect } from '../helpers/browser-test-harness.js';
import { DEFAULT_PROJECT_FILTER } from '../../components/task-project.js';

const createKanbanBoard = (tasks = []) => {
  const board = document.createElement('kanban-board');
  board.tasks = tasks;
  return board;
};

describe('Kanban Board Unit Tests', () => {
  afterEach(() => {
    document.body.querySelectorAll('kanban-board').forEach((board) => board.remove());
  });

  it('groups tasks by status into the expected columns', () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Task 1', completed: false },
      { id: '2', text: 'Task 2', completed: false, inProgress: true },
      { id: '3', text: 'Task 3', completed: true },
    ]);

    const columns = board.getColumns();

    expect(columns.upcoming.map((task) => task.text)).to.deep.equal(['Task 1']);
    expect(columns['in-progress'].map((task) => task.text)).to.deep.equal(['Task 2']);
    expect(columns.done.map((task) => task.text)).to.deep.equal(['Task 3']);
  });

  it('keeps empty arrays for statuses with no matching tasks', () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Task 1', completed: false },
    ]);
    const columns = board.getColumns();

    expect(columns.upcoming.map((task) => task.text)).to.deep.equal(['Task 1']);
    expect(columns['in-progress']).to.deep.equal([]);
    expect(columns.done).to.deep.equal([]);
  });

  it('adds new tasks into the upcoming column when tasks are appended', () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Task 1', completed: false },
    ]);

    board.tasks = [
      ...board.tasks,
      { id: '2', text: 'Task 2', completed: false },
    ];

    const columns = board.getColumns();

    expect(columns.upcoming.map((task) => task.text)).to.deep.equal(['Task 1', 'Task 2']);
    expect(columns['in-progress']).to.deep.equal([]);
    expect(columns.done).to.deep.equal([]);
  });

  it('adds new tasks into the upcoming column when tasks are prepended', () => {
    const board = createKanbanBoard([
      { id: '2', text: 'Existing task', completed: false },
    ]);

    board.tasks = [
      { id: '1', text: 'Prepended task', completed: false },
      ...board.tasks,
    ];

    const columns = board.getColumns();

    expect(columns.upcoming.map((task) => task.text)).to.deep.equal(['Prepended task', 'Existing task']);
    expect(columns['in-progress']).to.deep.equal([]);
    expect(columns.done).to.deep.equal([]);
  });

  it('removes deleted tasks from their column when the tasks list shrinks', () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Task 1', completed: false },
      { id: '2', text: 'Task 2', completed: true },
    ]);

    board.tasks = board.tasks.filter((task) => task.id !== '2');

    const columns = board.getColumns();

    expect(columns.upcoming.map((task) => task.text)).to.deep.equal(['Task 1']);
    expect(columns.done).to.deep.equal([]);
  });

  it('keeps edited titles in the same column when status fields do not change', () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Old title', completed: false, inProgress: true },
    ]);

    board.tasks = board.tasks.map((task) => task.id === '1'
      ? { ...task, text: 'Renamed title' }
      : task);

    const columns = board.getColumns();

    expect(columns['in-progress'].map((task) => task.text)).to.deep.equal(['Renamed title']);
    expect(columns.upcoming).to.deep.equal([]);
    expect(columns.done).to.deep.equal([]);
  });

  it('moves tasks between columns when section edits change their normalized status', () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Move me', completed: false, sectionShortcut: '/up', section: 'up' },
    ]);

    board.tasks = board.tasks.map((task) => task.id === '1'
      ? { ...task, completed: true, sectionShortcut: '/done', section: 'done' }
      : task);

    const columns = board.getColumns();

    expect(columns.upcoming).to.deep.equal([]);
    expect(columns.done.map((task) => task.text)).to.deep.equal(['Move me']);
  });

  it('moves tasks from upcoming to in-progress when section edits change to /in', () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Start me', completed: false, sectionShortcut: '/up', section: 'up' },
    ]);

    board.tasks = board.tasks.map((task) => task.id === '1'
      ? { ...task, inProgress: true, completed: false, sectionShortcut: '/in', section: 'in' }
      : task);

    const columns = board.getColumns();

    expect(columns.upcoming).to.deep.equal([]);
    expect(columns['in-progress'].map((task) => task.text)).to.deep.equal(['Start me']);
    expect(columns.done).to.deep.equal([]);
  });

  it('moves tasks from in-progress to done when section edits change to /done', () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Finish me', completed: false, inProgress: true, sectionShortcut: '/in', section: 'in' },
    ]);

    board.tasks = board.tasks.map((task) => task.id === '1'
      ? { ...task, inProgress: false, completed: true, sectionShortcut: '/done', section: 'done' }
      : task);

    const columns = board.getColumns();

    expect(columns.upcoming).to.deep.equal([]);
    expect(columns['in-progress']).to.deep.equal([]);
    expect(columns.done.map((task) => task.text)).to.deep.equal(['Finish me']);
  });

  it('moves tasks back from done to upcoming when section edits change to /up', () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Reopened task', completed: true, inProgress: false, sectionShortcut: '/done', section: 'done' },
    ]);

    board.tasks = board.tasks.map((task) => task.id === '1'
      ? { ...task, completed: false, inProgress: false, sectionShortcut: '/up', section: 'up' }
      : task);

    const columns = board.getColumns();

    expect(columns.upcoming.map((task) => task.text)).to.deep.equal(['Reopened task']);
    expect(columns['in-progress']).to.deep.equal([]);
    expect(columns.done).to.deep.equal([]);
  });

  it('routes section-derived statuses into the same canonical columns', () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Queued', completed: false, section: 'upcoming' },
      { id: '2', text: 'Working', completed: false, sectionShortcut: '/in' },
      { id: '3', text: 'Shipped', completed: false, section: 'done' },
    ]);
    const columns = board.getColumns();

    expect(columns.upcoming.map((task) => task.text)).to.deep.equal(['Queued']);
    expect(columns['in-progress'].map((task) => task.text)).to.deep.equal(['Working']);
    expect(columns.done.map((task) => task.text)).to.deep.equal(['Shipped']);
  });

  it('filters kanban columns by project, treating missing projects as the default project', () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Inbox', completed: false, project: null },
      { id: '2', text: 'Working', completed: false, project: 'Work', inProgress: true },
      { id: '3', text: 'Done work', completed: true, project: 'Work' },
    ]);
    board.projectFilter = DEFAULT_PROJECT_FILTER;

    let columns = board.getColumns();
    expect(columns.upcoming.map((task) => task.text)).to.deep.equal(['Inbox']);
    expect(columns['in-progress']).to.deep.equal([]);
    expect(columns.done).to.deep.equal([]);

    board.projectFilter = 'Work';
    columns = board.getColumns();
    expect(columns.upcoming).to.deep.equal([]);
    expect(columns['in-progress'].map((task) => task.text)).to.deep.equal(['Working']);
    expect(columns.done.map((task) => task.text)).to.deep.equal(['Done work']);
  });

  it('emits task-move when a task payload is dropped into a different column', async () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Move me', completed: false, sectionShortcut: '/up', section: 'up' },
    ]);
    document.body.append(board);
    await board.updateComplete;

    const moves = [];
    board.addEventListener('task-move', (event) => moves.push(event.detail));

    const target = board.shadowRoot.querySelector('drop-target-element[target-value="done"]');
    expect(target, 'Done column drop target should render.').to.exist;

    target.dispatchEvent(new CustomEvent('drop-receive', {
      bubbles: true,
      composed: true,
      detail: {
        payload: { taskId: '1', fromColumn: 'upcoming' },
        targetValue: 'done',
      },
    }));

    expect(moves).to.deep.equal([
      { taskId: '1', fromColumn: 'upcoming', toColumn: 'done' },
    ]);
  });

  it('ignores drops when the task is dropped back into the same column', async () => {
    const board = createKanbanBoard([
      { id: '1', text: 'Stay here', completed: false, sectionShortcut: '/in', section: 'in', inProgress: true },
    ]);
    document.body.append(board);
    await board.updateComplete;

    let moveCount = 0;
    board.addEventListener('task-move', () => {
      moveCount += 1;
    });

    const target = board.shadowRoot.querySelector('drop-target-element[target-value="in-progress"]');
    expect(target, 'In Progress drop target should render.').to.exist;

    target.dispatchEvent(new CustomEvent('drop-receive', {
      bubbles: true,
      composed: true,
      detail: {
        payload: { taskId: '1', fromColumn: 'in-progress' },
        targetValue: 'in-progress',
      },
    }));

    expect(moveCount).to.equal(0);
  });
});
