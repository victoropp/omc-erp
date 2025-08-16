import { ProxyService } from '../proxy/proxy.service';
export declare class AuthController {
    private readonly proxyService;
    constructor(proxyService: ProxyService);
    register(registerDto: any, headers: any): Promise<any>;
    login(loginDto: any, headers: any): Promise<any>;
    refreshTokens(refreshDto: any, headers: any): Promise<any>;
    logout(headers: any): Promise<any>;
    forgotPassword(forgotPasswordDto: any, headers: any): Promise<any>;
    resetPassword(resetPasswordDto: any, headers: any): Promise<any>;
    getProfile(headers: any): Promise<any>;
}
//# sourceMappingURL=auth.controller.d.ts.map