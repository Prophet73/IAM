# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev        # Start Vite dev server with HMR (port 3001)
npm run build      # TypeScript check (tsc -b) + Vite production build → ./dist/
npm run lint       # ESLint on all .ts/.tsx files
npm run preview    # Preview production build locally
```

Dev server runs on **http://localhost:3001**.

No test framework is configured.

## Architecture

React 19 + TypeScript 5.9 + Tailwind CSS v4 + Vite 7 single-page portfolio application. All content is in Russian.

**App structure:** `App.tsx` is a monolithic file containing all page sections (Nav, Hero, Competence, Products, Architecture, BusinessValue, Methodology, Research, Career, Contact) as inline function components. Navigation uses hash-based anchor links with smooth scrolling — no router library.

**Product demos:** Four interactive modal components in `src/components/` — `DataBookDemo`, `DemoAIHub`, `DemoCostManager`, `DemoAutoprotocol`. Each is a self-contained modal with internal state, sidebar navigation, and multiple screens. Opened via `ProductCard` component.

**Data layer:** Static data only, no API calls. Product definitions live in `src/data/products.ts`, demo data in `src/data/prescriptions.ts`.

**State management:** Local `useState` only — no global store.

**Styling:** Tailwind v4 with custom dark theme defined in `@theme` block in `src/index.css`. Color palette uses custom tokens (bg, surface, accent, text-primary, text-muted). Font: Inter via Google Fonts.

## Key Files

- `src/App.tsx` — All page sections (~526 lines)
- `src/components/ProductCard.tsx` — Expandable product card with animated grid expand/collapse
- `src/components/DataBookDemo.tsx`, `DemoAIHub.tsx`, `DemoCostManager.tsx`, `DemoAutoprotocol.tsx` — Product demo modals
- `src/data/products.ts` — Product type definition and product array
- `src/index.css` — Tailwind theme config and custom animations
