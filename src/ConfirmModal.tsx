import React, { useEffect } from 'react';
import './ConfirmModal.css';

interface ModalProps {
  isOpen: boolean;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

function Modal({ isOpen, message, onConfirm, onCancel, autoClose = false, autoCloseTime = 1000 }: ModalProps) {
  useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        if (onCancel) onCancel();
      }, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isOpen, onCancel, autoCloseTime]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${autoClose ? 'auto-close' : ''}`}>
        <p>{message}</p>
        {!autoClose && (
          <div className="modal-buttons">
            {onConfirm && <button onClick={onConfirm}>确认</button>}
            {onCancel && <button onClick={onCancel}>取消</button>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
