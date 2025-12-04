import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  BackgroundVariant,
  Node,
} from 'reactflow';
import { Play, Loader2, BarChart2, Moon, Sun, Save, FolderOpen, FileCode, X, Copy, Download, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import Sidebar from './components/Sidebar';
import CustomNode from './components/CustomNode';
import ConfigPanel from './components/ConfigPanel';
import { NodeType, NodeData } from './types';
import { generateAIResponse } from './services/geminiService';
import { generatePythonCode } from './services/codeGenerator';

// Define custom node types
const nodeTypes = {
  webhook: CustomNode,
  ai_agent: CustomNode,
  debug: CustomNode,
  javascript: CustomNode,
  http_request: CustomNode,
  condition: CustomNode,
};

const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: NodeType.WEBHOOK,
    position: { x: 100, y: 100 },
    data: { label: 'Start Trigger', type: NodeType.WEBHOOK, config: { mockData: '{"topic": "Artificial Intelligence", "tone": "Professional"}' } },
  },
  {
    id: '2',
    type: NodeType.AI_AGENT,
    position: { x: 500, y: 150 },
    data: { label: 'Generate Content', type: NodeType.AI_AGENT, config: { prompt: 'Write a short intro paragraph about the input topic in the specified tone.' } },
  },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#000000', strokeWidth: 2 } }
];

