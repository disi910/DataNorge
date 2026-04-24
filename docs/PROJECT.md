# Datasenter-Norge

A public, aggregated map + list of every data center in Norway — where they are, who owns them, how much electricity they draw, and how that compares to the kommune they sit in. Plus an AI-driven "radar" that surfaces new sites and capacity changes as they appear in press releases and kommune plansak documents.

## Why this exists

Norway is quietly becoming a hyperscaler magnet: Microsoft, Google, Meta, TikTok (via Green Mountain), Bulk, GreenScale. Cheap hydropower is the draw. The political question of 2026 — *"should Norwegian electricity feed American AI?"* — is loud, but no single public source aggregates the facts behind it.

- **Nkom** has a registry of 58 operators — no geography, no MW, no ownership chains.
- **NVE** has concession cases — scattered across filings, no consolidated view.
- **Press releases** have MW figures — buried across dozens of corporate blogs.
- **Kommune plansak portals** have building permits — one portal per kommune, mostly unindexed.

We merge all of it into one place.

## Audience

1. **Energy journalists** — E24, Europower, Finansavisen, Teknisk Ukeblad
2. **Policy and politics** — Stortinget researchers, kommune planners, r/norge
3. **Industry analysts** — energi-bransjen, Statnett, utilities
4. **AI community in Norway** — builders curious about local infra
5. **Curious public** — anyone asking "hvorfor bygger de datasentre i MIN kommune?"

## Scope

### In scope
- All data centers in Norway (operational, under construction, planned with ≥50 MW)
- Ownership chains to ultimate parent (via BRREG)
- Power capacity (current + planned max) with explicit confidence
- Comparison against kommune total electricity consumption
- Source-linked everything

### Out of scope (for now)
- Outside Norway
- Colocation customers (we track operators, not their tenants)
- Real-time power draw (we don't have that data)
- Anything requiring FOIA-style requests

## Non-goals

- Not an activist site. We report, we don't lobby.
- Not a vendor directory. Don't add "book a tour" features.
- Not speculative. If MW is unknown, say unknown — don't guess.

## Success metrics

- **M2 launch**: ≥30 data centers seeded with location, operator, and a confidence-rated MW figure.
- **M4 launch**: featured in at least one Norwegian tech/energy publication, ≥500 unique visitors in first week.
- **Ongoing**: radar detects ≥1 new public announcement per week with ≤48h latency.

## Milestones (condensed)

| Milestone | Target | Deliverable |
|---|---|---|
| M0 | Week 1 | Repo structure, docs, docker-compose, DB schema |
| M1 | Week 2 | Bootstrap dataset: Nkom + BRREG + 20 hand-curated top sites |
| M2 | Week 3-4 | UI MVP working locally (map + list + detail panel) |
| M3 | Week 5-6 | AI radar pipeline (Claude extraction on press releases + plansak) |
| M4 | Week 7 | Polish, methodology page, launch on r/norge + press outreach |

See [LOG.md](LOG.md) for dated progress entries.
