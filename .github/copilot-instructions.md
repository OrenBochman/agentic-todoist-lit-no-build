# Project coding guidelines

## Project Context

- This project is a no-build task manager app that must run directly from `index.html` in VS Code preview, Chrome, or any simple static server.
- Use plain JavaScript and Lit loaded from a CDN. Do not introduce a bundler, npm build step, or framework scaffolding.
- The current Lit import pattern is CDN-based and should stay browser-safe.
- The app includes the official WebMCP widget and exposes task tools for agentic browsing, adding, completing, and deleting tasks.

## Features:

Work on each feature one at a time, to facilitate focused code review and easier regression testing and clearer git commits.


- [x] Add tasks
- [x] Mark tasks as completed
- [x] Delete tasks
- [x] Filter tasks by status
- [x] Persist tasks in localStorage
- [x] WebMCP widget with task tools for browsing, adding, completing, and deleting tasks from chat
- [x] Use Webawesome `wa-input` and `wa-button` components for the add task composer, ensuring they are properly styled and functional across browsers and viewports.
- [x] Dark mode support with appropriate color choices for text, backgrounds, and controls to maintain readability and visual appeal in both light and dark themes.
- [ ] Import/export tasks as JSON files to allow users to back up their tasks or transfer them between instances of the app.
- [ ] Service worker integration for offline support, allowing the app to function without an internet connection and sync changes when connectivity is restored.
- [ ] Implement the PRPL pattern (Push, Render, Pre-cache, Lazy-load) to optimize performance and load times, especially on slower networks or devices.
- [ ] Add edit task by long-pressing a task to open an edit form, allowing users to modify existing tasks without needing to delete and recreate them.
- [ ] Add an app icon `<wa-icon name="list-check" style="color: rgb(255, 212, 59);"></wa-icon>`
- [ ] Adjust css to make the Counters able to shrink to minimal size, replace `ALL tasks` to `All` and  `Completed` to `Done`.
- [ ] Responsive design that maintains usability and visual integrity across a range of device sizes, from mobile to desktop, ensuring that task toggles and controls are easily accessible and not visually squished.

## Architecture

- Keep each custom element in its own file.
- Prefer colocating component styles inside the Lit component with `static styles` unless there is a specific reason not to.
- The root app coordinates shared state, persistence, theming, and WebMCP tool registration.
- Child components should own their local UI concerns and communicate upward with custom events.

## Code Style

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

## Testing

1. Use Mocha and Chai from `https://unpkg.com`
2. automate the regression tests as unit tests that can be run in the browser and report pass/fail results.
3. to split the fixture from the test
4. to be short and sweet - less complex then the code being tested.
5. allow me to add more comprehensive unit test as we proceed.
6. Create a TDD plan - an ordered list of test that can be used to TDD all the features in the spec sequentially from scratch!
7. Test need a brief descriptive name that indicates the issue being tested and the expected behavior and the context (i.e. bug or feature name + expected behavior and the unit under test) also clarify the fidelity level using native v.s. wa-input where relevant.
8. each fixture is described in a short comment indicating intent (what web component and state is setup)
9. also the assertion block is also explained briefly to clarify what behavior is being checked at each step.

## Skills

use the `webawesome` skill to properly integrate the WebMCP widget and tools, ensuring they work seamlessly with the task manager app and provide a good user experience when accessed from chat.
