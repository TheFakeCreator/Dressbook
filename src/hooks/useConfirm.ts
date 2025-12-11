'use client';

import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
}

interface UseConfirmReturn {
  isOpen: boolean;
  confirmOptions: ConfirmOptions | null;
  isLoading: boolean;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
  setLoading: (loading: boolean) => void;
}

export const useConfirm = (): UseConfirmReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setConfirmOptions(options);
    setIsOpen(true);
    setIsLoading(false);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setConfirmOptions(null);
    setResolvePromise(null);
    setIsLoading(false);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setConfirmOptions(null);
    setResolvePromise(null);
    setIsLoading(false);
  }, [resolvePromise]);

  return {
    isOpen,
    confirmOptions,
    isLoading,
    confirm,
    handleConfirm,
    handleCancel,
    setLoading: setIsLoading,
  };
};
