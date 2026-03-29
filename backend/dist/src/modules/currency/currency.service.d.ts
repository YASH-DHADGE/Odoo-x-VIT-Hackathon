import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class CurrencyService {
    private configService;
    private redis;
    private readonly logger;
    private readonly RATE_TTL;
    private readonly COUNTRIES_TTL;
    constructor(configService: ConfigService, redis: Redis);
    getExchangeRate(from: string, to: string): Promise<number>;
    convertAmount(amount: number, from: string, to: string): Promise<{
        convertedAmount: number;
        rate: number;
        timestamp: Date;
    }>;
    getAllCountriesWithCurrencies(): Promise<any[]>;
    getCurrencyForCountry(countryName: string): Promise<string>;
}
