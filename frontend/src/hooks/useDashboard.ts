import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data;
    },
    refetchInterval: 60000,
  });
}

export function useProjectStats(projectId: string) {
  return useQuery({
    queryKey: ['dashboard', 'project', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/dashboard/project/${projectId}/stats`);
      return data;
    },
    enabled: !!projectId,
  });
}
