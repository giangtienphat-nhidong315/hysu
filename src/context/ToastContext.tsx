import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Heart,
  Sparkles,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface AlertModalOptions {
  title: string;
  message: string;
  type?: ToastType;
  buttonText?: string;
}

interface ConfirmModalOptions {
  title: string;
  message: string;
  type?: ToastType;
  confirmText?: string;
  cancelText?: string;
}

interface ToastContextType {
  // Toasts
  showToast: (title: string, message?: string, type?: ToastType, duration?: number) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;

  // Dialogs
  alert: (options: AlertModalOptions | string) => Promise<void>;
  confirm: (options: ConfirmModalOptions | string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Dialog states
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    options: AlertModalOptions;
    resolve: () => void;
  } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    options: ConfirmModalOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastType = 'info', duration = 3500) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      const newToast: ToastItem = { id, title, message, type, duration };

      setToasts(prev => [newToast, ...prev.slice(0, 4)]); // giữ tối đa 5 toast cùng lúc

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast(title, message, 'success', duration);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast(title, message, 'error', duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast(title, message, 'warning', duration);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast(title, message, 'info', duration);
    },
    [showToast]
  );

  // Thay thế alert() mặc định bằng popup sang trọng
  const alert = useCallback((options: AlertModalOptions | string): Promise<void> => {
    return new Promise(resolve => {
      const opt: AlertModalOptions =
        typeof options === 'string'
          ? { title: 'Thông Báo', message: options, type: 'info' }
          : { ...options, type: options.type || 'info' };

      setAlertDialog({
        isOpen: true,
        options: opt,
        resolve,
      });
    });
  }, []);

  // Thay thế confirm() mặc định bằng popup sang trọng
  const confirm = useCallback((options: ConfirmModalOptions | string): Promise<boolean> => {
    return new Promise(resolve => {
      const opt: ConfirmModalOptions =
        typeof options === 'string'
          ? { title: 'Xác Nhận Hành Động', message: options, type: 'warning' }
          : { ...options, type: options.type || 'warning' };

      setConfirmDialog({
        isOpen: true,
        options: opt,
        resolve,
      });
    });
  }, []);

  const handleCloseAlert = () => {
    if (alertDialog) {
      alertDialog.resolve();
      setAlertDialog(null);
    }
  };

  const handleConfirmDecision = (decision: boolean) => {
    if (confirmDialog) {
      confirmDialog.resolve(decision);
      setConfirmDialog(null);
    }
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        warning,
        info,
        alert,
        confirm,
      }}
    >
      {children}

      {/* ============================================================== */}
      {/* 1. DANH SÁCH TOAST NOTIFICATIONS (Góc trên phải) */}
      {/* ============================================================== */}
      <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
                isSuccess
                  ? 'bg-emerald-50/95 border-emerald-300/80 text-emerald-950'
                  : isError
                  ? 'bg-rose-50/95 border-rose-300/80 text-rose-950'
                  : isWarning
                  ? 'bg-amber-50/95 border-amber-300/80 text-amber-950'
                  : 'bg-white/95 border-rose-200/90 text-slate-900'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isSuccess
                    ? 'bg-emerald-100 text-emerald-600'
                    : isError
                    ? 'bg-rose-100 text-rose-600'
                    : isWarning
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-rose-100 text-rose-600'
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-5 h-5" />}
                {isError && <AlertCircle className="w-5 h-5" />}
                {isWarning && <AlertTriangle className="w-5 h-5" />}
                {toast.type === 'info' && <Sparkles className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <h4 className="text-xs sm:text-sm font-bold leading-snug">{toast.title}</h4>
                {toast.message && (
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed font-medium">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 2. POPUP THÔNG BÁO HỆ THỐNG (ALERT MODAL SANG TRỌNG) */}
      {/* ============================================================== */}
      {alertDialog && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-inner ${
                alertDialog.options.type === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : alertDialog.options.type === 'error'
                  ? 'bg-rose-100 text-rose-600'
                  : alertDialog.options.type === 'warning'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-rose-100 text-rose-600'
              }`}
            >
              {alertDialog.options.type === 'success' && <CheckCircle2 className="w-8 h-8" />}
              {alertDialog.options.type === 'error' && <AlertCircle className="w-8 h-8" />}
              {alertDialog.options.type === 'warning' && <AlertTriangle className="w-8 h-8" />}
              {alertDialog.options.type === 'info' && <Sparkles className="w-8 h-8 text-rose-500" />}
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {alertDialog.options.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
                {alertDialog.options.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCloseAlert}
                className="w-full py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition transform active:scale-95 cursor-pointer"
              >
                {alertDialog.options.buttonText || 'Đã hiểu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. POPUP XÁC NHẬN HÀNH ĐỘNG (CONFIRM MODAL SANG TRỌNG) */}
      {/* ============================================================== */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-inner ${
                confirmDialog.options.type === 'error'
                  ? 'bg-rose-100 text-rose-600'
                  : confirmDialog.options.type === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              {confirmDialog.options.type === 'error' ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {confirmDialog.options.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
                {confirmDialog.options.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmDecision(false)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition cursor-pointer"
              >
                {confirmDialog.options.cancelText || 'Hủy bỏ'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDecision(true)}
                className={`w-full py-2.5 px-4 rounded-2xl text-white font-bold text-sm shadow-md transition transform active:scale-95 cursor-pointer ${
                  confirmDialog.options.type === 'error'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {confirmDialog.options.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return context;
};
