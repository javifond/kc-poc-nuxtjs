# NuxtJS Keycloak Custom Theme POC

Single Page Application demonstrating Keycloak authentication with custom themed login pages deployed on Netlify using edge functions for CORS-free authentication.

## Core Architecture

### Client-Side SPA (`ssr: false`)
Pure client-side rendering with no server-side execution. All authentication logic runs in the browser using `oidc-client-ts`.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,
  nitro: { preset: 'netlify-static' },
  experimental: { payloadExtraction: false }
})
```

### Authentication Flow ([composables/useAuth.ts](composables/useAuth.ts))

OIDC authentication using `oidc-client-ts` with automatic callback handling:

```ts
const oidcConfig = {
  authority: `${AUTH_ENDPOINT}realms/${KEYCLOAK_REALM}`,
  client_id: KEYCLOAK_CLIENT_ID,
  redirect_uri: getRedirectUri(),
  scope: `openid ${TENANT_ID}`,
  onSigninCallback, // Auto-cleanup URL params
  response_type: "code"
}
```

**Key Features:**
- Dynamic redirect URI calculation
- Automatic URL cleanup after OAuth callback
- Token expiration handling
- User session persistence via localStorage

### Reverse Proxy via Edge Functions

Netlify Edge Functions act as reverse proxies to bypass CORS restrictions when communicating with Keycloak server.

#### Configuration ([netlify.toml](netlify.toml))
```toml
[[edge_functions]]
  function = "auth-proxy"
  path = "/auth/*"

[[edge_functions]]
  function = "realms-proxy"
  path = "/realms/*"
```

#### Proxy Implementation ([netlify/edge-functions/auth-proxy.ts](netlify/edge-functions/auth-proxy.ts))

Edge functions intercept requests to `/auth/*` and `/realms/*`, proxy them to the Keycloak server, and return responses:

```ts
export default async (request: Request, context: any): Promise<Response> => {
  const url = new URL(request.url);
  const targetUrl = `https://casino-citizen.eks-dev01.gigndvr.com/auth/${targetPath}`;

  // Forward with proper headers
  headers.set('X-Real-IP', context.ip);
  headers.set('X-Forwarded-For', context.ip);

  return await fetch(targetUrl, {
    method: request.method,
    headers: headers,
    body: body,
    redirect: 'manual'
  });
}
```

**Why Edge Functions?**
- Executes at CDN edge (low latency)
- Bypasses CORS policies
- Preserves request headers and IP context
- No backend server required

### Custom Authentication Routes

#### Catch-all Route ([pages/auth/[...slug].vue](pages/auth/[...slug].vue))
Handles all Keycloak authentication URLs (`/auth/*`) by rendering custom themed pages:

```vue
<template>
  <KeycloakMain />
</template>
```

This route intercepts Keycloak's standard login pages and replaces them with custom Vue components.

#### Theme Handler ([components/KeycloakMain.vue](components/KeycloakMain.vue))
Routes Keycloak contexts to appropriate custom pages:

```ts
const kcContext = ref<any>(null)

onMounted(() => {
  // Real: window.kcContext from Keycloak
  // Dev: Mock data for local testing
  kcContext.value = (window as any).kcContext || mockContext
})
```

Renders `LoginPage.vue` when `pageId === 'login.ftl'`.

## Setup

```bash
npm install
npm run dev
```

## Deployment

Static build deployed to Netlify with edge function proxies:

```bash
npm run generate  # Generates static SPA
```

Build output (`dist/`) contains:
- Static HTML/CSS/JS
- Edge functions for Keycloak proxying
- SPA fallback redirects

## Key Dependencies

- **oidc-client-ts**: OpenID Connect client library
- **keycloak-js**: Keycloak JavaScript adapter
- **Nuxt 3**: SPA framework with static generation

## Development Configuration

**Local Keycloak Settings:**
- Authority: `https://casino-citizen.eks-dev01.gigndvr.com/auth/realms/demo1`
- Client ID: `web-demo1`
- Tenant: `demo1`
- Redirect: `http://localhost:3000`
