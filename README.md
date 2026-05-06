# TaskFlow — Team Task Manager

A full-stack project & task management app with role-based access, Kanban boards, analytics, and real-time activity feeds.

## Features

- **Authentication** — JWT-based signup/login with secure password hashing
- **Projects** — Create, manage, and archive projects with team members
- **Role-Based Access** — Admin (manage project + members) and Member roles per project
- **Kanban Board** — Drag-and-drop tasks across: To Do → In Progress → In Review → Done
- **Task Management** — Priority levels (Urgent/High/Medium/Low), due dates, assignees, comments
- **Dashboard** — Analytics charts, completion rates, overdue alerts, upcoming deadlines
- **Activity Feed** — Full audit trail of all team actions per project
- **Real-time** — Socket.io updates when teammates change tasks
- **Responsive** — Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand + TanStack Query |
| Charts | Recharts |
| Drag & Drop | @hello-pangea/dnd |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT |
| Real-time | Socket.io |
| Deployment | Render |

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Edit DATABASE_URL with your postgres credentials
npx prisma migrate dev --name init
node prisma/seed.js    # Load demo data
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit **http://localhost:5173**

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password123 |
| Member | alice@demo.com | password123 |
| Member | bob@demo.com | password123 |

## Deployment on Render

This project uses a `render.yaml` blueprint for one-click deployment.

### Steps

1. Push this repository to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your GitHub repo — Render will detect `render.yaml` automatically
4. After both services and the database are provisioned:
   - Copy the **taskflow-backend** service URL (e.g. `https://taskflow-backend.onrender.com`)
   - Set `FRONTEND_URL` on the backend service to your frontend URL (e.g. `https://taskflow-frontend.onrender.com`)
   - Set `VITE_API_URL` on the frontend service to `<backend-url>/api`
5. Trigger a redeploy of both services after setting env vars
6. Seed the database (optional):
   ```bash
   # In the Render backend service Shell tab
   node prisma/seed.js
   ```

### Manual Deployment (without Blueprint)

**Backend — Web Service**
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start` *(runs migrations + server)*
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`

**Frontend — Static Site**
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=<backend-url>/api`
- Rewrite rule: `/* → /index.html` (enables client-side routing)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |
| GET | `/api/tasks/project/:id` | List project tasks |
| POST | `/api/tasks/project/:id` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/health` | Health check |

## Project Structure

```
team-task-manager/
├── render.yaml           # Render deployment blueprint
├── backend/
│   ├── prisma/           # Schema + migrations + seed
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Auth + role guards
│       ├── routes/       # Express routers
│       └── utils/        # Prisma client + Socket.io
└── frontend/
    └── src/
        ├── components/   # Reusable UI components
        ├── hooks/        # React Query hooks
        ├── pages/        # Route pages
        ├── store/        # Zustand state
        └── types/        # TypeScript interfaces
```
