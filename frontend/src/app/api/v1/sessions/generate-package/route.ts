import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for full multi-asset package synthesis

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const targetUrls = [
      'http://127.0.0.1:8000/api/v1/sessions/generate-package',
      'http://localhost:8000/api/v1/sessions/generate-package',
      process.env.AI_SERVICE_URL ? `${process.env.AI_SERVICE_URL.replace(/\/+$/, '')}/api/v1/sessions/generate-package` : null,
      'https://ismllmsresourceagent-production.up.railway.app/api/v1/sessions/generate-package',
    ].filter(Boolean) as string[];

    let lastError: any = null;

    for (const url of targetUrls) {
      try {
        const resp = await fetch(url, {
          method: 'POST',
          body: formData,
        });

        // Forward successful response OR business validation errors (400, 422, 403)
        if (resp.ok || resp.status === 400 || resp.status === 422 || resp.status === 403) {
          const contentType = resp.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await resp.json();
            return NextResponse.json(data, { status: resp.status });
          }
          const text = await resp.text();
          return new NextResponse(text, {
            status: resp.status,
            headers: { 'Content-Type': contentType || 'text/plain' },
          });
        }

        lastError = new Error(`Upstream ${url} returned status ${resp.status}`);
      } catch (err: any) {
        lastError = err;
      }
    }

    return NextResponse.json(
      {
        error: 'AI Service Unreachable',
        detail: lastError?.message || 'Could not connect to Python AI generation engine on port 8000',
      },
      { status: 503 }
    );
  } catch (err: any) {
    console.error('Error in /api/v1/sessions/generate-package route:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', detail: err.message },
      { status: 500 }
    );
  }
}

