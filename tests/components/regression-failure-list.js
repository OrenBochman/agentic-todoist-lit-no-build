import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class RegressionFailureList extends LitElement {
  static properties = {
    visible: { state: true },
  };
  static styles = css`
    :host {
      display: block;
    }

    .failure-title {
      margin: 0 0 10px;
      font-size: 1rem;
    }

    .failure-list {
      display: grid;
      gap: 10px;
      margin: 0;
      padding-left: 18px;
    }

    .failure-list a {
      color: #fca5a5;
      text-decoration: none;
    }

    .failure-list a:hover {
      text-decoration: underline;
    }
  `;

  constructor() {
    super();
    this.visible = false;
  }

  get listElement() {
    return this.renderRoot.querySelector('#failure-list');
  }

  setVisible(isVisible) {
    this.visible = isVisible;
  }

  render() {
    return html`
      <h2 class="failure-title">Failure List</h2>
      <ol id="failure-list" class="failure-list"></ol>
    `;
  }

  updated() {
    this.dataset.visible = String(this.visible);
  }
}

customElements.define('regression-failure-list', RegressionFailureList);
