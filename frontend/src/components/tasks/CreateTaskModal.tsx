import { useState } from 'react';
import type { Priority, TaskStatus, ProjectMember } from '../../types';
import { Modal } from '../ui/Modal';
import { useCreateTask } from '../../hooks/useTasks';

interface Props {
  projectId: string;
  members: ProjectMember[];
  defaultStatus?: TaskStatus;
  onClose: () => void;
}

export function CreateTaskModal({ projectId, members, defaultStatus = 'TODO', onClose }: Props) {
  const createTask = useCreateTask();
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus as TaskStatus,
    priority: 'MEDIUM' as Priority,
    dueDate: '',
    assigneeId: '',
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await createTask.mutateAsync({
      projectId,
      title: form.title,
      description: form.description || undefined,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      assigneeId: form.assigneeId || undefined,
    });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Create Task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input
            className="input"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            autoFocus
            required
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Optional description"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => update('status', e.target.value)}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => update('priority', e.target.value)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Assignee</label>
            <select className="input" value={form.assigneeId} onChange={(e) => update('assigneeId', e.target.value)}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => update('dueDate', e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={!form.title.trim() || createTask.isPending}>
            {createTask.isPending ? 'Creating…' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
