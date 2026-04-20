
import '../../components/todoist-parser-element.js';
import { expect } from '../helpers/browser-test-harness.js';


// Helper to mount the parser element
defineMount();
function defineMount() {
  if (!window.mountTodoistParser) {
    window.mountTodoistParser = () => {
      const el = document.createElement('todoist-parser');
      document.body.appendChild(el);
      return el;
    };
  }
}

describe('TodoistParser', () => {
  let parserEl;
  beforeEach(() => {
    parserEl = window.mountTodoistParser();
  });
  afterEach(() => {
    parserEl.remove();
  });

  it('parses project metadata', () => {
    const result = parserEl.parse('task #Work');
    expect(result.project).to.equal('Work');
  });

  it('parses section metadata', () => {
    const result = parserEl.parse('task /Section');
    expect(result.section).to.equal('Section');
  });

  it('parses multiple labels', () => {
    const result = parserEl.parse('task @a @b');
    expect(result.labels).to.deep.equal(['a', 'b']);
  });

  it('parses priority', () => {
    const result = parserEl.parse('task p1');
    expect(result.priority).to.equal(1);
  });

  it('parses ISO date', () => {
    const result = parserEl.parse('do it 2026-04-20');
    expect(result.due).to.not.equal(null);
  });

  it('parses today keyword', () => {
    const result = parserEl.parse('do it today');
    expect(result.due).to.not.equal(null);
  });

  it('parses tomorrow keyword', () => {
    const result = parserEl.parse('do it tomorrow');
    expect(result.due).to.not.equal(null);
  });

  it('parses time with date', () => {
    const result = parserEl.parse('meeting 2026-04-20 15:30');
    expect(result.due).to.not.equal(null);
  });

  it('handles missing metadata', () => {
    const result = parserEl.parse('plain task');
    expect(result.project).to.equal(null);
    expect(result.section).to.equal(null);
    expect(result.labels).to.deep.equal([]);
    expect(result.priority).to.equal(null);
  });

  it('handles garbage input', () => {
    const result = parserEl.parse('!!! ### @@ p9');
    expect(result.project).to.equal(null);
    expect(result.priority).to.equal(null);
  });

  it('dispatches parsed event', (done) => {
    parserEl.addEventListener('parsed', (e) => {
      expect(e.detail.project).to.equal('Work');
      done();
    });
    parserEl.parse('task #Work');
  });
});
