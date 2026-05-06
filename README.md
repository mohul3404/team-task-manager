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
| Deployment | Render (backend) + Vercel (frontend) |

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

## Deployment

The backend is deployed on **Render** (supports Socket.io) and the frontend on **Vercel** (free static hosting).

### 1 — Backend on Render (via Blueprint)

1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect `mohul3404/team-task-manager` — Render detects `render.yaml` automatically
3. This creates: `taskflow-db` (free PostgreSQL) + `taskflow-backend` (web service)
4. After deploy, set the one manual env var on **taskflow-backend**:
   ```
   FRONTEND_URL = <your Vercel frontend URL>
   ```
5. Trigger a redeploy after setting `FRONTEND_URL`
6. Seed demo data (optional) — in the backend **Shell** tab:
   ```bash
   node prisma/seed.js
   ```

### 2 — Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import `team-task-manager`
2. Set **Root Directory** to `frontend`
3. Vercel auto-detects Vite — no build settings needed
4. Add environment variable:
   ```
   VITE_API_URL = https://<your-render-backend-name>.onrender.com/api
   ```
5. Click **Deploy**

> The `frontend/vercel.json` already handles SPA client-side routing rewrites.

### Manual Backend Deployment (without Blueprint)

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start` *(runs prisma migrate deploy + server)*
- Env vars: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`

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
├── render.yaml           # Render blueprint (backend + database)
├── backend/
│   ├── prisma/           # Schema + migrations + seed
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Auth + role guards
│       ├── routes/       # Express routers
│       └── utils/        # Prisma client + Socket.io
└── frontend/
    ├── vercel.json       # Vercel SPA routing config
    └── src/
        ├── components/   # Reusable UI components
        ├── hooks/        # React Query hooks
        ├── pages/        # Route pages
        ├── store/        # Zustand state
        └── types/        # TypeScript interfaces
```
