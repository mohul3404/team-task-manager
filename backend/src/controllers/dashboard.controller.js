const prisma = require('../utils/prisma');

async function getDashboard(req, res) {
  try {
    const userId = req.user.id;

    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    const projectIds = memberships.map((m) => m.projectId);

    const now = new Date();

    const [
      totalProjects,
      myTasks,
      overdueTasks,
      tasksByStatus,
      tasksByPriority,
      recentActivity,
      upcomingTasks,
    ] = await Promise.all([
      prisma.project.count({ where: { id: { in: projectIds } } }),
      prisma.task.count({ where: { assigneeId: userId, status: { not: 'DONE' } } }),
      prisma.task.count({
        where: {
          projectId: { in: projectIds },
          dueDate: { lt: now },
          status: { not: 'DONE' },
        },
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { projectId: { in: projectIds } },
        _count: true,
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { projectId: { in: projectIds }, status: { not: 'DONE' } },
        _count: true,
      }),
      prisma.activity.findMany({
        where: { projectId: { in: projectIds } },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      prisma.task.findMany({
        where: {
          assigneeId: userId,
          status: { not: 'DONE' },
          dueDate: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) },
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
    ]);

    const completedTasks = tasksByStatus.find((s) => s.status === 'DONE')?._count ?? 0;
    const totalTasks = tasksByStatus.reduce((sum, s) => sum + s._count, 0);

    res.json({
      stats: {
        totalProjects,
        myTasks,
        overdueTasks,
        completedTasks,
        totalTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      tasksByStatus,
      tasksByPriority,
      recentActivity,
      upcomingTasks,
    });
  } catch (err) {
    res.status(500).json({ message: 'Dashboard failed', error: err.message });
  }
}

async function getProjectStats(req, res) {
  try {
    const { projectId } = req.params;
    const now = new Date();

    const [tasksByStatus, tasksByPriority, overdueTasks, tasksByAssignee] = await Promise.all([
      prisma.task.groupBy({ by: ['status'], where: { projectId }, _count: true }),
      prisma.task.groupBy({ by: ['priority'], where: { projectId }, _count: true }),
      prisma.task.count({
        where: { projectId, dueDate: { lt: now }, status: { not: 'DONE' } },
      }),
      prisma.task.groupBy({
        by: ['assigneeId'],
        where: { projectId },
        _count: true,
      }),
    ]);

    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const recentCompletions = await prisma.task.count({
      where: { projectId, status: 'DONE', updatedAt: { gte: weekAgo } },
    });

    res.json({ tasksByStatus, tasksByPriority, overdueTasks, tasksByAssignee, recentCompletions });
  } catch (err) {
    res.status(500).json({ message: 'Stats failed', error: err.message });
  }
}

module.exports = { getDashboard, getProjectStats };
