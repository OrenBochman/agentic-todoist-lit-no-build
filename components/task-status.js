const SECTION_STATUS_MAP = {
  backlog: { status: 'upcoming', shortcut: '/up' },
  complete: { status: 'done', shortcut: '/done' },
  completed: { status: 'done', shortcut: '/done' },
  done: { status: 'done', shortcut: '/done' },
  in: { status: 'in-progress', shortcut: '/in' },
  inprogress: { status: 'in-progress', shortcut: '/in' },
  progress: { status: 'in-progress', shortcut: '/in' },
  todo: { status: 'upcoming', shortcut: '/up' },
  up: { status: 'upcoming', shortcut: '/up' },
  upcoming: { status: 'upcoming', shortcut: '/up' },
};

const normalizeToken = (value) => String(value || '')
  .trim()
  .replace(/^\//, '')
  .toLowerCase();

export const normalizeSection = (section) => {
  const token = normalizeToken(section);
  return token ? SECTION_STATUS_MAP[token] ?? { status: token, shortcut: `/${token}` } : null;
};

export const getTaskStatusShortcut = (task) => {
  const normalizedShortcut = normalizeSection(task?.sectionShortcut);
  if (normalizedShortcut?.shortcut) {
    return normalizedShortcut.shortcut;
  }

  const normalizedSection = normalizeSection(task?.section);
  if (normalizedSection?.shortcut) {
    return normalizedSection.shortcut;
  }

  if (task?.completed) {
    return '/done';
  }

  if (task?.inProgress) {
    return '/in';
  }

  return '/up';
};

export const getTaskStatus = (task) => {
  const normalizedShortcut = normalizeSection(task?.sectionShortcut);
  if (normalizedShortcut?.status) {
    return normalizedShortcut.status;
  }

  const normalizedSection = normalizeSection(task?.section);
  if (normalizedSection?.status) {
    return normalizedSection.status;
  }

  if (task?.completed) {
    return 'done';
  }

  if (task?.inProgress) {
    return 'in-progress';
  }

  return 'upcoming';
};
