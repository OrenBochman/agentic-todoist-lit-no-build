import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class RegressionToolbar extends LitElement {
  static properties = {
    activeFilter: { state: true },
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.activeFilter = 'all';
  }

  get filterButtons() {
    return [...this.querySelectorAll('.filter-button')];
  }

  get searchInput() {
    return this.querySelector('#test-search');
  }

  setActiveFilter(filter) {
    this.activeFilter = filter;
  }

  render() {
    return html`
      <div class="toolbar-group">
        <button class="filter-button" type="button" data-filter="all" data-active=${String(this.activeFilter === 'all')}>All</button>
        <button class="filter-button" type="button" data-filter="fail" data-active=${String(this.activeFilter === 'fail')}>Failures</button>
        <button class="filter-button" type="button" data-filter="pass" data-active=${String(this.activeFilter === 'pass')}>Passing</button>
      </div>
      <div class="toolbar-group">
        <input id="test-search" type="search" placeholder="Filter tests by title or suite" aria-label="Filter tests by title or suite" />
      </div>
    `;
  }
}

customElements.define('regression-toolbar', RegressionToolbar);
