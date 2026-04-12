import { LitElement, css, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './components/task-composer.js';
import './components/task-board.js';
import './components/task-hero.js';

const STORAGE_KEY = 'task-manager-items';
const THEME_STORAGE_KEY = 'task-manager-theme';
const WEBMCP_TOOLS_KEY = '__taskManagerWebMcpToolsRegistered';

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
class TaskManagerApp extends LitElement {
  static properties = {
    filter: { state: true },
    tasks: { state: true },
    theme: { state: true },
    webMcpStatus: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    .shell {
      width: min(980px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 48px 0 72px;
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
    this.filter = 'all';
    this.tasks = this.loadTasks();
    this.theme = this.loadTheme();
    this.webMcpStatus = window.__webmcpStatus || 'loading';
  }

  connectedCallback() {
    super.connectedCallback();
    this.applyTheme();
    this.syncWebMcpStatus();
    this.registerWebMcpTools();
  }

  render() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter((task) => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    return html`
      <main class="shell">
        <section aria-label="Task manager overview">
          <task-hero
            total-tasks=${totalTasks}
            pending-tasks=${pendingTasks}
            completed-tasks=${completedTasks}
            theme=${this.theme}
            webmcp-status=${this.webMcpStatus}
            @theme-toggle=${this.toggleTheme}
          ></task-hero>
        </section>

        <section class="board" aria-label="Task list">
          <article class="card composer-card">
            <div class="panel">
              <task-composer @task-add=${this.handleTaskAdd}></task-composer>
            </div>
          </article>

          <task-board
            .filter=${this.filter}
            .tasks=${/** @type {any} */ (this.tasks)}
            @filter-change=${this.handleFilterChange}
            @task-toggle=${this.handleTaskToggle}
            @task-delete=${this.handleTaskDelete}
          ></task-board>
        </section>
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

  saveTasks() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    } catch {
      return;
    }
  }

  saveTheme() {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, this.theme);
    } catch {
      return;
    }
  }

  applyTheme() {
    document.documentElement.dataset.theme = this.theme;
  }

  toggleTheme = () => {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    this.saveTheme();
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
    const taskText = event.detail.text;
    this.tasks = [
      {
        id: crypto.randomUUID(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...this.tasks,
    ];
    this.saveTasks();
  }

  /**
   * Keeps the active filter in the root so WebMCP and UI stay in sync.
   */
  handleFilterChange(event) {
    this.filter = event.detail.filter;
  }

  /**
   * Toggles completion state for the requested task id.
   */
  handleTaskToggle(event) {
    const taskId = event.detail.taskId;
    this.tasks = this.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
    this.saveTasks();
  }

  /**
   * Removes the requested task and persists the updated collection.
   */
  handleTaskDelete(event) {
    const taskId = event.detail.taskId;
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.saveTasks();
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
          const tasks = this.getFilteredTasks(filter);
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
  getFilteredTasks(filter) {
    if (filter === 'pending') {
      return this.tasks.filter((task) => !task.completed);
    }

    if (filter === 'completed') {
      return this.tasks.filter((task) => task.completed);
    }

    return this.tasks;
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