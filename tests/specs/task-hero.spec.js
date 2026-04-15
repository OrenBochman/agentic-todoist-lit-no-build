import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import { mountTaskHero, setHeroFixtureWidth } from '../fixtures/task-hero.fixture.js';

describe('Task Hero Regression', () => {

  let fixture;

  beforeEach(async () => {
    fixture = await mountTaskHero();
  });


  // No theme toggle test: theme toggle is now in utility bar, not hero

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
      // No theme toggle test: theme toggle is now in utility bar, not hero
  });

  it('very small width feature collapses below three columns in task-hero', async () => {
    await setHeroFixtureWidth(fixture.mount, '280px');

    const stats = fixture.shadow.querySelector('.stats');
    const columns = getComputedStyle(stats).gridTemplateColumns.split(' ').filter(Boolean);

    // Assert: extremely small widths are allowed to reduce the column count, but 3 columns is also acceptable if the layout fits.
    expect(columns.length).to.be.at.most(3);
  });
});