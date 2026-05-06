import { format } from 'date-fns';
import { MessageSquare, CalendarDays, AlertCircle } from 'lucide-react';
import type { Task } from '../../types';
import { PriorityBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { cn, isOverdue } from '../../lib/utils';

interface Props {
  task: Task;
  onClick: () => void;
  dragging?: boolean;
}

export function TaskCard({ task, onClick, dragging }: Props) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      onClick={onClick}
      className={cn(
        'card p-3.5 cursor-pointer hover:shadow-md transition-all group',
        dragging && 'shadow-xl rotate-2 opacity-90',
        overdue && 'border-red-200 bg-red-50'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className={cn('text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors', overdue && 'text-red-800')}>
          {task.title}
        </p>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={cn('flex items-center gap-1 text-xs', overdue ? 'text-red-600 font-medium' : 'text-gray-400')}>
              {overdue && <AlertCircle size={12} />}
              {!overdue && <CalendarDays size={12} />}
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          {task._count && task._count.comments > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare size={12} />
              {task._count.comments}
            </span>
          )}
        </div>

        {task.assignee && (
          <Avatar name={task.assignee.name} avatar={task.assignee.avatar} size="xs" />
        )}
      </div>
    </div>
  );
}
