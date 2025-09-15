# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build the application for production
- `npm run generate` - Generate static SPA version of the application
- `npm run preview` - Preview the production build
- `npm install` - Install dependencies

### Testing
- `npx playwright test` - Run Playwright tests

## Architecture

This is a NuxtJS 3 Single Page Application (SPA) demonstrating Keycloak authentication integration with custom themed login pages.

### SPA Configuration

**Pure Client-Side Rendering:**
- `ssr: false` - Disables server-side rendering completely
- `nitro.preset: 'static'` - Generates static files for SPA deployment
- `experimental.payloadExtraction: false` - Prevents server payload generation
- `ClientOnly` wrapper in app.vue ensures no server-side execution
- Loading fallback provided during client hydration

### Key Components

**Authentication System:**
- `composables/useAuth.ts` - Core authentication composable using oidc-client-ts
- Handles OIDC flow with Keycloak realm configuration
- Manages user state, login/logout, and token handling
- Configured for local development with hardcoded Keycloak endpoints
- All authentication logic runs client-side only

**Pages & Components:**
- `pages/index.vue` - Main application page with conditional rendering based on auth state
- `components/LoginPage.vue` - Custom Keycloak login form component with styled UI
- `components/KeycloakMain.vue` - Keycloak context handler with mock data for development
- `app.vue` - Root component with ClientOnly wrapper and loading state

### Configuration

**Keycloak Settings (in useAuth.ts):**
- Authority: `https://casino-citizen.eks-dev01.gigndvr.com/auth/realms/demo1`
- Client ID: `web-demo1`
- Tenant ID: `demo1`
- Local redirect: `http://localhost:3000`

**SPA-Specific Nuxt Config:**
- Pure client-side rendering enabled
- Static preset for deployment
- Viewport meta tag configured
- SCSS support enabled
- Devtools enabled for development

### Development Notes

- Application runs as pure SPA with no server-side rendering
- All component logic executed client-side only
- Mock Keycloak context provided for local development in KeycloakMain.vue
- Custom SCSS styling with gradient themes
- Loading spinner shown during initial client hydration
- No middleware or plugins currently configured
- Uses oidc-client-ts for OpenID Connect integration

### Deployment

The application generates static files that can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.) since it's a pure SPA.