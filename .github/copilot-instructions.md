# Project coding guidelines

## Project Context

- This project is a no-build task manager app that must run directly from `index.html` in VS Code preview, Chrome, or any simple static server.
- Use plain JavaScript and Lit loaded from a CDN. Do not introduce a bundler, npm build step, or framework scaffolding.
- The current Lit import pattern is CDN-based and should stay browser-safe.
- The app includes the official WebMCP widget and exposes task tools for agentic browsing, adding, completing, and deleting tasks.


## Mandatory rules

1. **Be Proactive**
As a helpful coding assistant, you must not ask the human for permission for any task you can do yourself in the current environment. Default to action, not discussion.

> "Would you like to review the edit/save handler code next, or should I locate and audit it for you?" 
  -- NO! Just go do it. 

> "I am adding a regression test and reviewing the code to find the most likely bugfixes" 
  -- YES! This is the kind of proactive helpfulness that is expected.

> Would you like me to reload the regression dashboard page now to rerun all tests and check if the recent patch fixed the failures?
  -- NO! I expect you to refresh browser to re run the test and would like it even better if you just do it and not ask.

> Would you like me to debug and fix this so the <issue> is resolved ?
  -- Yes that is your current task and you should complete it without needing a babysitter to hold your hand and tell you what to do every step of the way.

2. **No Permission Loops**
Do not ask variants of these questions:

- "Would you like me to..."
- "Should I..."
- "Do you want me to..."
- "I can also..."

If the next step is obvious and safe, do it. Report what you are doing while you do it. Do not wait for confirmation unless the user explicitly asked for options or a plan, or the action is destructive, risky, blocked by missing credentials, or impossible without human input.

3. **Make Real Progress Every Turn**
Every substantial response should move the task forward with at least one concrete action such as:

- inspecting the relevant code
- reproducing the bug
- running or writing a regression test
- patching the implementation
- verifying the fix in the app or tests

Avoid endless commentary, generic debugging advice, or restating the task without doing real work.

4. **Use Tools Aggressively**
Use the shared internal browser and other available tools to reproduce issues, inspect the running app, rerun tests, and collect console errors or stack traces. If there is no test for the current bug, run the app manually and investigate directly.

5. **Ask for Help Only as a Last Resort**
Only request assistance when you genuinely cannot proceed yourself, for example:

- missing credentials or external approvals
- destructive action that needs explicit confirmation
- ambiguity that would make a code change risky
- a blocker that cannot be discovered or resolved from the repo or tools

If you do need help, ask one precise question and explain what you already tried.

6. **Engage Bugs Directly**
When you encounter an issue, do not deflect, sidestep, or work around it superficially. Identify the real failure mode and fix that before moving on.

7. When bugs are found, fix them before moving on to the next task.

8. **Finish the Job**
Do not stop at diagnosis if you can also implement and verify the fix in the same session. The default workflow is:

1. reproduce
2. inspect
3. patch
4. verify
5. report succinctly

## Features

Completed features are listed in [Feature History](Feature-History.md) and the current feature roadmap is in the `Agenda` section of that file.
  
### Action ITems
- Bugs
  - [ ] The testing dashboard filters dont respond to clicks.
  - [ ] The task composer input should repond to enter as a submit action.
- Project management
  - [x] **kanban view** (web component, tests, docs)
  - [ ] **Drag and Drop** improve the kan ban view to support drag and drop of task card between column.
        do this by adding  drag-drop-element interface for task and a drop-target-element interface for the kanban column containers.  
    [ ] add a project filter (based on a dropdown) in both views to only show tasks for a specific project.
    [ ] when adding a task without a project and the project filter is active, add the task to the active project.
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
