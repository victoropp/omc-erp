import 'reflect-metadata';
import { DataSource } from 'typeorm';
export declare const AppDataSource: DataSource;
export declare const initializeDatabase: (maxRetries?: number, delay?: number) => Promise<DataSource>;
export declare const closeDatabase: () => Promise<void>;
//# sourceMappingURL=data-source.d.ts.map