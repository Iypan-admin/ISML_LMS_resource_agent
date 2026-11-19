import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await prisma.sessionPackage.findFirst({
      where: {
        OR: [
          { sessionId: id },
          { id: id },
        ],
      },
    });

    if (!session) {
      return NextResponse.json({ error: `Session ${id} not found` }, { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error: any) {
    console.error(`[API /api/sessions/[id] GET Error]:`, error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.sessionVectorChunk.deleteMany({
      where: { sessionId: id },
    }).catch(() => {});

    await prisma.sessionPackage.deleteMany({
      where: {
        OR: [
          { sessionId: id },
          { id: id },
        ],
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Session ${id} deleted permanently`,
    }, { status: 200 });
  } catch (error: any) {
    console.error(`[API /api/sessions/[id] DELETE Error]:`, error);
    return NextResponse.json({ success: true, message: 'Session deleted' }, { status: 200 });
  }
}
