import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

/**
 * @typedef {Object} TaskRecord
 * @property {boolean} completed
 * @property {string} createdAt
 * @property {string} id
 * @property {string} text
 * @property {string|null} dueDate - ISO date string or null
 * @property {string|null} project - Freeform project name or null
 * @property {string|null} importance - Importance (e.g., 'P1'-'P5'), nullable
 * @property {string[]} dependsOn - Array of task IDs (default: [])
 * @property {number} workloadEstimate - Estimated hours (default: 4)
 * @property {number} workloadUncertainty - Uncertainty in hours (default: 1)
 * @property {string[]} tags - Array of tags (default: [])
 */

/**
 * Single task row with toggle and delete actions.
 */
class TaskItem extends LitElement {
  static properties = {
    draftText: { state: true },
    editError: { state: true },
    editing: { state: true },
    task: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
    }

    .task {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 16px;
      align-items: start;
      padding: 20px;
      border-radius: 22px;
      background: color-mix(in srgb, var(--panel-background) 96%, transparent);
      border: 1px solid var(--panel-border);
      box-shadow: 0 14px 40px color-mix(in srgb, var(--text-strong) 8%, transparent);
    }

    .task[data-completed='true'] {
      background: linear-gradient(180deg, var(--success-soft), color-mix(in srgb, var(--panel-background) 96%, transparent));
    }

    .toggle {
      inline-size: 24px;
      block-size: 24px;
      min-inline-size: 24px;
      min-block-size: 24px;
      margin-top: 0;
      padding: 0;
      border-radius: 50%;
      border: 2px solid color-mix(in srgb, var(--accent) 44%, transparent);
      background: transparent;
      cursor: pointer;
      appearance: none;
      display: inline-block;
      flex: 0 0 24px;
      align-self: center;
      box-sizing: border-box;
      transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease;
    }

    .toggle:hover,
    .toggle:focus-visible {
      transform: scale(1.08);
      outline: none;
      border-color: var(--accent);
    }

