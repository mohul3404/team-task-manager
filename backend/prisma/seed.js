const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@demo.com',
      password: hashedPassword,
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'alice@demo.com' },
    update: {},
    create: {
      name: 'Alice Johnson',
      email: 'alice@demo.com',
      password: hashedPassword,
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'bob@demo.com' },
    update: {},
    create: {
      name: 'Bob Smith',
      email: 'bob@demo.com',
      password: hashedPassword,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design',
      ownerId: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: admin.id } },
    update: {},
    create: { projectId: project.id, userId: admin.id, role: 'ADMIN' },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: member1.id } },
    update: {},
    create: { projectId: project.id, userId: member1.id, role: 'MEMBER' },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: member2.id } },
    update: {},
    create: { projectId: project.id, userId: member2.id, role: 'MEMBER' },
  });

  const tasks = [
    { id: 'demo-task-1', title: 'Design homepage mockup', status: 'DONE', priority: 'HIGH', assigneeId: member1.id },
    { id: 'demo-task-2', title: 'Set up CI/CD pipeline', status: 'IN_PROGRESS', priority: 'URGENT', assigneeId: admin.id },
    { id: 'demo-task-3', title: 'Write API documentation', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: member2.id },
    { id: 'demo-task-4', title: 'Implement authentication', status: 'IN_REVIEW', priority: 'HIGH', assigneeId: admin.id },
    { id: 'demo-task-5', title: 'Mobile responsive layout', status: 'TODO', priority: 'MEDIUM', assigneeId: member1.id },
    { id: 'demo-task-6', title: 'Performance optimization', status: 'TODO', priority: 'LOW', assigneeId: null },
    { id: 'demo-task-7', title: 'Security audit', status: 'TODO', priority: 'URGENT', assigneeId: admin.id, dueDate: new Date(Date.now() - 86400000) },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: {
        ...task,
        projectId: project.id,
        creatorId: admin.id,
      },
    });
  }

  console.log('Seed complete. Demo credentials:');
  console.log('Admin: admin@demo.com / password123');
  console.log('Member: alice@demo.com / password123');
  console.log('Member: bob@demo.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
