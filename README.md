# Task Manager

This workspace contains a task manager web app built with Lit in plain JavaScript and Web Awesome components loaded from a CDN.

## Features

- Add tasks
- Mark tasks as completed
- Delete tasks
- Filter tasks by status
- Persist tasks in localStorage
- WebMCP widget with task tools for browsing, adding, completing, and deleting tasks from chat

## Run

To run we need a local development environment that can serve static files.  I used `live preview` addon in VS Code.
This 

Open [index.html](./index.html) in VS Code preview, or serve the folder with any static file server.

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