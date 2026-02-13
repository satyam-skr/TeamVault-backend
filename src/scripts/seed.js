import {prisma} from '../config/prisma.ts'
import { hashPassword } from '../utils/password.utils.js';


async function main() {
  console.log('Starting database seed...');

  // Create Admin User
  const adminPassword = await hashPassword('Admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@primetrade.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@primetrade.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });
  console.log('Created admin user:', admin.email);


  // Create Regular Users
  const user1Password = await hashPassword('User123');
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@primetrade.com' },
    update: {},
    create: {
      name: 'User One',
      email: 'user1@primetrade.com',
      password: user1Password,
      role: 'USER'
    }
  });
  console.log('Created user:', user1.email);

  const user2Password = await hashPassword('User123');
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@primetrade.com' },
    update: {},
    create: {
      name: 'User Two',
      email: 'user2@primetrade.com',
      password: user2Password,
      role: 'USER'
    }
  });
  console.log('Created user:', user2.email);

  // Create Sample Tasks for User 1
  const task1 = await prisma.task.create({
    data: {
      title: 'Setup Development Environment',
      description: 'Install Node.js, PostgreSQL, and configure the project environment variables',
      status: 'DONE',
      userId: user1.id
    }
  });
  console.log('Created task:', task1.title);

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement Authentication',
      description: 'Complete JWT authentication with access and refresh tokens',
      status: 'DONE',
      userId: user1.id
    }
  });
  console.log('Created task:', task2.title);

  const task3 = await prisma.task.create({
    data: {
      title: 'Add Task CRUD Operations',
      description: 'Implement create, read, update, and delete operations for tasks',
      status: 'IN_PROGRESS',
      userId: user1.id
    }
  });
  console.log('Created task:', task3.title);

  // Create Sample Tasks for User 2
  const task4 = await prisma.task.create({
    data: {
      title: 'Write API Documentation',
      description: 'Document all API endpoints using Swagger/OpenAPI specification',
      status: 'TODO',
      userId: user2.id
    }
  });
  console.log('Created task:', task4.title);

  const task5 = await prisma.task.create({
    data: {
      title: 'Deploy to Production',
      description: 'Configure production environment and deploy the application',
      status: 'TODO',
      userId: user2.id
    }
  });
  console.log('Created task:', task5.title);

  console.log('\nDatabase seeding completed successfully!');
  console.log('\nTest Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Email: admin@primetrade.com');
  console.log('  Password: Admin123');
  console.log('\nUser 1:');
  console.log('  Email: user1@primetrade.com');
  console.log('  Password: User123');
  console.log('\nUser 2:');
  console.log('  Email: user2@primetrade.com');
  console.log('  Password: User123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
