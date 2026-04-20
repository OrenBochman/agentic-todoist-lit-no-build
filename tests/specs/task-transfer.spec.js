import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import {
  clearTaskManagerStorage,
  mountTaskManagerApp,
  setFileList,
  forceLayoutReflow,
} from '../fixtures/task-manager-app.fixture.js';

let fixture;

const SEEDED_TASKS = [
  {
    id: 'seed-task',
    text: 'Seed task',
    completed: false,
    createdAt: '2026-04-14T00:00:00.000Z',
    dueDate: null,
    project: null,
    importance: null,
    dependsOn: [],
    workloadEstimate: 4,
    workloadUncertainty: 1,
    tags: [],
  },
];

const getTransferButtons = () => [...fixture.transferShadow.querySelectorAll('wa-button')];

const getFileInput = () => fixture.transferShadow.querySelector('#file-input');

const getBoardTexts = () => [...fixture.board.shadowRoot.querySelectorAll('task-item')].map((item) => item.task?.text);

const dispatchImport = async (file) => {
  const fileInput = getFileInput();
  setFileList(fileInput, file);
  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  await waitForRender();
  await Promise.resolve();
  if (fixture.app?.updateComplete) {
    await fixture.app.updateComplete;
  }
  if (fixture.snackbar?.updateComplete) {
    await fixture.snackbar.updateComplete;
  }
  await waitForRender();
};

const setShellWidth = async (width) => {
  fixture.appShadow.querySelector('.shell').style.width = width;
  await waitForRender();
  await forceLayoutReflow();
};

const expectButtonsOnSameRow = () => {
  const [importButton, exportButton] = getTransferButtons();
  const importRect = importButton.getBoundingClientRect();
  const exportRect = exportButton.getBoundingClientRect();

  expect(importButton.offsetParent, 'Import button should be visible.').to.not.equal(null);
  expect(exportButton.offsetParent, 'Export button should be visible.').to.not.equal(null);
  expect(Math.abs(importRect.top - exportRect.top), 'Buttons should be on the same row.').to.be.lessThan(10);
  expect(importRect.right, 'Import and Export buttons should not overlap horizontally.').to.be.lessThan(exportRect.left);
};

const captureExport = async () => {
  const [, exportButton] = getTransferButtons();
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

  try {
    exportButton.click();
    await waitForRender();
    await blobTextReady;
  } finally {
    window.URL.createObjectURL = originalCreateObjectUrl;
    window.URL.revokeObjectURL = originalRevokeObjectUrl;
    HTMLAnchorElement.prototype.click = originalClick;
  }

  return { capturedDownload, capturedJson };
};

const createImportFile = (name, tasks) =>
  new File([JSON.stringify({ tasks })], name, { type: 'application/json' });

