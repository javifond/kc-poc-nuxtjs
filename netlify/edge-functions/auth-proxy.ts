export default async (request: Request, context: any): Promise<Response> => {
  const url = new URL(request.url);
  const targetPath = url.pathname.replace('/auth/', '');
  const targetUrl = `https://casino-citizen.eks-dev01.gigndvr.com/auth/${targetPath}${url.search}`;

  // Clone request to avoid stream consumption issues
  const clonedRequest = request.clone();

  // Filter and prepare headers
  const headers = new Headers();

  // Copy essential headers, skip problematic ones
  for (const [key, value] of request.headers.entries()) {
    const lowerKey = key.toLowerCase();
    // Skip headers that might cause issues with proxying
    if (!['host', 'connection', 'upgrade', 'transfer-encoding'].includes(lowerKey)) {
      headers.set(key, value);
    }
  }

  // Set proxy headers
  headers.set('X-Real-IP', context.ip);
  headers.set('X-Forwarded-For', context.ip);
  headers.set('X-Forwarded-Host', url.hostname);

  try {
    // Handle request body properly
    let body: ReadableStream<Uint8Array> | null = null;
    if (clonedRequest.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      body = clonedRequest.body;
    }

    return await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: body,
      redirect: 'manual', // Handle redirects manually to avoid stream issues
    });
  } catch (error) {
    console.error('Auth proxy error:', error);
    return new Response('Proxy Error', {
      status: 502,
      statusText: 'Bad Gateway'
    });
  }
};