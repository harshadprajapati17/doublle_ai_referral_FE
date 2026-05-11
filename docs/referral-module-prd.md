# DOUBLLE Referral Module PRD

## Executive Summary

Doublle is building an in-product referral loop that turns every user into a distribution node. Any signed-up Doublle user can share a personal referral link and code. When the referred user signs up and later becomes a paying customer, the referrer earns a recurring reward tied to the referee's net Doublle revenue.

The default Standard Program for MVP is:

- 5% of referee net revenue
- paid for 12 months
- attributed with a 30-day first-party cookie
- paid as Doublle account credit

The product objective is to create a high-quality, low-CAC inbound growth channel that compounds over time and complements outbound and content motions.

## Goals

- Increase inbound qualified deal flow by at least 15% within 6 months of GA.
- Lower blended CAC by at least 10% within 9 months of GA.
- Give users a frictionless self-serve referral experience inside the Doublle dashboard.
- Let Growth Ops configure and tune programs without engineering changes.
- Protect unit economics with caps, holds, clawbacks, and fraud controls.

## Non-Goals For MVP

- Cash payouts to referrers
- Public or influencer codes that do not require a Doublle account
- Dedicated partner or affiliate programs with custom commercial terms
- Multi-level or second-degree referrals
- Mobile SDK support
- Leaderboards or gamification

## Success Metrics

### North Star

- Referral-attributed new ARR per quarter

### Primary KPIs

- Referrer activation rate
- Click-to-signup conversion through referral link or code
- Referee-to-paid conversion rate
- Share of new ARR attributed to referrals
- Average commission paid per active referrer

### Guardrails

- Self-referral and abuse rate below 0.5% of total referrals
- Cash-equivalent paid per dollar of referred revenue at or below 7%
- Referral-related support tickets below 2% of participants per month
- Transparent and stable refund-driven clawback behavior

## Program Model

The system should treat `Program` as a first-class entity. A program defines:

- reward percentage
- reward duration
- cookie window
- referee benefit
- caps
- eligibility rules
- terms version

The MVP ships with a single live `Standard Program`, but the data model should support multiple concurrent programs to avoid Phase 2 migrations.

## Standard Program Defaults

- Referrer eligibility: any signed-up Doublle user, including free, trial, or paying
- Reward: 5% of referee net revenue for 12 months
- Referee benefit: configurable trial extension or bonus credits
- Payout: Doublle account credit applied to the next invoice
- Termination: reward stream stops if the referrer account is deleted, terminated for fraud, or the program is sunset

## Attribution Rules

- Referral links and share flows originate from an authenticated dashboard surface
- Referral tracking uses a 30-day first-party cookie
- Cookie stores opaque referral code plus attribution metadata such as source and timestamp
- The signup flow should acknowledge an active referral and prefill the code field
- Manual code entry at signup overrides the cookie value
- A referee can only be attributed to one referrer
- Subsequent attribution attempts are ignored
- No multi-level commissions in any phase

## Revenue And Commission Rules

### Net Revenue Definition

`Net Revenue = gross paid invoice amount - refunds - chargebacks - taxes - third-party pass-throughs`

MVP assumes sales-assisted services revenue is included by default unless product decides otherwise later.

### Commission Lifecycle

- Stripe `invoice.paid` creates a commission in `Pending`
- A 30-day hold applies before payout eligibility
- If no refund or chargeback occurs during the hold, the commission becomes `Earned`
- MVP applies earned value as Doublle account credit on the referrer's next invoice
- Refunds or disputes can reverse pending or earned commission
- If already paid, the amount should be clawed back from future earnings or recorded as a negative balance

### Caps And Limits

- Per-referrer monthly cap defaults to `$5,000`, configurable by admin
- Per-program lifetime cap is supported but off by default
- Referee minimum spend gate defaults to `$50` in the first 60 days
- Commission may accrue from the first qualifying invoice but should only become payable once the spend gate is met

## MVP User Flows

