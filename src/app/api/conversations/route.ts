import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const currentUserId = session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: currentUserId,
          },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('[CONVERSATIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const currentUserId = session.user.id;
    const body = await request.json();
    const { participantIds, title } = body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return new NextResponse('Missing participant IDs', { status: 400 });
    }

    // 1-on-1 Chat optimization: check for existing matching conversation
    if (participantIds.length === 1 && !title) {
      const targetUserId = participantIds[0];

      // Find all conversations containing both participants
      const existingConversations = await prisma.conversation.findMany({
        where: {
          title: null,
          AND: [
            { participants: { some: { id: currentUserId } } },
            { participants: { some: { id: targetUserId } } },
          ],
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });

      // Filter to find exact 1:1 match (exactly 2 participants)
      const existing1v1 = existingConversations.find(
        (c) => c.participants.length === 2
      );

      if (existing1v1) {
        return NextResponse.json(existing1v1);
      }
    }

    // Create new conversation (either group or 1:1 if not found)
    const newConversation = await prisma.conversation.create({
      data: {
        title: title || null,
        participants: {
          connect: [
            { id: currentUserId },
            ...participantIds.map((id: string) => ({ id })),
          ],
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error('[CONVERSATIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
