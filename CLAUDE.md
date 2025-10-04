# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **RRIBN Management System** - a Next.js 15 application for managing Army Reserve Reservist Integrated Behavioral Network (RRIBN) personnel, training, and administrative operations. The system uses Supabase for authentication, database, and backend services.

## Key Technologies

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Build Tool**: Turbopack

## Development Commands

```bash
# Start development server (uses Turbopack)
npm run dev

# Build for production (uses Turbopack)
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Route Structure

The application uses Next.js App Router with route groups for organization:

- **Public routes**: Landing page (`/`)
- **Auth routes**: `(auth)/signin` - Authentication pages
- **Dashboard routes**: `(dashboard)/{role}/*` - Role-based dashboards
  - `/super-admin/*` - Super Admin dashboard and features
  - `/admin/*` - Admin dashboard (future)
  - `/staff/*` - Staff dashboard (future)
  - `/reservist/*` - Reservist dashboard (future)

### Role-Based Access Control (RBAC)

The system implements comprehensive RBAC with 4 user roles:

1. **Super Admin** (`super_admin`) - Full system access, manages administrators
2. **Admin** (`admin`) - Company-level management
3. **Staff** (`staff`) - Company operations, reservist management
4. **Reservist** (`reservist`) - Individual reservist access

**Key RBAC files:**
- `src/middleware.ts` - Route protection and role-based redirects (runs on every request)
- `src/lib/constants/navigation.ts` - Role-specific navigation definitions
- `src/app/(dashboard)/layout.tsx` - Dashboard layout with role-based navigation

### Authentication Flow

1. User signs in via `/signin`
2. Middleware checks auth status on every request
3. Authenticated users are redirected to their role-specific dashboard
4. Unauthenticated users accessing protected routes are redirected to `/signin`
5. Users accessing wrong dashboard routes are redirected to their correct dashboard

### Database Schema

Supabase database with key tables (see `src/lib/supabase/database.types.ts`):

- **accounts** - User accounts with role and status
- **profiles** - User profile information (first_name, last_name, phone, photo)
- **administrators** - Administrator-specific data with company assignments
- **staff** - Staff members with company assignments
- **companies** - Military companies (A, B, C, D, HHC)

**Relationships:**
- `accounts.id` (1:1) → `profiles.id`
- `accounts` → `administrators/staff` (role-dependent)

### Supabase Integration

**Three Supabase client patterns:**

1. **Client-side** (`src/lib/supabase/client.ts`): Browser-based operations
2. **Server-side** (`src/lib/supabase/server.ts`): Server Components and API routes
3. **Admin client** (`src/lib/supabase/admin.ts`): Service role for privileged operations

Always use the appropriate client based on context.

### API Routes

API routes follow REST conventions under `/api/admin/`:

- **GET** - Fetch resources (supports filtering via query params)
- **POST** - Create resources
- **PUT** - Update resources (use `[id]/route.ts` dynamic routes)
- **DELETE** - Delete resources (use `[id]/route.ts` dynamic routes)

Example: `src/app/api/admin/administrators/route.ts` and `src/app/api/admin/administrators/[id]/route.ts`

### Component Organization

```
src/components/
├── auth/              # Authentication components (SignInForm)
├── dashboard/         # Dashboard-specific components
│   ├── layout/        # DashboardSidebar, DashboardHeader
│   ├── stats/         # StatCard and statistics components
│   ├── administrators/# Administrator CRUD modals & tables
│   ├── staff/         # Staff CRUD modals & tables
│   └── shared/        # Shared dashboard components (PageHeader)
├── ui/                # Reusable UI components (Button, Input, Modal, etc.)
├── Features.tsx       # Landing page sections
├── Hero.tsx
└── Navbar.tsx
```

### Design System

Centralized design tokens in `src/lib/design-system/`:
- `tokens.ts` - Colors, typography, spacing, shadows
- `utils.ts` - Utility functions for applying design tokens

Use these tokens instead of arbitrary Tailwind values for consistency.

### State Management

- **Auth Context** (`src/contexts/AuthContext.tsx`) - Global authentication state
- React hooks for component state
- Server state managed via API routes and Supabase queries

### Logging

Custom logger utility (`src/lib/logger.ts`) provides formatted console output:
- `logger.info()` - Info messages
- `logger.success()` - Success messages
- `logger.warn()` - Warnings
- `logger.error()` - Errors

Use this instead of raw `console.log()`.

## Important Patterns

### Path Aliases

TypeScript path alias `@/*` maps to `src/*` (configured in `tsconfig.json`). Always use path aliases for imports:

```typescript
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
```

### Modal Pattern

CRUD operations use a consistent modal pattern:
1. Create/Edit/View/Delete modals as separate components
2. Modal visibility controlled by parent component state
3. Callbacks (`onCreate`, `onEdit`, `onDelete`) for data refetching
4. Form validation using `src/lib/utils/validation.ts`

### Table Pattern

Data tables follow a consistent structure:
1. Search/filter UI at the top
2. Responsive table with action buttons
3. Loading and empty states
4. Pagination (when needed)

See `src/components/dashboard/administrators/AdministratorTable.tsx` for reference.

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)

## Testing Considerations

- Test different user roles to ensure RBAC works correctly
- Verify middleware redirects for auth and role mismatches
- Test CRUD operations with proper error handling
- Ensure UI components handle loading and error states

## Common Tasks

### Adding a New Dashboard Page

1. Create page in `src/app/(dashboard)/{role}/[page-name]/page.tsx`
2. Add navigation item to appropriate role in `src/lib/constants/navigation.ts`
3. Create necessary components in `src/components/dashboard/[feature]/`
4. Add API routes if needed in `src/app/api/admin/[resource]/`

### Creating a New CRUD Feature

1. Define TypeScript types in `src/lib/types/[resource].ts`
2. Create API routes for CRUD operations
3. Build modals (Create, Edit, View, Delete) in `src/components/dashboard/[resource]/`
4. Create table component for displaying data
5. Build main page that orchestrates all components
- we are using supabse mcp server, when the user asking or what something always analyze the overall codebase, everything and use the supabse mcp server https://wvnxdgoenmqyfvymxwef.supabase.co to analyze the overall tables, columns, rows, policies, functions, feel free to modify if needed