"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const existingAdmin = await prisma.user.findFirst({ where: { email: 'admin@acme.com' } });
    if (existingAdmin) {
        console.log('Seed data already exists. Skipping...');
        return;
    }
    const company = await prisma.company.create({
        data: {
            name: 'ACME Corporation',
            country: 'US',
            defaultCurrency: 'USD',
        }
    });
    const passwordHash = await bcrypt.hash('password123', 12);
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
//# sourceMappingURL=seed.js.map