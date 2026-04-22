# Todoist Agent Coding Guidelines


# Project Overview

- This is a project management PWA with views inspired by Todoist,
  Google Keep, Ms Project, and other popular task management tools
  constructed using web components.
- The tech stack is plain JavaScript Libraries that are loaded via CDN
  links without a build step.
- The app exposes tools via WebMCP to support agentic operations.

## Project Structure

    index.html                # App entry point, loads all scripts and styles via CDN
    script.js                 # Main app logic, Redux store integration, and root component wiring
    styles.css                # Global styles and theme variables
    components/               # All custom Lit and WebAwesome-based web components
    memory/                   # (Reserved for future use, currently empty)
    tests/                    # All test specs, fixtures, helpers, and regression dashboards
      all-regression-tests.html
      fixtures/               # Test fixtures for mounting and manipulating components
      helpers/                # Test harness and setup utilities
      specs/                  # Mocha/Chai test suites for all components and flows
      components/             # Regression dashboard UI components
    .github/                  # Project configuration, skills, and documentation
      copilot-instructions.md # Main coding guidelines (Markdown)
      copilot-instructions.qmd# Quarto/Markdown hybrid for publishing
      action-items.qmd        # Feature and bug roadmap
      feature-history.qmd     # Completed features log
      skills/                 # Custom skills for testing, branching, and debugging
    .vscode/                  # VS Code workspace settings and MCP server config
    README.md                 # Project overview and feature summary
    WEBAWESOME.md             # WebAwesome component usage notes

## Libraries and Frameworks

- Lit for building web components and managing reactive state within
  components.
- Webawesome for pre-built UI components to speed up development and
  ensure a consistent look and feel.
- Redux for global state management across the app, ensuring predictable
  state updates and easier debugging.
- Mocha and Chai for writing and running tests in the browser, providing
  a robust testing framework with support for asynchronous tests and
  rich assertions.
- WebMCP for exposing tools to support agentic operations from chat
  interfaces.

## Mandatory rules

1.  **Be Proactive** As a helpful coding assistant, you must not ask the
    human for permission for any task you can do yourself in the current
    environment. Default to action, not discussion.

> “Would you like to review the edit/save handler code next, or should I
> locate and audit it for you?” – NO! Just go do it.

> “I am adding a regression test and reviewing the code to find the most
> likely bugfixes” – YES! This is the kind of proactive helpfulness that
> is expected.

> Would you like me to reload the regression dashboard page now to rerun
> all tests and check if the recent patch fixed the failures? – NO! I
> expect you to refresh browser to re run the test and would like it
> even better if you just do it and not ask.

> Would you like me to debug and fix this so the <issue> is resolved ? –
> Yes that is your current task and you should complete it without
> needing a babysitter to hold your hand and tell you what to do every
> step of the way.

2.  **No Permission Loops** Do not ask variants of these questions:

- “Would you like me to…”
- “Should I…”
- “Do you want me to…”
- “I can also…”

If the next step is obvious and safe, do it. Report what you are doing
while you do it. Do not wait for confirmation unless the user explicitly
asked for options or a plan, or the action is destructive, risky,
blocked by missing credentials, or impossible without human input.

3.  **Make Real Progress Every Turn** Every substantial response should
    move the task forward with at least one concrete action such as:

- inspecting the relevant code
- reproducing the bug
- running or writing a regression test
- patching the implementation
- verifying the fix in the app or tests

Avoid endless commentary, generic debugging advice, or restating the
task without doing real work.

4.  **Use Tools Aggressively** Use the shared internal browser and other
    available tools to reproduce issues, inspect the running app, rerun
    tests, and collect console errors or stack traces. If there is no
    test for the current bug, run the app manually and investigate
    directly.

5.  **Ask for Help Only as a Last Resort** Only request assistance when
    you genuinely cannot proceed yourself, for example:

- missing credentials or external approvals
- destructive action that needs explicit confirmation
- ambiguity that would make a code change risky
- a blocker that cannot be discovered or resolved from the repo or tools

If you do need help, ask one precise question and explain what you
already tried.

6.  **Engage Bugs Directly** When you encounter an issue, do not
    deflect, sidestep, or work around it superficially. Identify the
    real failure mode and fix that before moving on.

7.  When bugs are found, fix them before moving on to the next task.

8.  **Finish the Job** Do not stop at diagnosis if you can also
    implement and verify the fix in the same session. The default
    workflow is:

9.  reproduce

10. inspect

11. patch

12. verify

13. report succinctly

## Features

Completed features are listed in [Feature History](Feature-History.md)
and the current feature roadmap is in the `Agenda` section of that file.

### Action Items

