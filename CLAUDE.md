# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm dev      # Start dev server on port 4000 (http://localhost:4000)
pnpm build    # Production build
pnpm lint     # ESLint via Next.js
```

No test suite is configured. Type-check with `pnpm tsc --noEmit`.

## Environment Variables

Required in `.env`:
```
CT_API_URL=
CT_REGION=
CT_PROJECT_KEYS=key_dev,key_uat   # comma-separated; drives the environment switcher
CT_CLIENT_IDS=id_dev,id_uat
CT_CLIENT_SECRETS=secret_dev,secret_uat
CT_SCOPES=

# Optional: enables Basic Auth in production
BASIC_AUTH_USER=
BASIC_AUTH_PASSWORD=
```

## Architecture

**Next.js 15 App Router** with React 19, TypeScript, Tailwind CSS, shadcn/ui, React Query, and the Commercetools platform SDK.

### Key layers

- **`app/`** — Next.js pages. Routes: `/` (home), `/deployments`, `/deployments/[key]`, `/deployments/[key]/logs`, `/custom-objects`, `/product-debuger`.
- **`lib/commercetools-api.ts`** — All Commercetools API calls as `"use server"` Server Actions. This is the single integration point; it reads the active project from a cookie set by the environment switcher.
- **`hooks/`** — React Query hooks (`use-deployment-logs`, `use-products`, `use-custom-objects`, etc.) that wrap the server actions for client-side data fetching with caching.
- **`components/`** — Feature components grouped by domain (`product-debuger/`, `custom-objects/`) plus shared UI (`ui/` is shadcn/ui primitives).
- **`types/index.ts`** — `Severity` enum used across deployment log features.
- **`lib/dependency-graph-data.ts`** — Logic for the product sellability dependency graph (product setup, commerce setup, checkout flow checks). Uses `@xyflow/react` + `dagre` for rendering.

### Multi-environment pattern

`CT_PROJECT_KEYS` / `CT_CLIENT_IDS` / `CT_CLIENT_SECRETS` are parallel comma-separated lists. `environment-switcher.tsx` lets users pick an environment; the selection is stored in a cookie read by the server actions in `lib/commercetools-api.ts`.

### Product Debugger

The `/product-debuger` page renders a dependency graph showing product sellability. The graph logic lives in `lib/dependency-graph-data.ts`; the React Flow graph is rendered by `components/product-debuger/dependency-graph.tsx`.

### Auth

`middleware.ts` enforces HTTP Basic Auth in production only (`NODE_ENV === 'production'`). Dev mode skips auth entirely.

## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
