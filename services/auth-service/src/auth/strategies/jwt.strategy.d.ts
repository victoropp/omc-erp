import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(payload: any): Promise<{
        sub: any;
        email: any;
        tenantId: any;
        role: any;
    }>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map