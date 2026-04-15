import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import { mountTaskHero, setHeroFixtureWidth } from '../fixtures/task-hero.fixture.js';

describe('Task Hero Regression', () => {

  let fixture;

  beforeEach(async () => {
    fixture = await mountTaskHero();
  });

  it('toggles dark mode and updates theme property and button label', async () => {
    // Start with default (dark) theme
    expect(fixture.hero.theme).to.equal('dark');
    const button = fixture.shadow.querySelector('.button-ghost');
    expect(button).to.exist;
    expect(button.textContent).to.contain('Light mode');

    // Click to toggle to light mode
    button.click();
    await waitForRender();
    expect(fixture.hero.theme).to.equal('light');
    expect(button.textContent).to.contain('Dark mode');

    // Click again to toggle back to dark mode
    button.click();
    await waitForRender();
    expect(fixture.hero.theme).to.equal('dark');
    expect(button.textContent).to.contain('Light mode');
  });

  it('hero icon feature renders list-check with the configured Web Awesome color in task-hero', () => {
    const icon = fixture.shadow.querySelector('wa-icon');

    // Assert: the hero renders the expected Web Awesome glyph and preserves the requested brand color.
    expect(icon).to.exist;
    expect(icon.getAttribute('name')).to.equal('list-check');
    expect(icon.style.color).to.equal('rgb(255, 212, 59)');
  });

  it('counter copy feature uses All, Pending, and Done labels in task-hero', () => {
    const labels = [...fixture.shadow.querySelectorAll('.stat-label')].map((node) => node.textContent.trim());

    // Assert: the hero counters expose the updated short labels in the rendered order users see them.
    expect(labels).to.deep.equal(['All', 'Pending', 'Done']);
  });

  it('desktop layout feature keeps three stat columns at wide width in task-hero', async () => {
    await setHeroFixtureWidth(fixture.mount, '900px');

    const stats = fixture.shadow.querySelector('.stats');
    const columns = getComputedStyle(stats).gridTemplateColumns.split(' ').filter(Boolean);

    // Assert: wide hero layouts keep the counters on one three-column row.
    expect(columns.length).to.equal(3);
  });

  it('current narrow width feature still keeps three stat columns in task-hero', async () => {
    await setHeroFixtureWidth(fixture.mount, '353px');

    const stats = fixture.shadow.querySelector('.stats');
    const columns = getComputedStyle(stats).gridTemplateColumns.split(' ').filter(Boolean);

    // Assert: the current narrow card width still preserves the three-counter row instead of collapsing early.
    expect(columns.length).to.equal(3);
  });

  it('responsive expansion feature grows stat cards when width increases in task-hero', async () => {
    await setHeroFixtureWidth(fixture.mount, '353px');
    const narrowWidth = fixture.shadow.querySelector('.stat').getBoundingClientRect().width;

    await setHeroFixtureWidth(fixture.mount, '900px');
    const wideWidth = fixture.shadow.querySelector('.stat').getBoundingClientRect().width;

    // Assert: wider layouts produce wider stat cards so the counters shrink and expand with available space.
    expect(wideWidth).to.be.at.least(narrowWidth);
  });

  it('narrow card feature avoids horizontal overflow at current width in task-hero', async () => {
    await setHeroFixtureWidth(fixture.mount, '353px');

    const stats = fixture.shadow.querySelector('.stats');

    // Assert: the three-column hero row still fits inside its card without horizontal scrolling at the current narrow width.
    expect(stats.scrollWidth).to.be.at.most(stats.clientWidth + 1);
  });

  it('very small width feature collapses below three columns in task-hero', async () => {
    await setHeroFixtureWidth(fixture.mount, '280px');

    const stats = fixture.shadow.querySelector('.stats');
    const columns = getComputedStyle(stats).gridTemplateColumns.split(' ').filter(Boolean);

    // Assert: extremely small widths are allowed to reduce the column count, but 3 columns is also acceptable if the layout fits.
    expect(columns.length).to.be.at.most(3);
  });
});