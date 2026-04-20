import '../components/kanban-board.js';
import { fixture, html } from './task-manager-test-helpers.js';

describe('kanban-board', () => {
  it('renders columns and groups tasks', async () => {
    const tasks = [
      { id: '1', text: 'Task 1', completed: false },
      { id: '2', text: 'Task 2', completed: false, inProgress: true },
      { id: '3', text: 'Task 3', completed: true },
    ];
    const el = await fixture(html`<kanban-board .tasks=${tasks}></kanban-board>`);
    const columns = el.shadowRoot.querySelectorAll('.column');
    expect(columns.length).toBe(3);
    expect(columns[0].textContent).toContain('Upcoming');
    expect(columns[1].textContent).toContain('In Progress');
    expect(columns[2].textContent).toContain('Done');
    // Check task grouping
    expect(columns[0].textContent).toContain('Task 1');
    expect(columns[1].textContent).toContain('Task 2');
    expect(columns[2].textContent).toContain('Task 3');
  });

  it('shows empty state for columns with no tasks', async () => {
    const tasks = [
      { id: '1', text: 'Task 1', completed: false },
    ];
    const el = await fixture(html`<kanban-board .tasks=${tasks}></kanban-board>`);
    const columns = el.shadowRoot.querySelectorAll('.column');
    expect(columns[1].textContent).toContain('No tasks in progress');
    expect(columns[2].textContent).toContain('No completed tasks');
  });

  it('renders section shortcut badges in the column titles', async () => {
    const tasks = [
      { id: '1', text: 'Upcoming', completed: false },
      { id: '2', text: 'Doing', completed: false, inProgress: true },
      { id: '3', text: 'Done', completed: true },
    ];
    const el = await fixture(html`<kanban-board .tasks=${tasks}></kanban-board>`);
    const columnBadges = [...el.shadowRoot.querySelectorAll('.column-title wa-badge')];
    const itemBadges = [...el.shadowRoot.querySelectorAll('task-item')].map((item) =>
      item.shadowRoot.querySelector('wa-badge')
    );

    expect(columnBadges.map((badge) => badge.textContent?.trim() ?? '')).toEqual(['/up', '/in', '/done']);
    expect(itemBadges).toEqual([null, null, null]);
  });
});
