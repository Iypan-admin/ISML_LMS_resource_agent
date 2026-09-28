/**
 * Utility to get resilient API endpoints for Vercel, Mobile devices, and Local development.
 */
export function getAiEndpoints(path: string): string[] {
  const endpoints: string[] = [];

  // Normalize path format e.g. "/api/v1/ai/scrape-analyze"
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. Configured AI Service URL env var
  if (process.env.NEXT_PUBLIC_AI_SERVICE_URL) {
    const base = process.env.NEXT_PUBLIC_AI_SERVICE_URL.replace(/\/+$/, '');
    endpoints.push(`${base}${cleanPath}`);
  }

  // 2. Configured Backend API URL env var
  if (process.env.NEXT_PUBLIC_API_URL) {
    const base = process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
    const suffix = cleanPath.replace(/^\/api\/v1/, '');
    endpoints.push(`${base}${suffix}`);
  }

  // 3. Relative path (Same-origin Next.js serverless route - works 100% on Vercel & Mobile)
  endpoints.push(cleanPath);

  // 4. Local dev fallbacks (only attempt if running locally on localhost/127.0.0.1)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      endpoints.push(`http://localhost:8000${cleanPath}`);
      endpoints.push(`http://localhost:4000${cleanPath}`);
    }
  }

  // Return unique list of endpoints
  return Array.from(new Set(endpoints));
}

export async function fetchWithEndpointFallback(path: string, options: RequestInit): Promise<Response> {
  const endpoints = getAiEndpoints(path);
  let lastError: any = null;

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, options);
      if (resp.ok || resp.status === 400 || resp.status === 403 || resp.status === 404) {
        return resp;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to reach any endpoint for ${path}`);
}
