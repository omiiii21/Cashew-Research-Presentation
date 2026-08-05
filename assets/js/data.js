/* ============================================================
   Chart data — 2026 raw cashew nut crop
   ------------------------------------------------------------
   SOURCING RULE APPLIED THROUGHOUT:
   Every figure below traces to a named source (primarily ACA
   AfriCashewSplits 2026 bulletins N°01/03/05/06, DCCD, APEDA,
   Vietnam Customs / MoAE, VINACAS, Cambodian customs, INC).
   Charts plot midpoints; the slides show the ranges in text.
   Contested figures are marked and never silently averaged.

   All production values are in THOUSAND TONNES of raw cashew
   nut, on the TRADE basis (ACA/INC), never FAOSTAT.
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
       Slide 3 — how much each country grew in 2026.
       ONE bar per country, coloured by region. The year-on-year
       change lives in its own chart beside this one, so repeating
       it here as ghost bars and note text only added clutter.
       -------------------------------------------------------- */
    countryProduction: {
      dp: 0,
      single: true,
      axis: true,
      items: [
        { label: "Côte d'Ivoire", a: 1400, color: '#C05F3C' },
        { label: 'Cambodia',      a:  960, color: '#55703F' },
        { label: 'India',         a:  790, color: '#55703F' },
        { label: 'Tanzania',      a:  621, color: '#D9A441' },
        { label: 'Nigeria',       a:  375, color: '#C05F3C' },
        { label: 'Vietnam',       a:  317, color: '#55703F' },
        { label: 'Guinea-Bissau', a:  300, color: '#C05F3C' },
        { label: 'Burkina Faso',  a:  280, color: '#C05F3C' },
        { label: 'Ghana',         a:  200, color: '#C05F3C' },
        { label: 'Benin',         a:  175, color: '#C05F3C' },
        { label: 'Guinea',        a:  150, color: '#C05F3C' },
        { label: 'Indonesia',     a:  150, color: '#55703F' },
        { label: 'Senegal',       a:   52, color: '#C05F3C' }
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
       Slide 4 — where Vietnam's raw nuts came from, first half
       2026 (share %). Vietnam bought in 1.81 million tonnes
       to 15 July 2026.
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
       Slide 6 — the size-versus-export contrast.
       Deliberately TWO charts, not one. Raw nuts and kernel are
       different things (kernel is roughly 22% of raw-nut weight),
       so putting them on a single scale would be dishonest. Two
       plain bar charts make the reversal obvious in one glance:
       India wins the first, Vietnam wins the second by 21x.
       -------------------------------------------------------- */
    grownAtHome: {
      dp: 0,
      single: true,
      items: [
        { label: 'India',   a: 790, color: '#C05F3C', note: '2.5x more', noteColor: '#8A3319' },
        { label: 'Vietnam', a: 323, color: '#7A5638' }
      ]
    },

    soldAbroad: {
      dp: 0,
      single: true,
      items: [
        { label: 'India',   a:  36, color: '#C05F3C', note: 'almost none', noteColor: '#8A3319' },
        { label: 'Vietnam', a: 767, color: '#55703F', note: '21x more', noteColor: '#3F5730' }
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
        { label: 'India',         a: 4.03, b: 3.98, color: '#9C3D22', note: 'same price all year', noteColor: '#8A3319' },
        { label: "Côte d'Ivoire", a: 3.45, b: 3.55, color: '#D9A441', note: 'premium price',  noteColor: '#B07E22' },
        { label: 'Vietnam',       a: 3.18, b: 3.30, color: '#55703F', note: 'slipped',            noteColor: '#3F5730' }
      ]
    },

    /* --------------------------------------------------------
       Slide 8 — the scissor: input cost up, output value flat.
       This is the whole 2026 processor squeeze in one chart.
       -------------------------------------------------------- */
    scissor: {
      items: [
        { label: 'Vietnam raw nut bill', value:  12.3 },
        { label: 'Vietnam raw nut volume',      value:   4.0 },
        { label: 'Vietnam kernel sales', value:   2.0 },
        { label: 'Vietnam kernel volume',       value:  -0.9 },
        { label: 'India kernel price',  value:  -6.5 },
        { label: 'India kernel volume',    value:  -9.5 }
      ]
    }
  };
})();
