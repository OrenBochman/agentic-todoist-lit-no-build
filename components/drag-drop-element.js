
/**
 * Custom element for making its content draggable with task payloads.
 *
 * Usage: Wrap any element in <drag-drop-element> and set dragData property.
 * Emits 'drag-source-start' and 'drag-source-end' events with payload.
 */
const TASK_DRAG_MIME_TYPE = 'application/x-task-kanban';

/**
 * Serialize the drag payload as a JSON string.
 * @param {object} payload
 * @returns {string}
 */
const serializeDragPayload = (payload) => JSON.stringify(payload ?? {});

/**
 * Returns the MIME type used for task drag operations.
 * @returns {string}
 */
export const getTaskDragMimeType = () => TASK_DRAG_MIME_TYPE;

/**
 * <drag-drop-element>
 * Web component that enables drag-and-drop for tasks.
 * Set the dragData property to provide the payload.
 */
export class DragDropElement extends HTMLElement {
  /**
   * Attributes to observe for changes.
   */
  static get observedAttributes() {
    return ['disabled'];
  }


  constructor() {
    super();
    /**
     * The data payload to be transferred on drag.
     * @type {object|null}
     */
    this.dragData = null;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          cursor: grab;
        }
        :host([disabled]) {
          cursor: default;
        }
        :host([dragging]) {
          opacity: 0.72;
          cursor: grabbing;
        }
      </style>
      <slot></slot>
    `;
  }


  /**
   * Lifecycle: Called when element is added to the DOM.
   * Sets up drag event listeners.
   */
  connectedCallback() {
    this.setAttribute('draggable', this.disabled ? 'false' : 'true');
    this.addEventListener('dragstart', this.handleDragStart);
    this.addEventListener('dragend', this.handleDragEnd);
  }


  /**
   * Lifecycle: Called when element is removed from the DOM.
   * Cleans up event listeners.
   */
  disconnectedCallback() {
    this.removeEventListener('dragstart', this.handleDragStart);
    this.removeEventListener('dragend', this.handleDragEnd);
  }


  /**
   * Called when observed attributes change.
   * @param {string} name
   */
  attributeChangedCallback(name) {
    if (name === 'disabled') {
      this.setAttribute('draggable', this.disabled ? 'false' : 'true');
    }
  }


  /**
   * Whether the element is disabled for dragging.
   * @returns {boolean}
   */
  get disabled() {
    return this.hasAttribute('disabled');
  }


  /**
   * Handler for dragstart event. Sets drag data and fires custom event.
   * @param {DragEvent} event
   */
  handleDragStart = (event) => {
    if (this.disabled || !this.dragData) {
      event.preventDefault();
      return;
    }
    const payload = serializeDragPayload(this.dragData);
    event.dataTransfer?.setData(TASK_DRAG_MIME_TYPE, payload);
    event.dataTransfer?.setData('application/json', payload);
    event.dataTransfer?.setData('text/plain', payload);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
    this.setAttribute('dragging', '');
    this.dispatchEvent(new CustomEvent('drag-source-start', {
      bubbles: true,
      composed: true,
      detail: { payload: this.dragData },
    }));
  };

  /**
   * Handler for dragend event. Cleans up drag state and fires custom event.
   */
  handleDragEnd = () => {
    this.removeAttribute('dragging');
    this.dispatchEvent(new CustomEvent('drag-source-end', {
      bubbles: true,
      composed: true,
      detail: { payload: this.dragData },
    }));
  };
}

customElements.define('drag-drop-element', DragDropElement);
