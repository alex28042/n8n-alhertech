import { Node, Edge } from 'reactflow';

export enum NodeType {
  WEBHOOK = 'webhook',
  AI_AGENT = 'ai_agent',
  DEBUG = 'debug',
  JAVASCRIPT = 'javascript',
  HTTP_REQUEST = 'http_request',
  CONDITION = 'condition',
  DELAY = 'delay'
}

export interface NodeData {
  label: string;
  type: NodeType;
  config: Record<string, any>;
  output?: any;
  status?: 'idle' | 'running' | 'success' | 'error';
  errorMessage?: string;
  onViewOutput?: (output: any, label: string) => void;
}

export type WorkflowNode = Node<NodeData>;
export type WorkflowEdge = Edge;

export interface ExecutionContext {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  nodeResults: Record<string, any>;
}

export interface AIModelConfig {
  model: string;
  temperature: number;
}

export interface WorkflowVersion {
  id: string;
  timestamp: number;
  label: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}