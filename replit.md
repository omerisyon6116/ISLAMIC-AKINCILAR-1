# AKINCILAR - Enterprise Community Platform

## Overview
Youth organization community platform (Turkish: "Akıncılar") evolving from a landing page into a full-featured, multi-tenant enterprise community platform. This project supports content publishing, events management, forum discussions, direct messaging, and comprehensive moderation capabilities.

## Current State (as of December 12, 2025)
- **Frontend**: Complete Turkish youth organization landing page with sections for Hero, About, Activities, Blog, Knowledge, and Events
- **Admin Panel**: Basic event and CTA management using localStorage
- **Backend**: Express server with PostgreSQL database ready, minimal schema (users table only)
- **Tech Stack**: React + TypeScript, Node.js + Express, PostgreSQL, Drizzle ORM, Passport auth packages installed

## Project Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Wouter (routing) + TanStack Query
- **Backend**: Node.js 20 + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Passport + express-session with HttpOnly cookies
- **Validation**: Zod schemas
- **Real-time**: WebSocket (ws package installed)
- **UI**: Shadcn components + Tailwind CSS
- **Deployment**: Configured for Replit autoscale deployment

### Design System
- Primary color: Bright cyan/turquoise (#00FFFF range)
- Secondary color: Magenta/pink accents
- Dark theme with cyberpunk-inspired aesthetics
- Geometric patterns and glitch effects
- Turkish language UI (can be expanded to multi-language)

## Implementation Roadmap (Master Plan)

Based on the comprehensive master prompt, implementation will follow this order:

### Phase 1: Foundation & Multi-Tenant Core
1. Database migrations + seed data
2. Multi-tenant architecture (tenants, tenant_settings, tenant_members)
3. User system expansion (roles, trust levels, reputation)
4. Authentication & sessions (register, login, logout, email verification, password reset)
5. CSRF protection + rate limiting

### Phase 2: CMS & Events
6. Posts system (blog articles with SEO, drafts, scheduling)
7. Events system (with registration, capacity management)
8. Admin content management interface

### Phase 3: Forum & Engagement
9. Forum categories + threads + replies
10. Forum reactions (likes/votes)
11. Thread subscriptions + notifications
12. Mention detection (@username)

### Phase 4: Communication
13. Direct messaging (DM) system
14. Groups/Rooms functionality
15. WebSocket real-time updates

### Phase 5: Search & Discovery
16. PostgreSQL full-text search
17. Tenant-scoped search across posts, forum, events

### Phase 6: Moderation & Safety
18. Reporting system
19. Moderation queue & tools
20. Trust-level based permissions
21. Audit logging

### Phase 7: Advanced Features
22. PWA + Service Worker
23. Push notifications (VAPID)
24. Admin analytics & data export

## Recent Changes
- **2025-12-12**: Migrated from Replit Agent to standard Replit environment
- **2025-12-12**: Configured Node.js 20 runtime and deployment settings
- **2025-12-12**: Received master prompt for enterprise platform transformation

## User Preferences
- Preserve existing UI/theme/visual style
- No mock data or localStorage - everything must be database-backed
- Security is mandatory, not optional
- Clean architecture: routes → services → database
- Code must be production-ready, maintainable, and scalable

## Development Notes
- Workflow: `npm run dev` runs Express server on port 5000 (frontend + backend)
- Database: PostgreSQL via Replit, use `npm run db:push` for schema changes
- No Docker/virtualization (Nix environment)
- HttpOnly cookie-based sessions preferred over JWT
- Multi-tenant via URL path: `/:tenantSlug/...`

## Security Requirements
- CSRF tokens
- Rate limiting (auth + posting)
- Role-based access control (RBAC)
- Permission-based access
- Password hashing (bcrypt)
- SQL injection prevention (via Drizzle ORM)
- XSS prevention (input sanitization)
- Audit logging for admin/mod actions

## Key Files
- `shared/schema.ts` - Drizzle database schema (single source of truth for data models)
- `server/routes.ts` - API routes (thin layer, delegates to storage)
- `server/storage.ts` - Storage interface + implementation
- `client/src/App.tsx` - Frontend routing
- `client/src/pages/` - Page components
- `client/src/lib/site-content.tsx` - Content management (to be replaced with API calls)

## Important Constraints
- ❌ DO NOT change existing UI/theme/layout/visual style
- ❌ NO localStorage or mock data
- ✅ Everything must be database-backed
- ✅ All features must be fully functional
- ✅ Follow implementation order from master prompt