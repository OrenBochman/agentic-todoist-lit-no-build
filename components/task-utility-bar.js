import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

/**
 * <task-utility-bar>
 * Utility bar for theme toggle, WebMCP widget, and future controls.
 * Collapses to a hamburger menu on small screens, accessible via the logo.
 */
export class TaskUtilityBar extends LitElement {
  static properties = {
    theme: { type: String, reflect: true },
  };

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
      font-family: inherit;
      min-height: 40px;
      z-index: 10;
    }
    .utility-bar {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      min-height: 32px;
      padding: 0 10px;
      font-size: 1.08rem;
      font-weight: 600;
      background: none;
      border-radius: 0;
      box-shadow: none;
    }
    wa-button {
      font-size: 1.08em;
      padding: 0.7em 1.3em;
      min-height: 40px;
    }
    .hamburger {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }
    @container (max-width: 500px) {
      .utility-bar {
        display: none;
      }
      .hamburger {
        display: block;
      }
    }
    .menu {
      display: none;
      position: absolute;
      top: 2.5rem;
      right: 0;
      background: var(--wa-surface, #fff);
      border: 1px solid var(--wa-border, #ccc);
      border-radius: 0.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
      min-width: 180px;
    }
    .menu.open {
      display: block;
    }
    .menu-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      font: inherit;
    }
    .menu-item:hover {
      background: var(--wa-hover, #f0f0f0);
    }
  `;

  constructor() {
    super();
    this.theme = 'light';
    this._menuOpen = false;
  }

  render() {
    return html`
      <div class="utility-bar">
        <wa-button @click=${this._onToggleTheme} aria-label="Toggle dark mode" style="background: none; box-shadow: none; padding: 0.3em; min-width: 0;">
          <wa-icon name="${this.theme === 'dark' ? 'sun' : 'moon'}" style="color: #fbbf24; font-size: 1.3em;"></wa-icon>
        </wa-button>
        <wa-button @click=${this._onWebMcpMenu} aria-label="Open WebMCP Tools" style="margin-left: 0.5em;">
          WebMCP Tools
        </wa-button>
        <span id="webmcp-anchor"></span>
      </div>
      <button class="hamburger" @click=${this._toggleMenu} aria-label="Open utility menu">
        &#9776;
      </button>
      <div class="menu${this._menuOpen ? ' open' : ''}">
        <button class="menu-item" @click=${this._onToggleTheme} style="display: flex; align-items: center; gap: 0.5em;">
          <wa-icon name="${this.theme === 'dark' ? 'sun' : 'moon'}" style="color: #fbbf24; font-size: 1.3em;"></wa-icon>
        </button>
        <div class="menu-item" @click=${this._onWebMcpMenu}>WebMCP Tools</div>
      </div>
    `;
  }

  _onToggleTheme() {
    this.dispatchEvent(new CustomEvent('theme-toggle', { bubbles: true, composed: true }));
    this._closeMenu();
  }

  _toggleMenu() {
    this._menuOpen = !this._menuOpen;
    this.requestUpdate();
  }

  _closeMenu() {
    this._menuOpen = false;
    this.requestUpdate();
  }

  _onWebMcpMenu() {
    // Focus or open WebMCP widget (implementation placeholder)
    this._closeMenu();
    // Optionally dispatch event for parent to handle
    this.dispatchEvent(new CustomEvent('webmcp-menu', { bubbles: true, composed: true }));
  }

  firstUpdated() {
    // Mount WebMCP widget if needed
    // (Assume parent will handle actual widget script injection)
    // Optionally, parent can pass a ref or mount here
  }
}

customElements.define('task-utility-bar', TaskUtilityBar);