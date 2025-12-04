import { GoogleGenAI } from "@google/genai";

// Access process.env.API_KEY directly so Vite/Bundlers can replace it during build.
// The previous runtime check for 'process' prevents Vite's string replacement from working in the browser.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAIResponse = async (
  prompt: string,
  inputData: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<string> => {
  try {
    const fullPrompt = `
    Input Data Context: ${inputData}
    
    Task: ${prompt}
    
    Please provide the response directly without markdown code blocks unless requested.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: fullPrompt,
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with Gemini API.");
  }
};

export const suggestWorkflow = async (description: string): Promise<any> => {
    // Legacy function, kept for reference
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Suggest a list of steps for an automation workflow that does: "${description}". Return just a bulleted list.`,
        });
        return response.text;
    } catch (e) {
        return "Could not generate suggestion.";
    }
}

export const generateWorkflowStructure = async (description: string): Promise<{ nodes: any[], edges: any[] }> => {
  try {
    const prompt = `
    You are an expert workflow automation architect. 
    Create a JSON structure for a node-based workflow based on this user description: "${description}".

    AVAILABLE NODE TYPES (Use only these):
    1. 'webhook' (Triggers the flow. Config: { mockData: string })
    2. 'ai_agent' (Uses LLM. Config: { prompt: string, model: 'gemini-2.5-flash' })
    3. 'condition' (If/Else logic. Config: { variable: string, operator: 'equals'|'contains'|'greater_than'|'less_than', value: string })
    4. 'http_request' (External API. Config: { url: string, method: 'GET'|'POST' })
    5. 'javascript' (Custom code. Config: { code: string })
    6. 'debug' (Output logger. No config)

    LAYOUT RULES:
    - Start with a 'webhook' node at x: 100, y: 100.
    - Space subsequent nodes horizontally by +400 pixels (e.g., x: 500, x: 900).
    - If branching with 'condition', place 'true' path at y: 100 and 'false' path at y: 400.
    
    RESPONSE FORMAT (Strict JSON):
    {
      "nodes": [
        { "id": "1", "type": "webhook", "position": { "x": 100, "y": 100 }, "data": { "label": "Start", "type": "webhook", "config": { "mockData": "..." } } }
      ],
      "edges": [
        { "id": "e1-2", "source": "1", "target": "2" }
        // For conditions, use sourceHandle: 'true' or 'false'
      ]
    }

    Return ONLY raw JSON. Do not use Markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    // Clean potential markdown blocks if the model ignores the instruction
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Workflow Gen Error:", error);
    throw new Error("Failed to generate workflow configuration.");
  }
};