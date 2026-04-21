import '../../components/task-board.js';
import { waitForRender } from '../helpers/browser-test-harness.js';

export const mountTaskBoard = async (opts = {}) => {
  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();

  const board = document.createElement('task-board');

  if (typeof opts.filter === 'string') {
    board.filter = opts.filter;
  }

  if (typeof opts.projectFilter === 'string') {
    board.projectFilter = opts.projectFilter;
  }

  if (Array.isArray(opts.tasks)) {
    board.tasks = opts.tasks;
  }

  mount.append(board);
  await customElements.whenDefined('task-board');
  await waitForRender();

  return {
    mount,
    board,
    shadow: board.shadowRoot,
  };
};
