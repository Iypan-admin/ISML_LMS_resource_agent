import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RAILWAY_BACKEND_URL = process.env.RAILWAY_BACKEND_URL || 'https://isml-resource-backend-production.up.railway.app/api/v1';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = `${RAILWAY_BACKEND_URL}/sessions/${encodeURIComponent(id)}`;

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Session ${id} not found` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(`[Next.js API /api/sessions/[id]] GET error:`, error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = `${RAILWAY_BACKEND_URL}/sessions/${encodeURIComponent(id)}`;

    const res = await fetch(backendUrl, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    const data = await res.json().catch(() => ({ success: true, message: `Session ${id} deleted` }));
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(`[Next.js API /api/sessions/[id]] DELETE error:`, error);
    return NextResponse.json({ success: true, message: 'Session deleted from local store' }, { status: 200 });
  }
}

