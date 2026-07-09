# Commercetools Logs Dashboard

A web dashboard for inspecting a [commercetools](https://commercetools.com) project: browse Connect deployment logs, read custom objects, and debug why a product is or isn't sellable. Built for developers and support engineers who need to diagnose issues without digging through the Merchant Center or raw API responses.

Supports multiple commercetools projects (e.g. dev / UAT / prod) behind an in-app environment switcher.

## Features

- **Deployment logs** — List Connect deployments, drill into a single deployment, and stream its logs. Filter by severity and search across log messages.
- **Custom objects** — Browse custom object containers and inspect individual object payloads.
- **Product debugger** — Renders a dependency graph (React Flow + dagre) of a product's sellability: publish state, variants and SKUs, inventory, and linked promotions. Makes it obvious which prerequisite is missing when a product won't appear on the storefront.
- **Environment switcher** — Point the whole dashboard at a different commercetools project without restarting.

## Screenshots

Deployments
![deployments](/images/deployments.jpg)
![deployments-detail](/images/deployments-detail.jpg)

Logs
![logs](/images/logs.jpg)
![logs-detail](/images/logs-detail.jpg)

Custom objects
![custom-objects](/images/custom-objects.jpg)
![custom-objects-detail](/images/custom-objects-detail.jpg)

Product Debugger
![product-debugger](/images/product-debuger.jpg)

## Tech stack

- **Next.js 15** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives) for the UI
- **TanStack React Query** for client-side data fetching and caching
- **@commercetools/platform-sdk** for API access, called exclusively from Server Actions
- **@xyflow/react** + **dagre** for the product dependency graph

## Getting started

### Prerequisites

- Node.js 20 or later
- [pnpm](https://pnpm.io) (this repo is pinned to a `pnpm-lock.yaml`)
- A commercetools API client with credentials and scopes for the resources you want to read

### Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/amornpic/commercetools-logs-dashboard.git
   cd commercetools-logs-dashboard
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Create a `.env` file in the project root:

   ```env
   CT_API_URL=https://api.<region>.commercetools.com
   CT_REGION=your_region
   CT_PROJECT_KEYS=your_project_key_dev,your_project_key_uat
   CT_CLIENT_IDS=your_client_id_dev,your_client_id_uat
   CT_CLIENT_SECRETS=your_client_secret_dev,your_client_secret_uat
   CT_SCOPES=your_scopes

   # Optional: enables HTTP Basic Auth, production builds only
   BASIC_AUTH_USER=
   BASIC_AUTH_PASSWORD=
   ```

   `CT_PROJECT_KEYS`, `CT_CLIENT_IDS`, and `CT_CLIENT_SECRETS` are **parallel comma-separated lists** — the first key pairs with the first client ID and secret, and so on. Each entry becomes an option in the environment switcher.

4. Start the dev server:

   ```sh
   pnpm dev
   ```

   The app runs on [http://localhost:4000](http://localhost:4000).

### Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server on port 4000 |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint via Next.js |
| `pnpm tsc --noEmit` | Type-check (no test suite is configured) |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home |
| `/deployments` | List Connect deployments |
| `/deployments/[key]` | Deployment detail |
| `/deployments/[key]/logs` | Deployment logs with severity filter and search |
| `/custom-objects` | Browse and inspect custom objects |
| `/product-debuger` | Product sellability dependency graph |

## Architecture

- **`lib/commercetools-api.ts`** is the single integration point with commercetools. Every call is a `"use server"` Server Action, so credentials never reach the browser. It reads the active project from a cookie set by the environment switcher.
- **`hooks/`** wraps those Server Actions in React Query hooks (`use-deployment-logs`, `use-products`, `use-custom-objects`, …) for caching and client-side fetching.
- **`components/`** groups feature components by domain (`product-debuger/`, `custom-objects/`); `components/ui/` holds the shadcn/ui primitives.
- **`lib/dependency-graph-data.ts`** builds the product sellability graph — the checks and node/edge layout consumed by `components/product-debuger/dependency-graph.tsx`.

## Authentication

`middleware.ts` enforces HTTP Basic Auth when `NODE_ENV === 'production'`, using `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD`. Development mode skips auth entirely.

**Note:** Basic Auth is a light gate, not a real access-control layer. The dashboard exposes read access to your commercetools project — deploy it somewhere private, and scope the API client to the minimum it needs.

## Deployment

Deploy to Vercel, Cloudflare Pages, or any host that runs Next.js. Set every `CT_*` variable in the host's environment, plus `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` if you want the Basic Auth gate.

```sh
vercel deploy
```

## Contributing

Contributions are welcome:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes; check them with `pnpm lint` and `pnpm tsc --noEmit`.
4. Open a pull request.

## Contact

Open a GitHub issue, or email [amornpic09@gmail.com](mailto:amornpic09@gmail.com).
