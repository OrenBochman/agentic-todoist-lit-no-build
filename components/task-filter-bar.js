import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

const FILTER_OPTIONS = ['all', 'pending', 'completed'];

/**
 * Stateless filter controls for the task board.
 */
class TaskFilterBar extends LitElement {
  static properties = {
    filter: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    .filter-group {
      display: inline-flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .button {
      border: 0;
      border-radius: 999px;
      padding: 10px 14px;
      font: inherit;
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 160ms ease, background-color 160ms ease, color 160ms ease;
    }

    .button:hover,
    .button:focus-visible {
      transform: translateY(-1px);
      outline: none;
    }

    .button-brand {
      background: var(--accent);
      color: white;
    }

    .button-brand:hover,
    .button-brand:focus-visible {
      background: var(--accent-strong);
    }

    .button-neutral {
      background: color-mix(in srgb, var(--text-strong) 8%, transparent);
      color: var(--text-strong);
    }

    .button-neutral:hover,
    .button-neutral:focus-visible {
      background: color-mix(in srgb, var(--text-strong) 14%, transparent);
    }
  `;

  constructor() {
    super();
    this.filter = 'all';
  }

  render() {
    return html`
      <div class="filter-group" role="tablist" aria-label="Task filters">
        ${FILTER_OPTIONS.map(
          (option) => html`
            <button
              class="button ${this.filter === option ? 'button-brand' : 'button-neutral'}"
              type="button"
              @click=${() => this.emitFilterChange(option)}
            >
              ${this.getFilterLabel(option)}
            </button>
          `,
        )}
      </div>
    `;
  }

  emitFilterChange(filter) {
    this.dispatchEvent(
      new CustomEvent('filter-change', {
        bubbles: true,
        composed: true,
        detail: { filter },
      }),
    );
  }

  getFilterLabel(option) {
    if (option === 'pending') {
      return 'Pending';
    }

    if (option === 'completed') {
      return 'Completed';
    }

    return 'All';
  }
}

customElements.define('task-filter-bar', TaskFilterBar);