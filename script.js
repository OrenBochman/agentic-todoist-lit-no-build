import { css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { LitReduxElement } from './components/lit-redux-element.js';
import { store, setTasks, addTask, editTask, toggleTask, deleteTask, setFilter, setProjectFilter, setTheme } from './components/redux-store.js';
import './components/task-composer.js';
import './components/task-board.js';
import './components/task-hero.js';
import './components/kanban-board.js';
import './components/gantt-view.js';
import './components/gantt-canvas-view.js';
import './components/task-snackbar.js';
import './components/task-transfer-controls.js';
import './components/task-utility-bar.js';
import { parseTaskInput } from './components/task-input-codec.js';
import {
  ALL_PROJECTS_FILTER,
  isNamedProjectFilter,
  matchesProjectFilter,
  normalizeTaskProject,
} from './components/task-project.js';

const STORAGE_KEY = 'task-manager-items';
const THEME_STORAGE_KEY = 'task-manager-theme';
const VIEW_STORAGE_KEY = 'task-manager-view';
const WEBMCP_TOOLS_KEY = '__taskManagerWebMcpToolsRegistered';
const EXPORT_VERSION = 1;
const KANBAN_STATUS_UPDATES = {
  upcoming: {
    completed: false,
    inProgress: false,
    section: 'up',
    sectionShortcut: '/up',
  },
  'in-progress': {
    completed: false,
    inProgress: true,
    section: 'in',
    sectionShortcut: '/in',
  },
  done: {
    completed: true,
    inProgress: false,
    section: 'done',
    sectionShortcut: '/done',
  },
};

function getWebMcpConstructor() {
  if (typeof globalThis.WebMCP === 'function') {
    return globalThis.WebMCP;
  }

  try {
    return new Function("return typeof WebMCP !== 'undefined' ? WebMCP : undefined;")();
  } catch {
    return undefined;
  }
}

/**
 * Root application component.
 * Owns persisted task state, theme state, and WebMCP tool registration.
 */
class TaskManagerApp extends LitReduxElement {
  // --- Compatibility: expose .tasks, .filter, .projectFilter, .theme for tests/tools ---
  get tasks() {
    return this.reduxState.tasks;
  }
  set tasks(val) {
    this.dispatch(setTasks(Array.isArray(val) ? val : []));
    this.saveTasks();
    this.requestUpdate();
  }

  get filter() {
    return this.reduxState.filter;
  }
  set filter(val) {
    this.dispatch(setFilter(val));
    this.requestUpdate();
  }

  get projectFilter() {
    return this.reduxState.projectFilter;
  }
  set projectFilter(val) {
    this.dispatch(setProjectFilter(val));
    this.requestUpdate();
  }

  get theme() {
    return this.reduxState.theme;
  }
  set theme(val) {
    this.dispatch(setTheme(val));
    this.saveTheme();
    this.requestUpdate();
  }

  get activeView() {
    return this._activeView || 'list';
  }
  set activeView(val) {
    const normalized = val === 'kanban' || val === 'gantt' ? val : 'list';
    this._activeView = normalized;
    this.requestUpdate();
  }

  get showKanban() {
    return this.activeView === 'kanban';
  }
  set showKanban(val) {
    this.activeView = val ? 'kanban' : 'list';
  }
  static properties = {
    activeView: { state: true },
    transferStatusMessage: { state: true },
    transferStatusTone: { state: true },
    webMcpStatus: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      /* background: khaki; */
    }
    :host([data-theme='dark']) {
      /* Example: override background for dark mode */
      background: #181c24;
    }
    /* :host([data-theme='light']) { background: khaki; } */

    .shell {
      width: min(980px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 48px 0 72px;
      outline: 2px solid hotpink;
    }

    .card {
      display: block;
      border-radius: 28px;
      overflow: hidden;
      backdrop-filter: blur(20px);
      border: 1px solid var(--panel-border);
      box-shadow: var(--panel-shadow);
      background: var(--panel-background);
    }

    .panel {
      padding: 28px;
    }

    .composer-card {
      margin-top: 24px;
    }

    .board {
      margin-top: 24px;
      display: grid;
      gap: 24px;
    }

    .transfer-card {
      margin-top: 0;
    }

    @media (max-width: 640px) {
      .shell {
        width: min(100vw - 20px, 980px);
        padding: 20px 0 40px;
      }

      .panel {
        padding: 20px;
      }
    }
  `;

  constructor() {
    super();
    // Initial state is in Redux store
    this.transferStatusMessage = '';
    this.transferStatusTone = 'neutral';
    this.webMcpStatus = window.__webmcpStatus || 'loading';
    this._transferStatusTimeout = null;
    this.activeView = this.loadView();
    // Load persisted state into Redux store on first load
    if (store.getState().tasks.length === 0) {
      const tasks = this.loadTasks();
      this.dispatch(setTasks(tasks));
    }
    this.dispatch(setTheme(this.loadTheme()));
  }

  connectedCallback() {
    super.connectedCallback();
    this.applyTheme();
    this.syncWebMcpStatus();
    this.registerWebMcpTools();
  }

  getNextViewLabel() {
    if (this.activeView === 'list') {
      return 'Show Kanban View';
    }

    if (this.activeView === 'kanban') {
      return 'Show Gantt View';
    }

    return 'Show List View';
  }

  render() {
    const { tasks, filter, projectFilter, theme } = this.reduxState;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    return html`
      <main class="shell" data-theme="${theme}">
        <div class="app-header-row">
          <div style="display: flex; align-items: center; gap: 1.2rem; width: 100%;">
            <span class="eyebrow" style="display: flex; align-items: center; gap: 0.5em; color: var(--accent); font-weight: 700; font-size: 1.08rem;">
              <wa-icon name="list-check" style="color: rgb(255, 212, 59);"></wa-icon>
              <span style="color: var(--accent);">ToDo&gt;</span>
            </span>
            <task-utility-bar
              style="flex: 0 0 auto; align-self: flex-start;"
              .theme=${theme}
              .webMcpStatus=${this.webMcpStatus}
              @theme-toggle=${this.toggleTheme}
              @webmcp-menu=${this.handleWebMcpMenu}
            ></task-utility-bar>
          </div>
          <task-hero
            style="flex: 1 1 0%; min-width: 0;"
            total-tasks=${totalTasks}
            pending-tasks=${pendingTasks}
            completed-tasks=${completedTasks}
          ></task-hero>
        </div>

        <section class="board" aria-label="Task list">
          <article class="card composer-card">
            <div class="panel">
              <task-composer @task-add=${this.handleTaskAdd}></task-composer>
            </div>
          </article>

          <wa-button @click=${this.toggleTaskView} style="margin-bottom: 12px;">${this.getNextViewLabel()}</wa-button>

          ${this.activeView === 'kanban'
            ? html`<kanban-board
                .filter=${filter}
                .projectFilter=${projectFilter}
                .tasks=${tasks}
                @filter-change=${this.handleFilterChange}
                @project-filter-change=${this.handleProjectFilterChange}
                @task-edit=${this.handleTaskEdit}
                @task-toggle=${this.handleTaskToggle}
                @task-delete=${this.handleTaskDelete}
                @task-move=${this.handleTaskMove}
              ></kanban-board>`
            : this.activeView === 'gantt'
              ? html`<gantt-canvas-view
                  .filter=${filter}
                  .projectFilter=${projectFilter}
                  .tasks=${tasks}
                ></gantt-canvas-view>`
            : html`<task-board
                .filter=${filter}
                .projectFilter=${projectFilter}
                .tasks=${tasks}
                @filter-change=${this.handleFilterChange}
                @project-filter-change=${this.handleProjectFilterChange}
                @task-edit=${this.handleTaskEdit}
                @task-toggle=${this.handleTaskToggle}
                @task-delete=${this.handleTaskDelete}
              ></task-board>`}

          <article class="card transfer-card">
            <div class="panel">
              <task-transfer-controls
                @tasks-export=${this.handleTasksExport}
                @tasks-import=${this.handleTasksImport}
              ></task-transfer-controls>
            </div>
          </article>
        </section>

        <task-snackbar
          .message=${this.transferStatusMessage}
          .tone=${this.transferStatusTone}
          .open=${Boolean(this.transferStatusMessage)}
          @snackbar-dismiss=${this.clearTransferStatus}
        ></task-snackbar>
      </main>
    `;
  }

  /**
   * Restores the saved task collection from localStorage.
   */
  loadTasks() {
    try {
      const rawTasks = window.localStorage.getItem(STORAGE_KEY);
      const parsedTasks = rawTasks ? JSON.parse(rawTasks) : [];
      return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch {
      return [];
    }
  }

  /**
   * Restores the last selected theme, defaulting to light mode.
   */
  loadTheme() {
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      return storedTheme === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  loadView() {
    try {
      const view = window.localStorage.getItem(VIEW_STORAGE_KEY);
      return view === 'kanban' || view === 'gantt' ? view : 'list';
    } catch {
      return 'list';
    }
  }

  saveTasks() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reduxState.tasks));
    } catch {
      return;
    }
  }

  saveTheme() {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, this.reduxState.theme);
    } catch {
      return;
    }
  }

  saveView() {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, this.activeView);
    } catch {
      return;
    }
  }

  applyTheme() {
    this.setAttribute('data-theme', this.reduxState.theme);
  }

  toggleTheme = () => {
    const theme = this.reduxState.theme === 'dark' ? 'light' : 'dark';
    this.dispatch(setTheme(theme));
    this.applyTheme();
    this.saveTheme();
  };

  toggleTaskView = () => {
    this.activeView = this.activeView === 'list'
      ? 'kanban'
      : this.activeView === 'kanban'
        ? 'gantt'
        : 'list';
    this.saveView();
  };

  handleWebMcpMenu = () => {
    // Optionally focus or open WebMCP widget
    // Placeholder for future logic
  };

  syncWebMcpStatus() {
    const refreshStatus = () => {
      if (window.webMCP) {
        this.webMcpStatus = 'ready';
        return;
      }

      this.webMcpStatus = window.__webmcpStatus || 'loading';
    };

    refreshStatus();
    window.setTimeout(refreshStatus, 0);
    window.setTimeout(refreshStatus, 250);
    window.setTimeout(refreshStatus, 1000);
  }

  /**
   * Handles upward task creation events from the composer component.
   */
  handleTaskAdd(event) {
    const taskDetails = event.detail ?? {};
    const taskText = String(taskDetails.text || '').trim();
    const explicitProject = normalizeTaskProject(taskDetails.project);
    const inheritedProject = isNamedProjectFilter(this.projectFilter) ? this.projectFilter : null;

    if (!taskText) {
      return;
    }

    this.dispatch(addTask({
      id: crypto.randomUUID(),
      text: taskText,
      completed: Boolean(taskDetails.completed),
      createdAt: new Date().toISOString(),
      dueDate: taskDetails.dueDate ?? null,
      project: explicitProject ?? inheritedProject,
      importance: taskDetails.importance ?? null,
      dependsOn: Array.isArray(taskDetails.dependsOn) ? taskDetails.dependsOn : [],
      workloadEstimate: typeof taskDetails.workloadEstimate === 'number' ? taskDetails.workloadEstimate : 4,
      workloadUncertainty: typeof taskDetails.workloadUncertainty === 'number' ? taskDetails.workloadUncertainty : 1,
      tags: Array.isArray(taskDetails.tags) ? taskDetails.tags : [],
      inProgress: Boolean(taskDetails.inProgress),
      sectionShortcut: taskDetails.sectionShortcut ?? null,
      section: taskDetails.section ?? null,
    }));
    this.saveTasks();
    this.clearTransferStatus();
  }

  /**
   * Keeps the active filter in the root so WebMCP and UI stay in sync.
   */
  handleFilterChange(event) {
    this.dispatch(setFilter(event.detail.filter));
  }

  handleProjectFilterChange = (event) => {
    this.dispatch(setProjectFilter(event.detail.projectFilter || ALL_PROJECTS_FILTER));
  };

  /**
   * Toggles completion state for the requested task id.
   */
  handleTaskToggle(event) {
    const taskId = event.detail.taskId;
    this.dispatch(toggleTask(taskId));
    this.saveTasks();
    this.clearTransferStatus();
  }

  /**
   * Removes the requested task and persists the updated collection.
   */
  handleTaskDelete(event) {
    const taskId = event.detail.taskId;
    this.dispatch(deleteTask(taskId));
    this.saveTasks();
    this.clearTransferStatus();
  }

  /**
   * Updates the text of an existing task.
   */
  handleTaskEdit(event) {
    const taskId = event.detail.taskId;
    const rawInput = String(event.detail.input || '').trim();
    if (!rawInput) return;
    const parsedTask = parseTaskInput(rawInput);
    if (!parsedTask.text) return;

    // Overwrite all fields from the parser, preserving the id
    this.dispatch(editTask({
      id: taskId,
      ...parsedTask
    }));
    this.saveTasks();
    this.clearTransferStatus();
  }

  /**
   * Normalizes a kanban drop into the task status fields used by the rest of the app.
   */
  handleTaskMove = (event) => {
    const taskId = event.detail?.taskId;
    const toColumn = event.detail?.toColumn;
    const statusUpdate = KANBAN_STATUS_UPDATES[toColumn];

    if (!taskId || !statusUpdate) {
      return;
    }

    const task = this.tasks.find((entry) => entry.id === taskId);
    if (!task) {
      return;
    }

    if (
      Boolean(task.completed) === statusUpdate.completed
      && Boolean(task.inProgress) === statusUpdate.inProgress
      && (task.sectionShortcut ?? null) === statusUpdate.sectionShortcut
      && (task.section ?? null) === statusUpdate.section
    ) {
      return;
    }

    this.dispatch(editTask({
      id: taskId,
      ...statusUpdate,
    }));
    this.saveTasks();
    this.clearTransferStatus();
  };

  /**
   * Clears stale transfer feedback after ordinary task mutations.
   */
  clearTransferStatus() {
    if (this._transferStatusTimeout) {
      window.clearTimeout(this._transferStatusTimeout);
      this._transferStatusTimeout = null;
    }

    if (!this.transferStatusMessage) {
      return;
    }

    this.transferStatusMessage = '';
    this.transferStatusTone = 'neutral';
  }

  showTransferStatus(message, tone = 'neutral') {
    if (this._transferStatusTimeout) {
      window.clearTimeout(this._transferStatusTimeout);
    }

    this.transferStatusMessage = message;
    this.transferStatusTone = tone;
    this._transferStatusTimeout = window.setTimeout(() => {
      this._transferStatusTimeout = null;
      this.clearTransferStatus();
    }, 3600);
  }

  /**
   * Creates a portable JSON backup of the current task collection.
   */
  handleTasksExport = () => {
    const payload = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      tasks: this.tasks.map((task) => ({
        id: task.id,
        text: task.text,
        completed: task.completed,
        createdAt: task.createdAt,
        dueDate: task.dueDate ?? null,
        project: task.project ?? null,
        importance: task.importance ?? null,
        dependsOn: Array.isArray(task.dependsOn) ? task.dependsOn : [],
        workloadEstimate: typeof task.workloadEstimate === 'number' ? task.workloadEstimate : 4,
        workloadUncertainty: typeof task.workloadUncertainty === 'number' ? task.workloadUncertainty : 1,
        tags: Array.isArray(task.tags) ? task.tags : [],
        inProgress: Boolean(task.inProgress),
        sectionShortcut: task.sectionShortcut ?? null,
        section: task.section ?? null,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = this.getExportFileName();
    link.click();
    window.URL.revokeObjectURL(objectUrl);

    this.showTransferStatus(
      this.tasks.length
        ? `Exported ${this.tasks.length} ${this.tasks.length === 1 ? 'task' : 'tasks'} to JSON.`
        : 'Exported an empty task list to JSON.',
      'success',
    );
  };

  /**
   * Imports tasks from a JSON backup file and merges in only missing tasks.
   */
  handleTasksImport = async (event) => {
    const file = event.detail?.file;

    if (!(file instanceof File)) {
      this.showTransferStatus('Choose a JSON file to import.', 'error');
      return;
    }

    try {
      const fileContents = await file.text();
      const parsed = JSON.parse(fileContents);
      const importedTasks = this.normalizeImportedTasks(parsed);
      const existingTaskKeys = new Set(this.tasks.flatMap((task) => this.getTaskKeys(task)));
      const tasksToAdd = importedTasks.filter((task) => {
        const keys = this.getTaskKeys(task);
        const isNewTask = keys.every((key) => !existingTaskKeys.has(key));

        if (!isNewTask) {
          return false;
        }

        keys.forEach((key) => existingTaskKeys.add(key));
        return true;
      });

      this.tasks = [...tasksToAdd, ...this.tasks];
      this.filter = 'all';
      this.saveTasks();
      this.showTransferStatus(
        tasksToAdd.length
          ? `Imported ${tasksToAdd.length} new ${tasksToAdd.length === 1 ? 'task' : 'tasks'} from ${file.name}.`
          : `No new tasks were imported from ${file.name}.`,
        'success',
      );
    } catch (error) {
      this.showTransferStatus(
        error instanceof Error ? error.message : 'Could not import that JSON file.',
        'error',
      );
    }
  };

  /**
   * Builds the dedupe keys used to decide whether a task already exists.
   */
  getTaskKeys(task) {
    const keys = [];
    const id = typeof task?.id === 'string' ? task.id.trim() : '';
    const text = typeof task?.text === 'string' ? task.text.trim().toLocaleLowerCase() : '';

    if (id) {
      keys.push(`id:${id}`);
    }

    if (text) {
      keys.push(`text:${text}`);
    }

    return keys;
  }

  /**
   * Normalizes a parsed JSON payload into the internal task shape.
   */
  normalizeImportedTasks(payload) {
    const rawTasks = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.tasks)
        ? payload.tasks
        : null;

    if (!rawTasks) {
      throw new Error('Import JSON must contain a tasks array.');
    }

    return rawTasks.map((task, index) => this.normalizeImportedTask(task, index));
  }

  /**
   * Validates a single imported task record.
   */
  normalizeImportedTask(task, index) {
    if (!task || typeof task !== 'object') {
      throw new Error(`Task ${index + 1} is not a valid object.`);
    }

    const text = typeof task.text === 'string' ? task.text.trim() : '';

    if (!text) {
      throw new Error(`Task ${index + 1} is missing task text.`);
    }

    const id = typeof task.id === 'string' && task.id.trim() ? task.id : crypto.randomUUID();
    const createdAt = typeof task.createdAt === 'string' && !Number.isNaN(Date.parse(task.createdAt))
      ? task.createdAt
      : new Date().toISOString();

    return {
      id,
      text,
      completed: Boolean(task.completed),
      createdAt,
      dueDate: task.dueDate ?? null,
      project: task.project ?? null,
      importance: task.importance ?? null,
      dependsOn: Array.isArray(task.dependsOn) ? task.dependsOn : [],
      workloadEstimate: typeof task.workloadEstimate === 'number' ? task.workloadEstimate : 4,
      workloadUncertainty: typeof task.workloadUncertainty === 'number' ? task.workloadUncertainty : 1,
      tags: Array.isArray(task.tags) ? task.tags : [],
      inProgress: Boolean(task.inProgress),
      sectionShortcut: task.sectionShortcut ?? null,
      section: task.section ?? null,
    };
  }

  getExportFileName() {
    const stamp = new Date().toISOString().slice(0, 10);
    return `task-manager-${stamp}.json`;
  }

  /**
   * Creates the widget instance and registers the page tools exposed over WebMCP.
   */
  registerWebMcpTools() {
    const registerTools = () => {
      const WebMCP = getWebMcpConstructor();

      if (!WebMCP) {
        this.webMcpStatus = window.__webmcpStatus === 'failed' ? 'failed' : 'loading';
        return false;
      }

      if (!window.webMCP) {
        window.webMCP = new WebMCP({
          color: '#2563eb',
          position: 'bottom-right',
          size: '48px',
          padding: '18px',
        });
      }

      const mcp = window.webMCP;

      if (!mcp || window[WEBMCP_TOOLS_KEY]) {
        this.webMcpStatus = 'ready';
        return true;
      }

      mcp.registerTool(
        'browse_tasks',
        'Browse the current task list and optionally filter it by status.',
        {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              enum: ['all', 'pending', 'completed'],
              description: 'Which task subset to return.',
            },
          },
        },
        (args = {}) => {
          const filter = args.filter || 'all';
          const tasks = this.getFilteredTasks(filter, this.projectFilter);
          const lines = tasks.length
            ? tasks.map((task, index) => `${index + 1}. [${task.completed ? 'x' : ' '}] ${task.text} (${task.id})`)
            : ['No tasks found for this filter.'];

          return {
            content: [
              {
                type: 'text',
                text: [`Filter: ${filter}`, ...lines].join('\n'),
              },
            ],
          };
        },
      );

      mcp.registerTool(
        'add_task',
        'Add a new task to the task list from chat.',
        {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The task text to add.',
            },
          },
          required: ['text'],
        },
        (args = {}) => {
          const text = String(args.text || '').trim();

          if (!text) {
            throw new Error('Task text is required.');
          }

          const task = {
            id: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: new Date().toISOString(),
          };

          this.tasks = [task, ...this.tasks];
          this.saveTasks();

          return {
            content: [
              {
                type: 'text',
                text: `Added task: ${task.text} (${task.id})`,
              },
            ],
          };
        },
      );

      mcp.registerTool(
        'complete_task',
        'Mark a task as completed by id or exact text match.',
        {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The task id to complete.',
            },
            text: {
              type: 'string',
              description: 'Exact task text to complete when id is not provided.',
            },
          },
        },
        (args = {}) => this.updateTaskCompletion(args, true),
      );

      mcp.registerTool(
        'delete_task',
        'Delete a task by id or exact text match.',
        {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The task id to delete.',
            },
            text: {
              type: 'string',
              description: 'Exact task text to delete when id is not provided.',
            },
          },
        },
        (args = {}) => this.deleteTaskFromTool(args),
      );

      window[WEBMCP_TOOLS_KEY] = true;
      this.webMcpStatus = 'ready';
      return true;
    };

    if (registerTools()) {
      return;
    }

    window.setTimeout(registerTools, 150);
    window.setTimeout(registerTools, 750);
  }

  /**
   * Returns the task list subset used by both the UI and the browse_tasks tool.
   */
  getFilteredTasks(filter, projectFilter = ALL_PROJECTS_FILTER) {
    return this.tasks.filter((task) => {
      if (!matchesProjectFilter(task, projectFilter)) {
        return false;
      }

      if (filter === 'pending') {
        return !task.completed;
      }

      if (filter === 'completed') {
        return task.completed;
      }

      return true;
    });
  }

  /**
   * Resolves a task either by id or by exact text match for tool-driven mutations.
   */
  findTask(args = {}) {
    const id = String(args.id || '').trim();
    const text = String(args.text || '').trim();

    if (id) {
      return this.tasks.find((task) => task.id === id) || null;
    }

    if (text) {
      return this.tasks.find((task) => task.text === text) || null;
    }

    return null;
  }

  /**
   * Shared completion update path used by WebMCP mutation tools.
   */
  updateTaskCompletion(args, completed) {
    const task = this.findTask(args);

    if (!task) {
      throw new Error('Task not found. Provide a valid id or exact text.');
    }

    this.tasks = this.tasks.map((item) =>
      item.id === task.id ? { ...item, completed } : item,
    );
    this.saveTasks();

    return {
      content: [
        {
          type: 'text',
          text: `${completed ? 'Completed' : 'Updated'} task: ${task.text} (${task.id})`,
        },
      ],
    };
  }

  /**
   * Deletes a task through the same lookup rules exposed to WebMCP callers.
   */
  deleteTaskFromTool(args) {
    const task = this.findTask(args);

    if (!task) {
      throw new Error('Task not found. Provide a valid id or exact text.');
    }

    this.tasks = this.tasks.filter((item) => item.id !== task.id);
    this.saveTasks();

    return {
      content: [
        {
          type: 'text',
          text: `Deleted task: ${task.text} (${task.id})`,
        },
      ],
    };
  }
}

customElements.define('task-manager-app', TaskManagerApp);
