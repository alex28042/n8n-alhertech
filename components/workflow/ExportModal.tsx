import React, { useState } from 'react';
import { FileCode, Check, Copy, Download } from 'lucide-react';
import Modal from '../ui/Modal';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  isDarkMode: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, code, isDarkMode }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "workflow.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Modal
      title="Export to Python"
      subtitle="Run this workflow locally using the Gemini SDK"
      icon={<FileCode size={20} />}
      iconBgColor="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
      onClose={onClose}
      className="w-[800px]"
      isDarkMode={isDarkMode}
    >
      <div className="flex flex-col h-[60vh]">
        <div className="flex-1 overflow-auto p-0 relative border rounded-xl border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-black/20">
          <pre className="p-6 text-sm font-mono leading-relaxed text-gray-800 dark:text-zinc-300">
            {code}
          </pre>
        </div>

        <div className="pt-6 flex items-center justify-end space-x-3">
          <button
            onClick={copyToClipboard}
            className={`flex items-center space-x-2 px-5 py-3 rounded-full font-bold text-sm transition-all border
            ${copied
                ? 'bg-green-500 border-green-500 text-white'
                : isDarkMode
                  ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
          <button
            onClick={downloadCode}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95
            ${isDarkMode
                ? 'bg-white text-black hover:bg-gray-200 shadow-white/10'
                : 'bg-black text-white hover:bg-gray-800 shadow-black/20'
              }`}
          >
            <Download size={16} />
            <span>Download .py</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;