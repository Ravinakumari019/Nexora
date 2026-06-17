import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateAIChatResponse, isGeminiSimulated, simulateAIChatResponse, GeminiMessage } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new NextResponse('Bad Request: messages array is required', { status: 400 });
    }

    // Basic structure validation
    const isValid = messages.every(
      (m) =>
        m &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'model') &&
        typeof m.content === 'string'
    );

    if (!isValid) {
      return new NextResponse('Bad Request: Invalid messages structure', { status: 400 });
    }

    // Check if simulation mode is active
    let isSimulated = isGeminiSimulated();
    let aiResponseText = '';

    try {
      if (isSimulated) {
        aiResponseText = simulateAIChatResponse(messages as GeminiMessage[]);
      } else {
        aiResponseText = await generateAIChatResponse(messages as GeminiMessage[]);
      }
    } catch (error) {
      console.error('[AI_CHAT_ROUTE_FALLBACK_TRIGGERED]', error);
      isSimulated = true;
      aiResponseText = `⚠️ **Gemini API Error:** Failed to generate response (your API key may be invalid or the service is temporarily unavailable).\n\n**Here is a simulated response as fallback:**\n\n` + simulateAIChatResponse(messages as GeminiMessage[]);
    }

    // Return the response, adding a header to indicate simulation mode
    return NextResponse.json(
      { response: aiResponseText, isSimulated },
      {
        headers: {
          'x-ai-simulation': isSimulated ? 'true' : 'false',
        },
      }
    );
  } catch (error) {
    console.error('[AI_CHAT_ROUTE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
