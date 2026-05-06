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
| Deployment | Render.com (free tier) |

---

## Deploying on Render (Manual — No Blueprint)

Deploy in this exact order: **Database → Backend → Frontend**

---

### Step 1 — PostgreSQL Database

1. [render.com](https://render.com) → **New → PostgreSQL**
2. Fill in:
   - **Name:** `taskflow-db`
   - **Plan:** Free
3. Click **Create Database**
4. Wait until status is **Available**, then open the database page
5. Scroll down to **Connections** — copy the **Internal Database URL**
   (looks like `postgresql://taskflow_db_user:...@dpg-....render.com/taskflow_db`)

---

### Step 2 — Backend Web Service

1. **New → Web Service**
2. Connect your GitHub repo → select `team-task-manager`
3. Settings:
   | Field | Value |
   |-------|-------|
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
4. Scroll down to **Environment Variables** → add these:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | *(paste Internal Database URL from Step 1)* |
   | `JWT_SECRET` | *(any long random string, e.g. `mysecretkey123abc`)* |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | *(leave blank for now — fill after Step 3)* |

5. Click **Create Web Service**
6. Wait for the deploy to finish — the start command automatically runs database migrations
7. Copy your backend URL: `https://taskflow-backend-xxxx.onrender.com`

---

### Step 3 — Frontend Static Site

1. **New → Static Site**
2. Connect the same GitHub repo → select `team-task-manager`
3. Settings:
   | Field | Value |
   |-------|-------|
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |
4. Add **Environment Variable**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://taskflow-backend-xxxx.onrender.com/api` |

   *(use your actual backend URL from Step 2)*

5. Scroll to **Redirects/Rewrites** → click **Add Rule**:
   | Field | Value |
   |-------|-------|
   | **Source** | `/*` |
   | **Destination** | `/index.html` |
   | **Action** | `Rewrite` |

6. Click **Create Static Site**
7. Copy your frontend URL: `https://taskflow-frontend-xxxx.onrender.com`

---

### Step 4 — Connect Frontend URL to Backend

1. Go to your **backend Web Service** → **Environment**
2. Set `FRONTEND_URL` = `https://taskflow-frontend-xxxx.onrender.com`
3. Click **Save Changes** — the backend redeploys automatically

---

### Step 5 — Seed Demo Data (optional)

In the backend Web Service → **Shell** tab:
```bash
node prisma/seed.js
```

This creates three demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password123 |
| Member | alice@demo.com | password123 |
| Member | bob@demo.com | password123 |

---

## Quick Start (Local)

```bash
# Backend
cd backend
npm install
cp .env.example .env     # set DATABASE_URL, JWT_SECRET, FRONTEND_URL
npx prisma migrate dev --name init
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env     # set VITE_API_URL=http://localhost:5000/api
npm run dev
```

Visit **http://localhost:5173**

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
│   ├── fly.toml          # Fly.io config (alternative deployment)
│   ├── prisma/           # Schema + migrations + seed
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Auth + role guards
│       ├── routes/       # Express routers
│       └── utils/        # Prisma client + Socket.io
└── frontend/
    ├── vercel.json       # Vercel/static site config
    └── src/
        ├── components/   # Reusable UI components
        ├── hooks/        # React Query hooks
        ├── pages/        # Route pages
        ├── store/        # Zustand state
        └── types/        # TypeScript interfaces
```
