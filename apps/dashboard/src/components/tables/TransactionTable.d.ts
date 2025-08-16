import React from 'react';
interface Transaction {
    id: string;
    transactionId: string;
    stationName: string;
    fuelType: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    paymentMethod: string;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    timestamp: string;
    customerType: 'retail' | 'commercial';
    vehicleNumber?: string;
    driverName?: string;
    receiptNumber: string;
}
interface TransactionTableProps {
    showActions?: boolean;
    onTransactionSelect?: (transaction: Transaction) => void;
    filters?: Record<string, any>;
    maxRecords?: number;
}
export declare function TransactionTable({ showActions, onTransactionSelect, filters, maxRecords }: TransactionTableProps): React.JSX.Element;
export {};
//# sourceMappingURL=TransactionTable.d.ts.map