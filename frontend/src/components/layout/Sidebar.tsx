import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, LogOut, Plus, CheckSquare, Settings,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useProjects } from '../../hooks/useProjects';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';

interface Props {
  onNewProject: () => void;
}

export function Sidebar({ onNewProject }: Props) {
  const { user, logout } = useAuthStore();
  const { data: projects } = useProjects();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <CheckSquare size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">TaskFlow</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white')
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <div className="pt-4 pb-1">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</span>
            <button
              onClick={onNewProject}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {projects?.map((project: any) => (
            <NavLink
              key={project.id}
              to={`/projects/${project.id}`}
              className={({ isActive }) =>
                cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white')
              }
            >
              <FolderKanban size={16} className="flex-shrink-0" />
              <span className="truncate">{project.name}</span>
              <span className="ml-auto text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                {project._count?.tasks ?? 0}
              </span>
            </NavLink>
          ))}

          {(!projects || projects.length === 0) && (
            <button
              onClick={onNewProject}
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
            >
              <Plus size={16} />
              Create first project
            </button>
          )}
        </div>
      </nav>

      <div className="border-t border-gray-800 p-3 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white')
          }
        >
          <Settings size={16} />
          Settings
        </NavLink>

        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar name={user?.name || ''} avatar={user?.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
