import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const scriptPath = path.resolve(process.cwd(), '..', 'ai-service', 'extract_doc.py');
    const fallbackScriptPath = path.resolve(process.cwd(), 'ai-service', 'extract_doc.py');
    const finalScriptPath = (await fileExists(scriptPath)) ? scriptPath : fallbackScriptPath;

    const extractedMaterials = [];

    for (const file of files) {
      const fileName = file.name || 'unnamed_document';
      const ext = path.extname(fileName).toLowerCase();

      // Plaintext-friendly formats can be read directly
      if (['.txt', '.md', '.csv', '.json', '.html', '.tsv', '.xml'].includes(ext)) {
        try {
          const text = await file.text();
          extractedMaterials.push({
            name: fileName,
            size: file.size,
            extension: ext,
            pages: 1,
            word_count: text.split(/\s+/).filter(Boolean).length,
            char_count: text.length,
            text
          });
          continue;
        } catch (_) {}
      }

      // Binary formats (PDF, DOCX, PPTX)
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempFilePath = path.join(os.tmpdir(), `isml_upload_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
        
        await fs.writeFile(tempFilePath, buffer);

        // Run python extractor
        const pyProc = spawnSync('python', [finalScriptPath, tempFilePath], {
          encoding: 'utf-8',
          maxBuffer: 50 * 1024 * 1024, // 50MB buffer for full books
          timeout: 45000
        });

        // Clean up temp file
        try { await fs.unlink(tempFilePath); } catch (_) {}

        if (pyProc.stdout && pyProc.stdout.trim()) {
          try {
            const parsed = JSON.parse(pyProc.stdout.trim());
            if (parsed.success && parsed.text) {
              extractedMaterials.push({
                name: fileName,
                size: file.size,
                extension: ext,
                pages: parsed.pages || 1,
                word_count: parsed.word_count || 0,
                char_count: parsed.char_count || parsed.text.length,
                text: parsed.text
              });
              continue;
            }
          } catch (_) {}
        }

        // Fallback if python script encountered an issue
        extractedMaterials.push({
          name: fileName,
          size: file.size,
          extension: ext,
          pages: 1,
          word_count: 0,
          char_count: 0,
          text: `[Attached Document: ${fileName} (${(file.size / 1024).toFixed(1)} KB)]`
        });
      } catch (err: any) {
        extractedMaterials.push({
          name: fileName,
          size: file.size,
          extension: ext,
          pages: 1,
          word_count: 0,
          char_count: 0,
          text: `[Document File: ${fileName}]`
        });
      }
    }

    return NextResponse.json({
      success: true,
      extracted_materials: extractedMaterials,
      count: extractedMaterials.length
    });

  } catch (err: any) {
    console.error('Error in extract-material route:', err);
    return NextResponse.json({ error: err.message || 'Failed to extract material' }, { status: 500 });
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

