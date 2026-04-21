import '../../components/kanban-board.js';
import { expect, waitForRender } from '../helpers/browser-test-harness.js';

const mountKanbanBoard = async (tasks) => {
  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();

  const board = document.createElement('kanban-board');
  board.tasks = tasks;
  mount.append(board);

  await customElements.whenDefined('kanban-board');
  await waitForRender();

  return board;
};

describe('Kanban Board Unit Tests', () => {
  it('renders columns and groups tasks', async () => {
    const tasks = [
      { id: '1', text: 'Task 1', completed: false },
      { id: '2', text: 'Task 2', completed: false, inProgress: true },
      { id: '3', text: 'Task 3', completed: true },
    ];
    const el = await mountKanbanBoard(tasks);
    const columns = el.shadowRoot.querySelectorAll('.column');

    expect(columns.length).to.equal(3);
    expect(columns[0].textContent).to.contain('Upcoming');
    expect(columns[1].textContent).to.contain('In Progress');
    expect(columns[2].textContent).to.contain('Done');
    expect(columns[0].textContent).to.contain('Task 1');
    expect(columns[1].textContent).to.contain('Task 2');
    expect(columns[2].textContent).to.contain('Task 3');
  });

  it('shows empty state for columns with no tasks', async () => {
    const tasks = [
      { id: '1', text: 'Task 1', completed: false },
    ];
    const el = await mountKanbanBoard(tasks);
    const columns = el.shadowRoot.querySelectorAll('.column');

    expect(columns[1].textContent).to.contain('No tasks in progress');
    expect(columns[2].textContent).to.contain('No completed tasks');
  });

  it('renders section shortcut badges in the column titles', async () => {
    const tasks = [
      { id: '1', text: 'Upcoming', completed: false },
      { id: '2', text: 'Doing', completed: false, inProgress: true },
      { id: '3', text: 'Done', completed: true },
    ];
    const el = await mountKanbanBoard(tasks);
    const columnBadges = [...el.shadowRoot.querySelectorAll('.column-title wa-badge')];
    const itemBadges = [...el.shadowRoot.querySelectorAll('task-item')].map((item) =>
      item.shadowRoot.querySelector('wa-badge')
    );

    expect(columnBadges.map((badge) => badge.textContent?.trim() ?? '')).to.deep.equal(['/up', '/in', '/done']);
    expect(itemBadges).to.deep.equal([null, null, null]);
  });
});
