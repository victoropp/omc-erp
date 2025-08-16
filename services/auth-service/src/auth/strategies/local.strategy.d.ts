import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(req: any, username: string, password: string): Promise<any>;
}
export {};
//# sourceMappingURL=local.strategy.d.ts.map