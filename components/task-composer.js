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
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: stretch;
      column-gap: 12px;
      row-gap: 0;
    }

    .text-input {
      width: 100%;
      min-height: 60px;
      border: 1px solid color-mix(in srgb, var(--text-strong) 14%, transparent);
      border-radius: 16px;
      padding: 14px 16px;
      font: inherit;
      color: var(--text-strong);
      background: color-mix(in srgb, var(--panel-background) 92%, transparent);
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }

    .text-input::placeholder {
      color: color-mix(in srgb, var(--text-muted) 80%, transparent);
    }

    .text-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent);
    }

    .composer-actions {
      display: flex;
      justify-content: flex-end;
      align-self: stretch;
    }

    .validation {
      grid-column: 1 / -1;
      margin: 10px 0 0;
      color: #d33a4a;
      font-size: 0.92rem;
    }

    .button {
      border: 0;
      border-radius: 999px;
      padding: 12px 18px;
      font: inherit;
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

    .button-icon {
      min-width: 60px;
      min-height: 60px;
      height: 100%;
      padding: 0;
      border-radius: 16px;
      font-size: 1.8rem;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 820px) {
      .composer-form {
        grid-template-columns: 1fr;
        row-gap: 10px;
      }

      .composer-actions {
        justify-content: flex-start;
        align-self: auto;
      }

      .button-icon {
        width: 100%;
      }
    }
  `;

  constructor() {
    super();
    this.errorMessage = '';
    this.value = '';
  }

  render() {
    return html`
      <div class="composer">
        <form class="composer-form" @submit=${this.handleSubmit}>
          <input
            class="text-input"
            name="task"
            type="text"
            placeholder="Add a task"
            aria-label="Add a task"
            .value=${this.value}
            @input=${this.handleInput}
          />
          <div class="composer-actions">
            <button class="button button-brand button-icon" type="submit" aria-label="Add task">
              +
            </button>
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