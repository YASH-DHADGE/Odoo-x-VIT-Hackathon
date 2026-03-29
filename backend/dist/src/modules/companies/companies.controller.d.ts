import { CompaniesService } from './companies.service';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    getMyCompany(companyId: string): Promise<any>;
    updateMyCompany(companyId: string, body: {
        name?: string;
        defaultCurrency?: string;
    }): Promise<any>;
}
