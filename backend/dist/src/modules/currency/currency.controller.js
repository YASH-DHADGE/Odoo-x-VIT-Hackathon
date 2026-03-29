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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyController = void 0;
const common_1 = require("@nestjs/common");
const currency_service_1 = require("./currency.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let CurrencyController = class CurrencyController {
    currencyService;
    constructor(currencyService) {
        this.currencyService = currencyService;
    }
    getAllCountries() {
        return this.currencyService.getAllCountriesWithCurrencies();
    }
    getRate(from, to) {
        return this.currencyService.getExchangeRate(from, to).then((rate) => ({
            from,
            to,
            rate,
        }));
    }
    convert(amount, from, to) {
        return this.currencyService.convertAmount(parseFloat(amount), from, to);
    }
};
exports.CurrencyController = CurrencyController;
__decorate([
    (0, common_1.Get)('countries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CurrencyController.prototype, "getAllCountries", null);
__decorate([
    (0, common_1.Get)('rate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CurrencyController.prototype, "getRate", null);
__decorate([
    (0, common_1.Get)('convert'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('amount')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CurrencyController.prototype, "convert", null);
exports.CurrencyController = CurrencyController = __decorate([
    (0, common_1.Controller)('currency'),
    __metadata("design:paramtypes", [currency_service_1.CurrencyService])
], CurrencyController);
//# sourceMappingURL=currency.controller.js.map