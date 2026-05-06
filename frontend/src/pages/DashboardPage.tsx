import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, CheckCircle2, AlertTriangle, Clock, TrendingUp,
  ArrowRight, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import { useAuthStore } from '../store/auth.store';
import { Avatar } from '../components/ui/Avatar';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { formatRelativeTime, isOverdue } from '../lib/utils';

const STATUS_COLORS: Record<string, string> = {
  TODO: '#94a3b8', IN_PROGRESS: '#3b82f6', IN_REVIEW: '#a855f7', DONE: '#22c55e',
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#94a3b8', MEDIUM: '#3b82f6', HIGH: '#f97316', URGENT: '#ef4444',
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = data?.stats;
  const pieData = (data?.tasksByStatus || []).map((s: any) => ({
    name: s.status.replace('_', ' '),
    value: s._count,
    color: STATUS_COLORS[s.status],
  }));

  const barData = (data?.tasksByPriority || []).map((p: any) => ({
    name: p.priority,
    count: p._count,
    fill: PRIORITY_COLORS[p.priority],
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Here's what's happening across your projects.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Projects', value: stats?.totalProjects, icon: FolderKanban, color: 'bg-blue-50 text-blue-600' },
          { label: 'My Tasks', value: stats?.myTasks, icon: Clock, color: 'bg-purple-50 text-purple-600' },
          { label: 'Completed', value: stats?.completedTasks, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
          { label: 'Overdue', value: stats?.overdueTasks, icon: AlertTriangle, color: stats?.overdueTasks > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value ?? 0}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {stats && stats.totalTasks > 0 && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Overall Completion</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {pieData.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                  {pieData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {barData.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Open Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {barData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data?.upcomingTasks?.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-orange-500" />
              <h3 className="text-sm font-semibold text-gray-700">Upcoming Deadlines</h3>
            </div>
            <div className="space-y-2">
              {data.upcomingTasks.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/projects/${task.projectId}`)}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer group"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOverdue(task.dueDate, task.status) ? 'bg-red-500' : 'bg-orange-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.project?.name}</p>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${isOverdue(task.dueDate, task.status) ? 'text-red-600' : 'text-gray-500'}`}>
                    {format(new Date(task.dueDate), 'MMM d')}
                  </span>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {data?.recentActivity?.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {data.recentActivity.slice(0, 8).map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-2.5">
                  <Avatar name={activity.user.name} avatar={activity.user.avatar} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{activity.user.name}</span>{' '}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
