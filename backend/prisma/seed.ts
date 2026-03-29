import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const existingAdmin = await prisma.user.findFirst({ where: { email: 'admin@acme.com' } });
  if (existingAdmin) {
    console.log('Seed data already exists. Skipping...');
    return;
  }

  // Set up ACME Corporation
  const company = await prisma.company.create({
    data: {
      name: 'ACME Corporation',
      country: 'US',
      defaultCurrency: 'USD',
    }
  });

  const passwordHash = await bcrypt.hash('password123', 12);

  // Users
  const admin = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Admin Boss',
      email: 'admin@acme.com',
      passwordHash,
      role: 'ADMIN',
      mustChangePassword: false,
    }
  });

  const manager = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Sarah Manager',
      email: 'manager@acme.com',
      passwordHash,
      role: 'MANAGER',
      isManagerApprover: true,
      mustChangePassword: false,
    }
  });

  const employee = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Johnny Employee',
      email: 'johnny@acme.com',
      passwordHash,
      role: 'EMPLOYEE',
      managerId: manager.id,
      mustChangePassword: false,
    }
  });

  // Approval Template
  const template = await prisma.approvalTemplate.create({
    data: {
      companyId: company.id,
      name: 'Standard Approval Route',
      isDefault: true,
      steps: {
        create: [
          {
            stepOrder: 1,
            approverId: manager.id,
            roleLabel: 'Line Manager'
          },
          {
            stepOrder: 2,
            approverId: admin.id,
            roleLabel: 'Finance Director'
          }
        ]
      }
    }
  });

  // Sample Expense
  const expense = await prisma.expense.create({
    data: {
      companyId: company.id,
      submittedById: employee.id,
      amount: 1250.00,
      currency: 'USD',
      convertedAmount: 1250.00,
      companyCurrency: 'USD',
      exchangeRateUsed: 1,
      category: 'TRAVEL',
      description: 'Flight to NY Office',
      date: new Date(),
      status: 'PENDING',
      templateId: template.id,
    }
  });

  // Attach Approval Steps
  await prisma.expenseApproval.create({
    data: {
      expenseId: expense.id,
      approverId: manager.id,
      stepOrder: 1,
      status: 'PENDING'
    }
  });

  console.log('Seeding completed successfully!');
  console.log('Test Accounts:');
  console.log('- admin@acme.com / password123');
  console.log('- manager@acme.com / password123');
  console.log('- johnny@acme.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
