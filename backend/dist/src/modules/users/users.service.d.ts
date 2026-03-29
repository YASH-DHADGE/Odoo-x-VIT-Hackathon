import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
export declare class UsersService {
    private prisma;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    findAll(companyId: string): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    create(companyId: string, dto: CreateUserDto): Promise<{
        user: any;
        temporaryPassword: string;
    }>;
    update(id: string, companyId: string, dto: UpdateUserDto): Promise<any>;
    assignRole(id: string, companyId: string, dto: AssignRoleDto): Promise<any>;
    assignManager(id: string, companyId: string, managerId: string): Promise<any>;
    remove(id: string, companyId: string): Promise<{
        message: string;
    }>;
    private generateRandomPassword;
}
