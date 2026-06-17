import React, { useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';

const CenteredNotification = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      icon: CheckCircleIcon,
      title: 'Success',
      wrapper: 'border-emerald-200 bg-white',
      iconBox: 'bg-emerald-100 text-emerald-600',
      titleColor: 'text-emerald-900',
      messageColor: 'text-emerald-700',
      progress: 'bg-emerald-500',
    },
    error: {
      icon: XCircleIcon,
      title: 'Error',
      wrapper: 'border-red-200 bg-white',
      iconBox: 'bg-red-100 text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
      progress: 'bg-red-500',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      title: 'Warning',
      wrapper: 'border-amber-200 bg-white',
      iconBox: 'bg-amber-100 text-amber-600',
      titleColor: 'text-amber-900',
      messageColor: 'text-amber-700',
      progress: 'bg-amber-500',
    },
    info: {
      icon: InformationCircleIcon,
      title: 'Notice',
      wrapper: 'border-blue-200 bg-white',
      iconBox: 'bg-blue-100 text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      progress: 'bg-blue-500',
    },
  };

  const item = config[type] || config.success;
  const Icon = item.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-6 sm:pt-10 pointer-events-none">
      <div
        className={`pointer-events-auto relative w-full max-w-md overflow-hidden rounded-xl border ${item.wrapper} shadow-2xl ring-1 ring-black/5 animate-fade-in-up`}
      >
        <div className="flex gap-4 px-5 py-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.iconBox}`}>
            <Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className={`text-sm font-semibold ${item.titleColor}`}>
              {item.title}
            </p>
            <p className={`mt-1 text-sm leading-5 ${item.messageColor}`}>
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close notification"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="h-1 w-full bg-gray-100">
          <div className={`h-full ${item.progress} animate-notification-progress`} />
        </div>
      </div>
    </div>
  );
};

export default CenteredNotification;