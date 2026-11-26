// United States in Numbers — page views (V1, dashboard edition)
// Each route is a function returning the page's HTML string. V1 is
// the dashboard take: a dark hero strip with the three headline
// numbers up front, then cards, charts and tables. Cards, chart
// points, year buttons, timeline rows and state rows all carry
// data-open / data-state hooks; main.js delegates the clicks to the
// source panel (modal.js). Sources are named on detail pages and in
// the footer; V1 keeps the overview clean.

import { YEARS, S, STATES, BEA, RANK, META } from './data.js';
import { esc, lineChart, barChart } from './charts.js';

// V1's chart colour: deep dashboard green.
const GREEN = '#0b6e4f';

// Per-chart year range, remembered while the visitor browses so a
// range switch never jumps the page back to the top.
export const RANGES = {};
function rangeOf(key) { return RANGES[key] || 'all'; }
function rangeSlice(key) {
  const r = rangeOf(key);
  if (r === 'all') return [YEARS, s => s];
  if (r === 'recent') return [YEARS.slice(5), s => s.slice(5)];
  return [YEARS.slice(0, 5), s => s.slice(0, 5)];
}

// A headline card: big 2024 value and a one-line change note.
export function statCard(key, delta) {
  const m = META[key], v = S[key][9];
  return '<article class="card stat" data-open="' + key + '" tabindex="0" role="button" aria-label="' + esc(m.t) + ', ' + m.f(v) + ' in 2024. Activate to open its source panel.">' +
    '<span class="tap">tap for source</span>' +
    '<div class="k">' + esc(m.t) + '</div>' +
    '<div class="v">' + m.f(v) + '</div>' +
    '<div class="d">' + (delta || '') + ' · 2024</div></article>';
}

// Ten-year table. Rows are clickable (they open the source panel for
// that year); the header is deliberately not a button — only sortable
// headers look clickable (a fix from phone testing).
export function table10(key) {
  const m = META[key];
  return '<div class="card"><h3>' + esc(m.t) + ' by year</h3><table>' +
    '<thead><tr><th>Year</th><th class="num">Value</th><th class="num">Change</th></tr></thead><tbody>' +
    YEARS.map((y, i) => '<tr class="rowlink" data-open="' + key + '" data-year="' + y + '">' +
      '<td>' + y + '</td><td class="num">' + m.f(S[key][i]) + '</td>' +
      '<td class="num">' + (i ? ((S[key][i] - S[key][i - 1]) >= 0 ? '+' : '') + (S[key][i] - S[key][i - 1]).toFixed(2) : '—') + '</td></tr>').join('') +
    '</tbody></table>' +
    '<p class="note">Tap a row to open the source panel for that year. Source: ' + esc(m.src) + '.</p></div>';
}

// A chart card: range switch (each chart keeps its own range), the
// SVG chart, and a row of year buttons that open the panel for that year.
export function chartBlock(key) {
  const [yrs, fn] = rangeSlice(key);
  const r = rangeOf(key);
  return '<div class="card chart-card"><h3>' + esc(META[key].t) + ' — ' + yrs[0] + '–' + yrs[yrs.length - 1] + '</h3>' +
    '<div class="seg">' +
    '<button data-range="all" data-key="' + key + '" class="' + (r === 'all' ? 'on' : '') + '">2015–2024</button>' +
    '<button data-range="early" data-key="' + key + '" class="' + (r === 'early' ? 'on' : '') + '">2015–2019</button>' +
    '<button data-range="recent" data-key="' + key + '" class="' + (r === 'recent' ? 'on' : '') + '">2020–2024</button></div>' +
    lineChart(key, yrs, fn(S[key]), GREEN) +
    '<div class="ybtns">' + yrs.map(y => '<button class="ybtn" data-open="' + key + '" data-year="' + y + '">' + y + '</button>').join('') + '</div>' +
    '<p class="note">Tap a year button below, or a point on the chart, to open the source panel for that year. Tap any card number anywhere on this site to open its source panel.</p></div>';
}

