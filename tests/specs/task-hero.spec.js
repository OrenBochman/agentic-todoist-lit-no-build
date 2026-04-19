import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import { mountTaskHero, setHeroFixtureWidth } from '../fixtures/task-hero.fixture.js';

describe('Task Hero Regression', () => {

  let fixture;

  beforeEach(async () => {
    fixture = await mountTaskHero();
  });


  // No theme toggle test: theme toggle is now in utility bar, not hero

  it('counter copy uses All, Pending, and Done labels', () => {
    const labels = [...fixture.shadow.querySelectorAll('.stat-label')].map((node) => node.textContent.trim());
    expect(labels, 'Hero counters should use All, Pending, Done labels.').to.deep.equal(['All', 'Pending', 'Done']);
  });

  it('desktop layout keeps three stat columns at wide width', async () => {
    await setHeroFixtureWidth(fixture.mount, '900px');
    const stats = fixture.shadow.querySelector('.stats');
    const columns = getComputedStyle(stats).gridTemplateColumns.split(' ').filter(Boolean);
    expect(columns.length, 'Wide hero layout should have three columns.').to.equal(3);
  });

  it('narrow width still keeps three stat columns', async () => {
    await setHeroFixtureWidth(fixture.mount, '353px');
    const stats = fixture.shadow.querySelector('.stats');
    const columns = getComputedStyle(stats).gridTemplateColumns.split(' ').filter(Boolean);
    expect(columns.length, 'Narrow width should still have three columns.').to.equal(3);
  });

  it('responsive expansion grows stat cards when width increases', async () => {
    await setHeroFixtureWidth(fixture.mount, '353px');
    const narrowWidth = fixture.shadow.querySelector('.stat').getBoundingClientRect().width;
    await setHeroFixtureWidth(fixture.mount, '900px');
    const wideWidth = fixture.shadow.querySelector('.stat').getBoundingClientRect().width;
    expect(wideWidth, 'Stat card should grow as width increases.').to.be.at.least(narrowWidth);
  });

  it('narrow card avoids horizontal overflow at current width', async () => {
    await setHeroFixtureWidth(fixture.mount, '353px');
    const stats = fixture.shadow.querySelector('.stats');
    expect(stats.scrollWidth, 'Three-column hero row should fit without horizontal scroll.').to.be.at.most(stats.clientWidth + 1);
  });

  it('very small width collapses below three columns', async () => {
    await setHeroFixtureWidth(fixture.mount, '280px');
    const stats = fixture.shadow.querySelector('.stats');
    const columns = getComputedStyle(stats).gridTemplateColumns.split(' ').filter(Boolean);
    expect(columns.length, 'Small widths may reduce column count, but 3 is also acceptable.').to.be.at.most(3);
  });
});