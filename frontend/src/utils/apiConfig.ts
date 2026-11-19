/**
 * Utility to get resilient API endpoints for Vercel, Mobile devices, and Local development.
 */
export function getAiEndpoints(path: string): string[] {
  const endpoints: string[] = [];

  // Normalize path format e.g. "/api/v1/ai/scrape-analyze"
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. Local dev & LAN fallbacks (Direct Python AI microservice on Port 8000)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      endpoints.push(`http://localhost:8000${cleanPath}`);
      endpoints.push(`http://127.0.0.1:8000${cleanPath}`);
    } else if (!hostname.includes('railway.app') && !hostname.includes('vercel.app')) {
      endpoints.push(`${protocol}//${hostname}:8000${cleanPath}`);
    }
  }

  // 2. Relative path (Same-origin Next.js serverless route / proxy)
  endpoints.push(cleanPath);

  // 3. Configured AI Service URL env var
  if (process.env.NEXT_PUBLIC_AI_SERVICE_URL) {
    const base = process.env.NEXT_PUBLIC_AI_SERVICE_URL.replace(/\/+$/, '');
    endpoints.push(`${base}${cleanPath}`);
  }

  // 4. Production fallback to Python AI microservice on Railway
  endpoints.push(`https://ismllmsresourceagent-production.up.railway.app${cleanPath}`);

  // Return unique list of endpoints
  return Array.from(new Set(endpoints));
}

export function getBackendEndpoints(path: string): string[] {
  const endpoints: string[] = [];
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const isBrowser = typeof window !== 'undefined';
  const isHttps = isBrowser && window.location.protocol === 'https:';

  // 1. Production NestJS Backend on Railway (direct HTTPS cloud persistence & global cross-device sync)
  const railwayBackend = 'https://isml-resource-backend-production.up.railway.app/api/v1';
  if (cleanPath.startsWith('/api/sessions')) {
    endpoints.push(`${railwayBackend}/sessions${cleanPath.replace(/^\/api\/sessions/, '')}`);
  } else if (cleanPath.startsWith('/api/v1')) {
    endpoints.push(`${railwayBackend}${cleanPath.replace(/^\/api\/v1/, '')}`);
  } else if (cleanPath.startsWith('/api/')) {
    endpoints.push(`${railwayBackend}${cleanPath.replace(/^\/api/, '')}`);
  } else {
    endpoints.push(`${railwayBackend}${cleanPath}`);
  }

  // 2. Same-origin Next.js serverless route / proxy (only if explicitly an API route)
  if (cleanPath.startsWith('/api')) {
    endpoints.push(cleanPath);
  }

  // 3. Configured Backend API URL env var (if valid and not mixed-content localhost on HTTPS)
  if (process.env.NEXT_PUBLIC_API_URL) {
    const base = process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
    const isLocal = base.includes('localhost') || base.includes('127.0.0.1');
    if (!isHttps || !isLocal) {
      if (base.endsWith('/api/v1') && cleanPath.startsWith('/api/v1')) {
        endpoints.push(`${base}${cleanPath.replace(/^\/api\/v1/, '')}`);
      } else if (cleanPath.startsWith('/api/') && !cleanPath.startsWith('/api/v1')) {
        endpoints.push(`${base}${cleanPath.replace(/^\/api/, '')}`);
      } else {
        endpoints.push(`${base}${cleanPath}`);
      }
    }
  }

  // 4. Localhost / LAN fallback (for local development only)
  if (isBrowser) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      endpoints.push(`http://localhost:4000/api/v1${cleanPath.replace(/^\/api\/v1/, '').replace(/^\/api/, '')}`);
      endpoints.push(`http://localhost:3001${cleanPath}`);
      endpoints.push(`http://localhost:4000${cleanPath}`);
    } else if (!isHttps && !hostname.includes('railway.app') && !hostname.includes('vercel.app')) {
      endpoints.push(`${protocol}//${hostname}:4000/api/v1${cleanPath.replace(/^\/api\/v1/, '').replace(/^\/api/, '')}`);
      endpoints.push(`${protocol}//${hostname}:3001${cleanPath}`);
    }
  }

  return Array.from(new Set(endpoints));
}

export async function fetchWithEndpointFallback(path: string, options: RequestInit = {}): Promise<Response> {
  const endpoints = getAiEndpoints(path);
  let lastError: any = null;

  const isUpload = (typeof FormData !== 'undefined' && options.body instanceof FormData) || path.includes('upload');
  const timeoutMs = isUpload ? 60000 : 12000;

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(timeoutMs) });
      // Return immediately on success OR on any client business error (400, 422, 403) so the caller can process the error details!
      if (resp.ok || resp.status === 400 || resp.status === 409 || resp.status === 422 || resp.status === 403) {
        return resp;
      }
      // If 404 Not Found, 405 Method Not Allowed, or Gateway error (502/503/504), keep trying next endpoints!
      if (resp.status === 404 || resp.status === 405 || resp.status === 502 || resp.status === 503 || resp.status === 504) {
        lastError = new Error(`Endpoint ${url} returned ${resp.status}`);
        continue;
      }
      return resp;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to reach any endpoint for ${path}`);
}

export async function fetchBackendWithFallback(path: string, options: RequestInit = {}): Promise<Response> {
  const endpoints = getBackendEndpoints(path);
  let lastError: any = null;

  const isUpload = (typeof FormData !== 'undefined' && options.body instanceof FormData) || path.includes('upload');
  const timeoutMs = isUpload ? 60000 : 12000;

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(timeoutMs) });
      const contentType = resp.headers.get('content-type') || '';
      // If endpoint returned HTML instead of JSON API response (e.g. Next.js page), treat as invalid backend
      if (resp.ok && !contentType.includes('application/json')) {
        lastError = new Error(`Backend ${url} returned non-JSON response (${contentType})`);
        continue;
      }
      if (resp.ok || resp.status === 400 || resp.status === 409 || resp.status === 422 || resp.status === 403) {
        return resp;
      }
      if (resp.status === 404 || resp.status === 413 || resp.status === 500 || resp.status === 502 || resp.status === 503 || resp.status === 504) {
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
