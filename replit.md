# Overview

This is a **Fake Product Identifier** — an AI-powered web application that lets users upload product images, analyzes them using OpenAI's vision capabilities, and returns information about whether a product is likely fake or authentic. The app displays a risk level (Low/Medium/High), product details (name, brand, MRP, market price), and identification tips.

The stack is a full-stack TypeScript monorepo: React frontend with Vite, Express backend, PostgreSQL database with Drizzle ORM, and OpenAI API integration for image analysis.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Monorepo Structure

The project uses a three-folder monorepo pattern:
- **`client/`** — React SPA (Single Page Application)
- **`server/`** — Express API server
- **`shared/`** — Shared types, schemas, and route definitions used by both client and server

This structure allows type-safe sharing of database schemas, API contracts, and validation logic between frontend and backend.

## Frontend (`client/`)

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite (with HMR in development via `server/vite.ts`)
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming, custom design tokens in `index.css`
- **Animations**: Framer Motion for page transitions and reveal effects
- **File Upload**: react-dropzone for drag-and-drop image uploads
- **Key Pages**:
  - `Home` — Image upload zone + search history grid
  - `ProductDetails` — Full analysis results for a specific product
  - `not-found` — 404 fallback

## Backend (`server/`)

- **Framework**: Express.js with TypeScript (run via `tsx` in development)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Body Limit**: 50MB (to accommodate base64-encoded images)
- **Build**: esbuild for production bundling to `dist/index.cjs`, Vite for client build to `dist/public/`
- **Static Serving**: In production, serves built client from `dist/public/` with SPA fallback
- **Development**: Vite dev server middleware is attached to Express for HMR

## API Routes

Defined in `shared/routes.ts` with Zod schemas for input validation:
- `GET /api/products` — List all analyzed products (ordered by most recent)
- `GET /api/products/:id` — Get a single product by ID
- `POST /api/products/analyze` — Accept a base64-encoded image, analyze it with OpenAI, save and return the product

## Database

- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod conversion
- **Schema** (`shared/schema.ts`): Single `products` table with fields: id, name, brand, description, mrp, marketPrice, fakeRiskLevel, identificationTips (text array), imageUrl, createdAt
- **Migrations**: Managed via `drizzle-kit push` (`npm run db:push`)
- **Storage Layer** (`server/storage.ts`): `DatabaseStorage` class implementing `IStorage` interface — abstracts all DB operations

## AI Integration

- **Provider**: OpenAI API (via Replit AI Integrations proxy)
- **Environment Variables**: `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`
- **Usage**: The `/api/products/analyze` endpoint sends the uploaded image to OpenAI for vision-based analysis, extracting product name, brand, pricing, fake risk level, and identification tips

## Replit Integrations (Pre-built Modules)

Located in `server/replit_integrations/` and `client/replit_integrations/`, these are pre-scaffolded integration modules:
- **Chat**: Conversation/message storage and routes (uses `conversations` and `messages` tables)
- **Audio**: Voice recording, playback, and streaming utilities
- **Image**: Image generation/editing via OpenAI
- **Batch**: Batch processing utilities with rate limiting and retries

These modules exist as scaffolding and may or may not all be actively used by the main application flow.

## Shared Contract Pattern

The `shared/routes.ts` file defines API contracts as plain objects with method, path, input schemas, and response schemas. Both the client hooks (`use-products.ts`) and server routes (`routes.ts`) reference these contracts, ensuring type safety across the stack.

# External Dependencies

- **PostgreSQL** — Primary database, connected via `DATABASE_URL` env var, using `pg` (node-postgres) driver
- **OpenAI API** — Used for image analysis (vision model), configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables
- **Google Fonts** — DM Sans, Outfit, Fira Code, Geist Mono, Architects Daughter loaded via CDN
- **Radix UI** — Full suite of accessible UI primitives (dialog, dropdown, tabs, etc.)
- **Recharts** — Charting library (available via shadcn chart component)
- **Embla Carousel** — Carousel component
- **Vaul** — Drawer component