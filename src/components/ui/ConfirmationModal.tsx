'use client';

import React, { useEffect } from 'react';
import { Modal, ModalFooter } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ConfirmationVariant = 'danger' | 'warning' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  loading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmationModalProps) {
  // Handle Enter key to confirm
  useEffect(() => {
    if (!isOpen || loading) return;

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, [isOpen, loading, onConfirm]);

  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-error',
      iconBg: 'bg-error-light',
      buttonVariant: 'danger' as const,
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-warning',
      iconBg: 'bg-warning-light',
      buttonVariant: 'primary' as const,
    },
    info: {
      icon: Info,
      iconColor: 'text-info',
      iconBg: 'bg-info-light',
      buttonVariant: 'primary' as const,
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={!loading}
    >
      <div className="space-y-6">
        {/* Icon - Centered */}
        <div className="flex justify-center">
          <div className={`${config.iconBg} rounded-full p-3`}>
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>
        </div>

        {/* Message - No forced alignment, content decides */}
        <div className="text-gray-700 leading-relaxed">
          {message}
        </div>
      </div>

      <ModalFooter className="mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={config.buttonVariant}
          onClick={onConfirm}
          loading={loading}
          disabled={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