- Gantt view (feature branch Gantt-view;web component, tests, docs)
  - [x] Add a gantt view that shows tasks on a timeline based on their
    due dates and durations, allowing for easy visualization of task
    dependencies and scheduling.
  - [x] Add a view selector to toggle to the gantt view.
  - [x] support dragging an arrow from one task to another to indicate a
    dependency between the two tasks.
  - [ ] support highlighting tasks that are on the critical path in red.
  - [x] support dragging tasks to change their due dates and durations,
    with the gantt chart updating accordingly.
  - [x] support zooming in and out of the timeline for better visibility
    of tasks with different durations.
  - [x] visualize uncertainty with a boxplot whisker
  - [x] milestones are tasks with zero duration, and are visualized as
    diamonds on the gantt chart.
  - [x] shrink the note to a single line hide the badges and show just
    the title.
  - [x] add handles in the left center and right for
  - [x] drag the bars left/right using a handle in the the left tip -
    thus changing the start date of the task
  - [x] extend the duration by dragging a handle in the right tip
  - [x] drag an arrow to link a task that depends on the current task’s
    completion - by dragging a small handle from the center
  - [ ] support filtering tasks by project in the gantt view.
- BugsFixes (on bugfix branch Bug-fixes)
  - [ ] The testing dashboard filters don’t respond to clicks.
  - [ ] The task composer input should repond to enter as a submit
    action.
- Storage and Data

### Completed

- Libraries
  - [x] Integrated Lit from `https://unpkg.com/lit` and
    `https://unpkg.com/lit/decorators.js` with proper module imports and
    usage.
  - [x] Integrated Webawesome components from
    `https://unpkg.com/webawesome` for UI elements.
  - [x] Integrated the official WebMCP widget from
    `https://webmcp.dev/src/webmcp.js` and registered task tools for
    browsing, adding, completing, and deleting tasks from chat.
  - [x] Integrated Mocha for in-browser testing from
    `https://unpkg.com/mocha` with a basic test setup and reporting.
  - [x] Integrated Chai for assertions from `https://unpkg.com/chai`.
- Task management
  - [x] Add tasks
  - [x] Mark tasks as completed
  - [x] Delete tasks
- Task composer
  - [x] Use Webawesome `wa-input` and `wa-button` components for the add
    task composer, ensuring they are properly styled and functional
    across browsers and viewports.
  - [x] Keep the add-task composer compact, with the `+` button aligned
    to the input and matching its height.
- Storage and Data
  - [x] developed an initial task schema with `id`, `title`, and
    `completed` fields to represent tasks in the app.
  - [x] Persist tasks in localStorage
  - [x] Import/export tasks as JSON files to allow users to back up
    their tasks or transfer them between instances of the app.
  - [x] Add edit task by long-pressing a task to open an edit form,
    allowing users to modify existing tasks without needing to delete
    and recreate them.
  - [x] **Schema-Update** task schema for new fields to support due
    dates, projects, importance, depends on, work-load estimation,
    work-load uncertainty, and any other fields needed to support the
    new features.
  - [x] **Parser-Update** Add Todoist-style date, project, importance
    parsing (parser and unit tests, including
    todoist-parser-element.spec.js integrated in main regression suite)
  - [x] **Reducer-Pattern** Use a redux style reducer pattern for state
    management to ensure predictable state updates and easier debugging,
    especially as the app grows in complexity.
- Filtering
  - [x] Filter tasks by status
- WebMCP Integration
  - [x] Integrate the WebMCP widget \[blue box\]
  - [x] Register task tools for browsing, adding, completing, and
    deleting tasks from chat.
  - [x] Testing webMCP tools from chat to ensure they work as expected
    and provide a good user experience when accessed from chat.
- UI/UX
  - [x] Responsive design that maintains usability and visual integrity
    across a range of device sizes, from mobile to desktop, ensuring
    that task toggles and controls are easily accessible and not
    visually squished.
  - [x] Dark mode support with appropriate color choices for text,
    backgrounds, and controls to maintain readability and visual appeal
    in both light and dark themes.
  - [x] Adjust css to make the Counters able to shrink to minimal size,
  - [x] Use Atkinson Hyperlegible as the primary UI font.
  - [x] reduced ii foorprint by rename `ALL tasks` to `All` and
    `Completed` to `Done`.
- PWA
  - [x] Add an app icon
    `<wa-icon name="list-check" style="color: rgb(255, 212, 59);"></wa-icon>`
- Tests and Documentation
  - [x] no build testing using Mocha and Chai.
  - [x] Created a testing dashboard in `test/index.html` that runs Mocha
    tests in the browser and reports results.
  - [x] Regression test added for multiple issues
  - [x] Added some unit tests for edge cases.
  - [x] Added skill for writing refactoring xunit style tests
  - [x] Added skill bugfixing using hypothesis branches with Ishikawa
    diagrams, git progress charts, and counterfactual notes to keep
    track of complex bugfix efforts and retain knowledge from failed
    attempts in a blackboard and counterfactual
