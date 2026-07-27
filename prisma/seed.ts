import 'dotenv/config';
import { Role, EvaluationType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🌱 Starting Database Seeding...');

  const mainBranch = await prisma.branch.create({
    data: { name: 'Main Branch', location: 'Sana\'a - Hadda Street' },
  });
  const sanaaBranch = await prisma.branch.create({
    data: { name: 'Sana\'a Branch', location: 'Sana\'a - Zubairi Street' },
  });
  const ibbBranch = await prisma.branch.create({
    data: { name: 'Ibb Branch', location: 'Ibb - Main Street' },
  });
  console.log('✅ Branches created');

  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@alhobaishi.com',
      passwordHash,
      role: Role.ADMIN,
      branchId: mainBranch.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Branch Manager',
      email: 'manager@alhobaishi.com',
      passwordHash,
      role: Role.MANAGER,
      branchId: sanaaBranch.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Ahmed Employee',
      email: 'ahmed@alhobaishi.com',
      passwordHash,
      role: Role.EMPLOYEE,
      branchId: sanaaBranch.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Ali Employee',
      email: 'ali@alhobaishi.com',
      passwordHash,
      role: Role.EMPLOYEE,
      branchId: ibbBranch.id,
    },
  });
  console.log('✅ Default users created');

  const customerCriteria = ['Speed', 'Quality', 'Attitude'];
  for (const name of customerCriteria) {
    await prisma.criteria.create({
      data: { name, type: EvaluationType.CUSTOMER, description: `Rate the ${name.toLowerCase()}` },
    });
  }

  const internalCriteria = ['Teamwork', 'Punctuality'];
  for (const name of internalCriteria) {
    await prisma.criteria.create({
      data: { name, type: EvaluationType.INTERNAL_360, description: `Rate the ${name.toLowerCase()}` },
    });
  }
  console.log('✅ Evaluation criteria created');

  console.log('🚀 Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
