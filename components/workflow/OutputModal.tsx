import React from 'react';
import { Eye, Copy, Check, X } from 'lucide-react';
import Modal from '../ui/Modal';

interface OutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  nodeLabel: string;
  isDarkMode: boolean;
}

const OutputModal: React.FC<OutputModalProps> = ({ isOpen, onClose, data, nodeLabel, isDarkMode }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const formattedData = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      title="Node Output"
      subtitle={`Result from: ${nodeLabel}`}
      icon={<Eye size={20} />}
      iconBgColor="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
      onClose={onClose}
      className="w-[700px]"
      isDarkMode={isDarkMode}
    >
      <div className="flex flex-col h-[60vh]">
        <div className="flex-1 overflow-auto p-0 relative border rounded-xl border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-black/30">
          <pre className="p-6 text-xs font-mono leading-relaxed text-gray-800 dark:text-zinc-300 whitespace-pre-wrap break-words">
            {formattedData}
          </pre>
        </div>

        <div className="pt-6 flex items-center justify-end space-x-3">
          <button
            onClick={copyToClipboard}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all border
            ${copied
                ? 'bg-green-500 border-green-500 text-white'
                : isDarkMode
                  ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-full font-bold text-xs transition-all shadow-lg active:scale-95
            ${isDarkMode
                ? 'bg-white text-black hover:bg-gray-200 shadow-white/10'
                : 'bg-black text-white hover:bg-gray-800 shadow-black/20'
              }`}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OutputModal;