describe('Task Transfer Regression', () => {
  beforeEach(async () => {
    fixture = await mountTaskManagerApp({ tasks: SEEDED_TASKS });
  });

  afterEach(() => {
    clearTaskManagerStorage();
  });

  it('should handle import of malformed JSON gracefully', async () => {
    const invalidFile = new File(['{"tasks": ['], 'broken.json', { type: 'application/json' });

    await dispatchImport(invalidFile);

    expect(fixture.app.transferStatusTone, 'Transfer status tone should be error after invalid JSON.').to.equal('error');
    expect(fixture.snackbar.open, 'Snackbar should be open after invalid JSON.').to.equal(true);
    expect(fixture.snackbar.shadowRoot.querySelector('.message')?.textContent?.trim().length, 'Snackbar message should be non-empty after invalid JSON.').to.be.greaterThan(0);
  });

  it('should export and import with no tasks without error', async () => {
    fixture.app.tasks = [];
    fixture.app.saveTasks();
    await waitForRender();

    const { capturedJson } = await captureExport();
    const parsed = JSON.parse(capturedJson);
    expect(parsed.tasks.length, 'Exported JSON should have zero tasks.').to.equal(0);

    await dispatchImport(new File([capturedJson], 'empty.json', { type: 'application/json' }));

    expect(fixture.app.tasks.length, 'No tasks should be present after importing empty export.').to.equal(0);
  });

  it('transfer card renders after board', () => {
    const boardElement = fixture.appShadow.querySelector('task-board');
    const transferCard = fixture.transfer.closest('.panel')?.parentElement;
    expect(boardElement, 'Board element should exist.').to.exist;
    expect(transferCard?.classList.contains('transfer-card'), 'Transfer card should have transfer-card class.').to.equal(true);
    expect(boardElement.nextElementSibling, 'Transfer card should be after board.').to.equal(transferCard);
  });

  it('transfer card has Import and Export buttons', () => {
    const buttonLabels = getTransferButtons().map((button) => button.textContent?.trim());
    expect(buttonLabels, 'Transfer card should have Import and Export buttons.').to.deep.equal(['Import', 'Export']);
  });

  it('transfer card renders app-level snackbar', () => {
    expect(fixture.snackbar, 'App-level snackbar should exist for feedback.').to.exist;
  });

  it('transfer layout: wide width keeps buttons side by side', async () => {
    await setShellWidth('900px');
    expectButtonsOnSameRow();
  });

  it('transfer layout: just above collapse breakpoint keeps buttons side by side', async () => {
    await setShellWidth('353px');
    expectButtonsOnSameRow();
  });

  it('transfer layout: below collapse breakpoint keeps buttons side by side', async () => {
    await setShellWidth('280px');
    expectButtonsOnSameRow();
  });

  it('transfer controls are visually below the board', () => {
    const boardElement = fixture.appShadow.querySelector('task-board');
    const transferCard = fixture.transfer.closest('.panel')?.parentElement;
    expect(boardElement.nextElementSibling, 'Transfer card should be after board.').to.equal(transferCard);
  });

  it('export feature creates a portable JSON payload', async () => {
    const { capturedDownload, capturedJson } = await captureExport();

    const parsed = JSON.parse(capturedJson);
    expect(capturedDownload.endsWith('.json'), 'Exported file should have .json extension.').to.equal(true);
    expect(parsed.version, 'Exported JSON should have version 1.').to.equal(1);
    expect(Array.isArray(parsed.tasks), 'Exported JSON should have tasks array.').to.equal(true);
    expect(parsed.tasks[0]?.text, 'Exported JSON should include the current task.').to.equal('Seed task');
  });

  it('export feature opens success feedback', async () => {
    await captureExport();

    expect(fixture.app.transferStatusTone, 'Export should set transferStatusTone to success.').to.equal('success');
    expect(fixture.snackbar.open, 'Snackbar should be open after export.').to.equal(true);
    expect(fixture.snackbar.message, 'Snackbar message should confirm export.').to.contain('Exported 1 task to JSON.');
  });

  it('import merge adds only missing tasks from JSON', async () => {
    const importFile = new File([
      JSON.stringify({
        version: 1,
        tasks: [
          {
            id: 'seed-task',
            text: 'Seed task',
            completed: true,
            createdAt: '2026-04-14T01:00:00.000Z',
            dueDate: null,
            project: null,
            importance: null,
            dependsOn: [],
            workloadEstimate: 4,
            workloadUncertainty: 1,
            tags: [],
          },
          {
            id: 'imported-task',
            text: 'Imported task',
            completed: true,
            createdAt: '2026-04-14T01:00:00.000Z',
            dueDate: null,
            project: null,
            importance: null,
            dependsOn: [],
            workloadEstimate: 4,
            workloadUncertainty: 1,
            tags: [],
          },
        ],
      }),
    ], 'tasks.json', { type: 'application/json' });

    await dispatchImport(importFile);

    const renderedItems = getBoardTexts();
    expect(fixture.app.tasks.length, 'App should have two tasks after import.').to.equal(2);
    expect(fixture.app.tasks[0]?.text, 'Imported task should be first.').to.equal('Imported task');
    expect(fixture.app.tasks[0]?.completed, 'Imported task should be completed.').to.equal(true);
    expect(fixture.app.tasks[1]?.text, 'Seed task should be second.').to.equal('Seed task');
    expect(fixture.app.tasks[1]?.completed, 'Seed task should remain not completed.').to.equal(false);
    expect(fixture.app.filter, 'Filter should reset to all after import.').to.equal('all');
    expect(renderedItems, 'Rendered items should include imported and seed tasks.').to.include('Imported task');
    expect(renderedItems, 'Rendered items should include imported and seed tasks.').to.include('Seed task');
    expect(fixture.app.transferStatusMessage, 'Transfer status message should confirm import.').to.contain('Imported 1 new task from tasks.json.');
    expect(fixture.snackbar.open, 'Snackbar should be open after import.').to.equal(true);
  });

  it('existing-only import skips duplicates and reports no-op feedback', async () => {
    const beforeSnapshot = JSON.stringify(fixture.app.tasks);
    const importFile = createImportFile('existing-only.json', [
      {
        id: 'seed-task',
        text: 'Seed task',
        completed: false,
        createdAt: '2026-04-14T00:00:00.000Z',
        dueDate: null,
        project: null,
        importance: null,
        dependsOn: [],
        workloadEstimate: 4,
        workloadUncertainty: 1,
        tags: [],
      },
    ]);

    await dispatchImport(importFile);

    expect(JSON.stringify(fixture.app.tasks), 'App state should be unchanged after duplicate import.').to.equal(beforeSnapshot);
    expect(fixture.app.transferStatusMessage, 'Transfer status message should report no new tasks.').to.equal('No new tasks were imported from existing-only.json.');
    expect(fixture.snackbar.message, 'Snackbar message should report no new tasks.').to.equal('No new tasks were imported from existing-only.json.');
  });

  it('duplicate rows in import file are only added once and report success', async () => {
    const repeatedFile = createImportFile('repeated.json', [
      {
        id: 'repeat-a',
        text: 'Repeated import task',
        completed: false,
        createdAt: '2026-04-14T02:00:00.000Z',
        dueDate: null,
        project: null,
        importance: null,
        dependsOn: [],
        workloadEstimate: 4,
        workloadUncertainty: 1,
        tags: [],
      },
      {
        id: 'repeat-a',
        text: 'Repeated import task',
        completed: false,
        createdAt: '2026-04-14T02:00:00.000Z',
        dueDate: null,
        project: null,
        importance: null,
        dependsOn: [],
        workloadEstimate: 4,
        workloadUncertainty: 1,
        tags: [],
      },
    ]);

    await dispatchImport(repeatedFile);

    const repeatedTasks = fixture.app.tasks.filter((task) => task.text === 'Repeated import task');
    expect(repeatedTasks.length, 'Duplicate entries should only be added once.').to.equal(1);
    expect(fixture.app.transferStatusMessage, 'Transfer status message should confirm import.').to.equal('Imported 1 new task from repeated.json.');
    expect(fixture.snackbar.open, 'Snackbar should be open after duplicate import.').to.equal(true);
  });

  it('invalid JSON import avoids mutation and surfaces error feedback', async () => {
    const repeatedFile = createImportFile('repeated.json', [
      {
        id: 'repeat-a',
        text: 'Repeated import task',
        completed: false,
        createdAt: '2026-04-14T02:00:00.000Z',
        dueDate: null,
        project: null,
        importance: null,
        dependsOn: [],
        workloadEstimate: 4,
        workloadUncertainty: 1,
        tags: [],
      },
    ]);

    await dispatchImport(repeatedFile);

    const beforeSnapshot = JSON.stringify(fixture.app.tasks);
    const invalidFile = new File(['{"tasks": ['], 'broken.json', { type: 'application/json' });

    await dispatchImport(invalidFile);

    expect(JSON.stringify(fixture.app.tasks), 'App state should not change after invalid JSON import.').to.equal(beforeSnapshot);
    expect(fixture.app.transferStatusTone, 'Transfer status tone should be error after invalid JSON.').to.equal('error');
    expect(fixture.snackbar.open, 'Snackbar should be open after invalid JSON.').to.equal(true);
    expect(fixture.snackbar.shadowRoot.querySelector('.message')?.textContent?.trim().length, 'Snackbar message should be non-empty after invalid JSON.').to.be.greaterThan(0);
  });
});
