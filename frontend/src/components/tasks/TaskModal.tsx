import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Send, X } from 'lucide-react';
import type { Task, TaskStatus, Priority } from '../../types';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { useUpdateTask, useDeleteTask, useAddComment, useDeleteComment } from '../../hooks/useTasks';
import { useAuthStore } from '../../store/auth.store';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../lib/utils';
import { formatRelativeTime } from '../../lib/utils';

interface Props {
  task: Task;
  members: { user: { id: string; name: string; avatar?: string } }[];
  onClose: () => void;
}

export function TaskModal({ task, members, onClose }: Props) {
  const { user } = useAuthStore();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const handleStatusChange = (status: TaskStatus) => {
    updateTask.mutate({ taskId: task.id, projectId: task.projectId, status });
  };

  const handlePriorityChange = (priority: Priority) => {
    updateTask.mutate({ taskId: task.id, projectId: task.projectId, priority });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateTask.mutate({ taskId: task.id, projectId: task.projectId, assigneeId: assigneeId || null });
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    await deleteTask.mutateAsync({ taskId: task.id, projectId: task.projectId });
    onClose();
  };

  const handleSaveTitle = () => {
    if (title.trim() && title !== task.title) {
      updateTask.mutate({ taskId: task.id, projectId: task.projectId, title, description });
    }
    setEditing(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await addComment.mutateAsync({ taskId: task.id, projectId: task.projectId, content: comment });
    setComment('');
  };

  return (
    <Modal open onClose={onClose} size="xl">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="mb-4">
              <input
                className="input text-lg font-semibold mb-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Add description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button className="btn-primary btn-sm" onClick={handleSaveTitle}>Save</button>
                <button className="btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="mb-4 cursor-pointer group" onClick={() => setEditing(true)}>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</h2>
              {task.description ? (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              ) : (
                <p className="text-sm text-gray-400 mt-1 italic">Add a description...</p>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Comments</h4>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {task.comments.length === 0 && (
                <p className="text-sm text-gray-400">No comments yet.</p>
              )}
              {task.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.user.name} avatar={c.user.avatar} size="sm" />
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">{c.user.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">{formatRelativeTime(c.createdAt)}</span>
                        {c.userId === user?.id && (
                          <button
                            onClick={() => deleteComment.mutate({ commentId: c.id, projectId: task.projectId })}
                            className="text-gray-300 hover:text-red-500 ml-1"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleComment} className="flex gap-2">
              <Avatar name={user?.name || ''} size="sm" />
              <input
                className="input flex-1"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button type="submit" className="btn-primary" disabled={!comment.trim()}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="w-52 flex-shrink-0 space-y-4">
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            >
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={task.priority}
              onChange={(e) => handlePriorityChange(e.target.value as Priority)}
            >
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Assignee</label>
            <select
              className="input"
              value={task.assigneeId || ''}
              onChange={(e) => handleAssigneeChange(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </div>

          {task.dueDate && (
            <div>
              <label className="label">Due Date</label>
              <p className="text-sm text-gray-700">{format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
            </div>
          )}

          <div>
            <label className="label">Created by</label>
            <div className="flex items-center gap-2">
              <Avatar name={task.creator.name} size="xs" />
              <span className="text-sm text-gray-700">{task.creator.name}</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <button
              onClick={handleDelete}
              className="btn-danger btn-sm w-full justify-center"
            >
              <Trash2 size={14} />
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
