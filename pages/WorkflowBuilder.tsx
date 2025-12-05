import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  BackgroundVariant,
  Node,
  ReactFlowProvider,
} from 'reactflow';

// Components
import Sidebar from '../components/Sidebar';
import CustomNode from '../components/CustomNode';
import ConfigPanel from '../components/ConfigPanel';
import WorkflowHeader from '../components/workflow/WorkflowHeader';
import HistoryModal from '../components/workflow/HistoryModal';
import ExportModal from '../components/workflow/ExportModal';
import AnalyticsPanel from '../components/workflow/AnalyticsPanel';

// Hooks & Services
import { useTheme } from '../hooks/useTheme';
import { useWorkflowExecution } from '../hooks/useWorkflowExecution';
import { generatePythonCode } from '../services/codeGenerator';
import { NodeType, NodeData, WorkflowVersion } from '../types';

const nodeTypes = {
  webhook: CustomNode,
  ai_agent: CustomNode,
  debug: CustomNode,
  javascript: CustomNode,
  http_request: CustomNode,
  condition: CustomNode,
  delay: CustomNode,
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
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#71717a', strokeWidth: 2 } }
];

const WorkflowBuilderContent = () => {
  // --- State ---
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  
  // UI State
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  
  // Custom Hooks
  const { isDarkMode, toggleTheme } = useTheme();
  const { isRunning, executionStats, runWorkflow } = useWorkflowExecution(nodes, edges, setNodes);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowVersion[]>([]);

  // --- Effects ---
  
  // Update edges style dynamically when theme changes
  useEffect(() => {
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: {
          ...e.style,
          stroke: isDarkMode ? '#71717a' : '#000000',
          strokeWidth: 2
        }
      }))
    );
  }, [isDarkMode, setEdges]);

  // Load history
  useEffect(() => {
    const savedHistory = localStorage.getItem('flowgen_workflow_history');
    if (savedHistory) {
      try {
        setWorkflowHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // --- Handlers ---

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
      if (!type) return;

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

  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) return { ...node, data: newData };
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

  // Actions
  const saveWorkflow = useCallback(() => {
    const timestamp = Date.now();
    let label = prompt("Name this version (optional):", `v-${new Date().toLocaleTimeString()}`);
    if (label === null) return;
    if (!label) label = `Auto-save ${new Date().toLocaleTimeString()}`;

    const newVersion: WorkflowVersion = {
      id: timestamp.toString(),
      timestamp,
      label,
      nodes,
      edges
    };

    const updatedHistory = [newVersion, ...workflowHistory];
    setWorkflowHistory(updatedHistory);
    localStorage.setItem('flowgen_workflow_history', JSON.stringify(updatedHistory));
    localStorage.setItem('flowgen_workflow', JSON.stringify({ nodes, edges }));
  }, [nodes, edges, workflowHistory]);

  const deleteVersion = (id: string) => {
    const updated = workflowHistory.filter(v => v.id !== id);
    setWorkflowHistory(updated);
    localStorage.setItem('flowgen_workflow_history', JSON.stringify(updated));
  };

  const restoreVersion = (version: WorkflowVersion) => {
    if (confirm(`Restore version "${version.label}"? Unsaved changes will be lost.`)) {
      handleLoadWorkflow(version.nodes, version.edges);
      setShowHistoryModal(false);
    }
  };

  const handleExportCode = () => {
    const code = generatePythonCode(nodes, edges);
    setGeneratedCode(code);
    setShowExportModal(true);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar onLoadWorkflow={handleLoadWorkflow} />

      <div className="flex-1 flex flex-col relative">
        <WorkflowHeader
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isRunning={isRunning}
          onRun={runWorkflow}
          onSave={saveWorkflow}
          onHistory={() => setShowHistoryModal(true)}
          onExport={handleExportCode}
          showAnalytics={showAnalytics}
          toggleAnalytics={() => setShowAnalytics(!showAnalytics)}
        />

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
            onNodeClick={(_, node) => setSelectedNode(node)}
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

          {selectedNode && (
            <ConfigPanel
              selectedNode={selectedNode}
              updateNodeData={updateNodeData}
              deleteNode={deleteNode}
              closePanel={() => setSelectedNode(null)}
            />
          )}

          {showAnalytics && executionStats.length > 0 && (
            <AnalyticsPanel stats={executionStats} isDarkMode={isDarkMode} />
          )}
        </div>

        {/* Modals */}
        <HistoryModal 
          isOpen={showHistoryModal} 
          onClose={() => setShowHistoryModal(false)}
          history={workflowHistory}
          onRestore={restoreVersion}
          onDelete={deleteVersion}
          isDarkMode={isDarkMode}
        />

        <ExportModal 
          isOpen={showExportModal} 
          onClose={() => setShowExportModal(false)} 
          code={generatedCode} 
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent />
    </ReactFlowProvider>
  );
}