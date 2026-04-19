import { expect } from 'chai';
import { mountTaskUtilityBar } from '../fixtures/task-utility-bar.fixture.js';
import { waitForRender } from '../helpers/browser-test-harness.js';

describe('task-utility-bar regression', () => {
  let fixture;
  beforeEach(async () => {
    fixture = await mountTaskUtilityBar({ theme: 'light' });
  });

  it('renders the theme toggle button', () => {
    const button = fixture.bar.shadowRoot.querySelector('wa-button');
    expect(button, 'Theme toggle button should exist.').to.exist;
  });

  it('theme toggle button has correct label for light mode', () => {
    const button = fixture.bar.shadowRoot.querySelector('wa-button');
    expect(button.textContent, 'Theme toggle button should say Dark Mode in light mode.').to.include('Dark Mode');
  });

  it('toggles dark mode and updates theme property', async () => {
    fixture.bar.addEventListener('theme-toggle', () => {
      fixture.bar.theme = fixture.bar.theme === 'dark' ? 'light' : 'dark';
    });
    const button = fixture.bar.shadowRoot.querySelector('wa-button');
    button.click();
    await waitForRender();
    expect(fixture.bar.theme, 'Theme should be dark after first toggle.').to.equal('dark');
    button.click();
    await waitForRender();
    expect(fixture.bar.theme, 'Theme should be light after second toggle.').to.equal('light');
  });

  it('theme toggle button label updates after toggling', async () => {
    fixture.bar.addEventListener('theme-toggle', () => {
      fixture.bar.theme = fixture.bar.theme === 'dark' ? 'light' : 'dark';
    });
    const button = fixture.bar.shadowRoot.querySelector('wa-button');
    button.click();
    await waitForRender();
    expect(button.textContent, 'Theme toggle button should say Light Mode in dark mode.').to.include('Light Mode');
    button.click();
    await waitForRender();
    expect(button.textContent, 'Theme toggle button should say Dark Mode in light mode.').to.include('Dark Mode');
  });
});
