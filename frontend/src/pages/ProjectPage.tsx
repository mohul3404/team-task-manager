import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users, BarChart2, Activity, Plus, Settings, Search, Filter,
  List, Columns, UserPlus, ChevronDown
} from 'lucide-react';
import { useProject } from '../hooks/useProjects';
import { useProjectTasks } from '../hooks/useTasks';
import { useProjectActivity } from '../hooks/useProjects';
import { useProjectStats } from '../hooks/useDashboard';
import { useAuthStore } from '../store/auth.store';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { AddMemberModal } from '../components/projects/AddMemberModal';
import { formatRelativeTime } from '../lib/utils';
import type { Task, TaskStatus, Priority } from '../types';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

type ViewMode = 'kanban' | 'list';
type TabName = 'board' | 'stats' | 'activity' | 'members';

const STATUS_COLORS: Record<string, string> = {
  TODO: '#94a3b8', IN_PROGRESS: '#3b82f6', IN_REVIEW: '#a855f7', DONE: '#22c55e',
};

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<TabName>('board');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(projectId!, {
    search: search || undefined,
    status: filterStatus || undefined,
    priority: filterPriority || undefined,
  });
  const { data: activity = [] } = useProjectActivity(projectId!);
  const { data: stats } = useProjectStats(projectId!);

  const currentMember = project?.members?.find((m: any) => m.userId === user?.id);
  const isAdmin = currentMember?.role === 'ADMIN';

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!project) return <div className="p-6">Project not found.</div>;

  const pieData = stats?.tasksByStatus?.map((s: any) => ({
    name: s.status.replace('_', ' '),
    value: s._count,
    color: STATUS_COLORS[s.status],
  })) || [];

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {project.members?.slice(0, 5).map((m: any) => (
                <Avatar key={m.id} name={m.user.name} avatar={m.user.avatar} size="sm"
                  className="ring-2 ring-white" />
              ))}
              {project.members?.length > 5 && (
                <div className="w-8 h-8 bg-gray-200 rounded-full ring-2 ring-white flex items-center justify-center text-xs font-medium text-gray-600">
                  +{project.members.length - 5}
                </div>
              )}
            </div>
            {isAdmin && (
              <button onClick={() => setShowAddMember(true)} className="btn-secondary btn-sm">
                <UserPlus size={14} /> Add Member
              </button>
            )}
            <button onClick={() => setShowCreateTask(true)} className="btn-primary btn-sm">
              <Plus size={14} /> New Task
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-4">
          {(['board', 'stats', 'activity', 'members'] as TabName[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${
                tab === t ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {tab === 'board' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-8"
                  placeholder="Search tasks…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="input w-36"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="">All statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
              <select
                className="input w-36"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
              >
                <option value="">All priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Columns size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {tasksLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : viewMode === 'kanban' ? (
              <KanbanBoard tasks={tasks} projectId={projectId!} members={project.members} />
            ) : (
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <EmptyState
                    icon={List}
                    title="No tasks yet"
                    description="Create your first task to get started"
                    action={
                      <button className="btn-primary" onClick={() => setShowCreateTask(true)}>
                        <Plus size={16} /> Create Task
                      </button>
                    }
                  />
                ) : (
                  tasks.map((task: Task) => (
                    <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                  ))
                )}
              </div>
            )}
          </>
        )}

        {tab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Task Distribution</h3>
              {stats?.overdueTasks > 0 && (
                <p className="text-xs text-red-600 mb-3">⚠ {stats.overdueTasks} overdue task(s)</p>
              )}
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                    {pieData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Priority Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.tasksByPriority?.map((p: any) => ({ ...p, count: p._count })) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Tasks', value: stats?.tasksByStatus?.reduce((s: number, t: any) => s + t._count, 0) ?? 0 },
                  { label: 'Completed (7 days)', value: stats?.recentCompletions ?? 0 },
                  { label: 'Overdue', value: stats?.overdueTasks ?? 0 },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div className="max-w-xl">
            {activity.length === 0 ? (
              <EmptyState icon={Activity} title="No activity yet" description="Actions will appear here" />
            ) : (
              <div className="space-y-3">
                {activity.map((a: any) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <Avatar name={a.user.name} avatar={a.user.avatar} size="sm" />
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{a.user.name}</span> {a.action}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'members' && (
          <div className="max-w-lg space-y-3">
            {project.members?.map((m: any) => (
              <div key={m.id} className="card p-4 flex items-center gap-3">
                <Avatar name={m.user.name} avatar={m.user.avatar} size="md" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{m.user.name}</p>
                  <p className="text-sm text-gray-500">{m.user.email}</p>
                </div>
                <span className={`badge ${m.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {m.role}
                </span>
              </div>
            ))}
            {isAdmin && (
              <button className="btn-secondary w-full justify-center" onClick={() => setShowAddMember(true)}>
                <UserPlus size={16} /> Add Member
              </button>
            )}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={project.members}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          projectId={projectId!}
          members={project.members}
          onClose={() => setShowCreateTask(false)}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          projectId={projectId!}
          onClose={() => setShowAddMember(false)}
        />
      )}
    </div>
  );
}
