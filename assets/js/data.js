/* ============================================================
   Chart data — 2026 raw cashew nut crop
   ------------------------------------------------------------
   SOURCING RULE APPLIED THROUGHOUT:
   Every figure below traces to a named source (primarily ACA
   AfriCashewSplits 2026 bulletins N°01/03/05/06, DCCD, APEDA,
   Vietnam Customs / MoAE, VINACAS, Cambodian customs, INC).
   Charts plot midpoints; the slides show the ranges in text.
   Contested figures are marked and never silently averaged.

   All production values are in THOUSAND TONNES ('000 t) of
   raw cashew nut, on the TRADE basis (ACA/INC), never FAOSTAT.
   Mixing those two universes is the classic cashew-deck error:
   FAOSTAT puts the world ~60% lower.
   ============================================================ */

window.CHARTS = (function () {
  var UP = '#55703F', DOWN = '#9C3D22', FLAT = '#9A876F';

  return {

    /* --------------------------------------------------------
       Slide 2 — the world cannot agree on the size of the crop.
       Each published 2026 estimate is paired with THAT SOURCE'S
       OWN prior-year base, so the chart shows disagreement on
       direction as well as on level.
       -------------------------------------------------------- */
    globalEstimates: {
      dp: 2,
      items: [
        { label: 'ACA (June 2026)',       a: 6.00, b: 6.30, color: '#C05F3C', note: '▼ 3–6%',  noteColor: DOWN },
        { label: 'INC-derived table',     a: 6.21, b: 6.38, color: '#7A5638', note: '▼ 2.6%',  noteColor: DOWN },
        { label: 'Rotterdam / VINACAS',   a: 5.53, b: 5.37, color: '#55703F', note: '▲ 3%',    noteColor: UP },
        { label: 'cashewnews.in',         a: 5.21, b: 5.29, color: '#5B7C8D', note: '▼ 1.5%',  noteColor: DOWN }
      ]
    },

    /* --------------------------------------------------------
       Slide 3 — country production, 2026 vs 2025 ('000 t)
       Ghost bar = 2025. Omitted where no 2025 figure exists.
       -------------------------------------------------------- */
    countryProduction: {
      dp: 0,
      items: [
        { label: "Côte d'Ivoire",  a: 1400, b: 1550, color: DOWN, note: '▼ 6.5–13%', noteColor: DOWN },
        { label: 'Cambodia',       a:  960, b:  930, color: UP,   note: '▲ ~3%',     noteColor: UP },
        { label: 'India',          a:  790, b:  802, color: FLAT, note: '≈ flat',    noteColor: FLAT },
        { label: 'Tanzania',       a:  621, b:  531, color: UP,   note: '▲ 16.9%',   noteColor: UP },
        { label: 'Nigeria',        a:  375, b:  375, color: FLAT, note: '≈ flat',    noteColor: FLAT },
        { label: 'Vietnam',        a:  317, b:  309, color: UP,   note: '▲ 4.6%',    noteColor: UP },
        { label: 'Guinea-Bissau',  a:  300, b: null, color: UP,   note: '▲ up',      noteColor: UP },
        { label: 'Burkina Faso',   a:  280, b: null, color: FLAT, note: 'no base',   noteColor: FLAT },
        { label: 'Ghana',          a:  200, b:  275, color: DOWN, note: '▼ disputed',noteColor: DOWN },
        { label: 'Benin',          a:  175, b:  175, color: FLAT, note: '≈ flat',    noteColor: FLAT },
        { label: 'Guinea',         a:  150, b: null, color: FLAT, note: 'no base',   noteColor: FLAT },
        { label: 'Indonesia',      a:  150, b:  150, color: FLAT, note: '≈ flat',    noteColor: FLAT },
        { label: 'Senegal',        a:   52, b:   52, color: FLAT, note: '≈ flat',    noteColor: FLAT }
      ]
    },

    /* --------------------------------------------------------
       Slide 3 — year-on-year %. Only origins with a defensible
       prior-year base appear here.
       -------------------------------------------------------- */
    countryDelta: {
      items: [
        { label: 'Tanzania',      value:  16.9 },
        { label: 'Vietnam',       value:   4.6 },
        { label: 'Cambodia',      value:   3.2 },
        { label: 'Nigeria',       value:   0.0 },
        { label: 'Benin',         value:   0.0 },
        { label: 'Senegal',       value:   0.0 },
        { label: 'India',         value:  -1.5 },
        { label: "Côte d'Ivoire", value:  -9.7 },
        { label: 'Ghana',         value: -27.0 }
      ]
    },

    /* --------------------------------------------------------
       Slide 4 — Vietnam's RCN import book, H1 2026 (share %)
       Vietnam imported 1.81 Mt to 15 July 2026.
       -------------------------------------------------------- */
    vietnamImports: {
      parts: [
        { label: 'Cambodia',      value: 55, color: '#C05F3C' },
        { label: 'West Africa',   value: 26, color: '#7A5638' },
        { label: 'East Africa',   value: 12, color: '#D9A441' },
        { label: 'Other',         value:  7, color: '#5B7C8D' }
      ]
    },

    /* --------------------------------------------------------
       Slide 6 — the size-versus-export contrast, as a flow.
       Weights are proportional to real tonnages, not decorative.
       -------------------------------------------------------- */
    sizeVsExport: {
      leftTitle: 'RAW NUT ORIGINS',
      midTitle: 'PROCESSING',
      rightTitle: 'KERNEL OUT',
      left: [
        { label: 'West Africa',  sub: '~2.95 Mt', value: 295, fill: '#FDFAF3', stroke: '#C05F3C' },
        { label: 'Cambodia',     sub: '~0.96 Mt', value: 96,  fill: '#FDFAF3', stroke: '#D9A441' },
        { label: 'East Africa',  sub: '~0.80 Mt', value: 80,  fill: '#FDFAF3', stroke: '#7A5638' },
        { label: 'India crop',   sub: '0.79 Mt',  value: 79,  fill: '#FDFAF3', stroke: '#5B7C8D' },
        { label: 'Vietnam crop', sub: '0.32 Mt',  value: 32,  fill: '#FDFAF3', stroke: '#8C5A6E' }
      ],
      mid: [
        { label: 'VIETNAM',  sub: 'imports 1.81 Mt', value: 210, fill: '#4A3428', stroke: '#4A3428', textFill: '#F7F1E4', subFill: 'rgba(247,241,228,.7)' },
        { label: 'INDIA',    sub: 'imports 0.58 Mt', value: 130, fill: '#C05F3C', stroke: '#C05F3C', textFill: '#FFFFFF', subFill: 'rgba(255,255,255,.8)' },
        { label: 'AT ORIGIN',sub: 'Africa, rising',  value: 70,  fill: '#55703F', stroke: '#55703F', textFill: '#FFFFFF', subFill: 'rgba(255,255,255,.8)' }
      ],
      right: [
        { label: 'EXPORTED',  sub: 'VN 767k t · IN 36k t', value: 200, fill: '#FDFAF3', stroke: '#55703F' },
        { label: 'INDIA EATS',sub: '350k+ t at home',      value: 150, fill: '#FDFAF3', stroke: '#C05F3C' }
      ],
      links: [
        { from: 'L0', to: 'M0', weight: 9,  color: '#C05F3C' },
        { from: 'L0', to: 'M1', weight: 5,  color: '#C05F3C' },
        { from: 'L0', to: 'M2', weight: 6,  color: '#55703F' },
        { from: 'L1', to: 'M0', weight: 11, color: '#D9A441' },
        { from: 'L2', to: 'M1', weight: 6,  color: '#7A5638' },
        { from: 'L2', to: 'M0', weight: 4,  color: '#7A5638' },
        { from: 'L3', to: 'M1', weight: 6,  color: '#5B7C8D' },
        { from: 'L4', to: 'M0', weight: 3,  color: '#8C5A6E' },
        { from: 'M0', to: 'R0', weight: 13, color: '#55703F' },
        { from: 'M1', to: 'R1', weight: 10, color: '#C05F3C' },
        { from: 'M1', to: 'R0', weight: 2,  color: '#55703F' },
        { from: 'M2', to: 'R0', weight: 4,  color: '#55703F' }
      ]
    },

    /* --------------------------------------------------------
       Slide 8 — kernel WW320 FOB, USD/lb, now vs a year ago
       India has been FROZEN at 3.98 for a full year while
       Vietnam eased. The competitiveness gap is widening.
       -------------------------------------------------------- */
    kernelPrices: {
      dp: 2,
      items: [
        { label: 'India',         a: 4.03, b: 3.98, color: '#9C3D22', note: 'frozen 12 months', noteColor: '#8A3319' },
        { label: "Côte d'Ivoire", a: 3.45, b: 3.55, color: '#D9A441', note: 'African premium',  noteColor: '#B07E22' },
        { label: 'Vietnam',       a: 3.18, b: 3.30, color: '#55703F', note: 'eased',            noteColor: '#3F5730' }
      ]
    },

    /* --------------------------------------------------------
       Slide 8 — the scissor: input cost up, output value flat.
       This is the whole 2026 processor squeeze in one chart.
       -------------------------------------------------------- */
    scissor: {
      items: [
        { label: 'VN raw-nut import bill', value:  12.3 },
        { label: 'VN raw-nut volume',      value:   4.0 },
        { label: 'VN kernel export value', value:   2.0 },
        { label: 'VN kernel volume',       value:  -0.9 },
        { label: 'India kernel realised',  value:  -6.5 },
        { label: 'India kernel volume',    value:  -9.5 }
      ]
    }
  };
})();
