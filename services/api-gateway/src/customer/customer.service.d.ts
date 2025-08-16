import { ProxyService } from '../proxy/proxy.service';
export declare class CustomerService {
    private readonly proxyService;
    private readonly serviceName;
    constructor(proxyService: ProxyService);
    forwardRequest(method: string, path: string, data?: any, headers?: any): Promise<any>;
}
//# sourceMappingURL=customer.service.d.ts.map