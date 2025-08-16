import { CustomerService } from './customer.service';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    getCustomers(query: any, headers: any): Promise<any>;
    getCustomer(id: string, headers: any): Promise<any>;
    createCustomer(data: any, headers: any): Promise<any>;
    updateCustomer(id: string, data: any, headers: any): Promise<any>;
}
//# sourceMappingURL=customer.controller.d.ts.map