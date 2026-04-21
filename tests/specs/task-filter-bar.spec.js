import '../../components/task-filter-bar.js';
import { expect } from '../helpers/browser-test-harness.js';
import { DEFAULT_PROJECT_FILTER } from '../../components/task-project.js';

describe('Task Filter Bar Unit Tests', () => {
  let filterBar;

  beforeEach(async () => {
    const mount = document.getElementById('mount');
    mount.replaceChildren();
    filterBar = document.createElement('task-filter-bar');
    filterBar.filter = 'all';
    mount.append(filterBar);
    await customElements.whenDefined('task-filter-bar');
    await filterBar.updateComplete;
  });

  afterEach(() => {
    document.getElementById('mount')?.replaceChildren();
  });

  it('renders All, Pending, and Completed buttons', () => {
    const labels = [...filterBar.shadowRoot.querySelectorAll('button')]
      .map((button) => button.textContent?.trim());

    expect(labels, 'Filter bar should render all filter options.').to.deep.equal(['All', 'Pending', 'Completed']);
  });

  it('renders a project dropdown with all, default, and named project options', async () => {
    filterBar.tasks = [
      { id: '1', text: 'Unassigned', completed: false, project: null },
      { id: '2', text: 'Work item', completed: false, project: 'Work' },
    ];
    await filterBar.updateComplete;

    const optionLabels = [...filterBar.shadowRoot.querySelectorAll('option')]
      .map((option) => option.textContent?.trim());

    expect(optionLabels).to.deep.equal(['All Projects', 'Default Project', 'Work']);
  });

  it('highlights the active filter with button-brand styling', async () => {
    filterBar.filter = 'completed';
    await filterBar.updateComplete;

    const buttons = [...filterBar.shadowRoot.querySelectorAll('button')];
    expect(buttons[2]?.className, 'Completed button should be active when filter=completed.').to.contain('button-brand');
    expect(buttons[0]?.className, 'All button should be inactive when filter=completed.').to.contain('button-neutral');
  });

  it('clicking a filter emits filter-change with the selected filter', async () => {
    let emittedDetail = null;

    filterBar.addEventListener('filter-change', (event) => {
      emittedDetail = event.detail;
    }, { once: true });

    filterBar.shadowRoot.querySelectorAll('button')[1].click();
    await filterBar.updateComplete;

    expect(emittedDetail?.filter, 'Pending button should emit filter-change with pending.').to.equal('pending');
  });

  it('changing the project dropdown emits project-filter-change with the selected project', async () => {
    filterBar.tasks = [{ id: '1', text: 'Unassigned', completed: false, project: null }];
    await filterBar.updateComplete;
    let emittedDetail = null;

    filterBar.addEventListener('project-filter-change', (event) => {
      emittedDetail = event.detail;
    }, { once: true });

    const projectSelect = filterBar.shadowRoot.querySelector('select');
    projectSelect.value = DEFAULT_PROJECT_FILTER;
    projectSelect.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    await filterBar.updateComplete;

    expect(emittedDetail?.projectFilter).to.equal(DEFAULT_PROJECT_FILTER);
  });

  it('getFilterLabel returns the expected labels', () => {
    expect(filterBar.getFilterLabel('all')).to.equal('All');
    expect(filterBar.getFilterLabel('pending')).to.equal('Pending');
    expect(filterBar.getFilterLabel('completed')).to.equal('Completed');
  });
});
