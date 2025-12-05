import React from 'react';
import { WorkflowVersion } from '../../types';
import { RotateCcw, Trash2, Clock } from 'lucide-react';
import Modal from '../ui/Modal';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: WorkflowVersion[];
  onRestore: (version: WorkflowVersion) => void;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onDelete,
  isDarkMode
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      title="Workflow History"
      subtitle="Restore previous versions of your work"
      icon={<Clock size={20} />}
      iconBgColor="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
      onClose={onClose}
      isDarkMode={isDarkMode}
    >
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-zinc-600">
            <p className="text-sm font-medium">No saved versions found.</p>
            <p className="text-xs mt-1 opacity-70">Click "Save Version" to create a checkpoint.</p>
          </div>
        ) : (
          history.map((version) => (
            <div key={version.id} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 bg-gray-50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all">
              <div className="flex items-start space-x-4">
                <div className="mt-1 w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-600 group-hover:bg-orange-500 transition-colors"></div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{version.label}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                      {new Date(version.timestamp).toLocaleString()}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400 font-bold">
                      {version.nodes.length} Nodes
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onRestore(version)}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border border-gray-100 dark:border-zinc-700 shadow-sm hover:scale-105 transition-transform"
                  title="Restore this version"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => onDelete(version.id)}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-900 text-red-500 border border-gray-100 dark:border-zinc-700 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-105 transition-all"
                  title="Delete version"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default HistoryModal;