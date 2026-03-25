# Sample Dashboard

A React frontend built to test and demonstrate the [multi-tenant SaaS backend](https://multi-tenant-saas-backend.vercel.app). The backend is hosted separately, this UI exists purely to exercise its API endpoints and verify they work correctly.

## Purpose

This project is a test client for the backend. Every feature in the UI maps directly to a backend endpoint: authentication, tenant management, widgets, API keys, audit logs, and subscription management. If something works here, it works in the API.

## What are Widgets?

Widgets are a placeholder — a demo resource to show how tenant-isolated CRUD works in the backend. They don't represent anything specific in the real world.

The idea is: when you build your actual product, you replace "widgets" with whatever your real resource is (orders, invoices, projects, etc.). The widget code is there to demonstrate the patterns — tenant isolation, role-based access, audit logging — all wired up and working on a concrete example.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- No external state management — plain React context

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env.local` file if you need to override the API base URL (defaults to the hosted backend):

```
VITE_API_BASE=https://multi-tenant-saas-backend.vercel.app
```

## Features Covered

- Tenant registration and login (username or email)
- JWT auth with silent token refresh
- Tenant config, subscription tier management, and deletion
- Widget CRUD (create, list, edit, delete)
- API key generation and revocation
- Audit log browsing with date filtering and pagination
- Profile editing (username + password change)
- Backend health monitoring (polled every 60s)
- Role-based access control (admin-only pages)
