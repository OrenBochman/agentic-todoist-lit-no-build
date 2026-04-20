import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import { mountTaskFilterBar } from '../fixtures/task-filter-bar.fixture.js';

describe('Task Filter Bar Unit Tests', () => {
  let fixture;

  beforeEach(async () => {
    fixture = await mountTaskFilterBar({ filter: 'all' });
  });

  it('renders All, Pending, and Completed buttons', () => {
    const labels = fixture.buttons.map((button) => button.textContent?.trim());
    expect(labels, 'Filter bar should render all filter options.').to.deep.equal(['All', 'Pending', 'Completed']);
  });

  it('highlights the active filter with button-brand styling', async () => {
    fixture.filterBar.filter = 'completed';
    await waitForRender();

    const buttons = [...fixture.shadow.querySelectorAll('button')];
    expect(buttons[2]?.className, 'Completed button should be active when filter=completed.').to.contain('button-brand');
    expect(buttons[0]?.className, 'All button should be inactive when filter=completed.').to.contain('button-neutral');
  });

  it('clicking a filter emits filter-change with the selected filter', async () => {
    let emittedDetail = null;

    fixture.filterBar.addEventListener('filter-change', (event) => {
      emittedDetail = event.detail;
    }, { once: true });

    fixture.buttons[1].click();
    await waitForRender();

    expect(emittedDetail?.filter, 'Pending button should emit filter-change with pending.').to.equal('pending');
  });

  it('getFilterLabel returns the expected labels', () => {
    expect(fixture.filterBar.getFilterLabel('all')).to.equal('All');
    expect(fixture.filterBar.getFilterLabel('pending')).to.equal('Pending');
    expect(fixture.filterBar.getFilterLabel('completed')).to.equal('Completed');
  });
});
