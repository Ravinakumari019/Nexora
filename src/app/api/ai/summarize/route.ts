import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateChatSummary, isGeminiSimulated, simulateChatSummary } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const currentUserId = session.user.id;
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId || typeof conversationId !== 'string') {
      return new NextResponse('Bad Request: conversationId is required', { status: 400 });
    }

    // 1. Verify the conversation exists and that the user is a participant of it
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            id: currentUserId,
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse('Conversation not found or access denied', { status: 404 });
    }

    // 2. Fetch the last 50 messages to summarize
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 50,
    });

    if (messages.length === 0) {
      return NextResponse.json(
        { summary: 'This conversation does not contain any messages yet.', isSimulated: isGeminiSimulated() },
        {
          headers: {
            'x-ai-simulation': isGeminiSimulated() ? 'true' : 'false',
          },
        }
      );
    }

    // 3. Format messages as "AuthorName: MessageText"
    const formattedMessages = messages.map((m) => {
      const authorName = m.author.name || m.author.email || 'User';
      return `${authorName}: ${m.content}`;
    });

    // 4. Generate summary
    let summaryText = '';
    let isSimulated = isGeminiSimulated();

    try {
      if (isSimulated) {
        summaryText = simulateChatSummary(formattedMessages);
      } else {
        summaryText = await generateChatSummary(formattedMessages);
      }
    } catch (error) {
      console.error('[AI_SUMMARIZE_ROUTE_FALLBACK_TRIGGERED]', error);
      isSimulated = true;
      summaryText = `* **⚠️ Gemini API Error**: Failed to generate summary (your API key may be invalid or the service is temporarily unavailable).\n* **Simulated Summary (Fallback)**:\n` + simulateChatSummary(formattedMessages);
    }

    // 5. Return JSON with the simulation header
    return NextResponse.json(
      { summary: summaryText, isSimulated },
      {
        headers: {
          'x-ai-simulation': isSimulated ? 'true' : 'false',
        },
      }
    );
  } catch (error) {
    console.error('[AI_SUMMARIZE_ROUTE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
