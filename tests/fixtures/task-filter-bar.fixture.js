import '../../components/task-filter-bar.js';
import { waitForRender } from '../helpers/browser-test-harness.js';

export const mountTaskFilterBar = async (opts = {}) => {
  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();

  const filterBar = document.createElement('task-filter-bar');

  if (typeof opts.filter === 'string') {
    filterBar.filter = opts.filter;
  }

  if (typeof opts.projectFilter === 'string') {
    filterBar.projectFilter = opts.projectFilter;
  }

  if (Array.isArray(opts.tasks)) {
    filterBar.tasks = opts.tasks;
  }

  mount.append(filterBar);
  await customElements.whenDefined('task-filter-bar');
  await waitForRender();

  return {
    mount,
    filterBar,
    shadow: filterBar.shadowRoot,
    buttons: [...filterBar.shadowRoot.querySelectorAll('button')],
    projectSelect: filterBar.shadowRoot.querySelector('select'),
  };
};
