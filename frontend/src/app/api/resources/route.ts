import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const resources = await prisma.resource.findMany({
      where: {
        tenantId: { not: 'inst_legacy_quarantine' },
      },
      include: {
        language: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({
      success: true,
      data: resources,
      count: resources.length,
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/resources GET Error]:', error);
    return NextResponse.json({ success: false, data: [] }, { status: 200 });
  }
}

