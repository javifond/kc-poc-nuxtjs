# Keycloak OIDC Authentication Flow Documentation

## Overview
This Nuxt.js application implements OIDC authentication with Keycloak using a reverse proxy pattern deployed on Netlify. The solution addresses CORS and routing issues by proxying Keycloak requests through Netlify Edge Functions.

## Architecture Components

### 1. Netlify Edge Functions (Reverse Proxies)

#### `/netlify/edge-functions/auth-proxy.ts`
- **Purpose**: Proxies all `/auth/*` requests to the Keycloak server
- **Target**: `https://casino-citizen.eks-dev01.gigndvr.com/auth/`
- **Function**: Handles Keycloak admin and authentication endpoints
- **Features**:
  - Strips problematic headers (host, connection, etc.)
  - Adds proxy headers (X-Real-IP, X-Forwarded-For)
  - Handles request body for POST/PUT/PATCH methods
  - Manual redirect handling to avoid stream issues

#### `/netlify/edge-functions/realms-proxy.ts`
- **Purpose**: Proxies all `/realms/*` requests to the Keycloak server
- **Target**: `https://casino-citizen.eks-dev01.gigndvr.com/realms/`
- **Function**: Handles OIDC discovery, token endpoints, and realm-specific requests
- **Features**: Identical proxy logic to auth-proxy

### 2. Dynamic Auth Route Handler

#### `/pages/auth/[...slug].vue`
- **Purpose**: Catch-all route for any Keycloak authentication URLs under `/auth/`
- **Function**: Renders `KeycloakMain` component to handle the auth flow
- **Route Pattern**: Matches `/auth/*` paths in Nuxt routing
- **Key Feature**: Ensures all auth-related routes are handled by the same component

### 3. OIDC Configuration

#### Authority URL Structure
```typescript
authority: `${AUTH_ENDPOINT}realms/${KEYCLOAK_REALM}`
// Resolves to: https://casino-citizen.eks-dev01.gigndvr.com/auth/realms/demo1
```

#### Redirect URI Calculation
- Uses current domain origin as redirect URI
- Works with both local development and production deployment
- Automatically handles callback processing

## Request Flow

### Authentication Initiation
1. User clicks login → `useAuth.login()` called
2. OIDC client creates signin request with Keycloak authority
3. Browser redirects to: `https://casino-citizen.eks-dev01.gigndvr.com/auth/realms/demo1/protocol/openid-connect/auth`
4. User authenticates on Keycloak
5. Keycloak redirects back to app with authorization code

### Callback Handling
1. Keycloak redirects to app URL with `?code=...&state=...`
2. Nuxt router matches `/auth/[...slug]` route
3. `KeycloakMain` component loads and processes callback
4. `useAuth` composable detects callback parameters
5. Calls `userManager.signinRedirectCallback()` to exchange code for tokens
6. URL parameters cleaned up via `onSigninCallback()`

### Proxy Resolution
- All `/auth/*` requests → `auth-proxy.ts` → Keycloak server
- All `/realms/*` requests → `realms-proxy.ts` → Keycloak server
- OIDC discovery and token requests work seamlessly through proxies

## Netlify Configuration

### Edge Functions Mapping
```toml
[[edge_functions]]
  function = "auth-proxy"
  path = "/auth/*"

[[edge_functions]]
  function = "realms-proxy"  
  path = "/realms/*"
```

### SPA Fallback
- Catch-all redirect `/*` → `/index.html` for SPA routing
- Edge functions take precedence over redirects for `/auth/*` and `/realms/*`

## Key Benefits

1. **CORS Resolution**: Proxying eliminates cross-origin issues
2. **Unified Domain**: All requests appear to come from the same domain
3. **Seamless Integration**: Keycloak works as if hosted on the same domain
4. **Flexible Routing**: Dynamic catch-all route handles all auth scenarios
5. **Production Ready**: Deployed on Netlify with proper edge function support

## Configuration Variables

- **AUTH_ENDPOINT**: `https://casino-citizen.eks-dev01.gigndvr.com/auth/`
- **KEYCLOAK_REALM**: `demo1`
- **KEYCLOAK_CLIENT_ID**: `web-demo1`
- **TENANT_ID**: `demo1`

This architecture successfully resolves the common issues with OIDC integration in SPAs by using reverse proxies to make Keycloak appear as part of the same domain.
