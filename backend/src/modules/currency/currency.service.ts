import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import axios from 'axios';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private readonly RATE_TTL = 3600; // 1 hour
  private readonly COUNTRIES_TTL = 86400; // 24 hours

  constructor(
    private configService: ConfigService,
    @InjectRedis() private redis: Redis,
  ) {}

  // ─── EXCHANGE RATES ──────────────────────────────────────────────────────────

  async getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) return 1;

    const cacheKey = `exchange_rate:${from}:${to}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return parseFloat(cached);
      }
    } catch (err) {
      this.logger.warn('Redis unavailable, fetching live rate');
    }

    const apiUrl = this.configService.get<string>('EXCHANGE_RATE_API_URL');
    const response = await axios.get(`${apiUrl}/${from}`);
    const rates: Record<string, number> = response.data.rates;

    if (!rates[to]) {
      throw new Error(`Unsupported currency: ${to}`);
    }

    const rate = rates[to];

    try {
      await this.redis.setex(cacheKey, this.RATE_TTL, rate.toString());
    } catch {
      this.logger.warn('Failed to cache exchange rate in Redis');
    }

    return rate;
  }

  async convertAmount(amount: number, from: string, to: string): Promise<{
    convertedAmount: number;
    rate: number;
    timestamp: Date;
  }> {
    const rate = await this.getExchangeRate(from, to);
    return {
      convertedAmount: parseFloat((amount * rate).toFixed(2)),
      rate,
      timestamp: new Date(),
    };
  }

  // ─── COUNTRIES ───────────────────────────────────────────────────────────────

  async getAllCountriesWithCurrencies(): Promise<any[]> {
    const cacheKey = 'countries:all';
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      this.logger.warn('Redis unavailable for countries cache');
    }

    const response = await axios.get(
      'https://restcountries.com/v3.1/all?fields=name,currencies,cca2',
    );

    const countries = response.data.map((c: any) => ({
      name: c.name.common,
      cca2: c.cca2,
      currencies: c.currencies
        ? Object.entries(c.currencies).map(([code, details]: [string, any]) => ({
            code,
            name: details.name,
            symbol: details.symbol,
          }))
        : [],
    }));

    try {
      await this.redis.setex(cacheKey, this.COUNTRIES_TTL, JSON.stringify(countries));
    } catch {
      this.logger.warn('Failed to cache countries in Redis');
    }

    return countries;
  }

  async getCurrencyForCountry(countryName: string): Promise<string> {
    try {
      const countries = await this.getAllCountriesWithCurrencies();
      const country = countries.find(
        (c) => c.name.toLowerCase() === countryName.toLowerCase(),
      );
      if (country && country.currencies.length > 0) {
        return country.currencies[0].code;
      }
    } catch (err) {
      this.logger.warn(`Failed to resolve currency for ${countryName}: ${err.message}`);
    }
    return 'USD';
  }
}
