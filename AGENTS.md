<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Product Context

Doublle's current product focus is the in-app referral module.

**Agent navigation (read first):** [`docs/PRODUCT_UNDERSTANDING.md`](docs/PRODUCT_UNDERSTANDING.md) — task → file map, routes, API surface, and what is implemented vs stubbed in this repo.

**Business requirements:** [`docs/Doublle_Referral_Module_PRD.md`](docs/Doublle_Referral_Module_PRD.md) — full PRD for rules, flows, admin, and compliance. Treat the PRD as source of truth for product behavior; use PRODUCT_UNDERSTANDING for where to edit code.

- MVP is web-first, logged-in referrers only, with credit-only payouts.
- Default Standard Program is 5% of referee net revenue for 12 months.
- Net revenue excludes refunds, chargebacks, taxes, and third-party pass-throughs.
- Attribution uses a 30-day first-party cookie, but manual code entry at signup overrides the cookie.
- Each referee can belong to only one referrer; no multi-level referrals.
- Commission lifecycle is pending -> earned -> applied, with 30-day hold and refund-driven clawbacks.
- Admins need configurable programs, fraud review, manual overrides, reporting, and audit trails.
- Build anti-fraud, privacy, terms acceptance, and operator controls into referral flows by default.
- Cash payouts, partner programs, and public influencer codes are Phase 2 unless explicitly requested.
