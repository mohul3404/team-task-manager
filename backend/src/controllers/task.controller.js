const prisma = require('../utils/prisma');
const { getIO } = require('../utils/socket');

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true, avatar: true } },
  creator: { select: { id: true, name: true, email: true, avatar: true } },
  comments: {
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: 'asc' },
  },
  _count: { select: { comments: true } },
};

async function getProjectTasks(req, res) {
  try {
    const { projectId } = req.params;
    const { status, priority, assigneeId, search } = req.query;

    const where = {
      projectId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
    };

    const tasks = await prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
}

async function createTask(req, res) {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: 'Task title required' });

    if (assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assigneeId } },
      });
      if (!member) return res.status(400).json({ message: 'Assignee is not a project member' });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        creatorId: req.user.id,
      },
      include: taskInclude,
    });

    await prisma.activity.create({
      data: {
        action: `created task "${task.title}"`,
        entityType: 'task',
        entityId: task.id,
        userId: req.user.id,
        projectId,
        taskId: task.id,
        metadata: { taskTitle: task.title, status: task.status, priority: task.priority },
      },
    });

    getIO()?.to(`project:${projectId}`).emit('task:created', task);
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
}

async function getTask(req, res) {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: taskInclude });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task', error: err.message });
  }
}

async function updateTask(req, res) {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const changes = [];
    if (status && status !== existing.status) changes.push(`status to ${status}`);
    if (priority && priority !== existing.priority) changes.push(`priority to ${priority}`);
    if (assigneeId !== undefined && assigneeId !== existing.assigneeId) {
      changes.push('assignee');
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: taskInclude,
    });

    if (changes.length > 0) {
      await prisma.activity.create({
        data: {
          action: `updated task "${task.title}" — changed ${changes.join(', ')}`,
          entityType: 'task',
          entityId: task.id,
          userId: req.user.id,
          projectId: task.projectId,
          taskId: task.id,
          metadata: { changes },
        },
      });
    }

    getIO()?.to(`project:${task.projectId}`).emit('task:updated', task);
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
}

async function deleteTask(req, res) {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await prisma.task.delete({ where: { id: taskId } });

    await prisma.activity.create({
      data: {
        action: `deleted task "${task.title}"`,
        entityType: 'task',
        entityId: taskId,
        userId: req.user.id,
        projectId: task.projectId,
        metadata: { taskTitle: task.title },
      },
    });

    getIO()?.to(`project:${task.projectId}`).emit('task:deleted', { taskId });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
}

async function addComment(req, res) {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Comment content required' });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await prisma.comment.create({
      data: { content: content.trim(), taskId, userId: req.user.id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    await prisma.activity.create({
      data: {
        action: `commented on task "${task.title}"`,
        entityType: 'task',
        entityId: taskId,
        userId: req.user.id,
        projectId: task.projectId,
        taskId,
        metadata: { comment: content.trim().substring(0, 100) },
      },
    });

    getIO()?.to(`project:${task.projectId}`).emit('comment:added', { taskId, comment });
    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
}

async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not your comment' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete comment', error: err.message });
  }
}

module.exports = {
  getProjectTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
};
