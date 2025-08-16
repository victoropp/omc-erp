export declare class CacheService {
    private cache;
    get<T = any>(key: string): Promise<T | undefined>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    reset(): Promise<void>;
    keys(pattern?: string): Promise<string[]>;
    private cleanup;
    constructor();
}
//# sourceMappingURL=cache.service.d.ts.map