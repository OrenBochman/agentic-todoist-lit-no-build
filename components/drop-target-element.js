
import { getTaskDragMimeType } from './drag-drop-element.js';

/**
 * Parse the drag payload from a drag event.
 * @param {DragEvent} event
 * @returns {object|null}
 */
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

/**
 * <drop-target-element>
 * Web component that acts as a drop target for drag-and-drop operations.
 * Emits 'drop-receive' event with the payload and target value.
 */
export class DropTargetElement extends HTMLElement {
  /**
   * Attributes to observe for changes.
   */
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
    /**
     * Tracks drag depth for nested dragenter/dragleave.
     * @type {number}
     */
    this._dragDepth = 0;
  }


  /**
   * Lifecycle: Called when element is added to the DOM.
   * Sets up drag event listeners.
   */
  connectedCallback() {
    this.addEventListener('dragenter', this.handleDragEnter);
    this.addEventListener('dragover', this.handleDragOver);
    this.addEventListener('dragleave', this.handleDragLeave);
    this.addEventListener('drop', this.handleDrop);
  }


  /**
   * Lifecycle: Called when element is removed from the DOM.
   * Cleans up event listeners.
   */
  disconnectedCallback() {
    this.removeEventListener('dragenter', this.handleDragEnter);
    this.removeEventListener('dragover', this.handleDragOver);
    this.removeEventListener('dragleave', this.handleDragLeave);
    this.removeEventListener('drop', this.handleDrop);
  }


  /**
   * Called when observed attributes change.
   * @param {string} name
   */
  attributeChangedCallback(name) {
    if (name === 'disabled' && this.disabled) {
      this.clearActiveState();
    }
  }


  /**
   * Whether the drop target is disabled.
   * @returns {boolean}
   */
  get disabled() {
    return this.hasAttribute('disabled');
  }


  /**
   * The value associated with this drop target (e.g., column name).
   * @returns {string}
   */
  get targetValue() {
    return this.getAttribute('target-value') ?? '';
  }


  /**
   * Checks if the drag event is acceptable for this target.
   * @param {DragEvent} event
   * @returns {boolean}
   */
  acceptsDrag(event) {
    if (this.disabled) {
      return false;
    }
    const types = Array.from(event.dataTransfer?.types ?? []);
    return types.includes(getTaskDragMimeType())
      || types.includes('application/json')
      || types.includes('text/plain');
  }


  /**
   * Clears the active visual state for drag feedback.
   */
  clearActiveState() {
    this._dragDepth = 0;
    this.removeAttribute('active');
  }


  /**
   * Handler for dragenter event. Activates visual feedback.
   * @param {DragEvent} event
   */
  handleDragEnter = (event) => {
    if (!this.acceptsDrag(event)) {
      return;
    }
    event.preventDefault();
    this._dragDepth += 1;
    this.setAttribute('active', '');
  };


  /**
   * Handler for dragover event. Allows drop and sets feedback.
   * @param {DragEvent} event
   */
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


  /**
   * Handler for dragleave event. Removes visual feedback if needed.
   * @param {DragEvent} event
   */
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


  /**
   * Handler for drop event. Parses payload and emits 'drop-receive'.
   * @param {DragEvent} event
   */
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
