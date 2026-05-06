import { cn, PRIORITY_CONFIG, STATUS_CONFIG } from '../../lib/utils';
import type { Priority, TaskStatus } from '../../types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={cn('badge', cfg.bg, cfg.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('badge', cfg.bg, cfg.color)}>
      {cfg.label}
    </span>
  );
}
