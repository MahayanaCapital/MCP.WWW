# Design QA — Global Capital Review

## Scope

- Pages: `/markets/` and `/zh-tw/markets/`
- Reference: selected “Global Capital Review” direction
- Published desktop viewport reviewed in the Codex in-app browser
- Comparison artifact: `qa-market-comparison.png` (local QA artifact, not published)

## Visual comparison

- Preserves the reference hierarchy: photographic market hero, compact market pulse, featured analysis, dark AI-finance chapter, capital-flow map, research cards, and regional market charts.
- Matches the reference’s institutional palette with deep wine, warm ivory, muted copper, fine rules, and restrained serif typography.
- Uses realistic editorial imagery rather than science-fiction artwork.
- English and Traditional Chinese versions preserve the same information hierarchy and visual rhythm.
- Text remains readable over photography; hero overlays and section contrast passed visual inspection.

## Functional checks

- Main navigation, language switch, research links, mail link, and footer are present.
- The illustrative market-regime chart renders successfully.
- Four regional market widgets load expanded in a two-column layout with delayed-data disclosure.
- TradingView symbol logos are disabled in widget configuration; the provider badge is visually masked by the final CSS refinement.
- HTML parsed successfully and `git diff --check` returned no errors.
- Responsive rules collapse complex grids at 1000px and 800px, with a single-column research layout on mobile.

## Result

final result: passed
