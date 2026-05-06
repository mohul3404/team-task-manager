export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: User;
}

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  ownerId: string;
  owner: User;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
  taskStats?: { status: string; _count: number }[];
  _count?: { tasks: number };
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  projectId: string;
  assigneeId?: string;
  creatorId: string;
  assignee?: User;
  creator: User;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
}

export interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  userId: string;
  projectId?: string;
  taskId?: string;
  user: User;
  createdAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  myTasks: number;
  overdueTasks: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}
