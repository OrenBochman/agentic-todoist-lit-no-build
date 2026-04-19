import { expect } from 'chai';
import { mountTaskUtilityBar } from '../fixtures/task-utility-bar.fixture.js';

describe('task-utility-bar visibility regression', () => {
  let fixture;
  beforeEach(async () => {
    fixture = await mountTaskUtilityBar({ theme: 'light' });
  });

  it('utility bar is present in shadow DOM', () => {
    const bar = fixture.bar.shadowRoot.querySelector('.utility-bar');
    expect(bar, 'Utility bar should exist in shadow DOM.').to.exist;
  });

  it('utility bar is visible and not collapsed by default', () => {
    const bar = fixture.bar.shadowRoot.querySelector('.utility-bar');
    const style = getComputedStyle(bar);
    expect(style.display, 'Utility bar should not be display:none.').to.not.equal('none');
    expect(bar.offsetHeight, 'Utility bar should have positive height.').to.be.greaterThan(0);
    expect(bar.offsetWidth, 'Utility bar should have positive width.').to.be.greaterThan(0);
  });

  it('shows hamburger at small container widths', async () => {
    fixture.mount.style.width = '400px';
    await fixture.bar.requestUpdate();
    const hamburger = fixture.bar.shadowRoot.querySelector('.hamburger');
    expect(hamburger, 'Hamburger should exist at small widths.').to.exist;
  });
});
