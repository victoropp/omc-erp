import React from 'react';
import { ModalProps } from '@/types';
export declare function Modal({ isOpen, onClose, title, size, children }: ModalProps): React.JSX.Element;
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}
export declare function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant, loading }: ConfirmationModalProps): React.JSX.Element;
interface FormModalProps extends Omit<ModalProps, 'children'> {
    onSubmit: (event: React.FormEvent) => void;
    children: React.ReactNode;
    submitText?: string;
    cancelText?: string;
    loading?: boolean;
    disabled?: boolean;
}
export declare function FormModal({ isOpen, onClose, onSubmit, title, size, children, submitText, cancelText, loading, disabled }: FormModalProps): React.JSX.Element;
export {};
//# sourceMappingURL=Modal.d.ts.map