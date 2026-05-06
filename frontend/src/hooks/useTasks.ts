import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';
import type { Priority, TaskStatus } from '../types';

interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  search?: string;
}

export function useProjectTasks(projectId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.priority) params.set('priority', filters.priority);
      if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);
      if (filters?.search) params.set('search', filters.search);
      const { data } = await api.get(`/tasks/project/${projectId}?${params}`);
      return data.tasks;
    },
    enabled: !!projectId,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      ...task
    }: {
      projectId: string;
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: Priority;
      dueDate?: string;
      assigneeId?: string;
    }) => {
      const { data } = await api.post(`/tasks/project/${projectId}`, task);
      return data.task;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', vars.projectId] });
      toast.success('Task created!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create task'),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      projectId,
      ...updates
    }: {
      taskId: string;
      projectId: string;
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: Priority;
      dueDate?: string | null;
      assigneeId?: string | null;
    }) => {
      const { data } = await api.put(`/tasks/${taskId}`, updates);
      return data.task;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', vars.projectId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update task'),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, projectId: _projectId }: { taskId: string; projectId: string }) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', vars.projectId] });
      toast.success('Task deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete task'),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, projectId: _p, content }: { taskId: string; projectId: string; content: string }) => {
      const { data } = await api.post(`/tasks/${taskId}/comments`, { content });
      return data.comment;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', vars.projectId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add comment'),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, projectId: _p }: { commentId: string; projectId: string }) => {
      await api.delete(`/tasks/comments/${commentId}`);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', vars.projectId] });
    },
  });
}
