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

  // 2. Production fallback to Python AI microservice on Railway if env var not yet baked
  endpoints.push(`https://ismllmsresourceagent-production.up.railway.app${cleanPath}`);

  // 3. Relative path (Same-origin Next.js serverless route - works on Next rewrite)
  endpoints.push(cleanPath);

  // 4. Local dev & LAN fallbacks (automatically adapt to current device / mobile IP or domain)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      endpoints.push(`http://localhost:8000${cleanPath}`);
    } else if (!hostname.includes('railway.app') && !hostname.includes('vercel.app')) {
      // Running on mobile / external laptop accessing via LAN IP or custom port:
      endpoints.push(`${protocol}//${hostname}:8000${cleanPath}`);
    }
  }

  // Return unique list of endpoints
  return Array.from(new Set(endpoints));
}

export function getBackendEndpoints(path: string): string[] {
  const endpoints: string[] = [];
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. Configured Backend API URL (e.g. https://api.isml.edu/api/v1 or https://isml-resource-backend-production.up.railway.app/api/v1)
  if (process.env.NEXT_PUBLIC_API_URL) {
    const base = process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
    // If cleanPath starts with /api/v1, strip prefix if base already contains /api/v1
    if (base.endsWith('/api/v1') && cleanPath.startsWith('/api/v1')) {
      endpoints.push(`${base}${cleanPath.replace(/^\/api\/v1/, '')}`);
    } else if (cleanPath.startsWith('/api/') && !cleanPath.startsWith('/api/v1')) {
      // E.g. /api/sessions -> base + /sessions
      endpoints.push(`${base}${cleanPath.replace(/^\/api/, '')}`);
    } else {
      endpoints.push(`${base}${cleanPath}`);
    }
  }

  // 2. Production fallback to NestJS Backend on Railway
  const railwayBackend = 'https://isml-resource-backend-production.up.railway.app/api/v1';
  if (cleanPath.startsWith('/api/sessions')) {
    endpoints.push(`${railwayBackend}/sessions${cleanPath.replace(/^\/api\/sessions/, '')}`);
  } else if (cleanPath.startsWith('/api/v1')) {
    endpoints.push(`${railwayBackend}${cleanPath.replace(/^\/api\/v1/, '')}`);
  }

  // 3. Relative Next.js rewrite/proxy or serverless route
  endpoints.push(cleanPath);

  // 4. Localhost / LAN fallback (ports 3001, 4000)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      endpoints.push(`http://localhost:3001${cleanPath}`);
      endpoints.push(`http://localhost:4000/api/v1${cleanPath.replace(/^\/api\/v1/, '').replace(/^\/api/, '')}`);
      endpoints.push(`http://localhost:4000${cleanPath}`);
    } else if (!hostname.includes('railway.app') && !hostname.includes('vercel.app')) {
      // Running on mobile / external laptop accessing via LAN IP or domain:
      endpoints.push(`${protocol}//${hostname}:3001${cleanPath}`);
      endpoints.push(`${protocol}//${hostname}:4000/api/v1${cleanPath.replace(/^\/api\/v1/, '').replace(/^\/api/, '')}`);
      endpoints.push(`${protocol}//${hostname}:4000${cleanPath}`);
    }
  }

  return Array.from(new Set(endpoints));
}

export async function fetchWithEndpointFallback(path: string, options: RequestInit): Promise<Response> {
  const endpoints = getAiEndpoints(path);
  let lastError: any = null;

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, options);
      // Return immediately on success OR on any client business error (400, 422, 403) so the caller can process the error details!
      if (resp.ok || resp.status === 400 || resp.status === 422 || resp.status === 403) {
        return resp;
      }
      // If 404, only keep looking if there are more endpoints
      if (resp.status === 404) {
        lastError = new Error(`Endpoint ${url} returned 404 Not Found`);
        continue;
      }
      return resp;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to reach any endpoint for ${path}`);
}

export async function fetchBackendWithFallback(path: string, options: RequestInit): Promise<Response> {
  const endpoints = getBackendEndpoints(path);
  let lastError: any = null;

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, options);
      if (resp.ok || resp.status === 400 || resp.status === 422 || resp.status === 403) {
        return resp;
      }
      if (resp.status === 404 || resp.status === 500 || resp.status === 502) {
        lastError = new Error(`Backend ${url} returned status ${resp.status}`);
        continue;
      }
      return resp;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to reach backend endpoint for ${path}`);
}
