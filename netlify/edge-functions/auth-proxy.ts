export default async (request: Request, context: any): Promise<Response> => {
  const url = new URL(request.url);
  const targetPath = url.pathname.replace('/auth/', '');
  const targetUrl = `https://casino-citizen.eks-dev01.gigndvr.com/auth/${targetPath}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('X-Real-IP', context.ip);
  headers.set('X-Forwarded-For', context.ip);

  return fetch(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
  });
};