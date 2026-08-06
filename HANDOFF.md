# Handoff — Cashew presentation

Working notes for whoever picks this up next. Not part of the deck.

## What this is

A 10-minute conference presentation on the 2025–2026 raw cashewnut season,
built as a self-contained HTML deck served from GitHub Pages.

- **Repo:** `/Users/spurge/Desktop/Personal/Cashew-Research-Presentation`
- **Live:** https://omiiii21.github.io/Cashew-Research-Presentation/
- **Speaker:** Sanjay Mengshetti, Supersonic India, sanjay.mengshetti@supersonicindia.com
- **Current build:** 16 · 11 slides · 16 charts

## Structure

```
index.html              all 11 slides; speaker notes live in data-notes attributes
assets/css/styles.css   design system — earthy agri-tone, light theme only
assets/js/data.js       every chart's data, sourced and commented
assets/js/charts.js     hand-rolled SVG renderers — no library, no CDN
assets/js/deck.js       navigation, presenter timer, notes overlay
assets/img/visiting-card.jpg
assets/img/logo.png     Supersonic mark, fixed top-right on every slide
assets/img/cashew.jpg   title-slide hero photograph
```

No build step, no dependencies. Runs from `file://`. To change a number, edit
`data.js` — nothing else needs touching.

## Slides

1. Title
2. The verdict — is the crop up or down
3. Country by country
4. Asia — India, Vietnam, Cambodia
5. West Africa — the table
6. India vs Vietnam — size versus export
7. India's own market — crop, imports by origin, outlook
8. Quality — kernel per bag
9. Prices
10. Outlook — three risks
11. Contact — visiting card

## Conventions that must hold

- **Units.** "tonnes" spelled out, never `MT` or a bare `t`. "million tonnes"
  for totals, comma-separated full numbers in prose. State the unit once in a
  chart or column heading, not on every row.
- **Plain language.** No trade jargon on slides — not RCN, KOR, outturn,
  export intensity. The room is mixed. Detail belongs in speaker notes.
- **Slides are visual anchors.** ~915 words on screen across the whole deck.
  If a slide grows a paragraph, move it to `data-notes`.
- **Every data slide ends with a `Resourced from` footer.**
- **Ranges, not false precision.** Where sources disagree the deck shows the
  spread and says it is contested.
- **One statistical universe.** All figures are on the ACA/INC *trade* basis.
  FAOSTAT runs ~60% lower and must never share a table with these numbers.

## CSS/JS patterns worth knowing

- `.card` is a **flex column**, `justify-content: center`. Titles pin to the
  top; `.stat`, `.bullets` and `.chart-fill` expand to fill. This exists
  because stretched cards used to leave dead space under their content.
- `.chart-fill` on a chart host lets it absorb the card's spare height. Charts
  read their pixel height from layout, so this is what makes visuals large.
- `.card--grow` inside a `.stack` claims leftover height.
- `.stat--hero` for headline numbers. Sized so the **longest** value in the
  deck fits on one line — `.stat__value` is `nowrap`.
- **Chart font sizes live in `FS` in charts.js**, applied inline. They must
  not be set in CSS: measurement and rendering read the same constant, and
  when they drifted apart every label overflowed its gutter.
- `bgInk(host)` picks label colours from the background luminance, so a chart
  on a dark card gets light labels automatically.
