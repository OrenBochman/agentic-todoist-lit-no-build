import { TodoistParserElement } from './todoist-parser-element.js';
import { normalizeSection, getTaskStatusShortcut } from './task-status.js';

const pad = (value) => String(value).padStart(2, '0');

const formatDateParts = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const extractDueToken = (input, parsedDue) => {
  const source = String(input || '');
  const explicit = source.match(/\b(\d{4}-\d{2}-\d{2}|\d{8})(?:\s+(\d{1,2}:\d{2}))?\b/);

  if (explicit) {
    const rawDate = explicit[1];
    const normalizedDate = rawDate.length === 8
      ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
      : rawDate;
    return explicit[2] ? `${normalizedDate} ${explicit[2]}` : normalizedDate;
  }

  if (!parsedDue || Number.isNaN(parsedDue.getTime())) {
    return null;
  }

  if (/\btoday\b/i.test(source) || /\btomorrow\b/i.test(source)) {
    const dateToken = formatDateParts(parsedDue);
    const hasTime = /\b\d{1,2}:\d{2}\b/.test(source);
    return hasTime ? `${dateToken} ${pad(parsedDue.getHours())}:${pad(parsedDue.getMinutes())}` : dateToken;
  }

  return null;
};

const formatDueToken = (dueDate) => {
  if (!dueDate) {
    return '';
  }

  if (typeof dueDate === 'string') {
    const trimmed = dueDate.trim();
    if (!trimmed) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}(?: \d{1,2}:\d{2})?$/.test(trimmed)) {
      return trimmed;
    }

    const utcDateOnly = trimmed.match(/^(\d{4}-\d{2}-\d{2})T00:00:00(?:\.000)?Z$/);
    if (utcDateOnly) {
      return utcDateOnly[1];
    }
  }

  const date = dueDate instanceof Date ? dueDate : new Date(dueDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const dateToken = formatDateParts(date);
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;

  return hasTime ? `${dateToken} ${pad(date.getHours())}:${pad(date.getMinutes())}` : dateToken;
};

export const parseTaskInput = (input) => {
  const parsed = TodoistParserElement.parseTask(String(input || ''));
  const normalizedSection = normalizeSection(parsed.section);
  const dueToken = extractDueToken(input, parsed.due);

  return {
    text: parsed.title || String(input || '').trim(),
    dueDate: dueToken,
    project: parsed.project ?? null,
    importance: parsed.priority ?? null,
    dependsOn: [],
    workloadEstimate: 4,
    workloadUncertainty: 1,
    tags: parsed.labels ?? [],
    inProgress: normalizedSection?.status === 'in-progress',
    completed: normalizedSection?.status === 'done',
    sectionShortcut: normalizedSection?.shortcut ?? null,
    section: parsed.section ?? null,
  };
};

export const buildTaskInput = (task) => {
  if (!task) {
    return '';
  }

  const tokens = [];
  const text = String(task.text || '').trim();
  if (text) {
    tokens.push(text);
  }

  const dueToken = formatDueToken(task.dueDate);
  if (dueToken) {
    tokens.push(dueToken);
  }

  const project = String(task.project || '').trim();
  if (project) {
    tokens.push(`#${project}`);
  }

  if (Array.isArray(task.tags)) {
    tokens.push(...task.tags.map((tag) => `@${String(tag).trim()}`).filter((tag) => tag !== '@'));
  }

  if (typeof task.importance === 'number' && task.importance >= 1 && task.importance <= 4) {
    tokens.push(`p${task.importance}`);
  }

  const sectionShortcut = getTaskStatusShortcut(task);
  if (sectionShortcut) {
    tokens.push(sectionShortcut);
  }

  return tokens.join(' ').trim();
};