### Referrer Flow

- User opens `Refer & Earn` from the authenticated dashboard
- On first visit, the user must accept versioned program terms
- The page shows the personal link, short code, share actions, and referral stats
- The user can share to email, X, LinkedIn, and WhatsApp

### Referee Flow

- Visitor lands with a referral link
- The app drops a referral cookie and shows a referral acknowledgment banner
- Signup pre-fills the referral code field
- Account creation creates the referral relationship and applies the referee benefit automatically

### Conversion Flow

- A referee pays an invoice
- Referral service consumes Stripe webhook events
- Net revenue is computed and a pending commission record is created
- After the hold period, the commission becomes earned and is applied as account credit

### Fraud Review Flow

- Fraud signals create flagged referrals or commissions
- Admins can approve, reject, or request more info
- Decisions must write to an audit log

### Refund Flow

- Refunds and chargebacks trigger clawback evaluation
- Related commission records are reversed or deducted from future earnings
- Referrers should see a clear explanation for negative balances

## Core Product Surfaces

### Referrer Dashboard

- Hero card with personal link and code
- One-click copy and tracked share actions
- Stats for clicks, signups, paid conversions, total earned, pending, and paid
- Referees table with referral and commission status
- Transactions panel for pending, earned, applied, and clawed-back events
- Visible help and terms links

### Signup Flow

- Active referral banner
- Editable, real-time validated referral code input
- Privacy notice for referral cookie handling

### Admin Console

- Program create, edit, disable, and version history
- Referral inspector with attribution chain
- Fraud review queue with evidence panel
- Reporting for funnel, cohorts, top referrers, ARR attribution, and clawbacks
- Manual approve, reject, and clawback actions with audit trail

## Integrations

- Existing Doublle auth and dashboard session
- Existing billing UI for showing applied credit
- Stripe webhooks for `invoice.paid`, `invoice.refunded`, `charge.refunded`, `customer.created`, and `charge.dispute.created`
- Idempotent webhook processing keyed by Stripe event id

## Anti-Fraud Requirements

### Hard Blocks

- Self-referral by exact email match
- Self-referral by payment method fingerprint match
- Self-referral by primary IP match
- Disposable email domain blocklist
- Repeated identical device fingerprint with rapid signups

### Review Queue Triggers

- More than 5 signups from the same `/24` subnet in 24 hours
- Device fingerprint, user agent, or subnet overlap above threshold
- Unusually high referral velocity for one referrer
- Any single commission above `$1,000`
- Aggregate fraud score above `0.6`

## Compliance And Legal

- Terms acceptance must be versioned and logged with IP and timestamp
- Cookie disclosure must explain referral purpose, lifetime, and data captured
- Referral cookie payload should never contain PII
- Right-to-delete should redact PII while preserving financial linkage needed for accounting integrity
- MVP uses credit-only payouts to avoid cash payout tax handling

## Notifications

- Transactional emails for first referee, first earned commission, payout, and clawback
- In-app notifications for new signups, payable commission, and negative balances

## Phase Plan

### MVP

- Logged-in users only
- Standard program only
- Credit-only payouts
- Manual fraud review queue
- Admin configuration and reporting

### Phase 2

- Cash payouts with KYC and W-9 or W-8 handling
- Partner programs with custom terms
- Public influencer codes without Doublle accounts
- Multiple concurrent programs and program-specific landing pages

### Phase 3

- ML-based fraud scoring
- Mobile SDK and deep linking
- Gamification or leaderboards
- Multi-currency settlement and FX harmonization

## Open Questions

- Should referee benefit be trial extension, flat credits, or both?
- Should services revenue count in MVP or only subscription and usage revenue?
- Should commission settle in invoice currency or referrer currency in later phases?
- Should the referrer dashboard explicitly show referee churn status?
- What exact monthly and lifetime caps should apply to the Standard Program?
- Which team owns final Program Terms drafting?
- Which payout partner should be used in Phase 2?
