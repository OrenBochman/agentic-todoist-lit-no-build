# Project coding guidelines

## Project Context

- This project is a no-build task manager app that must run directly from `index.html` in VS Code preview, Chrome, or any simple static server.
- Use plain JavaScript and Lit loaded from a CDN. Do not introduce a bundler, npm build step, or framework scaffolding.
- The current Lit import pattern is CDN-based and should stay browser-safe.
- The app includes the official WebMCP widget and exposes task tools for agentic browsing, adding, completing, and deleting tasks.


## Mandatory rules

1. **Be Proactive** As a helpful coding assistant, you must never ask the human copilot for permission for a task you can do yourself. 

> "Would you like to review the edit/save handler code next, or should I locate and audit it for you?" 
  -- NO! Just go do it. 
> "I am adding a regression test and reviewing the code to find the most likely bugfixes" 
  -- YES! This is the kind of proactive helpfulness that is expected.
2. Use must the shared internal browser and other tools to automate testing and recover console logs with traces. Execute the app and access it manually if there is not test for the current bug or fix.
3. You may Only request assistance as a last resort when you cannot do something yourself. 
2. **Engage Bugs Directly** When you encounter an issue/bug, do not deflect or sidestep it. Engage with the problem directly and work to resolve it before moving on to the next task.

3. When bugs are found, fix them before moving on to the next task.

## Features

Completed features are listed in [Feature History](Feature-History.md) and the current feature roadmap is in the `Agenda` section of that file.
  
### Action ITems
- Bugs
  - [ ] When editing an item and adding or changing a date, the new date is not saved. (Both views have the same issue)
      - 'goto /hell' long click  'goto /hell today' -> saves as 'goto /hell' . 
      - 'meeting 2021-12-12 /up' long click  'meeting 2020-12-12 /up' -> saves as 'meeting 2021-12-12 /up' 
- Project management
  - [ ] **kanban view** (web component, tests, docs)
  - [ ] drag-drop-element interface for task reordering and project organization.
  - [ ] drop-target-element interface for drag-drop-element to enable drag and drop between projects and kanban columns. 
- Storage and Data

  - [ ] **Google-Drive-Integration** Support storage to google drive. 
  - [ ] **Filter-Update** Add more filters for date, project, importance
- Tests and Documentation
  - [ ] Improve documentation with Mermaid UML charts (class diagrams, sequence diagrams) to illustrate app architecture, component relationships, and data flow.
- UI/UX
  - [ ] Add calendar view (web component, tests, docs)
  - [ ] Add gantt view (web component, tests, docs)
  - [ ] Add PERT view (web component, tests, docs)
- PWA
  - [ ] Add service worker integration for offline support, allowing the app to function without an internet connection and sync changes when connectivity is restored.
  - [ ] Implement the PRPL pattern (Push, Render, Pre-cache, Lazy-load) to optimize performance and load times, especially on slower networks or devices. 
  - [ ] Add a web app manifest to provide metadata about the app, such as its name, icons, and theme colors, to enhance the user experience when installing the app on their device.
  - [ ] Add analytics integration to track user interactions and gather insights on how the app is being used
  
### Stretch goals

1. [ ] deploy as a page on my blog.
2. [ ] add ability to sign in via OAuth and sync tasks via a backend, firebase/supabase/google docs...
3. [ ] and sync task via a backend, firebase/supabase/google docs...
4. [ ] share tasks with other users...
5. [ ] add my own insights about lit and webawesome. possible blog post.
6. [ ] add a rl agent script.
9. [ ] notifications for due dates and reminders.
10. [ ] add a "focus mode" and a pomodoro timer.

## Architecture

- Keep each custom element in its own file.
- Prefer placing component styles inside the Lit component with `static styles` unless there is a specific reason not to.
- The root app coordinates shared state, persistence, theming, and WebMCP tool registration.
- Child components should own their local UI concerns and communicate upward with custom events.

## Code Style

- Screen real estate is limited, so minimize footprint of UI chrome and controls to maximize space for tasks.
- Use semantic HTML5 elements where possible in templates and rendered markup.
- Prefer modern JavaScript features such as `const`, `let`, arrow functions, destructuring, and template literals.
- Keep UI state local, explicit, and easy to inspect.
- Preserve browser-safe code paths that work without module resolution or transpilation.
- Keep web components short and focused, ideally under 200 lines, 
- Where possible split complex web components into a child components to keep them manageable and reusable.

## Naming Conventions

- Use PascalCase for custom element classes.
- Use camelCase for variables, functions, methods, and reactive properties.
- Use ALL_CAPS for constants.
- Prefix private class members with underscore (_)

## UI Requirements

- Use Atkinson Hyperlegible as the primary UI font.
- Preserve the current hero copy and overall visual direction unless the user asks to change it.
- Keep the add-task composer compact, with the `+` button aligned to the input and matching its height.
- Preserve dark mode support and the current responsive behavior.
- Keep task toggles visually clear and unsquished across viewport sizes.

## WebMCP Requirements

- Use the official WebMCP widget script from `https://webmcp.dev/src/webmcp.js`.
- Register tools explicitly in app code; do not assume the widget auto-discovers task actions.
- Preserve the current task tool set: `browse_tasks`, `add_task`, `complete_task`, and `delete_task`.
- When changing task behavior, keep the WebMCP tool behavior aligned with the visible UI behavior.

## Testing Custom Elements

- When writing tests for custom elements, always import the component file (e.g. `import '../../components/todoist-parser-element.js'`) at the top of the test spec. This ensures the element is defined before tests run.

## Code Quality

- Use meaningful variable and function names.
- Include helpful comments for complex logic.
- Keep rendering logic readable and split complex behavior into small methods.
- Add error handling for user input and browser storage access.
- Preserve accessibility when changing markup, keyboard flows, labels, or control sizes.
- When an issue is found fix it before moving on to the next task.
- Do not deflect (use a fix that simply sidesteps the underlying issue) engage with it directly.
  e.g. removing autocomplete at the app level to sidestep problems with `wa-input` styles when auo-fill is used.
- Once an issue is fixed add a regression test that verifies the fix and prevents future breakage.

## Skills

- [feature-branches](skills/feature-branches/SKILL.md) to isolate development of new features in separate branches, allowing for focused work, easier code reviews, and safer integration of changes into the main codebase. This approach also supports better collaboration among team members and helps maintain a cleaner commit history.
- [bugfix-hypothesis-branches](skills/bugfix-hypothesis-branches/SKILL.md) to reduce risks using version control branching strategies that isolate features and bug fixes from each other and allow for easy rollbacks and experimentation without affecting the main codebase. It also supports superior planning using counterfactual reasoning about the potential impacts of changes and the ability to switch between branches to compare different approaches.
- [unit-testing-pattern-catalog](skills/unit-testing-pattern-catalog/SKILL.md) to refactor and write effective tests for the app.
- [webawesome](skills/webawesome/SKILL.md) to properly integrate the WebMCP widget and tools, ensuring they work seamlessly with the task manager app and provide a good user experience when accessed from chat.

The first three skills are new so provide feedback on how they are working and any improvements that could be made to them as you use them.

