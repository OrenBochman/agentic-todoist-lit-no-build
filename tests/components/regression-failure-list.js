import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class RegressionFailureList extends LitElement {
  static properties = {
    visible: { state: true },
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.visible = false;
  }

  get listElement() {
    return this.querySelector('#failure-list');
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
