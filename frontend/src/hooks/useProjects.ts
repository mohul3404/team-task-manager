import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data.projects;
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}`);
      return data.project;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await api.post('/projects', data);
      return res.data.project;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create project'),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, ...data }: { projectId: string; name?: string; description?: string; status?: string }) => {
      const res = await api.put(`/projects/${projectId}`, data);
      return res.data.project;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects', vars.projectId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update project'),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete project'),
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, email, role }: { projectId: string; email: string; role?: string }) => {
      const res = await api.post(`/projects/${projectId}/members`, { email, role });
      return res.data.member;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects', vars.projectId] });
      toast.success('Member added!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add member'),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }) => {
      await api.delete(`/projects/${projectId}/members/${userId}`);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects', vars.projectId] });
      toast.success('Member removed');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to remove member'),
  });
}

export function useProjectActivity(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'activity'],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/activity`);
      return data.activities;
    },
    enabled: !!projectId,
    refetchInterval: 30000,
  });
}
