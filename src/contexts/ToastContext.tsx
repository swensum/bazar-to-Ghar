import React, { createContext, useCallback, useContext, useState } from 'react';

export type ToastVariant = 'success' | 'error';

export type ToastState = {
    id: number;
    variant: ToastVariant;
    title: string;
    message?: string;
};

type ToastContextValue = {
    toasts: ToastState[];
    pushToast: (variant: ToastVariant, title: string, message?: string) => void;
    removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
    return ctx;
};

let toastIdCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastState[]>([]);

    const pushToast = useCallback((variant: ToastVariant, title: string, message?: string) => {
        if (!title) return;
        toastIdCounter += 1;
        setToasts((prev) => [...prev, { id: toastIdCounter, variant, title, message }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, pushToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};