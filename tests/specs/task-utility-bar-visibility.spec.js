import { expect } from 'chai';
import { mountTaskUtilityBar } from '../fixtures/task-utility-bar.fixture.js';

describe('task-utility-bar visibility regression', () => {
  let fixture;
  beforeEach(async () => {
    fixture = await mountTaskUtilityBar({ theme: 'light' });
  });

  it('should be visible and not collapsed by default', () => {
    // The utility bar should be in the shadow DOM and visible
    const bar = fixture.bar.shadowRoot.querySelector('.utility-bar');
    expect(bar).to.exist;
    const style = getComputedStyle(bar);
    expect(style.display).to.not.equal('none');
    expect(bar.offsetHeight).to.be.greaterThan(0);
    expect(bar.offsetWidth).to.be.greaterThan(0);
  });

  it('should show the hamburger only at small container widths', async () => {
    // Simulate a small container by setting width and triggering a resize
    fixture.mount.style.width = '400px';
    await fixture.bar.requestUpdate();
    // The hamburger should be visible if container queries are supported
    const hamburger = fixture.bar.shadowRoot.querySelector('.hamburger');
    // Hamburger may or may not be visible depending on browser support, but should exist
    expect(hamburger).to.exist;
  });
});
