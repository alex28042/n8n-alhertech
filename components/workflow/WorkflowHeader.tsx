import React from 'react';
import { Save, FolderOpen, FileCode, Moon, Sun, BarChart2, Loader2, Play } from 'lucide-react';

interface WorkflowHeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isRunning: boolean;
  onRun: () => void;
  onSave: () => void;
  onHistory: () => void;
  onExport: () => void;
  showAnalytics: boolean;
  toggleAnalytics: () => void;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  isDarkMode,
  toggleTheme,
  isRunning,
  onRun,
  onSave,
  onHistory,
  onExport,
  showAnalytics,
  toggleAnalytics
}) => {
  return (
    <div className="absolute top-6 left-6 right-6 h-20 pointer-events-none z-10 flex items-start justify-end">
      <div className={`
        backdrop-blur-xl border p-2 pr-4 pl-4 rounded-full shadow-lg flex items-center space-x-4 pointer-events-auto transition-all duration-300
        ${isDarkMode
          ? 'bg-zinc-900/80 border-zinc-800 shadow-black/50'
          : 'bg-white/80 border-gray-100 shadow-xl shadow-gray-200/50'}
      `}>
        <div className="flex flex-col mr-2">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Status</span>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-xs font-bold">Active</span>
          </div>
        </div>

        <div className={`h-8 w-[1px] mx-2 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}></div>

        {/* Action Buttons Group */}
        <div className="flex items-center space-x-1">
          <ActionButton onClick={onSave} icon={<Save size={18} strokeWidth={2.5} />} label="Save Version" isDarkMode={isDarkMode} />
          <ActionButton onClick={onHistory} icon={<FolderOpen size={18} strokeWidth={2.5} />} label="History / Open" isDarkMode={isDarkMode} />
          <ActionButton onClick={onExport} icon={<FileCode size={18} strokeWidth={2.5} />} label="Export Python" isDarkMode={isDarkMode} />
        </div>

        <div className={`h-8 w-[1px] mx-2 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}></div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-full transition-all duration-200 ${isDarkMode
              ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          {isDarkMode ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
        </button>

        <button
          onClick={toggleAnalytics}
          className={`p-2.5 rounded-full transition-all duration-200 ${isDarkMode
              ? (showAnalytics ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')
              : (showAnalytics ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
            }`}
        >
          <BarChart2 size={18} strokeWidth={2.5} />
        </button>

        <button
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-full font-bold transition-all transform active:scale-95 ${isRunning
              ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
              : isDarkMode
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-black text-white hover:bg-zinc-800 shadow-xl shadow-black/20'
            }`}
        >
          {isRunning ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
          <span>Run Flow</span>
        </button>
      </div>
    </div>
  );
};

const ActionButton = ({ onClick, icon, label, isDarkMode }: { onClick: () => void, icon: React.ReactNode, label: string, isDarkMode: boolean }) => (
  <button
    onClick={onClick}
    className={`p-2.5 rounded-full transition-all duration-200 group relative ${isDarkMode
        ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'
      }`}
  >
    {icon}
    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded-md whitespace-nowrap z-50">
      {label}
    </span>
  </button>
);

export default WorkflowHeader;