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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const signup_dto_1 = require("./dto/signup.dto");
const login_dto_1 = require("./dto/login.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const jwt_refresh_guard_1 = require("../../common/guards/jwt-refresh.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async signup(dto, res) {
        const result = await this.authService.signup(dto);
        this.setRefreshCookie(res, result.refreshToken);
        const { refreshToken, ...response } = result;
        return response;
    }
    async login(dto, res) {
        const result = await this.authService.login(dto);
        this.setRefreshCookie(res, result.refreshToken);
        const { refreshToken, ...response } = result;
        return response;
    }
    async refresh(user, res) {
        const result = await this.authService.refreshTokens(user.id, user.email, user.role, user.refreshToken);
        this.setRefreshCookie(res, result.refreshToken);
        return { accessToken: result.accessToken };
    }
    async logout(userId, res) {
        res.clearCookie('refresh_token');
        return this.authService.logout(userId);
    }
    getMe(userId) {
        return this.authService.getMe(userId);
    }
    changePassword(userId, dto) {
        return this.authService.changePassword(userId, dto);
    }
    forgotPassword(dto) {
        return this.authService.forgotPassword(dto);
    }
    resetPassword(dto) {
        return this.authService.resetPassword(dto);
    }
    setRefreshCookie(res, token) {
        res.cookie('refresh_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_refresh_guard_1.JwtRefreshGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map