import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const isSimulationMode = !apiKey;

// Initialize the Gemini client if the key is present
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface GeminiMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * Check if the Gemini API is running in simulation mode
 */
export function isGeminiSimulated(): boolean {
  return isSimulationMode;
}

/**
 * Generate a response for a multi-turn chat conversation
 */
export async function generateAIChatResponse(chatHistory: GeminiMessage[]): Promise<string> {
  if (isSimulationMode || !genAI) {
    return simulateAIChatResponse(chatHistory);
  }

  try {
    // Using gemini-2.5-flash as the default model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Map roles to Gemini roles ('user' -> 'user', 'model' -> 'model')
    // The history needs to be passed correctly to the Gemini chat API
    const history = chatHistory.slice(0, -1).map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const latestMessage = chatHistory[chatHistory.length - 1];
    
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(latestMessage.content);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[GEMINI_CHAT_ERROR]', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Generate a summary of a chat conversation
 */
export async function generateChatSummary(messagesList: string[]): Promise<string> {
  if (isSimulationMode || !genAI) {
    return simulateChatSummary(messagesList);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an AI assistant built into Nexora, a modern chat and SaaS workspace app.
      Below is a list of sequential chat messages from a conversation.
      Please analyze the messages and provide a highly concise, bullet-pointed summary of what was discussed, what decisions were made, and any action items.
      Keep it structured, clear, and neat. Use at most 4-5 bullet points. Do not include introductory text like "Sure, here is the summary".
      
      Chat Messages:
      ${messagesList.map((msg, index) => `${index + 1}. ${msg}`).join('\n')}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[GEMINI_SUMMARY_ERROR]', error);
    throw new Error('Failed to generate chat summary');
  }
}

// ─────────────────────────────────────────────
// Simulation Fallback Implementation
// ─────────────────────────────────────────────

export function simulateAIChatResponse(chatHistory: GeminiMessage[]): string {
  const latestMessage = chatHistory[chatHistory.length - 1]?.content.toLowerCase() || '';

  // Simulate delay
  // (We return immediately but the router handler can add a slight delay to simulate processing)
  
  if (latestMessage.includes('react 19') || latestMessage.includes('server action')) {
    return `### React 19 Server Actions Explained (Simulated Response)

Server Actions are a key feature in React 19 and Next.js, allowing you to run server-side code directly in response to user interactions (like form submissions) without manually writing API routes.

Here's a quick overview of how they work:

1. **Directive**: You declare a Server Action by adding the "use \u0020server" directive at the top of an async function or a file.
2. **Form Integration**: You can pass the Server Action directly to the HTML \`<form action={action}>\` attribute.
3. **Optimistic Updates**: React 19 introduces hooks like \`useOptimistic\` to update the UI instantly before the server action resolves.
4. **Pending States**: The \`useTransition\` hook lets you track when the action is running to show loading indicators.

Example:
\`\`\`tsx
// server-action.ts
"use \u0020server";

export async function updateProfile(formData: FormData) {
  const name = formData.get("name");
  // Update in database...
  return { success: true };
}
\`\`\``;
  }

  if (latestMessage.includes('summar') || latestMessage.includes('chats') || latestMessage.includes('history')) {
    return `### Conversation Summary Helper (Simulated Response)

I can summarize your active conversations! To try it:
1. Navigate back to the **Chats** section.
2. Select any active conversation (like the seeded "Welcome to Nexora" chat).
3. Click the **Sparkles** icon in the top header.
4. A modal will pop up showing an AI-generated bullet point summary of recent conversation activity!`;
  }

  if (latestMessage.includes('hello') || latestMessage.includes('hi') || latestMessage.includes('hey')) {
    return `Hello! 👋 I am your Nexora AI Companion. 

Currently, I am running in **Simulation Mode** because no \`GOOGLE_GEMINI_API_KEY\` is configured in your \`.env.local\` file.

However, you can still ask me general development questions, test the chat flow, or head over to the chat view and try the conversation summarizer feature. What can I help you test today?`;
  }

  return `I received your prompt: "${chatHistory[chatHistory.length - 1]?.content}"

This is a **simulated response** from your Nexora AI Companion. To enable real replies powered by Google Gemini, please add your \`GOOGLE_GEMINI_API_KEY\` to the \`.env.local\` file in the root of the project and restart the development server.

Let me know if you would like me to explain programming concepts (e.g., "Explain React 19 Server Actions") or help you test other UI flows!`;
}

export function simulateChatSummary(messagesList: string[]): string {
  if (messagesList.length === 0) {
    return `* No messages were found in this conversation to summarize.`;
  }

  // Check if it's the default welcome chat
  const hasWelcome = messagesList.some(m => m.includes('Welcome to Nexora'));
  
  if (hasWelcome) {
    return `* **Welcome & Greeting**: The Nexora Admin welcomed the demo user to the new workspace platform.
* **Positive Feedback**: The Demo User expressed excitement and complimented the high-fidelity UI design.
* **Feature Overview**: The Admin highlighted core features including real-time chatting, the Gemini AI assistant, and workspace profile customizations.
* **Nexora Exploration**: The conversation served as an initial onboarding step to help the user start testing the dashboard.`;
  }

  // Generic summary for custom messages
  return `* **Recent Communication**: A sequence of ${messagesList.length} messages was analyzed between the conversation participants.
* **Key Topics**: The discussion centered on general chat testing, real-time message sending, and Socket.IO server verification.
* **Status**: Messages were successfully delivered and recorded in the database, confirming the real-time websocket channel is active.`;
}
