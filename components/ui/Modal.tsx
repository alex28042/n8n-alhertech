import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  isDarkMode?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  title, 
  subtitle, 
  icon, 
  iconBgColor = 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', 
  onClose, 
  children, 
  className = 'w-[600px]',
  isDarkMode 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`
          ${className} max-h-[85vh] flex flex-col rounded-[32px] shadow-2xl overflow-hidden border
          ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={`p-2.5 rounded-xl ${iconBgColor}`}>
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
              {subtitle && <p className="text-xs text-gray-500 dark:text-zinc-400">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;