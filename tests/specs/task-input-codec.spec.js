import '../../components/todoist-parser-element.js';
import { expect } from '../helpers/browser-test-harness.js';
import { buildTaskInput, parseTaskInput } from '../../components/task-input-codec.js';

const pad = (value) => String(value).padStart(2, '0');
const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

describe('Task Input Codec Unit Tests', () => {
  it('parses compact ISO dates, metadata, and completed sections into normalized task fields', () => {
    const result = parseTaskInput('close launch 20260502 09:30 #Work @ops p1 /done');

    expect(result).to.deep.equal({
      text: 'close launch',
      dueDate: '2026-05-02 09:30',
      project: 'Work',
      importance: 1,
      dependsOn: [],
      workloadEstimate: 4,
      workloadUncertainty: 1,
      tags: ['ops'],
      inProgress: false,
      completed: true,
      sectionShortcut: '/done',
      section: 'done',
    });
  });

  it('normalizes keyword dates into explicit due tokens while preserving section aliases', () => {
    const expectedDate = formatDate(new Date());
    const result = parseTaskInput('ship today 07:45 /in');

    expect(result.text).to.equal('ship');
    expect(result.dueDate).to.equal(`${expectedDate} 07:45`);
    expect(result.sectionShortcut).to.equal('/in');
    expect(result.section).to.equal('in');
    expect(result.inProgress).to.equal(true);
    expect(result.completed).to.equal(false);
  });

  it('rebuilds a task string from trimmed task fields and UTC date-only values', () => {
    const input = buildTaskInput({
      text: '  Review roadmap  ',
      dueDate: '2026-05-03T00:00:00.000Z',
      project: ' Work ',
      importance: 2,
      tags: ['planning', ' team ', ''],
      completed: false,
      inProgress: true,
      sectionShortcut: '/in',
      section: 'up',
    });

    expect(input).to.equal('Review roadmap 2026-05-03 #Work @planning @team p2 /in');
  });

  it('falls back to derived status flags when rebuilding tasks without explicit section fields', () => {
    const completedInput = buildTaskInput({
      text: 'Ship docs',
      dueDate: null,
      project: null,
      importance: null,
      tags: [],
      completed: true,
      inProgress: false,
      sectionShortcut: null,
      section: null,
    });

    const upcomingInput = buildTaskInput({
      text: 'Triage inbox',
      dueDate: null,
      project: null,
      importance: null,
      tags: [],
      completed: false,
      inProgress: false,
      sectionShortcut: null,
      section: null,
    });

    expect(completedInput).to.equal('Ship docs /done');
    expect(upcomingInput).to.equal('Triage inbox /up');
  });
});
