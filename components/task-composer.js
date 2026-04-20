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

    wa-input::part(input) {
      color: var(--wa-color-text-normal);
      caret-color: var(--wa-color-text-normal);
      -webkit-text-fill-color: var(--wa-color-text-normal);
    }

    wa-input::part(input)::selection {
      color: var(--wa-color-text-normal);
      background: color-mix(in srgb, var(--accent) 28%, white);
    }

    wa-input::part(input):-webkit-autofill,
    wa-input::part(input):-webkit-autofill:hover,
    wa-input::part(input):-webkit-autofill:focus,
    wa-input::part(input):-webkit-autofill:active {
      -webkit-text-fill-color: var(--wa-color-text-normal);
      caret-color: var(--wa-color-text-normal);
      box-shadow: 0 0 0 1000px var(--wa-input-background-color) inset;
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

  getCurrentInputValue(event, includeInternalFallback = false) {
    const input = this.renderRoot?.querySelector('wa-input');
    const hostValue = typeof event?.target?.value === 'string'
      ? event.target.value
      : typeof input?.value === 'string'
        ? input.value
        : '';

    if (hostValue || !includeInternalFallback) {
      return hostValue;
    }

    const internalInput = input?.shadowRoot?.querySelector('input');
    return typeof internalInput?.value === 'string' ? internalInput.value : '';
  }

  clearInput() {
    const input = this.renderRoot?.querySelector('wa-input');
    const internalInput = input?.shadowRoot?.querySelector('input');

    if (input) {
      input.value = '';
    }

    if (internalInput) {
      internalInput.value = '';
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
            @wa-change=${this.handleInput}
          ></wa-input>
          <div class="composer-actions">
            <wa-button variant="brand" type="button" aria-label="Add task" @click=${this.handleSubmit}>+</wa-button>
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
    const nextValue = this.getCurrentInputValue(event);

    if (nextValue === this.value) {
      if (this.errorMessage && nextValue.trim()) {
        this.errorMessage = '';
      }
      return;
    }

    this.value = nextValue;

    if (this.errorMessage && nextValue.trim()) {
      this.errorMessage = '';
    }
  }

  /**
   * Returns a new task object with all schema fields and defaults.
   */
  createTask(text) {
    return {
      text,
      dueDate: null,
      project: null,
      importance: null,
      dependsOn: [],
      workloadEstimate: 4,
      workloadUncertainty: 1,
      tags: [],
    };
  }

  /**
   * Normalizes the entered text and bubbles a task creation request upward.
   */
  handleSubmit(event) {
    event?.preventDefault?.();
    const currentValue = this.getCurrentInputValue(event, true) || this.value;
    const taskText = currentValue.trim();

    this.value = currentValue;

    if (!taskText) {
      this.errorMessage = 'Enter a task before adding it.';
      return;
    }

    this.dispatchEvent(
      new CustomEvent('task-add', {
        bubbles: true,
        composed: true,
        detail: this.createTask(taskText),
      }),
    );

    this.value = '';
    this.clearInput();
    this.errorMessage = '';
  }
}

customElements.define('task-composer', TaskComposer);