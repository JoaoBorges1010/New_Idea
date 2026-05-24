# FamilyOS

Multi-domain household platform built with SvelteKit, Convex, and Tailwind CSS.

## Stack

- **Frontend:** SvelteKit + Tailwind CSS
- **Backend:** Convex (real-time DB, file storage, serverless functions)
- **Auth:** Convex Auth (email/password)

## Architecture

- **Domain modules** (`convex/domains/`) — orchestration per feature (families, documents, bills, dashboard)
- **Shared services** (`convex/services/`) — domain-agnostic mechanics (AI parsing, file storage)
- **Shared lib** (`convex/lib/`) — auth guards, attention-item types

## Getting started

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
npm install
```

3. Start Convex (in one terminal):

```bash
npx convex dev
```

4. Start SvelteKit (in another terminal):

```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173)

## Bill Engine

Set `OPENAI_API_KEY` in your Convex deployment for AI bill parsing:

```bash
npx convex env set OPENAI_API_KEY your-key-here
```

## Routes

| Route              | Description                           |
| ------------------ | ------------------------------------- |
| `/dashboard`       | Cross-domain attention feed           |
| `/vault`           | Shared document vault                 |
| `/bills`           | Bill processing and pending payments  |
| `/settings/family` | Family member management              |
| `/finance`         | Placeholder for future finance domain |
