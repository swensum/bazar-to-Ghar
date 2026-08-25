import React, { useEffect, useState } from 'react';
import { useToast, type ToastState } from '../contexts/ToastContext';

const CheckIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#1c7a68" />
        <path d="M7.5 12.5l3 3 6-6.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ErrorIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#c0392b" />
        <path d="M12 7v6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.2" r="1.1" fill="#fff" />
    </svg>
);

type ToastProps = {
    toast: ToastState;
    onClose: (id: number) => void;
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        const dismissTimer = setTimeout(() => setClosing(true), 4200);
        return () => clearTimeout(dismissTimer);
    }, []);

    useEffect(() => {
        if (!closing) return;
        const removeTimer = setTimeout(() => onClose(toast.id), 220);
        return () => clearTimeout(removeTimer);
    }, [closing, onClose, toast.id]);

    return (
        <div
            className={`toast toast--${toast.variant}${closing ? ' toast--closing' : ''}`}
            role={toast.variant === 'error' ? 'alert' : 'status'}
        >
            <span className="toast__icon">{toast.variant === 'success' ? <CheckIcon /> : <ErrorIcon />}</span>
            <div className="toast__body">
                <p className="toast__title">{toast.title}</p>
                {toast.message && <p className="toast__message">{toast.message}</p>}
            </div>
            <button
                type="button"
                className="toast__close"
                aria-label="Dismiss notification"
                onClick={() => setClosing(true)}
            >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
            </button>
        </div>
    );
};

// Reads directly from ToastContext — mount this once, high in the tree
// (e.g. right inside <ToastProvider>, alongside your <Router>), so it
// survives route changes instead of being remounted per-page.
export const ToastViewport: React.FC = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;
    return (
        <div className="toast-viewport" aria-live="polite">
            {toasts.map((t) => (
                <Toast key={t.id} toast={t} onClose={removeToast} />
            ))}
        </div>
    );
};