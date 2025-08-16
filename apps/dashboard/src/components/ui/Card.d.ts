import React, { HTMLAttributes } from 'react';
interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    animate?: boolean;
    hover?: boolean;
    interactive?: boolean;
}
declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
}
declare const CardHeader: React.ForwardRefExoticComponent<CardHeaderProps & React.RefAttributes<HTMLDivElement>>;
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
}
declare const CardContent: React.ForwardRefExoticComponent<CardContentProps & React.RefAttributes<HTMLDivElement>>;
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
}
declare const CardFooter: React.ForwardRefExoticComponent<CardFooterProps & React.RefAttributes<HTMLDivElement>>;
export { Card, CardHeader, CardContent, CardFooter };
//# sourceMappingURL=Card.d.ts.map