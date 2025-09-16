# Todo App

A modern, responsive todo application built with Nuxt.js, Vue 3, and Tailwind CSS.

## Features

- ✅ Add, edit, and delete todos
- ✅ Mark todos as complete/incomplete
- ✅ Optional descriptions for detailed task information
- ✅ Optional due dates for todos
- ✅ Visual due date indicators (overdue, due today, due soon)
- ✅ Import/Export functionality for backup and restore
- ✅ Filter todos (All, Active, Completed)
- ✅ Local storage persistence
- ✅ Responsive design
- ✅ Smooth animations and transitions
- ✅ Double-click to edit todos
- ✅ Clear completed todos

## Tech Stack

- **Nuxt.js 3** - Vue.js framework with SSR
- **Vue 3** - Progressive JavaScript framework
- **Pinia** - State management
- **Bootstrap 5** - CSS framework for responsive design
- **Bootstrap Icons** - Icon library
- **TypeScript** - Type safety

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build

## Usage

- **Add Todo**: Type in the input field and press Enter or click "Add Todo"
- **Add Description**: Use the description textarea to add detailed information about your task (optional)
- **Set Due Date**: Check "Set due date" when adding a todo and select a date
- **Complete Todo**: Click the checkbox next to any todo
- **Edit Todo**: Double-click on the todo text to edit it inline (including description and due date)
- **Delete Todo**: Click the trash icon next to any todo
- **Filter Todos**: Use the All/Active/Completed buttons to filter your view
- **Clear Completed**: Click "Clear completed" to remove all completed todos

### Description Features
- **Optional details**: Add longer descriptions to provide context for your tasks
- **Italic styling**: Descriptions appear in italics below the main todo text
- **Edit inline**: Double-click any todo to modify both title and description

### Due Date Features
- **Color-coded badges**: 
  - 🔴 Red: Overdue todos
  - 🟡 Yellow: Due today or within 3 days
  - ⚫ Gray: Future due dates
- **Optional dates**: Due dates are completely optional for each todo
- **Edit dates**: Double-click any todo to modify its due date

### Import/Export Features
- **Export Backup**: Click "Export" to download all your todos as a JSON file
- **Import Restore**: Click "Import" to upload and restore todos from a JSON backup file
- **Smart Merging**: Imported todos are merged with existing ones (no duplicates)
- **File Validation**: Only valid JSON files with proper todo structure are accepted
- **Automatic Naming**: Export files are named with the current date for easy organization

Your todos are automatically saved to your browser's local storage and will persist between sessions.
