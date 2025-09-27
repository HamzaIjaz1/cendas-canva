# Construction Plan Viewer

A React-based interactive construction plan viewer that allows users to manage tasks and checklists on construction blueprints.

## Features & Development Time

### Core Features
- **User Authentication System** - *35 minutes*

- **Interactive Canvas System** - *1 hour*
  - Construction plan image loading and display
  - Canvas coordinate transformation
  - Click-to-place task markers
  - Pin visualization with status colors

- **Task Management** - *1.5 hours*
  - Create tasks at specific coordinates
  - Edit task titles and status
  - Status-based color coding (not started, in progress, blocked, final check, done)
  - Task modal interface

- **Checklist System** - *1 hour*
  - Add checklist items to tasks
  - Status management for individual items
  - Inline editing of checklist item text
  - Delete checklist items

- **Database Integration** - *40 minutes*
  - RxDB local database setup
  - User data persistence
  - Task and checklist item storage

- **State Management Migration** - *30 minutes*
  - Replaced session system with Zustand
  - Centralized user and task state
  - Optimistic UI updates

**Total Development Time: ~5 hours**

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Start development server
```bash
npm run dev
```

5. Open browser to `http://localhost:5173`

### Usage
1. **Login**: Enter your name to access the application
2. **View Plan**: The construction plan will load automatically
3. **Add Tasks**: Click anywhere on the plan to create a new task
4. **Edit Tasks**: Click on existing pin markers to edit tasks
5. **Manage Checklists**: Add items to task checklists and track progress
6. **Edit Items**: Click on checklist item text to edit inline
7. **Track Status**: Use status dropdowns to update task and item progress

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Database**: RxDB (local storage)
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Canvas**: HTML5 Canvas API

## Project Structure
```
src/
├── components/
│   ├── ConstructionCanvas.tsx    # Main canvas component
│   └── TaskModal.tsx            # Task editing modal
├── pages/
│   ├── Login.tsx               # Authentication page
│   └── Home.tsx                # Main application page
├── store/
│   └── userStore.ts            # Zustand state management
├── db/
│   ├── index.ts                # Database functions
│   └── schemas.ts              # Data schemas
└── App.tsx                     # Main app component
```

## Key Features
- **Offline-first**: Works without internet connection
- **Real-time updates**: Changes reflect immediately
- **Responsive design**: Works on desktop and mobile
- **Type-safe**: Full TypeScript implementation
- **Persistent data**: Local database storage


## Possible Improvements
- Save user session in RxDB and retain it on page reload.
- Use styled components to make the components appear cleaner.
- Add styling basics like setting up theme for overall app.
- Making the canva code a bit more refined and minimal.
- Look more into db schema optimisation according to use case.
- Use better task check list icons and pin icons.
- Testing with 1000+ task icons.
- Look more into zustand slices like feature.
- Add and think of logic to manage server and local db state and how to manage conflicts.