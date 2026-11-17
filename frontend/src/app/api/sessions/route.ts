import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RAILWAY_BACKEND_URL = process.env.RAILWAY_BACKEND_URL || 'https://isml-resource-backend-production.up.railway.app/api/v1';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const backendUrl = `${RAILWAY_BACKEND_URL}/sessions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.warn(`[Next.js API /api/sessions] Backend returned status ${res.status}`);
      return NextResponse.json([], { status: 200 }); // Return empty array gracefully so UI never breaks
    }

    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : [], { status: 200 });
  } catch (error: any) {
    console.error('[Next.js API /api/sessions] GET error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const backendUrl = `${RAILWAY_BACKEND_URL}/sessions`;
    const res = await fetch(backendUrl, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    const data = await res.json().catch(() => ({ success: true }));
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[Next.js API /api/sessions] DELETE error:', error);
    return NextResponse.json({ success: true, message: 'Local reset acknowledged' }, { status: 200 });
  }
}

