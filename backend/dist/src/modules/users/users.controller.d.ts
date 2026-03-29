import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(companyId: string): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    create(dto: CreateUserDto, companyId: string): Promise<{
        user: any;
        temporaryPassword: string;
    }>;
    update(id: string, dto: UpdateUserDto, companyId: string): Promise<any>;
    assignRole(id: string, dto: AssignRoleDto, companyId: string): Promise<any>;
    assignManager(id: string, managerId: string, companyId: string): Promise<any>;
    remove(id: string, companyId: string): Promise<{
        message: string;
    }>;
}
