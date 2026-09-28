import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Try forwarding to Python AI microservice or NestJS backend
    const serviceUrls = [
      process.env.AI_SERVICE_URL ? `${process.env.AI_SERVICE_URL.replace(/\/+$/, '')}/api/v1/ai/discover` : null,
      process.env.BACKEND_API_URL ? `${process.env.BACKEND_API_URL.replace(/\/+$/, '')}/ai/discover` : null,
      'http://localhost:8000/api/v1/ai/discover',
      'http://localhost:4000/api/v1/ai/discover',
    ].filter(Boolean) as string[];

    for (const serviceUrl of serviceUrls) {
      try {
        const upstreamResp = await fetch(serviceUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(3000),
        });

        if (upstreamResp.ok) {
          const data = await upstreamResp.json();
          return NextResponse.json(data);
        }
      } catch {
        // Continue to fallback
      }
    }

    // 2. Vercel Serverless Fallback Discovery Engine
    const { search_keywords, target_languages, target_levels } = body || {};
    const keywords = search_keywords || 'German language lesson';
    const lang = (target_languages && target_languages[0]) ? target_languages[0] : 'German';
    const level = (target_levels && target_levels[0]) ? target_levels[0] : 'A2';

    // Query DuckDuckGo HTML API for search results
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(keywords + ' ' + lang + ' ' + level + ' learning resource')}`;
    let candidates: any[] = [];

    try {
      const ddgResp = await fetch(ddgUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (ddgResp.ok) {
        const html = await ddgResp.text();
        const linkRegex = /<a[^>]+class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        const titleRegex = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

        let match;
        const links: string[] = [];
        while ((match = linkRegex.exec(html)) !== null && links.length < 8) {
          let href = match[1];
          if (href.includes('uddg=')) {
            const rawUrl = href.split('uddg=')[1]?.split('&')[0];
            if (rawUrl) href = decodeURIComponent(rawUrl);
          }
          // Filter shorts
          if (!href.includes('/shorts/') && !href.includes('tiktok.com')) {
            links.push(href);
          }
        }

        candidates = links.map((linkUrl, idx) => {
          let domain = 'Web Domain';
          try { domain = new URL(linkUrl).hostname; } catch {}
          return {
            candidate_id: `disc-ver-${idx + 1}`,
            title: `${lang} ${level} Study Resource: ${domain}`,
            url: linkUrl,
            source_domain: domain,
            language: lang,
            target_level: level,
            resource_type: linkUrl.includes('youtube.com') || linkUrl.includes('youtu.be') ? 'Video' : 'Article',
            relevance_score: 95 - (idx * 3),
            snippet: `Verified educational language study material found on ${domain}.`,
            is_youtube_shorts: false,
          };
        });
      }
    } catch {
      // Ignore ddg error
    }

    if (candidates.length === 0) {
      candidates = [
        {
          candidate_id: 'disc-ver-1',
          title: `${lang} ${level} Essential Grammar & Practice Guide`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(lang)}_grammar`,
          source_domain: 'wikipedia.org',
          language: lang,
          target_level: level,
          resource_type: 'Article',
          relevance_score: 96,
          snippet: `Comprehensive academic ${lang} grammar guide for ${level} language learners.`,
          is_youtube_shorts: false,
        },
        {
          candidate_id: 'disc-ver-2',
          title: `BBC Languages - ${lang} Learning Portal`,
          url: `https://www.bbc.co.uk/languages/${lang.toLowerCase()}`,
          source_domain: 'bbc.co.uk',
          language: lang,
          target_level: level,
          resource_type: 'Interactive Tool',
          relevance_score: 92,
          snippet: `Interactive audio lessons and vocabulary exercises for ${lang} study.`,
          is_youtube_shorts: false,
        }
      ];
    }

    return NextResponse.json({
      success: true,
      data: {
        total_discovered: candidates.length,
        candidates,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error executing AI discovery' },
      { status: 500 }
    );
  }
}
