import '../../components/kanban-board.js';
import { expect } from '../helpers/browser-test-harness.js';

const createKanbanBoard = (tasks = []) => {
  const board = document.createElement('kanban-board');
  board.tasks = tasks;
  return board;
};

describe('Kanban Board Unit Tests', () => {
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
});