- `inkOn(fill)` picks per-segment ink for stacked bars. Threshold is **0.32,
  not 0.5** — gold (#D9A441) has luminance 0.42 and a higher cut handed it
  white at 2.2:1.
- The fixed brand mark is sized by `--brand-w`. Both `.slide__head`
  (padding-right) and `.timer` (right offset) reserve space against that one
  variable — resize the logo there, not in either of those rules.

## Chart engine traps

Two sizing rules in `charts.js` will silently ruin a layout rather than error:

- **`box()` discards any host shorter than 60px** and substitutes
  `width / ratio`. Give a `[data-chart]` host 56px in a full-width card and it
  builds a ~197px SVG inside it, which the card's `overflow:hidden` then clips.
  Keep chart hosts **≥ 64px**. The audit now asserts svg height ≤ host height.
- **Renderers cap their own ink**, so height past the cap is dead space, not a
  bigger graphic: `shareBar` bar caps at 92px (binds ~220px host), `deltaBars`
  bars at 21px, and `pictogram` cells take the *smaller* of the width- and
  height-derived fit. A wide, shallow pictogram grid is pinned by its column
  count — `keralaFactories` went 21 cols → 12 for exactly this reason. Check
  which dimension binds before adding height to fix an empty-looking card.

## Deploying

1. Edit files.
2. Bump `?v=N` on all four asset URLs **and** the `Build N` string in the help
   panel (`index.html`). Skipping this serves stale CSS/JS from cache — it has
   already caused one "the change didn't happen" false alarm.
3. Commit, push to `main`.
4. Pages redeploys in 1–3 minutes. Poll it:
   `curl -s "https://omiiii21.github.io/Cashew-Research-Presentation/?cb=$RANDOM" | grep -o 'Build [0-9]*'`

Git identity is set **locally** on this repo (`omiiii21` /
`omengshetti@gmail.com`); the machine's global identity is a different, work
account. Don't remove the local override.

Note the repo sits *inside* another git repo (`~/Desktop/Personal` is itself
one). Harmless, but `git` commands must run from the inner directory.

## The layout audit — use it

Changes were verified with a headless-Chrome harness rather than by eye. It
walks every slide at six viewports (1280×720 → 2560×1440) and reports:

- slide/card overflow and clipping
- content top-aligned with dead space below (asymmetric slack only —
  symmetric centring is deliberate and must not be flagged)
- sparse cards (<55% filled)
- text escaping a chart's viewBox
- colour contrast <3:1, measured against **the shape under the label**, not
  the card background — labels sit inside coloured bars
- headline figures that wrap to a second line
- **charts that failed to render at all**

That last check matters most. Renderers are wrapped in try/catch, so a thrown
error silently swaps the chart for a fallback `<p>` — and with no `<svg>`
present, every other check skips it and reports clean. A chart was dead for
two builds that way. The audit now asserts each `[data-chart]` host produced
an `<svg>` and prints a count (expect **16**).

Rebuild the harness rather than trusting a visual skim. When you do, headless
Chrome has four traps that all present as "it hangs" or "it passed":

1. **`--headless=new` never returns** on this page. Use legacy `--headless`.
2. **Never pipe stdout/stderr** (`capture_output=True`). Chrome spawns a
   detached GoogleUpdater that inherits the fd and outlives the browser, so
   `communicate()` waits on an EOF that never comes. Redirect to a file.
3. **`--dump-dom` writes the DOM and then does not exit.** Poll the output file
   for your result marker and kill the process group; don't wait on it.
4. **`--window-size` height is NOT the viewport height** — `innerHeight` came
   out *143px shorter*. Uncorrected, the whole audit runs short and never tests
   the tall cases. Assert measured `innerWidth/innerHeight` against the target
   before trusting a single number; a calibration check is the first thing the
   harness should print.

Also: don't rewrite `document.documentElement` while the parser is still
running — it wedges the parse, `load` never fires, and `--dump-dom` hangs. Do
the work in a `load` handler and replace only `document.body`.

Charts render synchronously via `window.Charts.render(slide)`, and slides are
`position:absolute; inset:0`, so the whole audit can be one synchronous pass —
no virtual clock and no slide-transition waits needed.

## Open items

- **Title wording.** Reads "The 2025–2026 Raw Cashewnut". "Crop" was removed
  along with "Cashew" on a literal reading of the instruction — confirm
  whether it should be "Raw Cashewnut **Crop**".
- **Terminology drift.** Narrower than it looks. No *slide* says "raw cashew
  nut" — the only spaced spellings left are a `data.js` header comment and
  line 3 of the README. Slide 7's speaker notes say "raw cashewnut". So it is
  two words to change if you want it uniform, not a deck-wide sweep.
- **India origin breakdown (slide 7) is 2023 data**, from World Bank WITS /
  UN Comtrade HS 080130. No complete 2026 partner table is published. The
  slide labels it 2023 and puts the 2026 movement (Tanzania → #1, Togo −84%,
  Côte d'Ivoire −55%) in its own card. Don't silently relabel it as current.
- **Risk heading wraps at 1440×900 and 1600×900.** "03 Governments changing
  rules" takes two lines at those two viewports only. It fills the card rather
  than breaking it, so it was left alone — shorten the heading if you object.
- **2560×1440 is inherently airy.** Slide 10's cards sit at 26–34% fill there
  even after this pass (they were 18–21%). The deck is composed for 1920×1080,
  where nothing is below 55%.

## Research provenance

Figures came from a verified research pass: African Cashew Alliance
*AfriCashewSplits* 2026 bulletins (N°01, N°03, N°05, N°06), VINACAS, Vietnam
Customs, Vietnam Ministry of Agriculture & Environment, India's DCCD, CEPCI
and APEDA, Cambodian customs, World Bank WITS / UN Comtrade, and the
Cardassilaris Cashew Market Report (May 2026).

Two claims are deliberately **corrected** on the slides: India's "825,000
tonnes" is a prior record, not a 2026 estimate; and Vietnam's "30–50% crop
collapse" is refuted — national output rose 4.6%, the alarming figures were
single cooperatives.
