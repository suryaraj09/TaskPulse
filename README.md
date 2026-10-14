# TaskPulse

**TaskPulse** is a browser-based task organizer for planning work, tracking progress, and keeping deadlines visible. It combines a prioritized to-do list, a Kanban board, customizable categories, and scheduled reminders in one interface.

> **Project status:** An existing React application. Task data is stored locally in your browser rather than in a hosted account or database.

## Features

- **Task management:** Create, edit, complete, and delete tasks with descriptions, due dates, and reminders.
- **Four priority levels:** P1 Urgent, P2 High, P3 Medium, and P4 Low.
- **List and Kanban views:** Switch between a sortable task list and a board with **To Do**, **In Progress**, **In Review**, and **Completed** stages.
- **Custom categories:** Organize tasks into color-coded categories; starter categories include work, personal, critical, learning, and health.
- **Search and filters:** Find tasks by title/description, category, priority, status, and deadlines.
- **Progress overview:** See counts for active, completed, overdue, and due-today tasks.
- **Reminders:** In-app reminder toasts with sound, browser notifications when permission is granted, and snooze actions.
- **Local persistence:** Tasks, categories, and view preference persist using browser `localStorage`.
- **Backup and restore:** Export tasks/categories to JSON and import a previously exported file.
- **Keyboard shortcut:** Press **N** (when not typing in a form field) to create a task.

## Tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript |
| Build and local development | Vite 8 |
| Styling | Tailwind CSS 4 |
| Icons and motion | Lucide React, Motion |
| Data persistence | Browser `localStorage` |
| Notifications | Browser Notification API, in-app toasts, Web Audio |

The package also declares Express, dotenv, and the Google Gen AI SDK dependencies. Their presence alone should not be taken as evidence of a deployed backend or an AI-powered feature.

## Getting started

### Prerequisites

- **Node.js** and **npm** installed. Use a current Node.js release compatible with Vite 8.
- A modern browser.

### Install and run

```bash
git clone https://github.com/suryaraj09/TaskPulse.git
cd TaskPulse
npm install
npm run dev
```

Open **http://localhost:3000** in your browser (the Vite development server is configured to run on port 3000).

### Other commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Generate production assets in `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run the TypeScript type check (`tsc --noEmit`) |

### Environment variables

The previous AI Studio starter README instructed users to configure `GEMINI_API_KEY`. TaskPulse's documented task-list and reminder workflows do **not** require a Gemini API key. Do not add an API key merely to use the task manager.

If you later introduce features requiring secrets, document their variable names and keep actual credentials out of Git. Client-side Vite variables are not suitable for private API keys.

## How to use

1. Launch the app. On first use it includes sample tasks and categories.
2. Create a task using the new-task control or press **N**.
3. Give the task a category, priority, status, and optional due date/reminder.
4. Switch between **List** and **Kanban** views to organize progress.
5. Use search and filters to focus on the tasks that matter.
6. Allow notifications in your browser if you want native desktop alerts.
7. Export a JSON backup before clearing browser data or switching devices.

### Reminder limitations

Reminders are checked by code running in the open application tab. **They are not guaranteed to fire after the tab/browser is closed, the device sleeps, or the browser pauses background tabs.** Native notifications require browser support and permission. This implementation should not be described as a background push-notification service.

### Where is my data?

TaskPulse uses browser `localStorage`, with no account-based synchronization in the current task manager. Different browsers/devices have different data. Clearing site storage may erase your tasks; use JSON export for backups. Imported files replace the task/category collections after basic structural checks, so import only trusted backups.

## Project structure

```text
TaskPulse/
├── public/                   # Application icon and web manifest
├── src/
│   ├── components/           # Task list, Kanban board, modals, sidebar, header
│   ├── hooks/
│   │   ├── useTaskManager.ts  # Task CRUD, filters, local storage, import/export
│   │   └── usePWAInstall.ts   # Install-related browser handling
│   ├── services/             # Notification and sound services
│   ├── types/todo.ts         # Task, category, status, and priority types
│   ├── App.tsx               # Main application layout
│   └── main.tsx              # React entry point
├── index.html
├── metadata.json             # AI Studio app metadata
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## AI Studio

TaskPulse originated from an AI Studio app template. The original AI Studio project link is:

[Open the TaskPulse AI Studio app](https://ai.studio/apps/ef1bf9d6-330e-4fd7-a6a6-b3286b9d2d6a)

GitHub is the source of truth for this repository; changes made on separate branches may not appear automatically in an AI Studio workspace.

## Contributing

Contributions are welcome through GitHub issues and pull requests.

1. Open an issue (or refer to an existing one) to describe the change.
2. Create a focused branch from `main`.
3. Make your changes and run `npm run lint` and `npm run build` locally.
4. Open a pull request explaining what changed, how you tested it, and including screenshots for UI changes when relevant.

Please avoid committing secrets, credentials, build outputs, or local environment files.

## Known limitations

- No server-backed user accounts or cross-device synchronization are implemented by the current task-management hook.
- Browser storage is device/browser-specific.
- Reminders depend on the application running in the browser.
- There is no automated test script currently defined in `package.json`.

## License

No license file was found in the repository at the time of this README update. **No open-source license is currently declared.** If the project is intended for reuse by others, add a suitable `LICENSE` file and update this section. Public visibility alone does not grant general reuse rights.

---

Maintained in [suryaraj09/TaskPulse](https://github.com/suryaraj09/TaskPulse). For bugs and feature requests, use [GitHub Issues](https://github.com/suryaraj09/TaskPulse/issues).
