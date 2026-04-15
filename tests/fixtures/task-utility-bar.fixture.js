// Fixture for mounting the utility bar in isolation for regression/unit tests
import '../components/task-utility-bar.js';

/**
 * Mounts a <task-utility-bar> for isolated testing.
 * @param {Object} [opts] - Optional initial props.
 * @param {string} [opts.theme] - Initial theme ('light' or 'dark').
 * @returns {Promise<{ mount: HTMLElement, bar: HTMLElement }>} - The mount and bar element.
 */
export async function mountTaskUtilityBar(opts = {}) {
  const mount = document.createElement('div');
  document.body.appendChild(mount);
  const bar = document.createElement('task-utility-bar');
  if (opts.theme) bar.theme = opts.theme;
  mount.appendChild(bar);
  await bar.updateComplete;
  return { mount, bar };
}
