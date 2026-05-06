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
| Backend | Node.js + Express + Socket.io |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT |
| Hosting | Fly.io (backend) + Supabase (DB) + Vercel (frontend) |

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, FRONTEND_URL
npx prisma migrate dev --name init
node prisma/seed.js    # optional: load demo data
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5000/api
npm run dev
```

Visit **http://localhost:5173**

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password123 |
| Member | alice@demo.com | password123 |
| Member | bob@demo.com | password123 |

---

## Free Deployment (Fly.io + Supabase + Vercel)

### Step 1 — Database: Supabase (free PostgreSQL)

1. Create a free account at [supabase.com](https://supabase.com)
2. New Project → choose a region close to your Fly.io region
3. Go to **Settings → Database → Connection string → URI**
4. Copy the connection string — looks like:
   ```
   postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   ```
   Keep this — it's your `DATABASE_URL`

---

### Step 2 — Backend: Fly.io

#### Install the CLI
```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
pwsh -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://fly.io/install.ps1'))"
```

#### Deploy

```bash
cd backend

# Login (creates a free account if you don't have one)
fly auth login

# Create the app (only first time — fly.toml already has app name)
fly launch --no-deploy

# Set secrets (never stored in fly.toml)
fly secrets set DATABASE_URL="postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres"
fly secrets set JWT_SECRET="any-long-random-string-here"
fly secrets set FRONTEND_URL="https://your-vercel-app.vercel.app"

# Deploy
fly deploy
```

The start command (`npm start`) automatically runs `prisma migrate deploy` before starting the server.

#### Seed demo data (optional)
```bash
fly ssh console -C "node prisma/seed.js"
```

Your backend will be live at: `https://taskflow-backend.fly.dev`

---

### Step 3 — Frontend: Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import `team-task-manager`
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL = https://taskflow-backend.fly.dev/api
   ```
4. Click **Deploy**

> `frontend/vercel.json` already handles SPA rewrites and build settings.

---

### Step 4 — Wire them together

After Vercel gives you a URL (e.g. `https://team-task-manager.vercel.app`), update the backend's `FRONTEND_URL` secret:

```bash
cd backend
fly secrets set FRONTEND_URL="https://team-task-manager.vercel.app"
```

Fly.io will automatically restart the backend with the new value.

---

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
├── backend/
│   ├── fly.toml          # Fly.io deployment config
│   ├── prisma/           # Schema + migrations + seed
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Auth + role guards
│       ├── routes/       # Express routers
│       └── utils/        # Prisma client + Socket.io
└── frontend/
    ├── vercel.json       # Vercel build + SPA routing config
    └── src/
        ├── components/   # Reusable UI components
        ├── hooks/        # React Query hooks
        ├── pages/        # Route pages
        ├── store/        # Zustand state
        └── types/        # TypeScript interfaces
```
