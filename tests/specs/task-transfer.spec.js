import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import {
  clearTaskManagerStorage,
  mountTaskManagerApp,
  setFileList,
} from '../fixtures/task-manager-app.fixture.js';

const SEEDED_TASKS = [
  {
    id: 'seed-task',
    text: 'Seed task',
    completed: false,
    createdAt: '2026-04-14T00:00:00.000Z',
  },
];

describe('Task Transfer Regression', () => {
  let fixture;

  beforeEach(async () => {
    fixture = await mountTaskManagerApp({ tasks: SEEDED_TASKS });
  });

  afterEach(() => {
    clearTaskManagerStorage();
  });

  it('transfer card feature renders below the board with Import and Export controls in task-manager-app', () => {
    const boardElement = fixture.appShadow.querySelector('task-board');
    const transferCard = fixture.transfer.closest('.panel')?.parentElement;
    const buttonLabels = [...fixture.transferShadow.querySelectorAll('wa-button')].map((button) => button.textContent?.trim());

    // Assert: the transfer controls render in their own card after the board, and the app-level snackbar exists for feedback.
    expect(boardElement).to.exist;
    expect(transferCard?.classList.contains('transfer-card')).to.equal(true);
    expect(boardElement.nextElementSibling).to.equal(transferCard);
    expect(fixture.snackbar).to.exist;
    expect(buttonLabels).to.deep.equal(['Import', 'Export']);
  });

  it('transfer layout feature keeps left third, empty middle third, and right third until the collapse breakpoint in task-transfer-controls', async () => {
    fixture.appShadow.querySelector('.shell').style.width = '900px';
    await waitForRender();

    const wideButtons = fixture.transferShadow.querySelector('.buttons');
    const [importButton, exportButton] = fixture.transferShadow.querySelectorAll('wa-button');
    const wideColumns = getComputedStyle(wideButtons).gridTemplateColumns.split(' ').filter(Boolean);
    const importRect = importButton.getBoundingClientRect();
    const exportRect = exportButton.getBoundingClientRect();
    const rowRect = wideButtons.getBoundingClientRect();
    const expectedThird = (rowRect.width - 20) / 3;
    const middleGap = exportRect.left - importRect.right;

    // Assert: wide layouts size each button to one third, anchor them to opposite edges, and leave the center third empty.
    expect(wideColumns.length).to.equal(3);
    expect(Math.abs(importRect.width - expectedThird)).to.be.lessThan(3);
    expect(Math.abs(exportRect.width - expectedThird)).to.be.lessThan(3);
    expect(Math.abs(importRect.left - rowRect.left)).to.be.lessThan(3);
    expect(Math.abs(exportRect.right - rowRect.right)).to.be.lessThan(3);
    expect(Math.abs(middleGap - expectedThird)).to.be.lessThan(6);

    fixture.appShadow.querySelector('.shell').style.width = '353px';
    await waitForRender();
    const narrowColumns = getComputedStyle(fixture.transferShadow.querySelector('.buttons')).gridTemplateColumns.split(' ').filter(Boolean);

    fixture.appShadow.querySelector('.shell').style.width = '280px';
    await waitForRender();
    const stackedColumns = getComputedStyle(fixture.transferShadow.querySelector('.buttons')).gridTemplateColumns.split(' ').filter(Boolean);

    // Assert: the button row stays three columns through the hero width, then stacks at the shared collapse breakpoint.
    expect(narrowColumns.length).to.equal(3);
    expect(stackedColumns.length).to.equal(1);
  });

  it('export feature creates a portable JSON payload and opens success feedback in task-manager-app', async () => {
    const [, exportButton] = fixture.transferShadow.querySelectorAll('wa-button');
    let capturedDownload = '';
    let capturedJson = '';
    let resolveBlobText = () => {};
    const blobTextReady = new Promise((resolve) => {
      resolveBlobText = resolve;
    });
    const originalCreateObjectUrl = window.URL.createObjectURL;
    const originalRevokeObjectUrl = window.URL.revokeObjectURL;
    const originalClick = HTMLAnchorElement.prototype.click;

    window.URL.createObjectURL = (blob) => {
      blob.text().then((text) => {
        capturedJson = text;
        resolveBlobText();
      });
      return 'blob:test-export';
    };
    window.URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function click() {
      capturedDownload = this.download;
    };

    exportButton.click();
    await waitForRender();
    await blobTextReady;

    window.URL.createObjectURL = originalCreateObjectUrl;
    window.URL.revokeObjectURL = originalRevokeObjectUrl;
    HTMLAnchorElement.prototype.click = originalClick;

    const parsed = JSON.parse(capturedJson);

    // Assert: export writes versioned JSON, includes the current tasks, and opens success feedback through the snackbar.
    expect(capturedDownload.endsWith('.json')).to.equal(true);
    expect(parsed.version).to.equal(1);
    expect(Array.isArray(parsed.tasks)).to.equal(true);
    expect(parsed.tasks[0]?.text).to.equal('Seed task');
    expect(fixture.app.transferStatusTone).to.equal('success');
    expect(fixture.snackbar.open).to.equal(true);
    expect(fixture.snackbar.message).to.contain('Exported 1 task to JSON.');
  });

  it('import merge feature adds only missing tasks from JSON in task-manager-app', async () => {
    const fileInput = fixture.transferShadow.querySelector('#file-input');
    const importFile = new File([
      JSON.stringify({
        version: 1,
        tasks: [
          {
            id: 'seed-task',
            text: 'Seed task',
            completed: true,
            createdAt: '2026-04-14T01:00:00.000Z',
          },
          {
            id: 'imported-task',
            text: 'Imported task',
            completed: true,
            createdAt: '2026-04-14T01:00:00.000Z',
          },
        ],
      }),
    ], 'tasks.json', { type: 'application/json' });

    setFileList(fileInput, importFile);
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await waitForRender();

    const renderedItems = [...fixture.board.shadowRoot.querySelectorAll('task-item')].map((item) => item.task?.text);

    // Assert: import preserves the existing task, adds only the new task, resets filter state, and surfaces success feedback.
    expect(fixture.app.tasks.length).to.equal(2);
    expect(fixture.app.tasks[0]?.text).to.equal('Imported task');
    expect(fixture.app.tasks[0]?.completed).to.equal(true);
    expect(fixture.app.tasks[1]?.text).to.equal('Seed task');
    expect(fixture.app.tasks[1]?.completed).to.equal(false);
    expect(fixture.app.filter).to.equal('all');
    expect(renderedItems).to.include('Imported task');
    expect(renderedItems).to.include('Seed task');
    expect(fixture.app.transferStatusMessage).to.contain('Imported 1 new task from tasks.json.');
    expect(fixture.snackbar.open).to.equal(true);
  });

  it('existing-only import feature skips duplicates and reports no-op feedback in task-manager-app', async () => {
    const fileInput = fixture.transferShadow.querySelector('#file-input');
    const beforeSnapshot = JSON.stringify(fixture.app.tasks);
    const importFile = new File([
      JSON.stringify({
        tasks: [
          {
            id: 'seed-task',
            text: 'Seed task',
            completed: false,
            createdAt: '2026-04-14T00:00:00.000Z',
          },
        ],
      }),
    ], 'existing-only.json', { type: 'application/json' });

    setFileList(fileInput, importFile);
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await waitForRender();

    // Assert: an import containing only existing tasks leaves state untouched and reports that nothing new was added.
    expect(JSON.stringify(fixture.app.tasks)).to.equal(beforeSnapshot);
    expect(fixture.app.transferStatusMessage).to.equal('No new tasks were imported from existing-only.json.');
    expect(fixture.snackbar.message).to.equal('No new tasks were imported from existing-only.json.');
  });

  it('duplicate rows and invalid JSON feature avoid mutation and surface correct feedback in task-manager-app', async () => {
    const fileInput = fixture.transferShadow.querySelector('#file-input');
    const repeatedFile = new File([
      JSON.stringify({
        tasks: [
          {
            id: 'repeat-a',
            text: 'Repeated import task',
            completed: false,
            createdAt: '2026-04-14T02:00:00.000Z',
          },
          {
            id: 'repeat-a',
            text: 'Repeated import task',
            completed: false,
            createdAt: '2026-04-14T02:00:00.000Z',
          },
        ],
      }),
    ], 'repeated.json', { type: 'application/json' });

    setFileList(fileInput, repeatedFile);
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await waitForRender();

    const repeatedTasks = fixture.app.tasks.filter((task) => task.text === 'Repeated import task');

    // Assert: duplicate entries within a single import file are only added once and still report a successful import.
    expect(repeatedTasks.length).to.equal(1);
    expect(fixture.app.transferStatusMessage).to.equal('Imported 1 new task from repeated.json.');
    expect(fixture.snackbar.open).to.equal(true);

    const beforeSnapshot = JSON.stringify(fixture.app.tasks);
    const invalidFile = new File(['{"tasks": ['], 'broken.json', { type: 'application/json' });

    setFileList(fileInput, invalidFile);
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await waitForRender();

    // Assert: invalid JSON does not mutate tasks, flips feedback into error tone, and renders a snackbar message.
    expect(JSON.stringify(fixture.app.tasks)).to.equal(beforeSnapshot);
    expect(fixture.app.transferStatusTone).to.equal('error');
    expect(fixture.snackbar.open).to.equal(true);
    expect(fixture.snackbar.shadowRoot.querySelector('.message')?.textContent?.trim().length).to.be.greaterThan(0);
  });
});