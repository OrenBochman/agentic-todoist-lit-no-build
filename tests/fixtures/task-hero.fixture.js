import '../../components/task-hero.js';
import { waitForRender } from '../helpers/browser-test-harness.js';
import { discoverWebAwesome } from '../helpers/webawesome-test-setup.js';

const DEFAULT_HERO_PROPS = {
  totalTasks: 12,
  pendingTasks: 5,
  completedTasks: 7,
  theme: 'dark',
  webMcpStatus: 'ready',
};

// Fixture: mount a standalone task-hero with seeded counts so layout and labels can be asserted.
export const mountTaskHero = async (props = {}) => {
  const mount = document.getElementById('mount');

  if (!mount) {
    throw new Error('Missing #mount fixture root.');
  }

  mount.replaceChildren();

  const hero = document.createElement('task-hero');
  hero.setAttribute('data-wa-preload', 'wa-icon');
  Object.assign(hero, DEFAULT_HERO_PROPS, props);
  mount.append(hero);

  await customElements.whenDefined('task-hero');
  await discoverWebAwesome(mount);
  await customElements.whenDefined('wa-icon');
  await waitForRender();

  return {
    mount,
    hero,
    shadow: hero.shadowRoot,
  };
};

// Fixture helper: resize the hero mount so container-query layout rules can be asserted.
export const setHeroFixtureWidth = async (mount, width) => {
  mount.style.width = width;
  await waitForRender();
};