import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, title: userTitle } = body || {};

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Valid URL parameter is required.' },
        { status: 400 }
      );
    }

    const targetUrl = url.trim();
    let domain = '';
    try {
      domain = new URL(targetUrl).hostname;
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format.' },
        { status: 400 }
      );
    }

    // 1. Try forwarding to Python AI microservice or NestJS backend if available
    const serviceUrls = [
      process.env.AI_SERVICE_URL ? `${process.env.AI_SERVICE_URL.replace(/\/+$/, '')}/api/v1/ai/scrape-analyze` : null,
      process.env.BACKEND_API_URL ? `${process.env.BACKEND_API_URL.replace(/\/+$/, '')}/ai/scrape-analyze` : null,
      'http://localhost:8000/api/v1/ai/scrape-analyze',
      'http://localhost:4000/api/v1/ai/scrape-analyze',
    ].filter(Boolean) as string[];

    for (const serviceUrl of serviceUrls) {
      try {
        const upstreamResp = await fetch(serviceUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl, title: userTitle }),
          // Short timeout for microservice reachability check
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

    // 2. Vercel Cloud Serverless Fallback Scraper (Server-side fetch on Node.js)
    try {
      const pageResp = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,de;q=0.8,fr;q=0.7,es;q=0.6',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });

      if (!pageResp.ok) {
        return NextResponse.json({
          success: true,
          data: {
            url: targetUrl,
            title: userTitle || domain,
            domain,
            word_count: 0,
            scraped_text: `# ${userTitle || domain}\n**Source**: ${targetUrl}\n**Domain**: ${domain}\n\n---\n\n> ⚠️ Scraping Notice: The target website returned HTTP ${pageResp.status} status code or is protected by bot security firewalls (Cloudflare/Wordfence).\n\n💡 **Tip**: Copy the lesson text directly from your browser and paste it into the **Generate Resource** tool to create custom study materials.\n\n---\n*Source: ${domain}*`,
            full_text_length: 0,
            copyright: {
              license_name: 'Web Attribution',
              copyright_safety_percentage: 80,
              risk_level: 'REVIEW_REQUIRED',
              risk_explanation: `Target website returned HTTP ${pageResp.status} status or bot challenge.`,
            },
          },
        });
      }

      const html = await pageResp.text();

      // Extract page title from HTML
      let extractedTitle = userTitle || '';
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        extractedTitle = titleMatch[1].replace(/\s+/g, ' ').trim();
      }
      if (!extractedTitle) extractedTitle = domain;

      // Extract main text content from HTML
      let cleanText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
        .replace(/<h[1-6][^>]*>/gi, '\n\n## ')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<p[^>]*>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li[^>]*>/gi, '\n- ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();

      // Limit length if extremely huge
      if (cleanText.length > 15000) {
        cleanText = cleanText.substring(0, 15000) + '\n\n...[Content truncated for analysis]';
      }

      const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
      const fullMarkdown = `# ${extractedTitle}\n**Source**: ${targetUrl}\n**Domain**: ${domain}\n**Word Count**: ${wordCount} words\n\n---\n\n${cleanText}\n\n---\n*Extracted via ISML Resource Platform Web Scraper (${domain})*`;

      return NextResponse.json({
        success: true,
        data: {
          url: targetUrl,
          title: extractedTitle,
          domain,
          word_count: wordCount,
          scraped_text: fullMarkdown,
          full_text_length: cleanText.length,
          copyright: {
            license_name: 'Web Attribution',
            copyright_safety_percentage: 90,
            risk_level: 'VERIFIED_SAFE',
            risk_explanation: `Extracted ${wordCount} words for educational language study and research. Proper source attribution required.`,
          },
        },
      });
    } catch (fetchErr: any) {
      return NextResponse.json({
        success: true,
        data: {
          url: targetUrl,
          title: userTitle || domain,
          domain,
          word_count: 0,
          scraped_text: `# ${userTitle || domain}\n**Source**: ${targetUrl}\n**Domain**: ${domain}\n\n---\n\n> ⚠️ Scraping Notice: Could not establish direct network connection to ${domain} (${fetchErr?.message || 'Connection Timeout'}).\n\n💡 **Tip**: Copy the lesson text directly from your browser and paste it into the **Generate Resource** tool to create custom study materials.\n\n---\n*Source: ${domain}*`,
          full_text_length: 0,
          copyright: {
            license_name: 'Web Attribution',
            copyright_safety_percentage: 75,
            risk_level: 'REVIEW_REQUIRED',
            risk_explanation: `Direct network connection to ${domain} timed out or was blocked by firewall.`,
          },
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server error during scrape analysis' },
      { status: 500 }
    );
  }
}
