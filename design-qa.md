# Design QA — Global Capital Review

## Scope

- Pages: `/markets/` and `/zh-tw/markets/`
- Reference: approved option 3, “Global Capital Review”
- Published desktop viewport reviewed in the Codex in-app browser
- Side-by-side artifact: `qa-market-approved-comparison.png` (local QA artifact, excluded from Git)

## Visual comparison

- Module order matches the reference: compact photographic hero, white market pulse, featured analysis with chart overlay, AI-finance lead, three quantitative AI themes, global capital flows, three research cards, four regional snapshots, compact footer.
- Section proportions, serif headline hierarchy, thin rules, warm ivory background, burgundy accents and tight annual-report spacing match the approved direction.
- Realistic Wall Street, data-center, semiconductor and port photography replaces the earlier editorial variants.
- Market visuals are rendered as restrained Chart.js charts; the oversized TradingView panels and provider branding are removed.
- English and Traditional Chinese pages share the same structure and responsive rules.

## Functional checks

- Main navigation, language switch, research links and footer navigation are present.
- Market pulse sparklines, featured index chart, three AI comparison charts and four regional charts render successfully.
- Pricing is clearly dated and labeled as potentially delayed and informational only.
- HTML parsed successfully and `git diff --check` returned no errors.
- Asset version query strings bypass stale Cloudflare CSS and JavaScript caches.

## Result

final result: passed
