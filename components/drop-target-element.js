import { getTaskDragMimeType } from './drag-drop-element.js';

const parsePayload = (event) => {
  const mimeType = getTaskDragMimeType();
  const text = event.dataTransfer?.getData(mimeType)
    || event.dataTransfer?.getData('application/json')
    || event.dataTransfer?.getData('text/plain');

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export class DropTargetElement extends HTMLElement {
  static get observedAttributes() {
    return ['disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
      </style>
      <slot></slot>
    `;
    this._dragDepth = 0;
  }

  connectedCallback() {
    this.addEventListener('dragenter', this.handleDragEnter);
    this.addEventListener('dragover', this.handleDragOver);
    this.addEventListener('dragleave', this.handleDragLeave);
    this.addEventListener('drop', this.handleDrop);
  }

  disconnectedCallback() {
    this.removeEventListener('dragenter', this.handleDragEnter);
    this.removeEventListener('dragover', this.handleDragOver);
    this.removeEventListener('dragleave', this.handleDragLeave);
    this.removeEventListener('drop', this.handleDrop);
  }

  attributeChangedCallback(name) {
    if (name === 'disabled' && this.disabled) {
      this.clearActiveState();
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  get targetValue() {
    return this.getAttribute('target-value') ?? '';
  }

  acceptsDrag(event) {
    if (this.disabled) {
      return false;
    }

    const types = Array.from(event.dataTransfer?.types ?? []);
    return types.includes(getTaskDragMimeType())
      || types.includes('application/json')
      || types.includes('text/plain');
  }

  clearActiveState() {
    this._dragDepth = 0;
    this.removeAttribute('active');
  }

  handleDragEnter = (event) => {
    if (!this.acceptsDrag(event)) {
      return;
    }

    event.preventDefault();
    this._dragDepth += 1;
    this.setAttribute('active', '');
  };

  handleDragOver = (event) => {
    if (!this.acceptsDrag(event)) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.setAttribute('active', '');
  };

  handleDragLeave = (event) => {
    if (!this.acceptsDrag(event)) {
      return;
    }

    event.preventDefault();
    this._dragDepth = Math.max(0, this._dragDepth - 1);
    if (this._dragDepth === 0) {
      this.removeAttribute('active');
    }
  };

  handleDrop = (event) => {
    if (!this.acceptsDrag(event)) {
      return;
    }

    event.preventDefault();
    const payload = parsePayload(event);
    this.clearActiveState();

    if (!payload) {
      return;
    }

    this.dispatchEvent(new CustomEvent('drop-receive', {
      bubbles: true,
      composed: true,
      detail: {
        payload,
        targetValue: this.targetValue,
      },
    }));
  };
}

customElements.define('drop-target-element', DropTargetElement);
