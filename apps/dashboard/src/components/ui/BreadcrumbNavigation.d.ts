import React from 'react';
interface BreadcrumbItem {
    label: string;
    href: string;
    icon?: React.ComponentType<{
        className?: string;
    }>;
}
interface BreadcrumbNavigationProps {
    items?: BreadcrumbItem[];
    showHome?: boolean;
}
export declare function BreadcrumbNavigation({ items, showHome }: BreadcrumbNavigationProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=BreadcrumbNavigation.d.ts.map