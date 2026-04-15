import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

/**
 * App-level snackbar used for transient transfer feedback.
 */
class TaskSnackbar extends LitElement {
  static properties = {
    message: { type: String },
    open: { type: Boolean, reflect: true },
    tone: { type: String },
  };

  static styles = css`
    :host {
      position: fixed;
      left: 50%;
      bottom: 28px;
      z-index: 40;
      width: min(calc(100vw - 24px), 560px);
      transform: translateX(-50%);
      pointer-events: none;
    }

    .snackbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 18px;
      border: 1px solid color-mix(in srgb, var(--text-strong) 14%, transparent);
      box-shadow: 0 18px 44px rgba(3, 10, 20, 0.32);
      background: color-mix(in srgb, var(--panel-background) 92%, rgba(10, 16, 28, 0.95));
      color: var(--text-strong);
      opacity: 0;
      transform: translateY(16px) scale(0.98);
      transition: opacity 180ms ease, transform 180ms ease;
      pointer-events: auto;
    }

    :host([open]) .snackbar {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .snackbar[data-tone='success'] {
      border-color: color-mix(in srgb, #1ea85f 42%, transparent);
    }

    .snackbar[data-tone='error'] {
      border-color: color-mix(in srgb, #d33a4a 44%, transparent);
    }

    .message {
      min-width: 0;
      font-size: 0.95rem;
      line-height: 1.45;
    }

    .dismiss {
      border: 0;
      border-radius: 999px;
      min-width: 34px;
      height: 34px;
      padding: 0;
      font: inherit;
      font-size: 1rem;
      background: color-mix(in srgb, var(--text-strong) 10%, transparent);
      color: var(--text-strong);
      cursor: pointer;
    }

    @media (max-width: 640px) {
      :host {
        bottom: 18px;
        width: min(calc(100vw - 16px), 560px);
      }

      .snackbar {
        grid-template-columns: minmax(0, 1fr);
      }

      .dismiss {
        justify-self: end;
      }
    }
  `;

  constructor() {
    super();
    this.message = '';
    this.open = false;
    this.tone = 'neutral';
  }

  render() {
    return html`
      <div
        class="snackbar"
        data-tone=${this.tone}
        role=${this.tone === 'error' ? 'alert' : 'status'}
        aria-live=${this.tone === 'error' ? 'assertive' : 'polite'}
        aria-hidden=${this.open ? 'false' : 'true'}
      >
        <div class="message">${this.message}</div>
      </div>
    `;
  }

  emitDismiss = () => {
    this.dispatchEvent(
      new CustomEvent('snackbar-dismiss', {
        bubbles: true,
        composed: true,
      }),
    );
  };
}

customElements.define('task-snackbar', TaskSnackbar);