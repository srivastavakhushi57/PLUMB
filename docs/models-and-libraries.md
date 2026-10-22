# Models, Libraries & Dependencies

This document provides a complete inventory of the external libraries, AI models, and APIs utilized throughout the PLUMB platform.

---

## 1. Backend Runtime & Libraries

- **Language / Runtime**: Python 3.11+ / Python 3.14 (MSYS2 UCRT64 precompiled binary compatibility)
- **Web Framework**: `FastAPI` (0.115+)
  - Async request handling, Pydantic data validation, automatic OpenAPI / Swagger spec generation.
- **ASGI Server**: `Uvicorn` (0.34+)
  - High-performance asynchronous server implementation for Python.
- **Database ORM**: `SQLAlchemy 2.0` (asyncio with `greenlet` and `aiosqlite`)
  - Async relational mapping, SQLite local storage (`plumb_demo.db`), PostgreSQL compatibility.
- **Data Validation & Settings**: `Pydantic v2` & `pydantic-settings`
  - Strict type checking, schema enforcement, structured output validation for AI inference.
- **Security & Cryptography**:
  - `python-jose` / `pyjwt`: JWT access token signing and verification.
  - `passlib[bcrypt]` / `bcrypt`: Secure password hashing.
  - `cryptography`: High-grade cryptographic primitives.
- **AI & LLM Integration**:
  - `google-genai` (Google Gemini SDK): Gemini 2.5 Flash model invocation with structured JSON response schema enforcement.
  - Modular `LLMProvider` interface with automatic fallback to deterministic `MockLLMProvider` for zero-configuration local demo mode.
- **Visual & Image Processing**:
  - `Pillow` (PIL fork): Image manipulation, resizing, RGB channel extraction, format validation.
  - `numpy`: High-speed vector array manipulations for color distance and palette quantization.
- **Testing**:
  - `pytest` (9.0+): Unit and integration test runner.
  - `anyio`: Async test runner harness.

---

## 2. Frontend Libraries & Tools

- **Framework**: `React 19` + `TypeScript 5`
  - Modern reactive component model, hooks, and strict type safety.
- **Build Tool**: `Vite 8`
  - Lightning-fast development server with Hot Module Replacement (HMR) and optimized Rollup production bundling.
- **Styling**: `Tailwind CSS v4` (`@tailwindcss/vite`)
  - Modern zero-runtime utility-first CSS engine customized with PLUMB's black and crimson design tokens (`#000000`, `#830000`, `#BC0202`, `#FF0000`, `#F5F5F5`).
- **Client Routing**: `React Router v7`
  - Declarative client-side routing, protected route guards, role-based navigation.
- **Data Fetching & State**: `@tanstack/react-query` (TanStack Query v5)
  - Asynchronous query caching, optimistic UI updates, background polling, and cache invalidation.
- **Data Visualization**: `Recharts` (v2.15+)
  - Responsive SVG charts (BarChart, AreaChart, PieChart, ResponsiveContainer) configured with brand token color scales.
- **Icons**: `lucide-react`
  - High-clarity, accessible iconography for UI elements and non-color severity indicators.
- **HTTP Client**: Native browser `fetch` with typed wrapper service (`src/services/api.ts`).

---

## 3. Database & Production Infrastructure

- **Development / Demo**: `SQLite` (Zero-dependency local database file `plumb_demo.db`).
- **Production Schema**: `PostgreSQL 15+` with `pgvector` extension for semantic embedding similarity searches.
- **Migration Scripts**: Located in `supabase/migrations/001_initial_schema.sql` including Row-Level Security (RLS) policies for:
  - Admin full access
  - Creator scoped access
  - Reviewer workflow access
  - External agency confidentiality enforcement
