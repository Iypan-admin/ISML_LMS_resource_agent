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

  // 4. Local dev & LAN fallbacks (automatically adapt to current device / mobile IP or domain)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      endpoints.push(`http://localhost:8000${cleanPath}`);
      endpoints.push(`http://localhost:4000${cleanPath}`);
    } else {
      // Running on mobile / external laptop accessing via LAN IP or custom port:
      endpoints.push(`${protocol}//${hostname}:8000${cleanPath}`);
      endpoints.push(`${protocol}//${hostname}:4000${cleanPath}`);
    }
  }

  // Return unique list of endpoints
  return Array.from(new Set(endpoints));
}

export function getBackendEndpoints(path: string): string[] {
  const endpoints: string[] = [];
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. Configured Backend API URL (e.g. https://api.isml.edu/api/v1 or http://localhost:4000/api/v1)
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

  // 2. Relative Next.js rewrite/proxy or serverless route
  endpoints.push(cleanPath);
  if (cleanPath.startsWith('/api/sessions')) {
    endpoints.push(`/api/v1${cleanPath.replace(/^\/api/, '')}`);
  }

  // 3. Localhost / LAN fallback (ports 3001, 4000)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      endpoints.push(`http://localhost:3001${cleanPath}`);
      endpoints.push(`http://localhost:4000/api/v1${cleanPath.replace(/^\/api\/v1/, '').replace(/^\/api/, '')}`);
      endpoints.push(`http://localhost:4000${cleanPath}`);
    } else {
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
      if (resp.ok || resp.status === 400 || resp.status === 403 || resp.status === 404) {
        return resp;
      }
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
      if (resp.ok || resp.status === 400 || resp.status === 403 || resp.status === 404) {
        return resp;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to reach backend endpoint for ${path}`);
}
