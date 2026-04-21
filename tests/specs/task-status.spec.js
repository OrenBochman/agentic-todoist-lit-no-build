import { expect } from '../helpers/browser-test-harness.js';
import {
  getTaskStatus,
  getTaskStatusShortcut,
  normalizeSection,
} from '../../components/task-status.js';

describe('Task Status Unit Tests', () => {
  it('normalizes built-in section aliases to canonical status metadata', () => {
    expect(normalizeSection('/in')).to.deep.equal({ status: 'in-progress', shortcut: '/in' });
    expect(normalizeSection(' completed ')).to.deep.equal({ status: 'done', shortcut: '/done' });
    expect(normalizeSection('TODO')).to.deep.equal({ status: 'upcoming', shortcut: '/up' });
  });

  it('preserves unknown section names while still assigning a shortcut', () => {
    expect(normalizeSection('/review')).to.deep.equal({ status: 'review', shortcut: '/review' });
  });

  it('prefers sectionShortcut over section and boolean flags when choosing a shortcut', () => {
    expect(getTaskStatusShortcut({
      sectionShortcut: '/done',
      section: 'in',
      completed: false,
      inProgress: true,
    })).to.equal('/done');
  });

  it('derives status from normalized section data before falling back to booleans', () => {
    expect(getTaskStatus({
      section: 'upcoming',
      completed: true,
      inProgress: true,
    })).to.equal('upcoming');

    expect(getTaskStatus({
      completed: true,
      inProgress: false,
    })).to.equal('done');

    expect(getTaskStatus({
      completed: false,
      inProgress: true,
    })).to.equal('in-progress');
  });
});