export function srcBox(m) {
  return '<div class="src">Source: ' + esc(m.src) + ' · <a href="' + m.link + '" target="_blank" rel="noopener">Open the official series ↗</a></div>';
}

/* ===== routes ===== */

export function vOverview() {
  return '<h1>United States in Numbers</h1>' +
    '<p class="lede">The United States in 2024: the world’s largest economy, 340 million people, and a decade of data you can check. Every number on this site is real — tap any card to see where it comes from.</p>' +
    '<div class="hero">' +
    '<div data-open="gdp" tabindex="0" role="button" aria-label="GDP, $29.30 trillion in 2024. Activate to open its source panel."><span class="hk">$29.30T</span><span class="hl2">GDP, 2024 — world’s largest</span></div>' +
    '<div data-open="pop" tabindex="0" role="button" aria-label="Population, 340.0 million in 2024. Activate to open its source panel."><span class="hk">340.0M</span><span class="hl2">people, 3rd most populous</span></div>' +
    '<div data-open="cpi" tabindex="0" role="button" aria-label="Inflation, 2.95% in 2024. Activate to open its source panel."><span class="hk">2.95%</span><span class="hl2">inflation, down from 8.00%</span></div></div>' +
    '<div class="grid">' +
    statCard('gdp', '<span class="up">▲ 5.4% vs 2023</span> nominal') +
    statCard('gdppc', '<span class="up">▲ 4.3% vs 2023</span>') +
    statCard('growth', 'real GDP growth') +
    statCard('cpi', '<span class="down">▼ from 8.00% in 2022</span>') +
    statCard('unemp', 'labour force') +
    statCard('pop', '<span class="up">▲ 0.96% vs 2023</span>') +
    '</div>' + chartBlock('gdp') +
    '<h2>At a glance</h2><div class="grid">' +
    statCard('life', 'recovered from the 2021 low') +
    statCard('debt', 'central government') +
    statCard('exp', 'share of GDP') +
    '</div>' +
    '<div class="card"><h3>The story in three numbers</h3>' +
    '<p><b>1. $29.30T.</b> The US economy is bigger than China ($18.7T) and Germany ($4.7T) combined in dollar terms — and California alone ($4.10T) would be the world’s fourth-largest economy. <a href="#/regions">See the states →</a></p>' +
    '<p><b>2. 8.00% → 2.95%.</b> Inflation peaked in 2022, the highest in four decades, then cooled for two straight years. <a href="#/prices">Prices &amp; jobs →</a></p>' +
    '<p><b>3. 340.0 million.</b> Population growth has slowed to about 0.5% a year, and life expectancy is still climbing back from the pandemic dip. <a href="#/population">Population →</a></p></div>';
}

export function vPopulation() {
  return '<h1>Population</h1><p class="lede">340.0 million people in 2024 — the third-largest population on earth, growing more slowly than at any time in modern history.</p>' +
    '<div class="grid">' + statCard('pop', '<span class="up">▲ 0.96% vs 2023</span>') + statCard('life', '<span class="up">▲ 0.50 yrs vs 2023</span>') + '</div>' +
    chartBlock('pop') + chartBlock('life') + table10('pop') + srcBox(META.pop);
}

export function vEconomy() {
  return '<h1>Economy</h1><p class="lede">GDP, growth and output per person — a decade that includes a pandemic crash, the fastest rebound since 1984, and a return to steady growth.</p>' +
    '<div class="grid">' + statCard('gdp', '<span class="up">▲ 5.4% vs 2023</span> nominal') + statCard('gdppc', '<span class="up">▲ 4.3% vs 2023</span>') + statCard('growth', 'real, year on year') + '</div>' +
    chartBlock('gdp') + chartBlock('growth') + table10('gdp') + srcBox(META.gdp);
}

