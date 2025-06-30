import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

export interface SystemComponent {
  id: string;
  name: string;
  type: string;
  description: string;
  tags: string[];
  inputs: string[];
  outputs: string[];
  icon?: string; // URL or icon name
}

export interface ComponentGroup {
  name: string;
  color?: string; // Tailwind or hex color
  icon?: string; // URL or icon name
  components: SystemComponent[];
  position: { x: number; y: number };
}

export interface AIRecommendation {
  groups: ComponentGroup[];
  explanation: string;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
}

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Check if API key is configured
if (!apiKey || apiKey === "your_gemini_api_key_here") {
  console.error("⚠️ Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

async function run(prompt: string) {
  try {
    // Check if API key is properly configured
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      throw new Error("API_KEY_NOT_CONFIGURED");
    }

    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    }); 

    const result = await chatSession.sendMessage(prompt);
    let text = await result.response.text();

    // Remove markdown ** characters
    text = text.replace(/\*\*/g, '');

    return text;
  } catch (error: any) {
    console.error("Error during API call:", error);
    
    if (error.message === "API_KEY_NOT_CONFIGURED") {
      throw new Error("API_KEY_NOT_CONFIGURED");
    }
    
    if (error.code === 403) {
      throw new Error("API_KEY_INVALID");
    }
    
    return null;
  }
}

// Helper function to find component by name or ID
function findComponentByIdOrName(componentId: string, availableComponents: SystemComponent[]): SystemComponent | undefined {
  // First try exact ID match
  let component = availableComponents.find(comp => comp.id === componentId);
  
  if (component) return component;
  
  // Try exact name match
  component = availableComponents.find(comp => comp.name === componentId);
  
  if (component) return component;
  
  // Try case-insensitive name match
  component = availableComponents.find(comp => 
    comp.name.toLowerCase() === componentId.toLowerCase()
  );
  
  if (component) return component;
  
  // Try partial name match
  component = availableComponents.find(comp => 
    comp.name.toLowerCase().includes(componentId.toLowerCase()) ||
    componentId.toLowerCase().includes(comp.name.toLowerCase())
  );
  
  return component;
}

export async function analyzeSystemRequest(
  userRequest: string,
  availableComponents: SystemComponent[]
): Promise<AIRecommendation> {
  const prompt = `
You are an expert system architect. Analyze the following user request and recommend the most appropriate system components from the available list, organized into logical groups (e.g., Frontend, Backend, Database, Networking, etc.).

For each group, recommend the most relevant components. Then, for each connection between groups (not between individual components), specify a short, meaningful label describing the interaction (e.g., "HTTP", "API Call", "DB Query", "DNS Lookup").

User Request: "${userRequest}"

Available Components (${availableComponents.length} total):
${availableComponents.map(comp => 
  `- ${comp.name} (ID: ${comp.id}, Type: ${comp.type}): ${comp.description} [Tags: ${comp.tags.join(', ')}, Inputs: ${comp.inputs.join(', ')}, Outputs: ${comp.outputs.join(', ')}]`
).join('\n')}

Please provide a JSON response with the following structure:
{
  "groups": [
    {
      "name": "Frontend",
      "color": "#3b82f6", // hex or Tailwind color for border/background
      "icon": "react", // icon name or URL
      "components": [
        { "id": "component_id", "icon": "react" }
      ]
    },
    // ... more groups ...
  ],
  "connections": [
    {
      "from": "Frontend", // group name
      "to": "Backend",   // group name
      "label": "HTTP"    // short, meaningful description of the interaction
    }
    // ... more group-to-group connections ...
  ]
}

IMPORTANT GUIDELINES:
1. Only create connections between groups (not between individual components).
2. Each connection label must be a short, meaningful description of the interaction (e.g., "HTTP", "API Call", "DB Query", "DNS Lookup").
3. Use group names for the "from" and "to" fields in connections.
4. Only recommend groups and connections directly relevant to the user's requirements.
5. Validate that all group names in connections exist in the recommended groups.
`;

  try {
    const text = await run(prompt);
    if (!text) {
      throw new Error("No response from AI");
    }
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    // Map group names to group objects
    const groups: ComponentGroup[] = (parsed.groups || []).map((group: any, groupIndex: number) => {
      const groupComponents = group.components
        .map((rec: any) => findComponentByIdOrName(rec.id, availableComponents))
        .filter(Boolean);
      return {
        name: group.name,
        color: group.color,
        icon: group.icon,
        components: groupComponents,
        position: { x: groupIndex * 400, y: 0 }
      };
    });
    // Validate connections to ensure group names exist
    const groupNames = groups.map(g => g.name);
    const validConnections = (parsed.connections || []).filter((conn: any) => {
      return groupNames.includes(conn.from) && groupNames.includes(conn.to) && conn.label;
    });
    return {
      groups,
      explanation: parsed.explanation || '',
      connections: validConnections
    };
  } catch (error: any) {
    console.error("AI analysis failed:", error);
    if (error.message === "API_KEY_NOT_CONFIGURED") {
      throw new Error("Please configure your Gemini API key in .env.local file");
    }
    if (error.message === "API_KEY_INVALID") {
      throw new Error("Invalid Gemini API key. Please check your API key configuration");
    }
    throw new Error("Failed to analyze system request. Please try again.");
  }
}