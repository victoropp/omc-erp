import React from 'react';
interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    disabled?: boolean;
}
export declare function Tooltip({ content, children, position, delay, disabled }: TooltipProps): React.JSX.Element;
export {};
//# sourceMappingURL=Tooltip.d.ts.map