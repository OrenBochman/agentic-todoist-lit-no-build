import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

/**
 * Import/export controls for JSON task backups.
 */
class TaskTransferControls extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .transfer {
      container-type: inline-size;
      display: grid;
      gap: 10px;
      justify-items: end;
    }

    .buttons {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      width: 100%;
    }

    .buttons > :first-child {
      grid-column: 1;
    }

    .buttons > :last-child {
      grid-column: 3;
    }

    wa-button {
      width: 100%;
      --wa-form-control-height: 44px;
      --wa-form-control-border-radius: 999px;
      --wa-font-size-m: 0.95rem;
      --wa-input-background-color: color-mix(in srgb, var(--panel-background) 90%, transparent);
    }

    wa-button::part(base) {
      width: 100%;
    }

    .hint {
      margin: 0;
      font-size: 0.82rem;
      line-height: 1.35;
      color: var(--text-muted);
      text-align: right;
    }

    input[type='file'] {
      display: none;
    }

    @container (max-width: 380px) {
      .buttons {
        gap: 8px;
      }

      wa-button {
        --wa-form-control-height: 40px;
        --wa-font-size-m: 0.9rem;
      }
    }

    @container (max-width: 300px) {
      .buttons {
        grid-template-columns: 1fr;
      }

      .buttons > :first-child,
      .buttons > :last-child {
        grid-column: auto;
      }
    }

    @media (max-width: 720px) {
      .transfer {
        justify-items: stretch;
      }

      .hint {
        max-width: none;
        text-align: left;
      }
    }
  `;

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="transfer">
        <div class="buttons">
          <wa-button type="button" @click=${this.openImportPicker}>Import</wa-button>
          <wa-button type="button" variant="brand" @click=${this.emitExport}>Export</wa-button>
        </div>
        <p class="hint">Import keeps your current tasks and adds only tasks that are not already present.</p>
        <input
          id="file-input"
          type="file"
          accept="application/json,.json"
          @change=${this.handleFileChange}
        />
      </div>
    `;
  }

  openImportPicker = () => {
    this.renderRoot?.querySelector('#file-input')?.click();
  };

  handleFileChange(event) {
    const input = event.target;
    const file = input?.files?.[0];

    this.dispatchEvent(
      new CustomEvent('tasks-import', {
        bubbles: true,
        composed: true,
        detail: { file },
      }),
    );

    if (input) {
      input.value = '';
    }
  }

  emitExport = () => {
    this.dispatchEvent(
      new CustomEvent('tasks-export', {
        bubbles: true,
        composed: true,
      }),
    );
  };
}

customElements.define('task-transfer-controls', TaskTransferControls);