- Kanban View
  - [x] **kanban view** (web component, tests, docs)
  - [x] **Drag and Drop** improve the kan ban view to support drag and
    drop of task card between column. do this by adding
    drag-drop-element interface for task and a drop-target-element
    interface for the kanban column containers.  
    \[x\] add a project filter (based on a dropdown) in both views to
    only show tasks for a specific project. \[x\] when adding a task
    without a project and the project filter is active, add the task to
    the active project.

### Stretch goals

1.  [ ] deploy as a page on my blog.
2.  [ ] add ability to sign in via OAuth and sync tasks via a backend,
    firebase/supabase/google docs…
3.  [ ] and sync task via a backend, firebase/supabase/google docs…
4.  [ ] share tasks with other users…
5.  [ ] add my own insights about lit and webawesome. possible blog
    post.
6.  [ ] add a rl agent script.
7.  [ ] notifications for due dates and reminders.
8.  [ ] add a “focus mode” and a pomodoro timer.

## Architecture

- Keep each custom element in its own file.
- Prefer placing component styles inside the Lit component with
  `static styles` unless there is a specific reason not to.
- The root app coordinates shared state, persistence, theming, and
  WebMCP tool registration.
- Child components should own their local UI concerns and communicate
  upward with custom events.

## Code Style

- Screen real estate is limited, so minimize footprint of UI chrome and
  controls to maximize space for tasks.
- Use semantic HTML5 elements where possible in templates and rendered
  markup.
- Prefer modern JavaScript features such as `const`, `let`, arrow
  functions, destructuring, and template literals.
- Keep UI state local, explicit, and easy to inspect.
- Preserve browser-safe code paths that work without module resolution
  or transpilation.
- Keep web components short and focused, ideally under 200 lines,
- Where possible split complex web components into a child components to
  keep them manageable and reusable.

## Naming Conventions

- Use PascalCase for custom element classes.
- Use camelCase for variables, functions, methods, and reactive
  properties.
- Use ALL_CAPS for constants.
- Prefix private class members with underscore (\_)

## UI Requirements

- Use Atkinson Hyperlegible as the primary UI font.
- Preserve the current hero copy and overall visual direction unless the
  user asks to change it.
- Keep the add-task composer compact, with the `+` button aligned to the
  input and matching its height.
- Preserve dark mode support and the current responsive behavior.
- Keep task toggles visually clear and unsquished across viewport sizes.

## WebMCP Requirements

- Use the official WebMCP widget script from
  `https://webmcp.dev/src/webmcp.js`.
- Register tools explicitly in app code; do not assume the widget
  auto-discovers task actions.
- Preserve the current task tool set: `browse_tasks`, `add_task`,
  `complete_task`, and `delete_task`.
- When changing task behavior, keep the WebMCP tool behavior aligned
  with the visible UI behavior.

## Testing Custom Elements

- When writing tests for custom elements, always import the component
  file (e.g. `import '../../components/todoist-parser-element.js'`) at
  the top of the test spec. This ensures the element is defined before
  tests run.

## Code Quality

- Use meaningful variable and function names.
- Include helpful comments for complex logic.
- Keep rendering logic readable and split complex behavior into small
  methods.
- Add error handling for user input and browser storage access.
- Preserve accessibility when changing markup, keyboard flows, labels,
  or control sizes.
- When an issue is found fix it before moving on to the next task.
- Do not deflect (use a fix that simply sidesteps the underlying issue)
  engage with it directly. e.g. removing autocomplete at the app level
  to sidestep problems with `wa-input` styles when auo-fill is used.
- Once an issue is fixed add a regression test that verifies the fix and
  prevents future breakage.

## Skills

- [feature-branches](skills/feature-branches/SKILL.md) to isolate
  development of new features in separate branches, allowing for focused
  work, easier code reviews, and safer integration of changes into the
  main codebase. This approach also supports better collaboration among
  team members and helps maintain a cleaner commit history.
- [bugfix-hypothesis-branches](skills/bugfix-hypothesis-branches/SKILL.md)
  to reduce risks using version control branching strategies that
  isolate features and bug fixes from each other and allow for easy
  rollbacks and experimentation without affecting the main codebase. It
  also supports superior planning using counterfactual reasoning about
  the potential impacts of changes and the ability to switch between
  branches to compare different approaches.
- [unit-testing-pattern-catalog](skills/unit-testing-pattern-catalog/SKILL.md)
  to refactor and write effective tests for the app.
- [webawesome](skills/webawesome/SKILL.md) to properly integrate the
  WebMCP widget and tools, ensuring they work seamlessly with the task
  manager app and provide a good user experience when accessed from
  chat.

The first three skills are new so provide feedback on how they are
working and any improvements that could be made to them as you use them.
