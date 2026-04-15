# Task Manager

This workspace contains a task manager web app built with Lit in plain JavaScript and Web Awesome components loaded from a CDN.

## Features

- Add tasks
- Mark tasks as completed
- Delete tasks
- Filter tasks by status
- Persist tasks in localStorage
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

Open it through the same static server used for the app. It auto-runs every Mocha/Chai regression spec in one page and is the fastest way to verify the whole suite after a change.

There is a browser-run regression test for the task composer click-submit bug at [tests/task-composer-regression.html](./tests/task-composer-regression.html).

Open it through the same static server used for the app. It now auto-runs a browser Mocha/Chai suite, with the fixture split into separate helper modules. It checks that clicking the `+` button uses the live `wa-input` value and that empty submit still shows validation.

There is also an app-level regression test at [tests/task-manager-add-task-regression.html](./tests/task-manager-add-task-regression.html).

Open it through the same static server used for the app. It now auto-runs a browser Mocha/Chai suite with a shared app fixture. It checks add, toggle, and long-press edit flows at both `wa-input` and native-input fidelity where relevant.

There is also a hero regression test at [tests/task-hero-regression.html](./tests/task-hero-regression.html).

Open it through the same static server used for the app. It now auto-runs a browser Mocha/Chai suite with a standalone hero fixture. It checks the icon, labels, and the responsive counter layout behavior.

There is also a transfer regression test at [tests/task-transfer-regression.html](./tests/task-transfer-regression.html).

Open it through the same static server used for the app. It now auto-runs a browser Mocha/Chai suite with the shared app fixture. It checks transfer layout, JSON export, merge-only import, duplicate skipping, and invalid-file feedback.

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

## Some todos:

1. [ ] an editor.
1. [ ] support richer project prompt like I had the first time round 
1. [ ] add some extra skill and remove some rcps.
1. [ ] expand the speck to include the flowing features:
1. [ ] add tests for current regression to allow an agent to develop from scratch with refactoring.
1. [ ] add class diagrams via mermaid.
2. [ ] add my own insights about lit and webawesome. possible blog post.
3. [ ] deploy as a page on my blog.
4. [ ] add ability to sign in 
4. [ ] and sync task via a backend, firebase/supabase/google docs...
5. [ ] add projects
6. [ ] task parser.
7. [ ] add importance levels + 
add due dates and reminders.
8. [ ] add task categories and filtering by category.
9. [ ] share tasks with other users.
10. [ ] add a calendar view.
11. [ ] add a kanban board view - for projects

