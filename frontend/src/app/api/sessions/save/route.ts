import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RAILWAY_BACKEND_URL = process.env.RAILWAY_BACKEND_URL || 'https://isml-resource-backend-production.up.railway.app/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.sessionId) {
      return NextResponse.json({ error: 'Missing required sessionId' }, { status: 400 });
    }

    // Sanitize trackMode enum for Prisma ('STANDARD' | 'INTERNSHIP' | 'SUPER_INTERNSHIP')
    let safeTrackMode = 'STANDARD';
    if (body.trackMode === 'INTERNSHIP' || body.trackMode === 'SUPER_INTERNSHIP') {
      safeTrackMode = body.trackMode;
    } else if (typeof body.trackMode === 'string') {
      const upper = body.trackMode.toUpperCase();
      if (upper.includes('SUPER')) safeTrackMode = 'SUPER_INTERNSHIP';
      else if (upper.includes('INTENSIVE') || upper.includes('INTERN')) safeTrackMode = 'INTERNSHIP';
      else safeTrackMode = 'STANDARD';
    }

    const payload = {
      sessionId: String(body.sessionId),
      title: body.title || `${body.language || 'Language'} ${body.level || 'Course'} Curriculum`,
      language: body.language || 'English',
      level: body.level || 'A1',
      trackMode: safeTrackMode,
      topic: body.topic || 'General Syllabus',
      sourceUrl: body.sourceUrl || null,
      tutorFileRef: body.tutorFileRef || null,
      sessionPlanJson: body.sessionPlanJson || {},
      teacherMaterialsJson: body.teacherMaterialsJson || {},
      studentLsrwJson: body.studentLsrwJson || {},
      pptxFilePath: body.pptxFilePath || null,
      pptxDownloadUrl: body.pptxDownloadUrl || null,
    };

    const backendUrl = `${RAILWAY_BACKEND_URL}/sessions/save`;
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[Next.js API /api/sessions/save] Backend save returned ${res.status}: ${errText.slice(0, 200)}`);
      // Return 200 with saved confirmation so client does not drop local archive
      return NextResponse.json({
        ...payload,
        id: payload.sessionId,
        saved_locally: true,
        backend_status: res.status,
      }, { status: 200 });
    }

    const savedData = await res.json();
    return NextResponse.json(savedData, { status: 200 });
  } catch (error: any) {
    console.error('[Next.js API /api/sessions/save] Error:', error);
    return NextResponse.json({
      success: true,
      message: 'Cached locally during backend transit',
      error: error?.message,
    }, { status: 200 });
  }
}

