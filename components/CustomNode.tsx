import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData, NodeType } from '../types';
import { Zap, Bot, Bug, Code, Globe, Split, Clock, Eye, Maximize2, Minimize2, FileJson } from 'lucide-react';

const icons = {
  [NodeType.WEBHOOK]: Zap,
  [NodeType.AI_AGENT]: Bot,
  [NodeType.DEBUG]: Bug,
  [NodeType.JAVASCRIPT]: Code,
  [NodeType.HTTP_REQUEST]: Globe,
  [NodeType.CONDITION]: Split,
  [NodeType.DELAY]: Clock,
};

// Pastel/Clean accents for the icon background - Adjusted for dark mode compatibility
const iconBgColors = {
  [NodeType.WEBHOOK]: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  [NodeType.AI_AGENT]: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  [NodeType.DEBUG]: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  [NodeType.JAVASCRIPT]: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
  [NodeType.HTTP_REQUEST]: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
  [NodeType.CONDITION]: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
  [NodeType.DELAY]: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
};

const CustomNode = ({ data, selected }: NodeProps<NodeData>) => {
  const [isPretty, setIsPretty] = useState(false);
  const Icon = icons[data.type] || Zap;
  const iconStyle = iconBgColors[data.type] || 'bg-gray-100 text-gray-600';

  const isRunning = data.status === 'running';
  const isSuccess = data.status === 'success';
  const isError = data.status === 'error';
  const isCondition = data.type === NodeType.CONDITION;

  // Handler to open the modal via parent callback
  const handleViewOutput = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection
    if (data.onViewOutput) {
      data.onViewOutput(data.output, data.label);
    }
  };

  const togglePrettyParams = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPretty(!isPretty);
  };

  const renderOutputContent = () => {
    if (typeof data.output === 'object') {
      return isPretty 
        ? JSON.stringify(data.output, null, 2) 
        : JSON.stringify(data.output);
    }
    return String(data.output);
  };

  return (
    <div
      className={`relative w-80 rounded-[28px] transition-all duration-300 group
      ${selected 
        ? 'ring-2 ring-black dark:ring-white shadow-2xl scale-[1.02]' 
        : 'shadow-lg hover:shadow-2xl hover:scale-[1.02] border'}
      bg-white dark:bg-zinc-900 
      border-gray-100 dark:border-zinc-800/50
      `}
    >
      {/* Status Indicator Dot */}
      <div className="absolute top-5 right-5 flex items-center space-x-1">
         {isRunning && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>}
         {isSuccess && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>}
         {isError && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>}
         {!isRunning && !isSuccess && !isError && <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-zinc-700 group-hover:bg-gray-300 dark:group-hover:bg-zinc-600 transition-colors"></div>}
      </div>

      {/* Header Section */}
      <div className="p-5 flex items-start space-x-4">
        <div className={`p-3.5 rounded-2xl ${iconStyle} flex-shrink-0 transition-colors shadow-sm`}>
            <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate tracking-tight">{data.label}</h3>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mt-0.5">
              {data.type.replace('_', ' ')}
            </p>
        </div>
      </div>

      {/* Output Preview Section */}
      {data.output && !isCondition && (
        <div className="px-5 pb-5">
           <div className={`
             relative group/output rounded-xl border transition-all duration-300 overflow-hidden
             ${isPretty ? 'bg-[#0d0d0d] border-zinc-700' : 'bg-gray-50 dark:bg-black/40 border-gray-100 dark:border-zinc-800/50 hover:border-gray-200 dark:hover:border-zinc-700'}
           `}>
              {/* Output Header Toolbar */}
              <div className={`
                flex items-center justify-between px-3 py-2 border-b
                ${isPretty ? 'border-zinc-800 bg-zinc-900/50' : 'border-transparent'}
              `}>
                 <div className="text-[9px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-wider flex items-center space-x-2">
                    {isSuccess && <span className="text-emerald-500">200 OK</span>}
                    {isError && <span className="text-rose-500">ERROR</span>}
                    {!isSuccess && !isError && <span>OUTPUT</span>}
                 </div>

                 <div className="flex items-center space-x-1 opacity-0 group-hover/output:opacity-100 transition-opacity">
                    {/* Beautify Toggle */}
                    <button 
                      onClick={togglePrettyParams}
                      className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      title={isPretty ? "Collapse" : "Beautify JSON"}
                    >
                      {isPretty ? <Minimize2 size={12} /> : <FileJson size={12} />}
                    </button>
                    {/* Full Modal View */}
                    <button 
                      onClick={handleViewOutput}
                      className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      title="Inspect Full Output"
                    >
                      <Eye size={12} />
                    </button>
                 </div>
              </div>
              
              {/* Output Content */}
              <div className={`p-3 ${isPretty ? 'max-h-60 overflow-y-auto custom-scrollbar' : ''}`}>
                <pre className={`
                   text-[10px] font-mono leading-relaxed break-all whitespace-pre-wrap
                   ${isPretty ? 'text-blue-300' : 'text-gray-600 dark:text-zinc-400 line-clamp-2'}
                `}>
                   {renderOutputContent()}
                </pre>
              </div>
           </div>
        </div>
      )}
      
      {/* Condition Results (Simple View) */}
      {isCondition && data.output && (
         <div className="px-5 pb-5">
            <div className={`rounded-xl p-2.5 text-center text-xs font-bold border ${data.output.result ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'}`}>
                {data.output.result ? 'PASSED (TRUE)' : 'FAILED (FALSE)'}
            </div>
             <button 
                onClick={handleViewOutput}
                className="w-full mt-2 py-1.5 text-[10px] font-bold text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
              >
                View Logic Details
              </button>
         </div>
      )}

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-gray-200 dark:!bg-zinc-700 !border-[4px] !border-white dark:!border-zinc-900 transition-colors hover:!bg-black dark:hover:!bg-white hover:scale-125"
        style={{ left: -8 }}
      />
      
      {isCondition ? (
        <>
            <div className="absolute -right-5 top-[25%] flex items-center space-x-2">
                <span className="text-[9px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">TRUE</span>
                <Handle
                    type="source"
                    position={Position.Right}
                    id="true"
                    className="!static !w-3.5 !h-3.5 !bg-emerald-200 dark:!bg-emerald-800 !border-[4px] !border-white dark:!border-zinc-900 transition-colors hover:!bg-emerald-500 hover:scale-125"
                />
            </div>
            <div className="absolute -right-5 bottom-[25%] flex items-center space-x-2">
                 <span className="text-[9px] font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">FALSE</span>
                 <Handle
                    type="source"
                    position={Position.Right}
                    id="false"
                    className="!static !w-3.5 !h-3.5 !bg-rose-200 dark:!bg-rose-800 !border-[4px] !border-white dark:!border-zinc-900 transition-colors hover:!bg-rose-500 hover:scale-125"
                />
            </div>
        </>
      ) : (
        <Handle
            type="source"
            position={Position.Right}
            className="!w-3.5 !h-3.5 !bg-gray-200 dark:!bg-zinc-700 !border-[4px] !border-white dark:!border-zinc-900 transition-colors hover:!bg-black dark:hover:!bg-white hover:scale-125"
            style={{ right: -8 }}
        />
      )}
    </div>
  );
};

export default memo(CustomNode);