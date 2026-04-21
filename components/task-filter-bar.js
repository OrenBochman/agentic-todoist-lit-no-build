import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import {
  ALL_PROJECTS_FILTER,
  getProjectFilterOptions,
} from './task-project.js';

const FILTER_OPTIONS = ['all', 'pending', 'completed'];

/**
 * Stateless filter controls for the task board.
 */
class TaskFilterBar extends LitElement {
  static properties = {
    filter: { type: String },
    projectFilter: { type: String, attribute: 'project-filter' },
    tasks: { type: Array },
  };

  static styles = css`
    :host {
      display: block;
    }

    .filter-group {
      display: inline-flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
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

    .project-select {
      min-width: 180px;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--text-strong) 14%, transparent);
      background: color-mix(in srgb, var(--panel-background) 94%, transparent);
      color: var(--text-strong);
      font: inherit;
      font-size: 0.92rem;
      font-weight: 600;
      padding: 10px 14px;
      cursor: pointer;
    }

    .project-select:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--accent) 42%, transparent);
      outline-offset: 2px;
    }
  `;

  constructor() {
    super();
    this.filter = 'all';
    this.projectFilter = ALL_PROJECTS_FILTER;
    this.tasks = [];
  }

  render() {
    const projectOptions = getProjectFilterOptions(this.tasks);

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
        <label for="project-select" style="margin-left:8px;font-weight:600;">Project:</label>
        <select id="project-select" class="project-select" .value=${this.projectFilter} @change=${this.handleProjectFilterChange} aria-label="Project filter">
          ${projectOptions.map(
            (option) => html`<option value=${option.value}>${option.label}</option>`,
          )}
        </select>
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

  handleProjectFilterChange(event) {
    const projectFilter = String(event.target?.value || ALL_PROJECTS_FILTER);
    this.dispatchEvent(
      new CustomEvent('project-filter-change', {
        bubbles: true,
        composed: true,
        detail: { projectFilter },
      }),
    );
  }
}

customElements.define('task-filter-bar', TaskFilterBar);
