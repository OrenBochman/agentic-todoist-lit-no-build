import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class RegressionToolbar extends LitElement {
  static properties = {
    activeFilter: { state: true },
  };
  static styles = css`
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }

    .toolbar-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    .filter-button {
      border: 1px solid color-mix(in srgb, var(--text-strong) 12%, transparent);
      border-radius: 999px;
      padding: 8px 14px;
      font: inherit;
      color: var(--text-strong);
      background: rgba(15, 23, 42, 0.52);
      cursor: pointer;
    }

    .filter-button[data-active='true'] {
      border-color: color-mix(in srgb, var(--accent) 50%, transparent);
      background: color-mix(in srgb, var(--accent) 18%, rgba(15, 23, 42, 0.52));
    }

    #test-search {
      min-width: min(320px, 100%);
      border: 1px solid color-mix(in srgb, var(--text-strong) 12%, transparent);
      border-radius: 999px;
      padding: 10px 14px;
      font: inherit;
      color: var(--text-strong);
      background: rgba(15, 23, 42, 0.52);
    }

    #test-search::placeholder {
      color: var(--text-muted);
    }

    @media (max-width: 640px) {
      :host {
        align-items: stretch;
      }

      .toolbar-group {
        width: 100%;
      }

      #test-search {
        min-width: 0;
        width: 100%;
      }
    }
  `;

  constructor() {
    super();
    this.activeFilter = 'all';
  }

  get filterButtons() {
    return [...this.renderRoot.querySelectorAll('.filter-button')];
  }

  get searchInput() {
    return this.renderRoot.querySelector('#test-search');
  }

  setActiveFilter(filter) {
    this.activeFilter = filter;
  }

  render() {
    return html`
      <div class="toolbar-group">
        <button class="filter-button" type="button" data-filter="all" data-active=${String(this.activeFilter === 'all')}
          @click=${() => this._onFilterClick('all')}>All</button>
        <button class="filter-button" type="button" data-filter="fail" data-active=${String(this.activeFilter === 'fail')}
          @click=${() => this._onFilterClick('fail')}>Failures</button>
        <button class="filter-button" type="button" data-filter="pass" data-active=${String(this.activeFilter === 'pass')}
          @click=${() => this._onFilterClick('pass')}>Passing</button>
      </div>
      <div class="toolbar-group">
        <input id="test-search" type="search" placeholder="Filter tests by title or suite" aria-label="Filter tests by title or suite"
          @input=${this._onSearchInput} />
      </div>
    `;
  }

  _onFilterClick(filter) {
    this.setActiveFilter(filter);
    this.dispatchEvent(new CustomEvent('filter-change', { detail: { filter }, bubbles: true, composed: true }));
  }

  _onSearchInput = (e) => {
    this.dispatchEvent(new CustomEvent('search-change', { detail: { value: e.target.value }, bubbles: true, composed: true }));
  }
}

customElements.define('regression-toolbar', RegressionToolbar);
