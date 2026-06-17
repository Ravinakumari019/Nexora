import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const currentUserId = session.user.id;
    const body = await request.json();
    const { name, status } = body;

    // Build update payload
    const updateData: { name?: string; status?: string | null } = {};

    if (name !== undefined) {
      if (typeof name !== 'string') {
        return new NextResponse('Invalid name type', { status: 400 });
      }
      const trimmedName = name.trim();
      if (trimmedName === '') {
        return new NextResponse('Name cannot be empty', { status: 400 });
      }
      updateData.name = trimmedName;
    }

    if (status !== undefined) {
      if (status !== null && typeof status !== 'string') {
        return new NextResponse('Invalid status type', { status: 400 });
      }
      updateData.status = status ? status.trim() : null;
    }

    // Update in database
    const updatedUser = await prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        status: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[USER_PROFILE_PATCH_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
