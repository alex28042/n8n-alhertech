import React, { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, NodeType } from '../types';
import { generateAIResponse } from '../services/geminiService';

export const useWorkflowExecution = (
  nodes: Node<NodeData>[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>
) => {
  const [isRunning, setIsRunning] = useState(false);
  const [executionStats, setExecutionStats] = useState<{ name: string; duration: number }[]>([]);

  // Helper for condition evaluation
  const evaluateCondition = (input: any, variable: string, operator: string, value: string): boolean => {
    const getVal = (obj: any, path: string) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const actualValue = getVal(input, variable);
    const compareValue = !isNaN(Number(value)) ? Number(value) : value;
    const actualValueTyped = !isNaN(Number(actualValue)) ? Number(actualValue) : actualValue;

    switch (operator) {
      case 'equals': return actualValue == compareValue;
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
    
    // Reset status
    setNodes((nds) => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle', errorMessage: undefined } })));

    const incomingEdgeCounts = nodes.reduce((acc, node) => {
      acc[node.id] = edges.filter(e => e.target === node.id).length;
      return acc;
    }, {} as Record<string, number>);

    // Find start nodes
    const startNodes = nodes.filter(n => incomingEdgeCounts[n.id] === 0);
    const nodeResults: Record<string, any> = {};
    const newStats: { name: string; duration: number }[] = [];

    const executeNode = async (nodeId: string, inputData: any) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' } } : n));

      const startTime = performance.now();
      let output = null;
      let error = null;

      try {
        await new Promise(r => setTimeout(r, 600)); // Simulate minimal UI latency

        if (node.type === NodeType.WEBHOOK) {
          try {
            output = JSON.parse(node.data.config.mockData || '{}');
          } catch {
            output = { error: 'Invalid JSON' };
          }
        } else if (node.type === NodeType.AI_AGENT) {
          const prompt = node.data.config.prompt || '';
          const inputStr = JSON.stringify(inputData);
          const aiText = await generateAIResponse(prompt, inputStr, node.data.config.model);
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
          output = { result, input: inputData };
        } else if (node.type === NodeType.DELAY) {
           const delayTime = Number(node.data.config.duration) || 1000;
           await new Promise(r => setTimeout(r, delayTime));
           output = { delayed_ms: delayTime, ...inputData };
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
        const outgoingEdges = edges.filter(e => e.source === nodeId);

        for (const edge of outgoingEdges) {
          if (node.type === NodeType.CONDITION) {
            const result = output.result;
            if (result && edge.sourceHandle === 'true') {
              await executeNode(edge.target, output.input);
            } else if (!result && edge.sourceHandle === 'false') {
              await executeNode(edge.target, output.input);
            }
          } else {
            await executeNode(edge.target, output);
          }
        }
      }
    };

    await Promise.all(startNodes.map(node => executeNode(node.id, {})));

    setIsRunning(false);
    setExecutionStats([...newStats]);
  };

  return { isRunning, executionStats, runWorkflow };
};