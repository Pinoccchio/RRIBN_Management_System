# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **301st RRIBn Personnel Management System** - a centralized personnel management platform for the 301st Ready Reserve Infantry Battalion (301st Community Defense Center) of the Philippine Army Reserve Command.

**Tech Stack:**
- Next.js 15.5.4 with App Router
- React 19.1.0
- TypeScript 5
- Tailwind CSS 4 (with PostCSS plugin)
- Turbopack (for dev and build)

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Development server runs at http://localhost:3000

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with metadata and fonts
│   ├── page.tsx           # Home page (landing page)
│   └── globals.css        # Global styles
└── components/
    ├── ui/                # Reusable UI components
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   └── Container.tsx
    ├── Navbar.tsx         # Navigation header
    ├── Hero.tsx           # Hero section
    ├── SecureBanner.tsx   # Security banner
    ├── Features.tsx       # Features showcase
    ├── Stats.tsx          # Statistics display
    ├── Mission.tsx        # Mission statement
    └── Footer.tsx         # Footer component
```

## Architecture Notes

**Landing Page Component Structure:**
The home page (`src/app/page.tsx`) is composed of modular sections that render in sequence:
1. Navbar
2. Hero
3. SecureBanner
4. Features
5. Stats
6. Mission
7. Footer

**Path Aliases:**
- `@/*` maps to `src/*` (configured in tsconfig.json)
- Import components using `@/components/ComponentName`

**Fonts:**
Uses Geist Sans and Geist Mono from next/font/google, configured in layout.tsx with CSS variables `--font-geist-sans` and `--font-geist-mono`.

**Styling:**
Tailwind CSS 4 with PostCSS. All components use Tailwind utility classes. The project uses the `antialiased` class globally for better font rendering.
