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
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand + TanStack Query |
| Charts | Recharts |
| Drag & Drop | @hello-pangea/dnd |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT |
| Real-time | Socket.io |
| Deployment | Railway |

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

## Deployment on Railway

### Backend Service
1. Create a new Railway project
2. Add a PostgreSQL database plugin
3. Deploy the `backend/` folder
4. Set environment variables:
   - `DATABASE_URL` — auto-filled by Railway PostgreSQL plugin
   - `JWT_SECRET` — any long random string
   - `FRONTEND_URL` — your frontend Railway URL
5. Run migrations: Railway auto-runs `npx prisma migrate deploy && node src/server.js`

### Frontend Service
1. Add a second service in the same Railway project
2. Deploy the `frontend/` folder
3. Set `VITE_API_URL` to your backend Railway URL + `/api`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| POST | `/api/projects/:id/members` | Add member |
| GET | `/api/tasks/project/:id` | List project tasks |
| POST | `/api/tasks/project/:id` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |
| GET | `/api/dashboard` | Dashboard stats |

## Project Structure

```
team-task-manager/
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