const AppContent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [executionStats, setExecutionStats] = useState<{name: string, duration: number}[]>([]);
  
  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Theme State - Default to light, but could check system preference
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle Dark Mode Class on body/root
  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // Update edges style dynamically when theme changes
    setEdges((eds) => 
      eds.map((e) => ({
        ...e,
        style: { 
          ...e.style, 
          stroke: isDarkMode ? '#71717a' : '#000000', // zinc-500 in dark, black in light
          strokeWidth: 2 
        }
      }))
    );
  }, [isDarkMode, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
        ...params, 
        animated: true, 
        style: { stroke: isDarkMode ? '#71717a' : '#000000', strokeWidth: 2 } 
    }, eds)),
    [setEdges, isDarkMode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<NodeData> = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `New ${type.replace('_', ' ')}`, type, config: {} },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: newData };
        }
        return node;
      })
    );
    setSelectedNode((prev) => prev ? { ...prev, data: newData } : null);
  };

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setSelectedNode(null);
  };

  const handleLoadWorkflow = useCallback((newNodes: Node<NodeData>[], newEdges: Edge[]) => {
      setNodes([]);
      setEdges([]);
      
      // Apply current theme style to new edges
      const themeEdges = newEdges.map(e => ({
          ...e,
          animated: true,
          style: { stroke: isDarkMode ? '#71717a' : '#000000', strokeWidth: 2 }
      }));

      setTimeout(() => {
          setNodes(newNodes);
          setEdges(themeEdges);
          setTimeout(() => reactFlowInstance?.fitView(), 100);
      }, 50);
  }, [isDarkMode, reactFlowInstance, setNodes, setEdges]);

  // Save to LocalStorage
  const saveWorkflow = useCallback(() => {
    const workflowData = {
      nodes,
      edges
    };
    try {
      localStorage.setItem('flowgen_workflow', JSON.stringify(workflowData));
      alert('Workflow saved successfully!');
    } catch (e) {
      console.error('Save failed', e);
      alert('Failed to save workflow.');
    }
  }, [nodes, edges]);

  // Load from LocalStorage
  const loadSavedWorkflow = useCallback(() => {
    const savedData = localStorage.getItem('flowgen_workflow');
    if (savedData) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedData);
        if (savedNodes && savedEdges) {
            handleLoadWorkflow(savedNodes, savedEdges);
        } else {
            alert('Invalid workflow data found.');
        }
      } catch (e) {
        console.error('Load failed', e);
        alert('Failed to parse saved workflow.');
      }
    } else {
      alert('No saved workflow found.');
    }
  }, [handleLoadWorkflow]);

  const handleExportCode = () => {
      const code = generatePythonCode(nodes, edges);
      setGeneratedCode(code);
      setShowExportModal(true);
      setCopied(false);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
      const element = document.createElement("a");
      const file = new Blob([generatedCode], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "workflow.py";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  // Helper for condition evaluation
  const evaluateCondition = (input: any, variable: string, operator: string, value: string): boolean => {
      // Access nested properties via dot notation (e.g. "user.name")
      const getVal = (obj: any, path: string) => {
          return path.split('.').reduce((acc, part) => acc && acc[part], obj);
      };

      const actualValue = getVal(input, variable);
      // Simple type casting for numbers
      const compareValue = !isNaN(Number(value)) ? Number(value) : value;
      const actualValueTyped = !isNaN(Number(actualValue)) ? Number(actualValue) : actualValue;

      switch (operator) {
          case 'equals': return actualValue == compareValue; // loose equality
          case 'not_equals': return actualValue != compareValue;
          case 'greater_than': return actualValueTyped > compareValue;
          case 'less_than': return actualValueTyped < compareValue;
          case 'contains': 
              return String(actualValue).toLowerCase().includes(String(compareValue).toLowerCase());
          default: return false;
      }
  };

  const runWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionStats([]);
    setNodes((nds) => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle', errorMessage: undefined } })));

    const incomingEdgeCounts = nodes.reduce((acc, node) => {
        acc[node.id] = edges.filter(e => e.target === node.id).length;
        return acc;
    }, {} as Record<string, number>);

    // Find start nodes (nodes with no incoming edges)
    const startNodes = nodes.filter(n => incomingEdgeCounts[n.id] === 0);
    const nodeResults: Record<string, any> = {};
    const newStats: {name: string, duration: number}[] = [];
    const visitedNodes = new Set<string>();

    const executeNode = async (nodeId: string, inputData: any) => {
        // Prevent infinite loops or re-execution in simple DAG
        // Note: Real engines handle merging inputs, here we just take the last call
        
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' } } : n));
        
        const startTime = performance.now();
        let output = null;
        let error = null;

        try {
            // Simulate network latency for realism
            await new Promise(r => setTimeout(r, 600));

            if (node.type === NodeType.WEBHOOK) {
                try {
                    output = JSON.parse(node.data.config.mockData || '{}');
                } catch {
                    output = { error: 'Invalid JSON' };
                }
            } else if (node.type === NodeType.AI_AGENT) {
                const prompt = node.data.config.prompt || '';
                const inputStr = JSON.stringify(inputData);
                const aiText = await generateAIResponse(prompt, inputStr);
                output = { result: aiText };
            } else if (node.type === NodeType.JAVASCRIPT) {
                try {
                    // eslint-disable-next-line no-new-func
                    const func = new Function('input', node.data.config.code || 'return input;');
                    output = func(inputData);
                } catch (e: any) {
                    throw new Error(e.message);
                }
            } else if (node.type === NodeType.CONDITION) {
                const { variable, operator, value } = node.data.config;
                const result = evaluateCondition(inputData, variable, operator, value);
                output = { result, input: inputData }; // Pass through input + result
            } else {
                output = inputData;
            }
        } catch (e: any) {
            error = e.message;
        }

        const endTime = performance.now();
        newStats.push({ name: node.data.label, duration: endTime - startTime });
        nodeResults[nodeId] = output;

        setNodes(nds => nds.map(n => n.id === nodeId ? { 
            ...n, 
            data: { 
                ...n.data, 
                status: error ? 'error' : 'success', 
                output: output,
                errorMessage: error
            } 
        } : n));

        if (!error) {
            // Find connected edges
            const outgoingEdges = edges.filter(e => e.source === nodeId);
            
            for (const edge of outgoingEdges) {
                // BRANCHING LOGIC FOR CONDITION NODE
                if (node.type === NodeType.CONDITION) {
                    const result = output.result; // boolean
                    // If result is true, only follow edges from 'true' handle
                    if (result && edge.sourceHandle === 'true') {
                        await executeNode(edge.target, output.input);
                    } 
                    // If result is false, only follow edges from 'false' handle
                    else if (!result && edge.sourceHandle === 'false') {
                        await executeNode(edge.target, output.input);
                    }
                } 
                // STANDARD LOGIC
                else {
                    await executeNode(edge.target, output);
                }
            }
        }
    };

    // Execute all start nodes in parallel
    await Promise.all(startNodes.map(node => executeNode(node.id, {})));

    setIsRunning(false);
    setExecutionStats([...newStats]);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar onLoadWorkflow={handleLoadWorkflow} />
      
      <div className="flex-1 flex flex-col relative">
        {/* Floating Header */}
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
                    <button 
                        onClick={saveWorkflow}
                        className={`p-2.5 rounded-full transition-all duration-200 group relative ${
                            isDarkMode 
                            ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'
                        }`}
                    >
                        <Save size={18} strokeWidth={2.5} />
                        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded-md whitespace-nowrap z-50">Save</span>
                    </button>

                    <button 
                        onClick={loadSavedWorkflow}
                        className={`p-2.5 rounded-full transition-all duration-200 group relative ${
                            isDarkMode 
                            ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'
                        }`}
                    >
                        <FolderOpen size={18} strokeWidth={2.5} />
                        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded-md whitespace-nowrap z-50">Load</span>
                    </button>

                    <button 
                        onClick={handleExportCode}
                        className={`p-2.5 rounded-full transition-all duration-200 group relative ${
                            isDarkMode 
                            ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'
                        }`}
                    >
                        <FileCode size={18} strokeWidth={2.5} />
                        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded-md whitespace-nowrap z-50">Export Python</span>
                    </button>
                 </div>

                 <div className={`h-8 w-[1px] mx-2 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}></div>

                 {/* Theme Toggle */}
                 <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2.5 rounded-full transition-all duration-200 ${
                        isDarkMode 
                        ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                 >
                    {isDarkMode ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
                 </button>

                 <button 
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`p-2.5 rounded-full transition-all duration-200 ${
                        isDarkMode
                        ? (showAnalytics ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')
                        : (showAnalytics ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                    }`}
                 >
                    <BarChart2 size={18} strokeWidth={2.5} />
                 </button>
                 
                 <button
                    onClick={runWorkflow}
                    disabled={isRunning}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-full font-bold transition-all transform active:scale-95 ${
                        isRunning 
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

        {/* Canvas */}
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={{ 
                    type: 'smoothstep', 
                    animated: true, 
                    style: { stroke: isDarkMode ? '#71717a' : '#000000', strokeWidth: 2 } 
                }}
                fitView
            >
                <Background 
                    color={isDarkMode ? '#ffffff' : '#000000'} 
                    variant={BackgroundVariant.Dots} 
                    gap={24} 
                    size={1.5} 
                    style={{ opacity: isDarkMode ? 0.08 : 0.05 }} 
                />
                <Controls className={`
                    !shadow-xl !rounded-2xl overflow-hidden m-4 border
                    ${isDarkMode ? '!bg-zinc-900 !border-zinc-800 !fill-white' : '!bg-white !border-gray-100 !text-black'}
                `} />
            </ReactFlow>

            {/* Config Panel */}
            {selectedNode && (
                <ConfigPanel 
                    selectedNode={selectedNode} 
                    updateNodeData={updateNodeData} 
                    deleteNode={deleteNode}
                    closePanel={() => setSelectedNode(null)} 
                />
            )}
            
            {/* Analytics Panel */}
            {showAnalytics && executionStats.length > 0 && (
                <div className={`
                    absolute left-6 bottom-6 w-[400px] border p-6 rounded-3xl z-20 animate-in slide-in-from-bottom duration-300
                    ${isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-[0_20px_40px_rgba(0,0,0,0.5)]' : 'bg-white border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)]'}
                `}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Performance</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-400'}`}>
                            {executionStats.reduce((a, b) => a + b.duration, 0).toFixed(0)}ms total
                        </span>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={executionStats}>
                                <XAxis dataKey="name" stroke={isDarkMode ? "#71717a" : "#9ca3af"} fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke={isDarkMode ? "#71717a" : "#9ca3af"} fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{fill: isDarkMode ? '#27272a' : '#f3f4f6'}}
                                    contentStyle={{ 
                                        backgroundColor: isDarkMode ? '#18181b' : '#000', 
                                        borderRadius: '12px', 
                                        border: isDarkMode ? '1px solid #27272a' : 'none', 
                                        color: '#fff' 
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="duration" fill={isDarkMode ? "#ffffff" : "#000000"} radius={[6, 6, 6, 6]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>

        {/* Export Modal Overlay */}
        {showExportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className={`
                    w-[800px] max-h-[85vh] flex flex-col rounded-[32px] shadow-2xl overflow-hidden border
                    ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}
                `}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
                         <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <FileCode size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export to Python</h2>
                                <p className="text-xs text-gray-500 dark:text-zinc-400">Run this workflow locally using the Gemini SDK</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => setShowExportModal(false)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                         >
                            <X size={20} />
                         </button>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-0 relative">
                        <pre className="p-6 text-sm font-mono leading-relaxed text-gray-800 dark:text-zinc-300">
                            {generatedCode}
                        </pre>
                    </div>

                    <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end space-x-3">
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
            </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}