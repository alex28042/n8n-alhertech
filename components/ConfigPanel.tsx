import React, { useEffect, useState } from 'react';
import { WorkflowNode, NodeType } from '../types';
import { X, Check, Trash2 } from 'lucide-react';

interface ConfigPanelProps {
  selectedNode: WorkflowNode | null;
  updateNodeData: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  closePanel: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ selectedNode, updateNodeData, deleteNode, closePanel }) => {
  const [label, setLabel] = useState('');
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label);
      setConfig(selectedNode.data.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const handleSave = () => {
    updateNodeData(selectedNode.id, {
      ...selectedNode.data,
      label,
      config
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute right-6 top-6 bottom-6 w-96 rounded-[32px] shadow-2xl flex flex-col z-30 animate-in slide-in-from-right duration-500 ease-out bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 transition-colors">
      <div className="flex items-center justify-between p-6 pb-2">
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configure</h2>
            <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 mt-0.5">{selectedNode.data.type.replace('_', ' ')}</p>
        </div>
        <button 
            onClick={closePanel} 
            className="p-2 rounded-full transition-colors bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Common Settings */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Node Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-transparent border-b-2 py-2 text-lg font-medium focus:outline-none transition-colors border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-white focus:border-black dark:focus:border-white placeholder-gray-300 dark:placeholder-zinc-700"
            placeholder="Name your node"
          />
        </div>

        {/* Specific Settings */}
        <div className="space-y-6">
           
           {selectedNode.data.type === NodeType.AI_AGENT && (
             <>
               <div className="space-y-3">
                 <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Prompt</label>
                 <textarea
                   rows={6}
                   value={config.prompt || ''}
                   onChange={(e) => handleConfigChange('prompt', e.target.value)}
                   placeholder="Enter instructions for the AI..."
                   className="w-full rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none resize-none bg-gray-50 dark:bg-zinc-950/50 text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-700 border-none transition-all"
                 />
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Model</label>
                 <div className="relative">
                    <select
                        value={config.model || 'gemini-2.5-flash'}
                        onChange={(e) => handleConfigChange('model', e.target.value)}
                        className="w-full rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none appearance-none cursor-pointer bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-zinc-200 border-none transition-all"
                    >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-flash-lite">Gemini Flash Lite</option>
                    </select>
                 </div>
               </div>
             </>
           )}

           {selectedNode.data.type === NodeType.WEBHOOK && (
             <div className="p-4 rounded-3xl border bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
               <div className="flex items-center space-x-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                   <h4 className="text-[10px] font-bold text-amber-800 dark:text-amber-500 uppercase">Simulation Data</h4>
               </div>
               <textarea
                   rows={6}
                   value={config.mockData || '{\n  "message": "Hello World"\n}'}
                   onChange={(e) => handleConfigChange('mockData', e.target.value)}
                   className="w-full rounded-xl p-3 text-xs font-mono focus:outline-none bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-900/30 text-gray-600 dark:text-amber-200 focus:border-amber-400 transition-all placeholder-amber-300"
                   placeholder='{"key": "value"}'
               />
             </div>
           )}

            {selectedNode.data.type === NodeType.JAVASCRIPT && (
             <div className="space-y-3">
                 <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Function Code</label>
                 <textarea
                   rows={10}
                   value={config.code || 'return { processed: input };'}
                   onChange={(e) => handleConfigChange('code', e.target.value)}
                   className="w-full bg-gray-900 dark:bg-black text-gray-100 rounded-2xl p-4 text-xs font-mono focus:ring-2 focus:ring-gray-500 focus:outline-none leading-relaxed border border-gray-800 dark:border-zinc-800 transition-all"
                 />
             </div>
           )}

            {selectedNode.data.type === NodeType.DELAY && (
             <div className="space-y-3">
                 <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Duration (Milliseconds)</label>
                 <input
                    type="number"
                    value={config.duration || '1000'}
                    onChange={(e) => handleConfigChange('duration', e.target.value)}
                    className="w-full rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-zinc-200 border-none transition-all"
                    placeholder="1000"
                 />
                 <p className="text-[10px] text-gray-400 px-2">Wait for the specified time before continuing.</p>
             </div>
           )}

           {selectedNode.data.type === NodeType.CONDITION && (
             <div className="space-y-4">
                 <div className="space-y-2">
                     <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Value to Check</label>
                     <input
                        type="text"
                        value={config.variable || ''}
                        onChange={(e) => handleConfigChange('variable', e.target.value)}
                        placeholder="e.g. amount or user.name"
                        className="w-full rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-zinc-200 border-none transition-all"
                     />
                     <p className="text-[10px] text-gray-400 px-2">Key from JSON input object.</p>
                 </div>
                 
                 <div className="space-y-2">
                     <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Operator</label>
                     <select
                        value={config.operator || 'equals'}
                        onChange={(e) => handleConfigChange('operator', e.target.value)}
                        className="w-full rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-zinc-200 border-none transition-all appearance-none"
                     >
                         <option value="equals">Equals (==)</option>
                         <option value="not_equals">Not Equals (!=)</option>
                         <option value="contains">Contains (Text)</option>
                         <option value="greater_than">Greater Than (&gt;)</option>
                         <option value="less_than">Less Than (&lt;)</option>
                     </select>
                 </div>

                 <div className="space-y-2">
                     <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Compare Against</label>
                     <input
                        type="text"
                        value={config.value || ''}
                        onChange={(e) => handleConfigChange('value', e.target.value)}
                        placeholder="Value"
                        className="w-full rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-zinc-200 border-none transition-all"
                     />
                 </div>
             </div>
           )}
        </div>

      </div>

      <div className="p-6 border-t flex items-center space-x-4 border-gray-100 dark:border-zinc-800">
        <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-full font-bold text-sm transition-transform active:scale-95 shadow-xl bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-black/20 dark:shadow-white/10"
        >
            <Check size={18} />
            <span>Apply Changes</span>
        </button>
        <button
            onClick={() => { deleteNode(selectedNode.id); closePanel(); }}
            className="flex items-center justify-center w-12 h-12 rounded-full transition-colors border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400"
        >
            <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;