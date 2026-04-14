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
- WebMCP widget with task tools for browsing, adding, completing, and deleting tasks from chat

## Run

To run we need a local development environment that can serve static files.  I used `live preview` addon in VS Code.
This 

Open [index.html](./index.html) in VS Code preview, or serve the folder with any static file server.

## Regression Tests

There is a browser-run regression test for the task composer click-submit bug at [tests/task-composer-regression.html](./tests/task-composer-regression.html).

Open it through the same static server used for the app. It checks that clicking the `+` button uses the live `wa-input` value and that empty submit still shows validation.

There is also an app-level regression test at [tests/task-manager-add-task-regression.html](./tests/task-manager-add-task-regression.html).

Open it through the same static server used for the app. It checks that clicking the `+` button adds a task to the root app state and renders that task in the board.

There is also a hero regression test at [tests/task-hero-regression.html](./tests/task-hero-regression.html).

Open it through the same static server used for the app. It checks the counter labels and verifies the hero stats stay in three shrinking columns at a narrow width.

There is also a transfer regression test at [tests/task-transfer-regression.html](./tests/task-transfer-regression.html).

Open it through the same static server used for the app. It checks that export creates a JSON backup payload and that import preserves existing tasks, adds only missing ones, and reports invalid files.

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