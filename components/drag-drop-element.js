const TASK_DRAG_MIME_TYPE = 'application/x-task-kanban';

const serializeDragPayload = (payload) => JSON.stringify(payload ?? {});

export const getTaskDragMimeType = () => TASK_DRAG_MIME_TYPE;

export class DragDropElement extends HTMLElement {
  static get observedAttributes() {
    return ['disabled'];
  }

  constructor() {
    super();
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

  connectedCallback() {
    this.setAttribute('draggable', this.disabled ? 'false' : 'true');
    this.addEventListener('dragstart', this.handleDragStart);
    this.addEventListener('dragend', this.handleDragEnd);
  }

  disconnectedCallback() {
    this.removeEventListener('dragstart', this.handleDragStart);
    this.removeEventListener('dragend', this.handleDragEnd);
  }

  attributeChangedCallback(name) {
    if (name === 'disabled') {
      this.setAttribute('draggable', this.disabled ? 'false' : 'true');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

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
