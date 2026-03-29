import { CurrencyService } from './currency.service';
export declare class CurrencyController {
    private readonly currencyService;
    constructor(currencyService: CurrencyService);
    getAllCountries(): Promise<any[]>;
    getRate(from: string, to: string): Promise<{
        from: string;
        to: string;
        rate: number;
    }>;
    convert(amount: string, from: string, to: string): Promise<{
        convertedAmount: number;
        rate: number;
        timestamp: Date;
    }>;
}
