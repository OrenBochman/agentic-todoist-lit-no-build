# Project coding guidelines

## Project Context

- This project is a no-build task manager app that must run directly from `index.html` in VS Code preview, Chrome, or any simple static server.
- Use plain JavaScript and Lit loaded from a CDN. Do not introduce a bundler, npm build step, or framework scaffolding.
- The current Lit import pattern is CDN-based and should stay browser-safe.
- The app includes the official WebMCP widget and exposes task tools for agentic browsing, adding, completing, and deleting tasks.

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

# skills

use the `webawesome` skill to properly integrate the WebMCP widget and tools, ensuring they work seamlessly with the task manager app and provide a good user experience when accessed from chat.