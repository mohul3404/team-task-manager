const prisma = require('../utils/prisma');
const { getIO } = require('../utils/socket');

const projectSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, name: true, email: true, avatar: true } },
  members: {
    select: {
      id: true,
      projectId: true,
      userId: true,
      role: true,
      joinedAt: true,
      user: { select: { id: true, name: true, email: true, avatar: true } }
    },
  },
  _count: { select: { tasks: true } },
};

async function getProjects(req, res) {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      select: { projectId: true },
    });
    const projectIds = memberships.map((m) => m.projectId);

    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: projectSelect,
      orderBy: { updatedAt: 'desc' },
    });

    const withStats = await Promise.all(
      projects.map(async (p) => {
        const taskStats = await prisma.task.groupBy({
          by: ['status'],
          where: { projectId: p.id },
          _count: true,
        });
        return { ...p, taskStats };
      })
    );

    res.json({ projects: withStats });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects', error: err.message });
  }
}

async function createProject(req, res) {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Project name required' });

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        ownerId: req.user.id,
        members: { create: { userId: req.user.id, role: 'ADMIN' } },
      },
      include: projectSelect,
    });

    await prisma.activity.create({
      data: {
        action: 'created project',
        entityType: 'project',
        entityId: project.id,
        userId: req.user.id,
        projectId: project.id,
        metadata: { projectName: project.name },
      },
    });

    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create project', error: err.message });
  }
}

async function getProject(req, res) {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: projectSelect,
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project', error: err.message });
  }
}

async function updateProject(req, res) {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(status && { status }),
      },
      include: projectSelect,
    });

    await prisma.activity.create({
      data: {
        action: 'updated project',
        entityType: 'project',
        entityId: project.id,
        userId: req.user.id,
        projectId: project.id,
        metadata: { projectName: project.name },
      },
    });

    getIO()?.to(`project:${projectId}`).emit('project:updated', project);
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project', error: err.message });
  }
}

async function deleteProject(req, res) {
  try {
    const { projectId } = req.params;
    await prisma.project.delete({ where: { id: projectId } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project', error: err.message });
  }
}

async function addMember(req, res) {
  try {
    const { projectId } = req.params;
    const { email, role = 'MEMBER' } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found with that email' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (existing) return res.status(409).json({ message: 'User already a member' });

    const member = await prisma.projectMember.create({
      data: { projectId, userId: user.id, role },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    await prisma.activity.create({
      data: {
        action: `added ${user.name} to project`,
        entityType: 'project',
        entityId: projectId,
        userId: req.user.id,
        projectId,
        metadata: { memberName: user.name, memberEmail: user.email },
      },
    });

    getIO()?.to(`project:${projectId}`).emit('member:added', member);
    res.status(201).json({ member });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add member', error: err.message });
  }
}

async function removeMember(req, res) {
  try {
    const { projectId, userId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project.ownerId === userId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });

    getIO()?.to(`project:${projectId}`).emit('member:removed', { userId });
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove member', error: err.message });
  }
}

async function getProjectActivity(req, res) {
  try {
    const { projectId } = req.params;
    const activities = await prisma.activity.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activity', error: err.message });
  }
}

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectActivity,
};
