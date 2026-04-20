---
title: Task Manager
description: A task manager web app built with Lit and Web Awesome components.
---


# Task Manager

This workspace contains a task manager web app built with Lit in plain JavaScript and Web Awesome components loaded from a CDN.

## Features

- Add tasks
- Mark tasks as completed
- Delete tasks
- Filter tasks by status
- Persist tasks in localStorage
- **Redux Toolkit + Lit**: All app state is managed by a Redux Toolkit store (browser-safe, no build step) and connected to Lit components via a custom `LitReduxElement` base class.
- **Compatibility API**: The root app exposes `.tasks`, `.filter`, and `.theme` properties for legacy tests and tools, but all state changes dispatch Redux actions.
- **Test/Fixture Patterns**: Test fixtures and helpers use Redux-safe assignment and always flush Lit updates after state changes. See `tests/fixtures/task-manager-app.fixture.js` for details.
- Import tasks from JSON backups
- Export tasks as JSON backups
- App icon in the hero using Web Awesome
- Edit tasks by long-pressing a task row
- WebMCP widget with task tools for browsing, adding, completing, and deleting tasks from chat


## Run

To run we need a local development environment that can serve static files.  I used `live preview` addon in VS Code.
This 

Open [index.html](./index.html) in VS Code preview, or serve the folder with any static file server.


## Regression Tests

There is a single browser-run regression dashboard at [tests/all-regression-tests.html](./tests/all-regression-tests.html).

Open it through the same static server used for the app. It auto-runs every Mocha/Chai regression spec in one page, shows a top-level pass/fail summary banner, and is the fastest way to verify the whole suite after a change.

There is a browser-run regression test for the task composer click-submit bug at [tests/task-composer-regression.html](./tests/task-composer-regression.html).

Open it through the same static server used for the app. It now auto-runs a browser Mocha/Chai suite, with the fixture split into separate helper modules. It checks that clicking the `+` button uses the live `wa-input` value and that empty submit still shows validation.

There is also an app-level regression test at [tests/task-manager-add-task-regression.html](./tests/task-manager-add-task-regression.html).

Open it through the same static server used for the app. It now auto-runs a browser Mocha/Chai suite with a shared app fixture. It checks add, toggle, and long-press edit flows at both `wa-input` and native-input fidelity where relevant.

There is also a hero regression test at [tests/task-hero-regression.html](./tests/task-hero-regression.html).

Open it through the same static server used for the app. It now auto-runs a browser Mocha/Chai suite with a standalone hero fixture. It checks the icon, labels, and the responsive counter layout behavior.

There is also a transfer regression test at [tests/task-transfer-regression.html](./tests/task-transfer-regression.html).

Open it through the same static server used for the app. It now auto-runs a browser Mocha/Chai suite with the shared app fixture. It checks transfer layout, JSON export, merge-only import, duplicate skipping, and invalid-file feedback.



## State Management: Redux Toolkit + Lit

- All app state (tasks, filter, theme) is managed by a Redux Toolkit store defined in [components/redux-store.js](components/redux-store.js).
- The root app and all stateful components extend [components/lit-redux-element.js](components/lit-redux-element.js), which subscribes to the Redux store and triggers Lit updates on state change.
- The root app exposes compatibility properties (`.tasks`, `.filter`, `.theme`) for legacy tests and tools, but all mutations dispatch Redux actions.
- Test fixtures and helpers use assignment (not in-place mutation) and always flush Lit updates after state changes. See [tests/fixtures/task-manager-app.fixture.js](tests/fixtures/task-manager-app.fixture.js).
- All stateful flows are covered by browser-run Mocha/Chai regression tests in [tests/all-regression-tests.html](tests/all-regression-tests.html).

## Feature Branch Workflow

This repo uses a strict feature branch workflow for all non-trivial changes. See `.github/skills/feature-branches/SKILL.md` for the full checklist and merge discipline:

1. Always branch from `main` before coding: `git checkout main && git pull && git checkout -b feature/<name>`
2. Commit in small increments, run tests frequently
3. Before merge: rebase/merge `main`, resolve conflicts, re-run all tests
4. Merge to `main` only when all tests pass and the branch is up to date
5. Delete the feature branch after merge

See the [Feature Branches skill doc](.github/skills/feature-branches/SKILL.md) for details and rationale.

The app includes a browser-safe, no-UI parser web component for Todoist-style task input:

**Component:** `<todoist-parser>` ([components/todoist-parser-element.js](components/todoist-parser-element.js))

**Usage:**

```js
const parser = document.createElement('todoist-parser');
const result = parser.parse('Review goals 2026-01-01 14:30 #Work @review p2 every fri');
// result: {
//   title: 'Review goals',
//   due: Date('2026-01-01T14:30:00'),
//   recurrence: 'WEEKLY:FRI',
//   project: 'Work',
//   labels: ['review'],
//   priority: 2,
//   section: null
// }
```


**Contract:**
- Input: freeform string (task text)
- Output: object with fields:
	- `title`: string (remaining text after parsing metadata/dates)
	- `due`: JS Date or null (parsed due date/time)
	- `recurrence`: string or null (e.g., 'WEEKLY:FRI')
	- `project`: string or null (first `#project`)
	- `section`: string or null (first `/section`)
	- `labels`: array of strings (all `@labels`)
	- `priority`: integer 1-4 or null (from `p1`-`p4`)

**Event:**
- Dispatches a `parsed` event with the result as `detail` when `.parse()` is called.

See [tests/specs/todoist-parser-element.spec.js](tests/specs/todoist-parser-element.spec.js) for full test coverage and examples.


## Todoist Parser Grammar

**Design principle:**

- NO ambiguity resolution
- NO fuzzy parsing
- ONLY explicit patterns + ISO fallback

**EBNF Grammar:**

```{mermaid}
railroad-beta

	task        ::= (meta WS)* core (WS meta)*

	meta        ::= project | label | priority | section

	project     ::= "#" ident
	label       ::= "@" ident
	section     ::= "/" ident
	priority    ::= "p" [1-4]

	core        ::= text? datetime? recurrence?

	datetime    ::= iso_date [time]
								| keyword_date [time]

	iso_date    ::= YYYY "-" MM "-" DD
								| YYYYMMDD

	time        ::= HH ":" MM

	keyword_date ::= "today" | "tomorrow"

	recurrence  ::= "every" WS ( "day" | "week" | weekday )

	weekday     ::= "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

	ident       ::= [a-zA-Z0-9_-]+
```


## WebMCP

The page loads the official WebMCP widget from `https://webmcp.dev/src/webmcp.js`.

Available task tools:
- `browse_tasks`
- `add_task`
- `complete_task`
- `delete_task`

To use them from chat, connect an MCP client to the blue widget. The WebMCP site documents a Claude Desktop setup using:

```json
{
	"mcpServers": {
		"webmcp": {
			"command": "npx",
			"args": ["-y", "@jason.today/webmcp@latest", "--mcp"]
		}
	}
}
```


## Copilot customization

Workspace instructions are in `.github/copilot-instructions.md` and the custom review agent is in `.github/agents/Reviewer.agent.md`.


