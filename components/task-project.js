export const ALL_PROJECTS_FILTER = 'all-projects';
export const DEFAULT_PROJECT_FILTER = 'default-project';
export const DEFAULT_PROJECT_LABEL = 'Default Project';

export const normalizeTaskProject = (project) => {
  const normalized = String(project || '').trim();
  return normalized || null;
};

export const getTaskProjectFilterValue = (task) => normalizeTaskProject(task?.project) ?? DEFAULT_PROJECT_FILTER;

export const getProjectFilterLabel = (projectFilter) =>
  projectFilter === DEFAULT_PROJECT_FILTER ? DEFAULT_PROJECT_LABEL : projectFilter;

export const isNamedProjectFilter = (projectFilter) =>
  projectFilter !== ALL_PROJECTS_FILTER && projectFilter !== DEFAULT_PROJECT_FILTER && Boolean(normalizeTaskProject(projectFilter));

export const getProjectFilterOptions = (tasks = []) => {
  const projectNames = new Set();
  let hasDefaultProject = false;

  for (const task of tasks) {
    const normalizedProject = normalizeTaskProject(task?.project);
    if (normalizedProject) {
      projectNames.add(normalizedProject);
    } else {
      hasDefaultProject = true;
    }
  }

  const namedProjects = [...projectNames].sort((left, right) => left.localeCompare(right));
  return [
    { value: ALL_PROJECTS_FILTER, label: 'All Projects' },
    ...(hasDefaultProject || tasks.length === 0
      ? [{ value: DEFAULT_PROJECT_FILTER, label: DEFAULT_PROJECT_LABEL }]
      : []),
    ...namedProjects.map((project) => ({ value: project, label: project })),
  ];
};

export const matchesProjectFilter = (task, projectFilter) =>
  projectFilter === ALL_PROJECTS_FILTER || getTaskProjectFilterValue(task) === projectFilter;
