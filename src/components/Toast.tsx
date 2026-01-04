'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import styles from './Toast.module.css'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = `toast_${Date.now()}`
        setToasts(prev => [...prev, { id, message, type }])

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }, [])

    const dismissToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`${styles.toast} ${styles[toast.type]}`}
                        onClick={() => dismissToast(toast.id)}
                    >
                        <div className={styles.icon}>
                            {toast.type === 'success' && <i className="fa fa-check-circle"></i>}
                            {toast.type === 'error' && <i className="fa fa-times-circle"></i>}
                            {toast.type === 'warning' && <i className="fa fa-exclamation-triangle"></i>}
                            {toast.type === 'info' && <i className="fa fa-info-circle"></i>}
                        </div>
                        <span className={styles.message}>{toast.message}</span>
                        <button className={styles.closeBtn}>
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
