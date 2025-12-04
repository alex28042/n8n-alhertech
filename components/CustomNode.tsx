import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData, NodeType } from '../types';
import { Zap, Bot, Bug, Code, Globe, Split } from 'lucide-react';

const icons = {
  [NodeType.WEBHOOK]: Zap,
  [NodeType.AI_AGENT]: Bot,
  [NodeType.DEBUG]: Bug,
  [NodeType.JAVASCRIPT]: Code,
  [NodeType.HTTP_REQUEST]: Globe,
  [NodeType.CONDITION]: Split,
};

// Pastel/Clean accents for the icon background - Adjusted for dark mode compatibility
const iconBgColors = {
  [NodeType.WEBHOOK]: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  [NodeType.AI_AGENT]: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  [NodeType.DEBUG]: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  [NodeType.JAVASCRIPT]: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
  [NodeType.HTTP_REQUEST]: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
  [NodeType.CONDITION]: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
};

const CustomNode = ({ data, selected }: NodeProps<NodeData>) => {
  const Icon = icons[data.type] || Zap;
  const iconStyle = iconBgColors[data.type] || 'bg-gray-100 text-gray-600';

  const isRunning = data.status === 'running';
  const isSuccess = data.status === 'success';
  const isError = data.status === 'error';
  const isCondition = data.type === NodeType.CONDITION;

  return (
    <div
      className={`relative w-72 rounded-[24px] transition-all duration-300 group
      ${selected 
        ? 'ring-2 ring-black dark:ring-white shadow-2xl scale-[1.02]' 
        : 'shadow-lg hover:shadow-2xl hover:scale-[1.02] border'}
      bg-white dark:bg-zinc-900 
      border-gray-100 dark:border-zinc-800/50
      `}
    >
      {/* Status Indicator Dot (Absolute positioning for minimalism) */}
      <div className="absolute top-4 right-4 flex items-center space-x-1">
         {isRunning && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>}
         {isSuccess && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>}
         {isError && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>}
         {!isRunning && !isSuccess && !isError && <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-zinc-700 group-hover:bg-gray-300 dark:group-hover:bg-zinc-600 transition-colors"></div>}
      </div>

      <div className="p-5 flex items-start space-x-4">
        <div className={`p-3.5 rounded-2xl ${iconStyle} flex-shrink-0 transition-colors`}>
            <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate tracking-tight">{data.label}</h3>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mt-0.5">
              {data.type.replace('_', ' ')}
            </p>
        </div>
      </div>

      {/* Output Preview (only if exists and minimal) */}
      {data.output && !isCondition && (
        <div className="px-5 pb-5">
           <div className="bg-gray-50 dark:bg-black/40 rounded-xl p-3 border border-gray-100 dark:border-zinc-800/50">
              <div className="text-[9px] font-bold text-gray-400 dark:text-zinc-600 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Output</span>
                {isSuccess && <span className="text-emerald-500">200 OK</span>}
              </div>
              <div className="text-xs text-gray-600 dark:text-zinc-300 font-mono truncate">
                 {typeof data.output === 'object' ? JSON.stringify(data.output) : String(data.output)}
              </div>
           </div>
        </div>
      )}
      
      {/* Specific Logic for Condition Results */}
      {isCondition && data.output && (
         <div className="px-5 pb-5">
            <div className={`rounded-xl p-2 text-center text-xs font-bold border ${data.output.result ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'}`}>
                {data.output.result ? 'PASSED (TRUE)' : 'FAILED (FALSE)'}
            </div>
         </div>
      )}

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-gray-200 dark:!bg-zinc-700 !border-[4px] !border-white dark:!border-zinc-900 transition-colors hover:!bg-black dark:hover:!bg-white hover:scale-125"
        style={{ left: -8 }}
      />
      
      {/* Conditional Outputs: Two handles for True/False */}
      {isCondition ? (
        <>
            {/* TRUE HANDLE - Top Right */}
            <div className="absolute -right-5 top-[25%] flex items-center space-x-2">
                <span className="text-[9px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">TRUE</span>
                <Handle
                    type="source"
                    position={Position.Right}
                    id="true"
                    className="!static !w-3.5 !h-3.5 !bg-emerald-200 dark:!bg-emerald-800 !border-[4px] !border-white dark:!border-zinc-900 transition-colors hover:!bg-emerald-500 hover:scale-125"
                />
            </div>

            {/* FALSE HANDLE - Bottom Right */}
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