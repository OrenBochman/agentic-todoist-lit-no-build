// Lit-Redux connector: subscribes to store and triggers Lit updates
// Usage: extend LitReduxElement instead of LitElement

import { store } from './redux-store.js';
import { LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class LitReduxElement extends LitElement {
  constructor() {
    super();
    this._reduxUnsubscribe = null;
    this._reduxState = store.getState();
  }

  connectedCallback() {
    super.connectedCallback();
    this._reduxUnsubscribe = store.subscribe(() => {
      this._reduxState = store.getState();
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._reduxUnsubscribe) {
      this._reduxUnsubscribe();
      this._reduxUnsubscribe = null;
    }
  }

  get reduxState() {
    return this._reduxState;
  }

  dispatch(action) {
    store.dispatch(action);
  }
}