export function vPrices() {
  return '<h1>Prices &amp; Jobs</h1><p class="lede">Inflation surged to 8% in 2022 and cooled to 2.95% by 2024; unemployment spiked to 8% in 2020 and settled near 4%.</p>' +
    '<div class="grid">' + statCard('cpi', '<span class="down">▼ from 8.00% in 2022</span>') + statCard('unemp', '<span class="down">▼ from 8.05% in 2020</span>') + '</div>' +
    chartBlock('cpi') + chartBlock('unemp') + table10('cpi') + srcBox(META.cpi);
}

export function vTrade() {
  return '<h1>Trade</h1><p class="lede">The US exports about 11% of its GDP and imports about 14% — a deficit of roughly 3.1% of GDP in 2024, about $900 billion.</p>' +
    '<div class="grid">' + statCard('exp', 'share of GDP') + statCard('imp', 'share of GDP') + '</div>' +
    chartBlock('exp') + chartBlock('imp') + table10('exp') + srcBox(META.exp);
}

// Regions page: sortable table of the four verified state economies
// plus the bar chart. `sortKey`/`sortDir` live in main.js and are
// shared through this module's exported state.
export let sortKey = 'gdp', sortDir = 'desc';
export function setSort(k, d) { sortKey = k; sortDir = d; }

export function vRegions() {
  const val = s => sortKey === 'rank' ? RANK[s.name] : s[sortKey];
  const cmp = (a, b) => {
    const va = val(a), vb = val(b);
    if (typeof va === 'string') return sortDir === 'desc' ? vb.localeCompare(va) : va.localeCompare(vb);
    return sortDir === 'desc' ? vb - va : va - vb;
  };
  const rows = [...STATES].sort(cmp);
  const arr = k => sortKey === k ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ' ↕';
  return '<h1>Regions — States by GDP</h1>' +
    '<p class="lede">The four largest state economies in 2024, in current dollars (BEA). Together they are $10.8 trillion — 37% of the whole country. Tap a column header to sort; tap a state in the chart or a row below to see its source panel.</p>' +
    '<div class="card chart-card"><h3>State GDP, 2024 ($ trillion)</h3>' + barChart(rows) +
    '<p class="note">Source: U.S. Bureau of Economic Analysis, GDP by state.</p></div>' +
    '<div class="card"><table><thead><tr>' +
    '<th data-sort="rank" tabindex="0">Rank' + arr('rank') + '</th>' +
    '<th data-sort="name" tabindex="0">State' + arr('name') + '</th>' +
    '<th class="num" data-sort="gdp" tabindex="0">GDP' + arr('gdp') + '</th>' +
    '<th class="num" data-sort="share" tabindex="0">Share of US' + arr('share') + '</th>' +
    '</tr></thead><tbody>' +
    rows.map(s => '<tr class="rowlink" data-state="' + esc(s.name) + '"><td>' + RANK[s.name] + '</td>' +
      '<td><b>' + esc(s.name) + '</b><br><span class="note">' + esc(s.note) + '</span></td>' +
      '<td class="num">$' + s.gdp.toFixed(2) + 'T</td><td class="num">' + s.share.toFixed(1) + '%</td></tr>').join('') +
    '</tbody></table><p class="note">California ($4.10T) alone is larger than Japan’s whole economy ($4.02T, 2024).</p></div>' +
    '<div class="src">Source: ' + BEA.src + ' · <a href="' + BEA.link + '" target="_blank" rel="noopener">Open the official BEA release ↗</a></div>';
}

export function vGovernment() {
  return '<h1>Government &amp; Debt</h1><p class="lede">Federal debt jumped with pandemic spending in 2020 and has stayed above 110% of GDP since.</p>' +
    '<div class="grid">' + statCard('debt', 'central government') + '</div>' +
    chartBlock('debt') + table10('debt') + srcBox(META.debt);
}

export const ROUTES = {
  '': vOverview, population: vPopulation, economy: vEconomy, prices: vPrices,
  trade: vTrade, regions: vRegions, government: vGovernment,
};
