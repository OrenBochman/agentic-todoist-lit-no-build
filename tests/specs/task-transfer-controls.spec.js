import { expect, waitForRender } from '../helpers/browser-test-harness.js';
import { mountTaskTransferControls, setFileList } from '../fixtures/task-transfer-controls.fixture.js';

describe('Task Transfer Controls Unit Tests', () => {
  let fixture;

  beforeEach(async () => {
    fixture = await mountTaskTransferControls();
  });

  it('renders Import and Export buttons', () => {
    const labels = fixture.buttons.map((button) => button.textContent?.trim());
    expect(labels, 'Transfer controls should render Import and Export buttons.').to.deep.equal(['Import', 'Export']);
  });

  it('clicking Import opens the hidden file input', async () => {
    const [importButton] = fixture.buttons;
    const originalClick = fixture.fileInput.click;
    let clicked = false;

    fixture.fileInput.click = () => {
      clicked = true;
    };

    importButton.click();
    await waitForRender();

    fixture.fileInput.click = originalClick;

    expect(clicked, 'Import button should trigger the hidden file input click.').to.equal(true);
  });

  it('file selection emits tasks-import with the chosen file', async () => {
    const importFile = new File(['{"tasks":[]}'], 'tasks.json', { type: 'application/json' });
    let emittedDetail = null;

    fixture.transfer.addEventListener('tasks-import', (event) => {
      emittedDetail = event.detail;
    }, { once: true });

    setFileList(fixture.fileInput, importFile);
    fixture.fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await waitForRender();

    expect(emittedDetail?.file, 'tasks-import should include the chosen file.').to.equal(importFile);
    expect(fixture.fileInput.value, 'The file input should reset after emitting tasks-import.').to.equal('');
  });

  it('clicking Export emits tasks-export', async () => {
    const exportButton = fixture.buttons[1];
    let emitted = false;

    fixture.transfer.addEventListener('tasks-export', () => {
      emitted = true;
    }, { once: true });

    exportButton.click();
    await waitForRender();

    expect(emitted, 'Export button should emit tasks-export.').to.equal(true);
  });
});
