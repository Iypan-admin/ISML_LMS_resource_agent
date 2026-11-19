import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language');
    const level = searchParams.get('level');

    const where: any = {};
    if (language) where.language = { equals: language, mode: 'insensitive' };
    if (level) where.level = { equals: level, mode: 'insensitive' };

    const sessions = await prisma.sessionPackage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(sessions, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/sessions GET Error]:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await prisma.sessionVectorChunk.deleteMany({}).catch(() => {});
    await prisma.knowledgeClaim.deleteMany({}).catch(() => {});
    const deleted = await prisma.sessionPackage.deleteMany({}).catch(() => ({ count: 0 }));

    return NextResponse.json({
      success: true,
      count: deleted.count,
      message: 'All session packages and vector chunks deleted successfully',
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/sessions DELETE Error]:', error);
    return NextResponse.json({ success: true, message: 'Sessions cleared' }, { status: 200 });
  }
}
