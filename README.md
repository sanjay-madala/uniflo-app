# Uniflo Platform

Unified ops + support SaaS for distributed enterprises — QSR, Retail, Hospitality, Pharma.

## Architecture

Turborepo monorepo with pnpm workspaces.

### Apps

| App | Description | Stack |
|-----|-------------|-------|
| `apps/web` | Main dashboard | Next.js 15, React 19, Tailwind v4, next-intl |
| `apps/api` | API server (placeholder) | Fastify 5 (planned) |

### Packages

| Package | Description |
|---------|-------------|
| `@uniflo/ui` | Shared component library (Radix UI, CVA, Tailwind) |
| `@uniflo/i18n` | i18n config + messages (en, ar, fr, de) |
| `@uniflo/config` | Shared TypeScript, Tailwind, ESLint configs |
| `@uniflo/db` | Database schema (placeholder — Drizzle ORM planned) |

## Getting Started

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build
pnpm build

# Storybook
pnpm storybook
```

## Modules

| # | Module | Phase |
|---|--------|-------|
| 01 | Platform Foundation & Auth | MVP |
| 02 | SOP & Process Management | DEMO |
| 03 | Audit & Compliance | DEMO |
| 04 | CAPA | DEMO |
| 05 | Ticket Management | DEMO |
| 06 | Workflow Automation | DEMO |
| 07 | Knowledge Base | MVP |
| 08 | Analytics & Reporting | MVP |
| 09 | Task & Project Management | MVP |
| 10 | SLA Management | MVP |
| 11 | Mobile Platform | DEMO |
| 12 | Goals & OKRs | ALPHA |
| 13 | Customer Portal & CSAT | ALPHA |
| 14 | Communication & Broadcasting | ALPHA |
| 15 | Training & LMS | ALPHA |

## i18n

Supported locales: English (en), Arabic (ar, RTL), French (fr), German (de).

## Deployment

Configured for Netlify with `@netlify/plugin-nextjs`. See `netlify.toml`.

## Tech Stack

- **Runtime**: Node.js 22, pnpm 10
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Radix UI, Tailwind CSS v4
- **Build**: Turborepo
- **i18n**: next-intl
- **Design**: Eastern European Minimalist (dark-first)
