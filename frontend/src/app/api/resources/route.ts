import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RAILWAY_URL = 'https://isml-resource-backend-production.up.railway.app/api/v1/resources?limit=500';

export async function GET(req: NextRequest) {
  // 1. Fetch from Railway backend (cloud container with full IPv6 routing to Supabase)
  try {
    const resp = await fetch(RAILWAY_URL, {
      signal: AbortSignal.timeout(10000),
      headers: { 'Accept': 'application/json' },
    });
    if (resp.ok) {
      const json = await resp.json();
      if (json && (Array.isArray(json.data) || Array.isArray(json))) {
        const rawList = Array.isArray(json.data) ? json.data : json;
        const valid = rawList.filter((r: any) => !r.title?.includes('MicroBiology'));
        // Deduplicate by normalized title, preferring global published records
        const mapByTitle = new Map<string, any>();
        for (const item of valid) {
          const t = (item.title || '').trim().toLowerCase();
          if (!t) continue;
          const existing = mapByTitle.get(t);
          if (!existing) {
            mapByTitle.set(t, item);
          } else if (existing.tenantId === 'inst_legacy_quarantine' && item.tenantId !== 'inst_legacy_quarantine') {
            mapByTitle.set(t, item);
          }
        }
        const filtered = Array.from(mapByTitle.values());
        return NextResponse.json({
          success: true,
          data: filtered,
          count: filtered.length,
          source: 'cloud_backend',
        }, { status: 200 });
      }
    }
  } catch (netErr: any) {
    console.warn('[Railway Fetch Notice]:', netErr.message);
  }

  // 2. Fallback to direct Prisma PostgreSQL query
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
      source: 'prisma_db',
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/resources GET Error]:', error);
    return NextResponse.json({
      success: false,
      data: [],
      error: error?.message || String(error),
      code: error?.code,
    }, { status: 500 });
  }
}

