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
You are an expert system architect. Analyze the following user request and recommend the most appropriate system components from the available list, organized into logical groups.

User Request: "${userRequest}"

Available Components (${availableComponents.length} total):
${availableComponents.map(comp => 
  `- ${comp.name} (ID: ${comp.id}, Type: ${comp.type}): ${comp.description} [Tags: ${comp.tags.join(', ')}]`
).join('\n')}

Please provide a JSON response with the following structure:
{
  "groups": [
    {
      "name": "Frontend",
      "color": "#3b82f6", // hex or Tailwind color for border/background
      "icon": "react", // icon name or URL
      "components": [
        {
          "id": "component_id",
          "icon": "react", // icon name or URL
          "reason": "Why this component is needed in this group"
        }
      ]
    },
    {
      "name": "Backend", 
      "color": "#f59e42",
      "icon": "api",
      "components": [
        {
          "id": "component_id",
          "icon": "api",
          "reason": "Why this component is needed in this group"
        }
      ]
    },
    {
      "name": "Database",
      "color": "#6366f1",
      "icon": "database",
      "components": [
        {
          "id": "component_id", 
          "icon": "database",
          "reason": "Why this component is needed in this group"
        }
      ]
    }
  ],
  "explanation": "Detailed explanation of the architecture choices and group organization",
  "connections": [
    {
      "from": "component_id",
      "to": "component_id", 
      "label": "Connection description (optional)"
    }
  ]
}

IMPORTANT GUIDELINES:
1. Use the exact component IDs from the list above. Do not use display names.
2. Group components logically (e.g., Frontend, Backend, Database, Networking, Storage, etc.)
3. Only recommend components that are directly relevant to the user's requirements.
4. Create 3-5 groups maximum, with meaningful group names.
5. Each group should contain 1-4 components typically.
6. Each group and component should have an icon (icon name or URL) and a color (hex or Tailwind color).
7. Common group names: Frontend, Backend, Database, Networking, Storage, Security, Monitoring, etc.
`;

  try {
    const text = await run(prompt);
    
    if (!text) {
      throw new Error("No response from AI");
    }
    
    console.log("Raw AI response:", text);
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    console.log("Parsed AI response:", parsed);
    
    // Process groups and map component IDs to full component objects
    const groups: ComponentGroup[] = (parsed.groups || []).map((group: any, groupIndex: number) => {
      const groupComponents = group.components
        .map((rec: any) => {
          const component = findComponentByIdOrName(rec.id, availableComponents);
          if (component) {
            console.log(`Found component: ${rec.id} -> ${component.name} (${component.id}) in group ${group.name}`);
          } else {
            console.warn(`Component not found: ${rec.id}`);
          }
          return component;
        })
        .filter(Boolean);
      
      return {
        name: group.name,
        color: group.color,
        icon: group.icon,
        components: groupComponents,
        position: { x: groupIndex * 400, y: 0 } // Will be adjusted in canvas
      };
    });
    
    console.log("Processed groups:", groups);
    
    return {
      groups,
      explanation: parsed.explanation,
      connections: parsed.connections || []
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

export async function explainComponentChoice(
  componentId: string,
  userRequest: string,
  availableComponents: SystemComponent[]
): Promise<string> {
  const component = availableComponents.find(c => c.id === componentId);
  
  if (!component) {
    return "Component not found";
  }

  const prompt = `
Explain why the "${component.name}" component is recommended for this system design request:

User Request: "${userRequest}"

Component Details:
- Name: ${component.name}
- Type: ${component.type}
- Description: ${component.description}
- Tags: ${component.tags.join(', ')}
- Inputs: ${component.inputs.join(', ')}
- Outputs: ${component.outputs.join(', ')}

Provide a clear, concise explanation of:
1. Why this component is needed for the user's requirements
2. How it fits into the overall architecture
3. What problems it solves
4. Any alternatives that could be considered

Keep the response under 200 words and focus on practical benefits.
`;

  try {
    const text = await run(prompt);
    return text || "Unable to explain component choice at this time.";
  } catch (error: any) {
    console.error("Component explanation failed:", error);
    
    if (error.message === "API_KEY_NOT_CONFIGURED") {
      return "Please configure your Gemini API key to get component explanations.";
    }
    
    return "Unable to explain component choice at this time.";
  }
} 