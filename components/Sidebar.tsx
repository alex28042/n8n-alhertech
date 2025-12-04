import React, { useState } from 'react';
import { NodeType, NodeData } from '../types';
import { Node, Edge } from 'reactflow';
import { Zap, Bot, Bug, Code, Globe, Plus, LayoutTemplate, Box, ArrowRight, Play, Split, Sparkles, Loader2 } from 'lucide-react';
import { generateWorkflowStructure } from '../services/geminiService';

interface SidebarProps {
  onLoadWorkflow: (nodes: Node<NodeData>[], edges: Edge[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLoadWorkflow }) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'templates' | 'ai' | 'tutorial'>('blocks');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const { nodes, edges } = await generateWorkflowStructure(aiPrompt);
      if (nodes && edges) {
        onLoadWorkflow(nodes, edges);
        setAiPrompt(''); // Clear after success
      } else {
        setErrorMsg('AI returned invalid structure.');
      }
    } catch (e) {
      setErrorMsg('Failed to generate. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const nodesList = [
    { type: NodeType.WEBHOOK, label: 'Webhook', icon: Zap },
    { type: NodeType.AI_AGENT, label: 'Gemini Agent', icon: Bot },
    { type: NodeType.CONDITION, label: 'If / Else', icon: Split },
    { type: NodeType.JAVASCRIPT, label: 'Function', icon: Code },
    { type: NodeType.HTTP_REQUEST, label: 'HTTP Request', icon: Globe },
    { type: NodeType.DEBUG, label: 'Debug', icon: Bug },
  ];

  const templates = [
    {
      id: 'sentiment',
      title: 'Sentiment Analysis',
      description: 'Analyze the tone of incoming text data using Gemini.',
      nodes: [
        { id: 't1-1', type: NodeType.WEBHOOK, position: { x: 100, y: 100 }, data: { label: 'Customer Review', type: NodeType.WEBHOOK, config: { mockData: '{"review": "The product is great but shipping was slow."}' } } },
        { id: 't1-2', type: NodeType.AI_AGENT, position: { x: 500, y: 100 }, data: { label: 'Analyze Sentiment', type: NodeType.AI_AGENT, config: { prompt: 'Analyze the sentiment of the input review. Return JSON with "sentiment" (Positive/Neutral/Negative) and "confidence" (0-1).' } } },
        { id: 't1-3', type: NodeType.DEBUG, position: { x: 900, y: 100 }, data: { label: 'View Result', type: NodeType.DEBUG, config: {} } }
      ],
      edges: [
        { id: 'e1-2', source: 't1-1', target: 't1-2' },
        { id: 'e2-3', source: 't1-2', target: 't1-3' }
      ]
    },
    {
      id: 'approval',
      title: 'Auto-Approval Flow',
      description: 'Check a value and route based on condition.',
      nodes: [
        { id: 'a1', type: NodeType.WEBHOOK, position: { x: 50, y: 200 }, data: { label: 'Expense Report', type: NodeType.WEBHOOK, config: { mockData: '{"amount": 450, "category": "Travel"}' } } },
        { id: 'a2', type: NodeType.CONDITION, position: { x: 400, y: 200 }, data: { label: 'Check Amount', type: NodeType.CONDITION, config: { variable: 'amount', operator: 'less_than', value: '500' } } },
        { id: 'a3', type: NodeType.AI_AGENT, position: { x: 800, y: 100 }, data: { label: 'Auto Approve', type: NodeType.AI_AGENT, config: { prompt: 'Generate an approval email for this expense.' } } },
        { id: 'a4', type: NodeType.AI_AGENT, position: { x: 800, y: 350 }, data: { label: 'Manager Review', type: NodeType.AI_AGENT, config: { prompt: 'Flag this high value expense for manual review.' } } },
      ],
      edges: [
        { id: 'e-a1-a2', source: 'a1', target: 'a2' },
        { id: 'e-a2-true', source: 'a2', target: 'a3', sourceHandle: 'true' },
        { id: 'e-a2-false', source: 'a2', target: 'a4', sourceHandle: 'false' }
      ]
    },
    {
      id: 'translator',
      title: 'Language Translator',
      description: 'Automatically translate input text into Spanish and French.',
      nodes: [
        { id: 't2-1', type: NodeType.WEBHOOK, position: { x: 100, y: 200 }, data: { label: 'English Text', type: NodeType.WEBHOOK, config: { mockData: '{"text": "Hello, how are you today?"}' } } },
        { id: 't2-2', type: NodeType.AI_AGENT, position: { x: 500, y: 100 }, data: { label: 'To Spanish', type: NodeType.AI_AGENT, config: { prompt: 'Translate the input text to Spanish.' } } },
        { id: 't2-3', type: NodeType.AI_AGENT, position: { x: 500, y: 300 }, data: { label: 'To French', type: NodeType.AI_AGENT, config: { prompt: 'Translate the input text to French.' } } },
      ],
      edges: [
        { id: 'e2-1', source: 't2-1', target: 't2-2' },
        { id: 'e2-2', source: 't2-1', target: 't2-3' }
      ]
    },
    {
      id: 'code-gen',
      title: 'Code Generator',
      description: 'Generate a Python function based on a description.',
      nodes: [
        { id: 't3-1', type: NodeType.WEBHOOK, position: { x: 100, y: 100 }, data: { label: 'Requirement', type: NodeType.WEBHOOK, config: { mockData: '{"task": "Calculate Fibonacci sequence"}' } } },
        { id: 't3-2', type: NodeType.AI_AGENT, position: { x: 500, y: 100 }, data: { label: 'Write Python', type: NodeType.AI_AGENT, config: { prompt: 'Write a Python function to solve the input task. Return only code.' } } },
      ],
      edges: [
        { id: 'e3-1', source: 't3-1', target: 't3-2' }
      ]
    }
  ];

  return (
    <aside className="w-96 flex flex-col h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors duration-300 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-xl border-r border-gray-100 dark:border-zinc-800">
      
      {/* Header */}
      <div className="p-8 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
          FlowGen.
        </h1>
        <p className="text-sm font-medium text-gray-400 dark:text-zinc-500 mt-1">Workflow Automation</p>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl">
          <button 
            onClick={() => setActiveTab('blocks')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'blocks' ? 'bg-white dark:bg-black/50 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-white'}`}
          >
            Blocks
          </button>
           <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'ai' ? 'bg-white dark:bg-black/50 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-zinc-500 hover:text-indigo-500'}`}
          >
            AI Gen
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'templates' ? 'bg-white dark:bg-black/50 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-white'}`}
          >
            Templates
          </button>
          <button 
            onClick={() => setActiveTab('tutorial')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'tutorial' ? 'bg-white dark:bg-black/50 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-white'}`}
          >
            Guide
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-2">
        
        {/* BLOCKS VIEW */}
        {activeTab === 'blocks' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 mb-3 uppercase tracking-wider">Drag & Drop</div>
            {nodesList.map((node) => (
              <div
                key={node.type}
                className="group flex items-center p-3.5 rounded-2xl cursor-grab transition-all duration-300 border border-transparent 
                bg-gray-50 dark:bg-zinc-800/40 
                hover:bg-white dark:hover:bg-zinc-800 
                hover:border-gray-200 dark:hover:border-zinc-700 
                hover:shadow-lg dark:hover:shadow-zinc-900/50"
                onDragStart={(event) => onDragStart(event, node.type)}
                draggable
              >
                <div className="mr-4 p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 text-gray-900 dark:text-white">
                  <node.icon size={18} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-zinc-100">{node.label}</div>
                  <div className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">Drag to canvas</div>
                </div>
                <div className="text-gray-300 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-white transition-colors">
                  <Plus size={18} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI GENERATOR VIEW */}
        {activeTab === 'ai' && (
           <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
             <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mb-3 uppercase tracking-wider flex items-center">
                <Sparkles size={12} className="mr-1.5" />
                AI Workflow Builder
             </div>
             
             <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                <p className="text-xs text-indigo-900 dark:text-indigo-200 mb-4 leading-relaxed font-medium">
                  Describe what you want to automate, and FlowGen AI will build the entire workflow for you instantly.
                </p>
                
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Receive a webhook with a user email, check if it contains 'urgent' in the subject using AI, and if so, send an HTTP POST to Slack."
                  className="w-full h-32 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-black/30 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-indigo-300/30 resize-none border border-indigo-100 dark:border-indigo-900/30"
                />

                {errorMsg && (
                    <div className="mt-2 text-[10px] font-bold text-red-500">{errorMsg}</div>
                )}

                <button 
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className={`mt-4 w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all 
                  ${isGenerating 
                    ? 'bg-indigo-200 dark:bg-indigo-900/50 text-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 active:scale-95'}`}
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>{isGenerating ? 'Building...' : 'Generate Workflow'}</span>
                </button>
             </div>
             
             <div className="space-y-2">
                 <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-wider">Try Examples</div>
                 <button 
                    onClick={() => setAiPrompt("Analyze a customer review. If it is negative, create a ticket via HTTP POST, otherwise log it.")}
                    className="w-full text-left p-3 rounded-xl text-[10px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors"
                 >
                    "Analyze review, if negative post ticket..."
                 </button>
                 <button 
                    onClick={() => setAiPrompt("Take an input number, calculate its square root with JS, and debug output.")}
                    className="w-full text-left p-3 rounded-xl text-[10px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors"
                 >
                    "Math calculation with Javascript..."
                 </button>
             </div>

           </div>
        )}

        {/* TEMPLATES VIEW */}
        {activeTab === 'templates' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 mb-3 uppercase tracking-wider">Start Fast</div>
             {templates.map((temp) => (
               <div 
                  key={temp.id}
                  onClick={() => onLoadWorkflow(temp.nodes as Node<NodeData>[], temp.edges)}
                  className="p-5 rounded-3xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 hover:border-black dark:hover:border-zinc-600 cursor-pointer transition-all group"
               >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                        <LayoutTemplate size={16} />
                    </div>
                    <ArrowRight size={16} className="text-gray-300 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{temp.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    {temp.description}
                  </p>
               </div>
             ))}
          </div>
        )}

        {/* TUTORIAL VIEW */}
        {activeTab === 'tutorial' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 mb-3 uppercase tracking-wider">Quick Guide</div>
             
             <div className="space-y-8 relative pl-4 border-l-2 border-gray-100 dark:border-zinc-800 ml-2">
                
                {/* Step 1 */}
                <div className="relative group">
                   <div className="absolute -left-[23px] top-0 w-4 h-4 rounded-full bg-black dark:bg-white border-4 border-white dark:border-zinc-900 shadow-sm"></div>
                   <div className="mb-2 flex items-center space-x-2">
                      <Box size={16} className="text-gray-900 dark:text-white" />
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Add Nodes</h4>
                   </div>
                   <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                      Go to the <strong>Blocks</strong> tab and drag any block (like <em>Webhook</em> or <em>Gemini Agent</em>) onto the infinite canvas.
                   </p>
                </div>

                {/* Step 2 */}
                <div className="relative group">
                   <div className="absolute -left-[23px] top-0 w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900 group-hover:bg-blue-500 transition-colors"></div>
                   <div className="mb-2 flex items-center space-x-2">
                      <ArrowRight size={16} className="text-gray-900 dark:text-white" />
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Connect</h4>
                   </div>
                   <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                      Click and drag from the right handle (dot) of one node to the left handle of another to connect data flow.
                   </p>
                </div>

                {/* Step 3 */}
                <div className="relative group">
                   <div className="absolute -left-[23px] top-0 w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900 group-hover:bg-purple-500 transition-colors"></div>
                   <div className="mb-2 flex items-center space-x-2">
                      <Code size={16} className="text-gray-900 dark:text-white" />
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Configure</h4>
                   </div>
                   <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                      Click any node to open the configuration panel. Set your AI prompts, mock data, or Javascript code here.
                   </p>
                </div>

                {/* Step 4 */}
                <div className="relative group">
                   <div className="absolute -left-[23px] top-0 w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900 group-hover:bg-green-500 transition-colors"></div>
                   <div className="mb-2 flex items-center space-x-2">
                      <Play size={16} className="text-gray-900 dark:text-white" />
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Run</h4>
                   </div>
                   <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                      Hit the "Run Flow" button in the top header. Watch as the data flows through your logic in real-time.
                   </p>
                </div>

             </div>

             <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs leading-relaxed border border-blue-100 dark:border-blue-900/50">
                <strong>Pro Tip:</strong> Use the <em>Condition</em> node to branch logic (e.g. if price &gt; 100).
             </div>
          </div>
        )}

      </div>
    </aside>
  );
};

export default Sidebar;
