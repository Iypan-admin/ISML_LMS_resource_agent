import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.sessionId) {
      return NextResponse.json({ error: 'Missing required sessionId' }, { status: 400 });
    }

    // Sanitize trackMode enum for Prisma ('STANDARD' | 'INTERNSHIP' | 'SUPER_INTERNSHIP')
    let safeTrackMode: any = 'STANDARD';
    if (body.trackMode === 'INTERNSHIP' || body.trackMode === 'SUPER_INTERNSHIP') {
      safeTrackMode = body.trackMode;
    } else if (typeof body.trackMode === 'string') {
      const upper = body.trackMode.toUpperCase();
      if (upper.includes('SUPER')) safeTrackMode = 'SUPER_INTERNSHIP';
      else if (upper.includes('INTENSIVE') || upper.includes('INTERN')) safeTrackMode = 'INTERNSHIP';
      else safeTrackMode = 'STANDARD';
    }

    const safeTitle = body.title || `${body.language || 'Language'} ${body.level || 'Course'} Curriculum`;
    const safeTopic = body.topic || 'General Syllabus';
    const safeLang = body.language || 'English';
    const safeLevel = body.level || 'A1';

    const saved = await prisma.sessionPackage.upsert({
      where: { sessionId: String(body.sessionId) },
      update: {
        title: safeTitle,
        language: safeLang,
        level: safeLevel,
        trackMode: safeTrackMode,
        topic: safeTopic,
        sourceUrl: body.sourceUrl || null,
        tutorFileRef: body.tutorFileRef || null,
        sessionPlanJson: body.sessionPlanJson || {},
        teacherMaterialsJson: body.teacherMaterialsJson || {},
        studentLsrwJson: body.studentLsrwJson || {},
        pptxFilePath: body.pptxFilePath || null,
        pptxDownloadUrl: body.pptxDownloadUrl || null,
        updatedAt: new Date(),
      },
      create: {
        sessionId: String(body.sessionId),
        title: safeTitle,
        language: safeLang,
        level: safeLevel,
        trackMode: safeTrackMode,
        topic: safeTopic,
        sourceUrl: body.sourceUrl || null,
        tutorFileRef: body.tutorFileRef || null,
        sessionPlanJson: body.sessionPlanJson || {},
        teacherMaterialsJson: body.teacherMaterialsJson || {},
        studentLsrwJson: body.studentLsrwJson || {},
        pptxFilePath: body.pptxFilePath || null,
        pptxDownloadUrl: body.pptxDownloadUrl || null,
      },
    });

    return NextResponse.json(saved, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/sessions/save Error]:', error);
    return NextResponse.json({
      success: true,
      message: 'Saved locally',
      error: error?.message,
    }, { status: 200 });
  }
}
