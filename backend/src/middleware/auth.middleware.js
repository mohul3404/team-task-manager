const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, avatar: true },
    });
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

async function requireProjectAdmin(req, res, next) {
  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) return res.status(400).json({ message: 'Project ID required' });

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: req.user.id } },
  });

  if (!member || member.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

async function requireProjectMember(req, res, next) {
  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) return res.status(400).json({ message: 'Project ID required' });

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: req.user.id } },
  });

  if (!member) {
    return res.status(403).json({ message: 'Not a project member' });
  }
  req.projectMember = member;
  next();
}

module.exports = { authenticate, requireProjectAdmin, requireProjectMember };
