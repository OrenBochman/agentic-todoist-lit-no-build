import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

/**
 * Compact task input component.
 * Emits `task-add` with `{ text }` when the current value passes validation.
 */
class TaskComposer extends LitElement {
  static properties = {
    errorMessage: { state: true },
    value: { state: true },
  };



  static styles = css`
    :host {
      display: block;
    }

    .composer {
      display: grid;
      gap: 0;
    }

    .composer-form {
      display: grid;
      width: 100%;
      grid-template-columns: minmax(0, 1fr) 64px;
      align-items: stretch;
      column-gap: 12px;
      row-gap: 0;
    }

    wa-input {
      width: 100%;
      --wa-form-control-height: 60px;
      --wa-form-control-border-radius: 16px;
      --wa-input-background-color: color-mix(in srgb, var(--panel-background) 92%, transparent);
      --wa-input-border-color: color-mix(in srgb, var(--text-strong) 14%, transparent);
      --wa-input-border-color-hover: color-mix(in srgb, var(--text-strong) 22%, transparent);
      --wa-input-border-color-focus: var(--accent);
      --wa-input-color: var(--text-strong);
      --wa-input-placeholder-color: color-mix(in srgb, var(--text-muted) 80%, transparent);
      --wa-focus-ring-color: color-mix(in srgb, var(--accent) 18%, transparent);
      --wa-focus-ring-width: 4px;
      --wa-font-size-m: 1rem;
    }

    .composer-actions {
      display: flex;
      justify-content: flex-end;
      align-self: stretch;
      min-width: 64px;
    }

    wa-button {
      display: block;
      width: 64px;
      min-width: 64px;
      align-self: stretch;
      --wa-form-control-height: 60px;
      --wa-form-control-border-radius: 16px;
      --wa-font-size-l: 1.15rem;
      --wa-font-weight-action: 700;
    }

    wa-button::part(base) {
      width: 64px;
      min-width: 64px;
      min-height: 60px;
      height: 60px;
      border-radius: 16px;
      padding-inline: 0;
    }

    wa-button::part(label) {
      line-height: 1;
      font-size: 1.5rem;
    }

    .validation {
      grid-column: 1 / -1;
      margin: 10px 0 0;
      color: #d33a4a;
      font-size: 0.92rem;
    }

    @media (max-width: 640px) {
      .composer-form {
        grid-template-columns: 1fr;
        row-gap: 10px;
      }

      .composer-actions {
        justify-content: flex-start;
        align-self: auto;
        min-width: 0;
      }

      wa-button {
        width: 100%;
        min-width: 0;
      }

      wa-button::part(base) {
        width: 100%;
        min-width: 0;
      }
    }
  `;

  constructor() {
    super();
    this.errorMessage = '';
    this.value = '';
  }

  updated(changedProperties) {
    if (!changedProperties.has('value')) {
      return;
    }

    const input = this.renderRoot?.querySelector('wa-input');
    if (input && input.value !== this.value) {
      input.value = this.value;
    }
  }

  render() {
    return html`
      <div class="composer">
        <form class="composer-form" @submit=${this.handleSubmit}>
          <wa-input
            class="text-input"
            id="task-input"
            name="task"
            placeholder="Add a task"
            aria-label="Add a task"
            .value=${this.value}
            @wa-input=${this.handleInput}
          ></wa-input>
          <div class="composer-actions">
            <wa-button variant="brand" type="submit" aria-label="Add task">+</wa-button>
          </div>
          ${this.errorMessage
            ? html`<p class="validation" role="status" aria-live="polite">${this.errorMessage}</p>`
            : ''}
        </form>
      </div>
    `;
  }

  /**
   * Keeps the input value in sync and clears any prior validation state.
   */
  handleInput(event) {
    this.value = event.target.value;
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  /**
   * Normalizes the entered text and bubbles a task creation request upward.
   */
  handleSubmit(event) {
    event.preventDefault();
    const taskText = this.value.trim();

    if (!taskText) {
      this.errorMessage = 'Enter a task before adding it.';
      return;
    }

    this.dispatchEvent(
      new CustomEvent('task-add', {
        bubbles: true,
        composed: true,
        detail: { text: taskText },
      }),
    );

    this.value = '';
    this.errorMessage = '';
  }
}

customElements.define('task-composer', TaskComposer);