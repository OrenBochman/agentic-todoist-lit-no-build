import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import { mountTaskBoard } from '../fixtures/task-board.fixture.js';
import { DEFAULT_PROJECT_FILTER } from '../../components/task-project.js';

describe('Task Board Unit Tests', () => {
  it('renders the empty state when there are no visible tasks', async () => {
    const fixture = await mountTaskBoard({ tasks: [] });

    expect(
      fixture.shadow.querySelector('.empty')?.textContent?.trim(),
      'Board should show an empty state when no tasks are visible.',
    ).to.equal('No tasks match this filter yet.');
  });

  it('filters completed tasks without mutating the underlying task array', async () => {
    const tasks = [
      { id: 'pending', text: 'Pending task', completed: false, createdAt: new Date().toISOString() },
      { id: 'done', text: 'Completed task', completed: true, createdAt: new Date().toISOString() },
    ];
    const fixture = await mountTaskBoard({ tasks, filter: 'completed' });
    const renderedItems = [...fixture.shadow.querySelectorAll('task-item')];

    expect(renderedItems.length, 'Completed filter should render only matching tasks.').to.equal(1);
    expect(renderedItems[0]?.task?.text, 'Rendered task should be the completed task.').to.equal('Completed task');
    expect(tasks.map((task) => task.text), 'Filtering should not mutate the source task list.').to.deep.equal([
      'Pending task',
      'Completed task',
    ]);
  });

  it('filters tasks by named project and maps missing projects into the default project', async () => {
    const tasks = [
      { id: 'default', text: 'Inbox task', completed: false, createdAt: new Date().toISOString(), project: null },
      { id: 'work', text: 'Work task', completed: false, createdAt: new Date().toISOString(), project: 'Work' },
    ];

    const defaultFixture = await mountTaskBoard({ tasks, projectFilter: DEFAULT_PROJECT_FILTER });
    let renderedItems = [...defaultFixture.shadow.querySelectorAll('task-item')];
    expect(renderedItems.map((item) => item.task.text)).to.deep.equal(['Inbox task']);

    const workFixture = await mountTaskBoard({ tasks, projectFilter: 'Work' });
    renderedItems = [...workFixture.shadow.querySelectorAll('task-item')];
    expect(renderedItems.map((item) => item.task.text)).to.deep.equal(['Work task']);
  });

  it('forwards filter-change events from the filter bar', async () => {
    const fixture = await mountTaskBoard();
    let emittedDetail = null;

    fixture.board.addEventListener('filter-change', (event) => {
      emittedDetail = event.detail;
    }, { once: true });

    fixture.shadow.querySelector('task-filter-bar').dispatchEvent(
      new CustomEvent('filter-change', {
        bubbles: true,
        composed: true,
        detail: { filter: 'pending' },
      }),
    );
    await waitForRender();

    expect(emittedDetail).to.deep.equal({ filter: 'pending' });
  });

  it('forwards project-filter-change events from the filter bar', async () => {
    const fixture = await mountTaskBoard();
    let emittedDetail = null;

    fixture.board.addEventListener('project-filter-change', (event) => {
      emittedDetail = event.detail;
    }, { once: true });

    fixture.shadow.querySelector('task-filter-bar').dispatchEvent(
      new CustomEvent('project-filter-change', {
        bubbles: true,
        composed: true,
        detail: { projectFilter: DEFAULT_PROJECT_FILTER },
      }),
    );
    await waitForRender();

    expect(emittedDetail).to.deep.equal({ projectFilter: DEFAULT_PROJECT_FILTER });
  });

  it('forwards task interaction events with the original task payload', async () => {
    const fixture = await mountTaskBoard({
      tasks: [{ id: 'task-1', text: 'Alpha', completed: false, createdAt: new Date().toISOString() }],
    });
    const item = fixture.shadow.querySelector('task-item');
    const received = {
      toggle: null,
      delete: null,
      edit: null,
    };

    fixture.board.addEventListener('task-toggle', (event) => {
      received.toggle = event.detail;
    }, { once: true });
    fixture.board.addEventListener('task-delete', (event) => {
      received.delete = event.detail;
    }, { once: true });
    fixture.board.addEventListener('task-edit', (event) => {
      received.edit = event.detail;
    }, { once: true });

    item.dispatchEvent(new CustomEvent('task-toggle', {
      bubbles: true,
      composed: true,
      detail: { taskId: 'task-1' },
    }));
    item.dispatchEvent(new CustomEvent('task-delete', {
      bubbles: true,
      composed: true,
      detail: { taskId: 'task-1' },
    }));
    item.dispatchEvent(new CustomEvent('task-edit', {
      bubbles: true,
      composed: true,
      detail: { taskId: 'task-1', input: 'Alpha updated' },
    }));
    await waitForRender();

    expect(received.toggle).to.deep.equal({ taskId: 'task-1' });
    expect(received.delete).to.deep.equal({ taskId: 'task-1' });
    expect(received.edit).to.deep.equal({ taskId: 'task-1', input: 'Alpha updated' });
  });
});
