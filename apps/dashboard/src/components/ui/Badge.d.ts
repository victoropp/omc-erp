import React from 'react';
interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
    className?: string;
    [key: string]: any;
}
export declare const Badge: React.FC<BadgeProps>;
export {};
//# sourceMappingURL=Badge.d.ts.map