    .toggle[data-completed='true'] {
      background: var(--accent);
      border-color: var(--accent);
      box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.95);
    }

    .task-main {
      min-width: 0;
    }

    .task-main[data-editable='true'] {
      cursor: pointer;
    }

    .task-text {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.45;
      color: var(--text-strong);
      overflow-wrap: anywhere;
    }

    .task[data-completed='true'] .task-text {
      color: var(--text-muted);
      text-decoration: line-through;
      text-decoration-thickness: 2px;
    }

    .task-meta {
      display: block;
      margin-top: 8px;
      color: var(--text-muted);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .edit-form {
      display: grid;
      gap: 12px;
    }

    wa-input {
      width: 100%;
      --wa-form-control-height: 52px;
      --wa-form-control-border-radius: 16px;
      --wa-input-background-color: color-mix(in srgb, var(--panel-background) 92%, transparent);
      --wa-input-border-color: color-mix(in srgb, var(--text-strong) 16%, transparent);
      --wa-input-border-color-focus: var(--accent);
      --wa-input-color: var(--text-strong);
      --wa-input-placeholder-color: color-mix(in srgb, var(--text-muted) 80%, transparent);
      --wa-focus-ring-color: color-mix(in srgb, var(--accent) 18%, transparent);
      --wa-focus-ring-width: 4px;
    }

    .edit-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    wa-button {
      --wa-form-control-height: 42px;
      --wa-form-control-border-radius: 999px;
    }

    .edit-error {
      margin: 0;
      color: #d33a4a;
      font-size: 0.92rem;
      line-height: 1.35;
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
      background: color-mix(in srgb, var(--text-strong) 8%, transparent);
      color: var(--text-strong);
    }

    .button:hover,
    .button:focus-visible {
      transform: translateY(-1px);
      outline: none;
      background: color-mix(in srgb, var(--text-strong) 14%, transparent);
    }

    @media (max-width: 640px) {
      .task {
        grid-template-columns: auto 1fr;
      }

      .task-actions {
        grid-column: 1 / -1;
        display: flex;
        justify-content: flex-end;
      }
    }
  `;

  constructor() {
    super();
    this.draftText = '';
    this.editError = '';
    this.editing = false;
    this._longPressTimer = null;
    /** @type {TaskRecord | null} */
    this.task = null;
  }

  disconnectedCallback() {
    this.clearLongPress();
    super.disconnectedCallback();
  }

  updated(changedProperties) {
    if (changedProperties.has('editing') && this.editing) {
      this.updateComplete.then(() => {
        const input = this.renderRoot?.querySelector('wa-input');
        input?.focus();
        input?.select?.();
      });
    }
  }

  render() {
    if (!this.task) {
      return '';
    }

    return html`
      <article class="task" data-completed=${String(this.task.completed)}>
        <button
          class="toggle"
          type="button"
          data-completed=${String(this.task.completed)}
          aria-label=${this.task.completed ? 'Mark task as pending' : 'Mark task as completed'}
          @click=${this.emitToggle}
        ></button>
        ${this.editing
          ? html`
              <form class="task-main edit-form" @submit=${this.handleEditSubmit}>
                <wa-input
                  .value=${this.draftText}
                  aria-label="Edit task"
                  @wa-input=${this.handleEditInput}
                  @wa-change=${this.handleEditInput}
                ></wa-input>
                ${this.editError ? html`<p class="edit-error" role="status" aria-live="polite">${this.editError}</p>` : ''}
                <div class="edit-actions">
                  <wa-button type="button" @click=${this.cancelEdit}>Cancel</wa-button>
                  <wa-button type="button" variant="brand" @click=${this.handleEditSubmit}>Save</wa-button>
                </div>
              </form>
            `
          : html`
              <div
                class="task-main"
                data-editable="true"
                @pointerdown=${this.handlePressStart}
                @pointerup=${this.clearLongPress}
                @pointerleave=${this.clearLongPress}
                @pointercancel=${this.clearLongPress}
              >
                <p class="task-text">${this.task.text}</p>
                <span class="task-meta">${this.task.completed ? 'Completed' : 'Pending'}</span>
              </div>
            `}
        <div class="task-actions">
          <button class="button" type="button" @click=${this.emitDelete}>Delete</button>
        </div>
      </article>
    `;
  }

  handlePressStart(event) {
    if (this.editing || event.button !== 0) {
      return;
    }

    this.clearLongPress();
    this._longPressTimer = window.setTimeout(() => {
      this._longPressTimer = null;
      this.startEditing();
    }, 450);
  }

  clearLongPress = () => {
    if (this._longPressTimer) {
      window.clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  };

  startEditing() {
    this.draftText = this.task?.text || '';
    this.editError = '';
    this.editing = true;
  }

  getCurrentEditValue(event, includeInternalFallback = false) {
    const input = this.renderRoot?.querySelector('wa-input');
    const hostValue = typeof event?.target?.value === 'string'
      ? event.target.value
      : typeof input?.value === 'string'
        ? input.value
        : this.draftText;

    if (hostValue || !includeInternalFallback) {
      return hostValue;
    }

    const internalInput = input?.shadowRoot?.querySelector('input');
    return typeof internalInput?.value === 'string' ? internalInput.value : hostValue;
  }

  handleEditInput(event) {
    const nextValue = this.getCurrentEditValue(event);
    this.draftText = nextValue;

    if (this.editError && nextValue.trim()) {
      this.editError = '';
    }
  }

  cancelEdit = () => {
    this.editing = false;
    this.editError = '';
    this.draftText = this.task?.text || '';
  };

  handleEditSubmit(event) {
    event?.preventDefault?.();
    const nextValue = this.getCurrentEditValue(event, true);
    const nextText = nextValue.trim();

    this.draftText = nextValue;

    if (!nextText) {
      this.editError = 'Enter a task before saving it.';
      return;
    }

    this.dispatchEvent(
      new CustomEvent('task-edit', {
        bubbles: true,
        composed: true,
        detail: {
          taskId: this.task.id,
          text: nextText,
        },
      }),
    );

    this.editing = false;
    this.editError = '';
    this.draftText = nextText;
  }

  emitDelete = () => {
    this.clearLongPress();
    this.dispatchEvent(
      new CustomEvent('task-delete', {
        bubbles: true,
        composed: true,
        detail: { taskId: this.task.id },
      }),
    );
  };

  emitToggle = () => {
    this.clearLongPress();
    this.dispatchEvent(
      new CustomEvent('task-toggle', {
        bubbles: true,
        composed: true,
        detail: { taskId: this.task.id },
      }),
    );
  };
}

customElements.define('task-item', TaskItem);