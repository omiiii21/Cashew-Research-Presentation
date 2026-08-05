# The 2026 Raw Cashew Crop — Asia & Africa

A ten-minute executive conference presentation on the 2026 raw cashew nut (RCN) season,
built as a self-contained HTML deck for GitHub Pages.

**Live:** https://omiiii21.github.io/Cashew-Research-Presentation/

---

## The argument in one line

2026 production is **reduced** versus 2025 — but 2025 was the all-time record, so this is
still the **second-largest crop in history**. The decline is ~3–6% on the trade basis
(~6.0 Mn t against 6.2–6.4 Mn t). The story that actually cost money was not tonnage:
West African outturns fell 2.0–2.5 lbs per 80 kg bag, so **effective kernel availability
fell roughly twice as fast as raw tonnage**.

## Slides

| # | Slide | Answers |
|---|-------|---------|
| 1 | Title | — |
| 2 | The verdict | Is production up or down? |
| 3 | Origin by origin | How is the crop, country by country? |
| 4 | Asia | India, Vietnam, Cambodia, Indonesia |
| 5 | West Africa | Côte d'Ivoire, Ghana, Nigeria, Benin, Togo, Senegal, Guinea-Bissau, Gambia, Burkina Faso |
| 6 | Size versus export | The India-vs-Vietnam contrast |
| 7 | Quality | Outturn/KOR by origin, and what 2 lbs costs |
| 8 | Prices | RCN and kernel, and the processor squeeze |
| 9 | Outlook | Three risks into 2027 |
| 10 | Contact | Visiting card |

## Presenting

Open the page and press **F** for fullscreen.

| Key | Action |
|-----|--------|
| `→` `Space` | Next slide |
| `←` | Previous slide |
| `1`–`9`, `0` | Jump to slide |
| `N` | Speaker notes (per-slide, written for a 10-minute delivery) |
| `T` | Start / pause the 10-minute countdown |
| `R` | Reset the timer |
| `F` | Fullscreen |
| `?` | Shortcut help |

Swipe works on touch devices, and clicking the left/right 12% of the screen also navigates.
**Print to PDF** for a handout — each slide becomes one page with animations resolved.

## Adding your visiting card

Drop the image at `assets/img/visiting-card.jpg` (`.png`, `.jpeg` and `.webp` also work).
It is detected automatically and replaces the placeholder on slide 10 — no code change needed.

Also update your title and organisation on slide 1 (`index.html`, `#speakerRole`).

## Sourcing and honesty notes

Figures come from live research verified against primary documents — principally the
**African Cashew Alliance AfriCashewSplits** 2026 bulletins (N°01, N°03, N°05, N°06),
**DCCD** and **APEDA** for India, **Vietnam Customs / Ministry of Agriculture & Environment**
and **VINACAS** for Vietnam, and Cambodian customs / CAC for Cambodia.

Deliberate choices worth knowing before you take questions:

- **One statistical universe only.** All figures are on the ACA/INC *trade* basis. FAOSTAT
  puts the world ~60% lower (≈3.9 Mn t) and must never share a table with these numbers.
- **Ranges, not false precision.** Where sources disagree the deck shows the spread and says
  it is contested — India (770–810k t), Ghana (150k vs 250k), Guinea-Bissau (150k vs 300k),
  Cambodia, Tanzania.
- **Gaps are stated, not filled.** No 2026 production figure is published for Togo, The Gambia
  or Mozambique; no 2026 outturn data exists for India's or Cambodia's own crops. The deck
  says so rather than estimating.
- **Two claims are explicitly corrected.** India's "825,000 t" is a *prior record ceiling*,
  not a 2026 estimate. Vietnam's "30–50% crop collapse" is refuted — national output rose 4.6%;
  the alarming figures were single cooperatives and communes.
- Charts plot midpoints; the slides carry the ranges in text.

## Structure

```
index.html              10 slides, speaker notes in data-notes attributes
assets/css/styles.css   design system — earthy agri-tone palette
assets/js/data.js       all chart data, sourced and commented
assets/js/charts.js     hand-rolled SVG charts (no library, works offline)
assets/js/deck.js       navigation, presenter timer, notes overlay
```

No build step, no dependencies, no CDN — it runs from `file://` and survives a conference
hall with no wifi. To change a number, edit `assets/js/data.js`.

## Local preview

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```
