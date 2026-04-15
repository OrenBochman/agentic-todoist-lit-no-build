import { expect } from 'chai';
import { mountTaskUtilityBar } from '../fixtures/task-utility-bar.fixture.js';
import { waitForRender } from '../helpers/browser-test-harness.js';

describe('task-utility-bar regression', () => {
  let fixture;
  beforeEach(async () => {
    fixture = await mountTaskUtilityBar({ theme: 'light' });
  });

  it('renders the theme toggle button with correct label', () => {
    const button = fixture.bar.shadowRoot.querySelector('wa-button');
    expect(button).to.exist;
    expect(button.textContent).to.include('Dark Mode');
  });

  it('toggles dark mode and updates theme property and button label', async () => {
    fixture.bar.addEventListener('theme-toggle', () => {
      fixture.bar.theme = fixture.bar.theme === 'dark' ? 'light' : 'dark';
    });
    const button = fixture.bar.shadowRoot.querySelector('wa-button');
    button.click();
    await waitForRender();
    expect(fixture.bar.theme).to.equal('dark');
    expect(button.textContent).to.include('Light Mode');
    button.click();
    await waitForRender();
    expect(fixture.bar.theme).to.equal('light');
    expect(button.textContent).to.include('Dark Mode');
  });
});
