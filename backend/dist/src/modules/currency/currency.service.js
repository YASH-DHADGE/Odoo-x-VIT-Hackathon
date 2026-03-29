"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CurrencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("@nestjs-modules/ioredis");
const ioredis_2 = __importDefault(require("ioredis"));
const axios_1 = __importDefault(require("axios"));
let CurrencyService = CurrencyService_1 = class CurrencyService {
    configService;
    redis;
    logger = new common_1.Logger(CurrencyService_1.name);
    RATE_TTL = 3600;
    COUNTRIES_TTL = 86400;
    constructor(configService, redis) {
        this.configService = configService;
        this.redis = redis;
    }
    async getExchangeRate(from, to) {
        if (from === to)
            return 1;
        const cacheKey = `exchange_rate:${from}:${to}`;
        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return parseFloat(cached);
            }
        }
        catch (err) {
            this.logger.warn('Redis unavailable, fetching live rate');
        }
        const apiUrl = this.configService.get('EXCHANGE_RATE_API_URL');
        const response = await axios_1.default.get(`${apiUrl}/${from}`);
        const rates = response.data.rates;
        if (!rates[to]) {
            throw new Error(`Unsupported currency: ${to}`);
        }
        const rate = rates[to];
        try {
            await this.redis.setex(cacheKey, this.RATE_TTL, rate.toString());
        }
        catch {
            this.logger.warn('Failed to cache exchange rate in Redis');
        }
        return rate;
    }
    async convertAmount(amount, from, to) {
        const rate = await this.getExchangeRate(from, to);
        return {
            convertedAmount: parseFloat((amount * rate).toFixed(2)),
            rate,
            timestamp: new Date(),
        };
    }
    async getAllCountriesWithCurrencies() {
        const cacheKey = 'countries:all';
        try {
            const cached = await this.redis.get(cacheKey);
            if (cached)
                return JSON.parse(cached);
        }
        catch {
            this.logger.warn('Redis unavailable for countries cache');
        }
        const response = await axios_1.default.get('https://restcountries.com/v3.1/all?fields=name,currencies,cca2');
        const countries = response.data.map((c) => ({
            name: c.name.common,
            cca2: c.cca2,
            currencies: c.currencies
                ? Object.entries(c.currencies).map(([code, details]) => ({
                    code,
                    name: details.name,
                    symbol: details.symbol,
                }))
                : [],
        }));
        try {
            await this.redis.setex(cacheKey, this.COUNTRIES_TTL, JSON.stringify(countries));
        }
        catch {
            this.logger.warn('Failed to cache countries in Redis');
        }
        return countries;
    }
    async getCurrencyForCountry(countryName) {
        try {
            const countries = await this.getAllCountriesWithCurrencies();
            const country = countries.find((c) => c.name.toLowerCase() === countryName.toLowerCase());
            if (country && country.currencies.length > 0) {
                return country.currencies[0].code;
            }
        }
        catch (err) {
            this.logger.warn(`Failed to resolve currency for ${countryName}: ${err.message}`);
        }
        return 'USD';
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = CurrencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, ioredis_1.InjectRedis)()),
    __metadata("design:paramtypes", [config_1.ConfigService,
        ioredis_2.default])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map