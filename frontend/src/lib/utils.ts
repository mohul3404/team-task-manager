import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type Priority, type TaskStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  LOW:    { label: 'Low',    color: 'text-gray-600',  bg: 'bg-gray-100',   dot: 'bg-gray-400' },
  MEDIUM: { label: 'Medium', color: 'text-blue-700',  bg: 'bg-blue-100',   dot: 'bg-blue-500' },
  HIGH:   { label: 'High',   color: 'text-orange-700',bg: 'bg-orange-100', dot: 'bg-orange-500' },
  URGENT: { label: 'Urgent', color: 'text-red-700',   bg: 'bg-red-100',    dot: 'bg-red-500' },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
  TODO:        { label: 'To Do',       color: 'text-gray-600',  bg: 'bg-gray-100',   border: 'border-gray-300' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-700',  bg: 'bg-blue-100',   border: 'border-blue-300' },
  IN_REVIEW:   { label: 'In Review',   color: 'text-purple-700',bg: 'bg-purple-100', border: 'border-purple-300' },
  DONE:        { label: 'Done',        color: 'text-green-700', bg: 'bg-green-100',  border: 'border-green-300' },
};

export function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function isOverdue(dueDate?: string, status?: TaskStatus) {
  if (!dueDate || status === 'DONE') return false;
  return new Date(dueDate) < new Date();
}

export function formatRelativeTime(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}
