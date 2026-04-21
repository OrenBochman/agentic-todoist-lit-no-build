import { expect } from '../helpers/browser-test-harness.js';
import { clearTaskUtilityBarFixture, mountTaskUtilityBar } from '../fixtures/task-utility-bar.fixture.js';

const getThemeButton = (fixture) => fixture.bar.shadowRoot.querySelector('wa-button[theme-icon]');
const getThemeIcon = (fixture) => getThemeButton(fixture)?.querySelector('wa-icon');
const clickThemeButton = async (fixture) => {
  getThemeButton(fixture)?.click();
  await fixture.bar.updateComplete;
};

describe('task-utility-bar regression', () => {
  let fixture;
  beforeEach(async () => {
    fixture = await mountTaskUtilityBar({ theme: 'light' });
  });

  afterEach(() => {
    clearTaskUtilityBarFixture();
  });

  it('renders the theme toggle button', () => {
    const button = getThemeButton(fixture);
    expect(button, 'Theme toggle button should exist.').to.exist;
  });

  it('theme toggle button shows the light-mode affordance', () => {
    const button = getThemeButton(fixture);
    const icon = getThemeIcon(fixture);

    expect(button?.getAttribute('aria-label'), 'Theme toggle button should expose an accessible label.').to.equal('Toggle dark mode');
    expect(icon?.getAttribute('name'), 'Light mode should show the moon icon to indicate dark-mode toggle.').to.equal('moon');
  });

  it('toggles dark mode and updates theme property', async () => {
    fixture.bar.addEventListener('theme-toggle', () => {
      fixture.bar.theme = fixture.bar.theme === 'dark' ? 'light' : 'dark';
    });

    await clickThemeButton(fixture);
    expect(fixture.bar.theme, 'Theme should be dark after first toggle.').to.equal('dark');

    await clickThemeButton(fixture);
    expect(fixture.bar.theme, 'Theme should be light after second toggle.').to.equal('light');
  });

  it('theme toggle icon updates after toggling', async () => {
    fixture.bar.addEventListener('theme-toggle', () => {
      fixture.bar.theme = fixture.bar.theme === 'dark' ? 'light' : 'dark';
    });

    await clickThemeButton(fixture);
    expect(getThemeIcon(fixture)?.getAttribute('name'), 'Dark mode should switch the icon to sun.').to.equal('sun');

    await clickThemeButton(fixture);
    expect(getThemeIcon(fixture)?.getAttribute('name'), 'Light mode should restore the moon icon.').to.equal('moon');
  });
});
