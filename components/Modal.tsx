'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Tooltip } from 'react-tooltip';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
}

const Modal: React.FC<ModalProps> = ({
isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 bg-gray-700/50 z-50 flex justify-center
    items-center p-4">
      <div className={`bg-white rounded-lg shadow-xl p-6 w-full
      ${sizeClasses[size]} relative`}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <div className="relative">
            <button
              onClick={onClose}
              data-tooltip-id="modal-close-tooltip"
              data-tooltip-content="Cerrar"
              aria-label="Cerrar modal"
              className="text-gray-400 hover:text-red-600 hover:cursor-pointer
              focus:outline-none transition-colors duration-200 p-1 rounded"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div>{children}</div>
      </div>

      <Tooltip
        id="modal-close-tooltip"
        place="bottom"
        variant="info"
        offset={10}
      />
    </div>
  );
};

export default Modal;