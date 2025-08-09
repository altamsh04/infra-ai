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
  icon?: string;
}

export interface ComponentGroup {
  name: string;
  color?: string;
  icon?: string;
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
  title?: string;
}

export interface AIResponse {
  isSystemDesign: boolean;
  message: string;
  recommendation?: AIRecommendation;
}

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Check if API key is configured
if (!apiKey || apiKey === "your_gemini_api_key_here") {
  console.error("⚠️ AI API key not configured.");
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

// InfraAI fallback message
const INFRA_AI_FALLBACK = "I'm InfraAI, developed by Altamsh Bairagdar - an AI assistant specializing in system design and architecture. I can help you:\n\n• Design scalable system architectures\n• Choose the right components for your needs\n• Create visual system diagrams\n• Answer questions about technology and engineering\n• Have general conversations about tech topics\n\nHow can I assist you today?";

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
  } catch (error: unknown) {
    console.error("Error during API call:", error);

    if (error instanceof Error && error.message === "API_KEY_NOT_CONFIGURED") {
      throw new Error("API_KEY_NOT_CONFIGURED");
    }

    if (error instanceof Error && (error as { code?: number }).code === 403) {
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

// Enhanced AI assistant that handles both chat and system design
export async function analyzeSystemRequest(
  userRequest: string,
  availableComponents: SystemComponent[]
): Promise<AIResponse> {

  // First, determine if this is a system design request
  const classificationPrompt = `
You are an InfraAI assistant that helps with both general conversation and system design. 
Your role is to be friendly, helpful, and knowledgeable about technology and system architecture.

Analyze the following user message and determine if it's asking for system design/architecture help or if it's a general conversation.

User message: "${userRequest}"

System design keywords to look for: design, architecture, system, scalable, database, API, microservices, cloud, infrastructure, backend, frontend, load balancer, cache, storage, deployment, etc.

Respond with ONLY one of these:
- "SYSTEM_DESIGN" if the user is asking for system architecture, design patterns, or technical system recommendations
- "GENERAL_CHAT" if the user is having a general conversation, asking questions, or chatting about non-system-design topics, about yourself (you are InfraAI, developed by Altamsh Bairagdar AI assistant specializing in system design and architecture. some can help to Design scalable system architectures
• Choose the right components for your needs
• Create visual system diagrams
• Answer questions about technology and engineering
• Have general conversations about tech topics
)

Consider these examples:
- "Hello, how are you?" -> GENERAL_CHAT
- "What's the weather like?" -> GENERAL_CHAT
- "Tell me about yourself" -> GENERAL_CHAT
- "Design a chat application" -> SYSTEM_DESIGN
- "How to build a scalable e-commerce platform?" -> SYSTEM_DESIGN
- "What database should I use for my app?" -> SYSTEM_DESIGN
`;

  try {
    const classificationType = await run(classificationPrompt);

    if (classificationType?.trim() === "SYSTEM_DESIGN") {
      // Handle system design request
      const systemDesignPrompt = `
You are an expert system design assistant with a friendly personality.

Analyze the following user request and recommend the most appropriate system components from the available list, organized into logical groups (e.g., Frontend, Backend, Database, Networking, etc.).

For each group, recommend the most relevant components. Then, for each connection between groups (not between individual components), specify a short, meaningful label describing the interaction (e.g., "HTTP", "API Call", "DB Query", "DNS Lookup").

User Request: "${userRequest}"

Available Components (${availableComponents.length} total):
${availableComponents.map(comp =>
        `- ${comp.name} (ID: ${comp.id}, Type: ${comp.type}): ${comp.description} [Tags: ${comp.tags.join(', ')}, Inputs: ${comp.inputs.join(', ')}, Outputs: ${comp.outputs.join(', ')}]`
      ).join('\n')}

Please provide a JSON response with the following structure:
{
  "title": "A concise, descriptive title for this system design (e.g., 'WhatsApp-like Real-Time Chat System Architecture')",
  "explanation": "A friendly explanation of the system design with technical details",
  "groups": [
    {
      "name": "Frontend",
      "color": "#3b82f6",
      "icon": "react",
      "components": [
        { "id": "component_id", "icon": "react" }
      ]
    }
  ],
  "connections": [
    {
      "from": "Frontend",
      "to": "Backend",
      "label": "HTTP"
    }
  ]
}

IMPORTANT GUIDELINES:
1. Be friendly and explain your reasoning
2. Only create connections between groups (not between individual components)
3. Each connection label must be a short, meaningful description
4. Use group names for the "from" and "to" fields in connections
5. Only recommend groups and connections directly relevant to the user's requirements
6. Provide a helpful explanation of the architecture
7. The 'title' field should be a short, descriptive summary of the system design topic
`;

      const response = await run(systemDesignPrompt);
      if (!response) {
        return {
          isSystemDesign: true,
          message: INFRA_AI_FALLBACK,
        };
      }

      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          isSystemDesign: true,
          message: response.trim() || INFRA_AI_FALLBACK,
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Map group names to group objects
      const groups: ComponentGroup[] = (parsed.groups || []).map((group: Record<string, unknown>, groupIndex: number) => {
        const groupComponents = (group.components as string[] || []).map((rec: string) => findComponentByIdOrName(rec, availableComponents))
          .filter(Boolean);
        return {
          name: group.name as string,
          color: group.color as string | undefined,
          icon: group.icon as string | undefined,
          components: groupComponents,
          position: { x: groupIndex * 400, y: 0 }
        };
      });

      // Validate connections to ensure group names exist
      const groupNames = groups.map(g => g.name);
      const validConnections = (parsed.connections || []).filter((conn: Record<string, unknown>) => {
        return groupNames.includes(conn.from as string) && groupNames.includes(conn.to as string) && conn.label;
      });

      return {
        isSystemDesign: true,
        message: parsed.explanation || 'Here\'s your system design:',
        recommendation: {
          groups,
          explanation: parsed.explanation || '',
          connections: validConnections,
          title: parsed.title || '',
        }
      };

    } else {
      // Handle general conversation
      const chatPrompt = `
You are a friendly AI assistant who specializes in technology and system design. You're knowledgeable, helpful, and engaging.

About you:
- You're an expert in system architecture, software engineering, and technology
- You can help with both technical questions and general conversation
- You're friendly, approachable, and enjoy helping people learn
- You have a passion for building scalable, efficient systems
- You love discussing technology trends, programming, and system design

If the user asks personal questions about your identity (such as "what is your name?", "who are you?", "tell me about yourself"), respond with: "I'm here to help! Feel free to ask me about system design, technology, or just chat about anything else."

User message: "${userRequest}"

Respond naturally and helpfully. If the user asks about system design or architecture, let them know you can help them design systems and create architecture diagrams. Keep your response conversational and engaging.
`;

      const response = await run(chatPrompt);

      return {
        isSystemDesign: false,
        message: response || INFRA_AI_FALLBACK,
      };
    }

  } catch (error: unknown) {
    console.error("AI analysis failed:", error);

    if (error instanceof Error && error.message === "API_KEY_NOT_CONFIGURED") {
      throw new Error("Please configure your Gemini API key in .env.local file");
    }

    if (error instanceof Error && error.message === "API_KEY_INVALID") {
      throw new Error("Invalid Gemini API key. Please check your API key configuration");
    }

    // Fallback response for any other errors
    return {
      isSystemDesign: false,
      message: INFRA_AI_FALLBACK
    };
  }
}