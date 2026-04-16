/* =========================================================
   APP.JS — Thin orchestrator: state, UI rendering, events.
   All computation delegated to:
     js/data/constants.js  js/data/cache.js    js/data/pokeapi.js
     js/data/pool.js       js/calc/stats.js    js/calc/typeChart.js
     js/calc/matchup.js    js/calc/recommendations.js
   ========================================================= */
'use strict';

/* =========================================================
   1. APP STATE
   ========================================================= */
const state = {
  currentPokemon: null,
  comparePokemon: null,
  team: new Array(MAX_TEAM_SIZE).fill(null),
};

/* =========================================================
   2. SPRITE / BADGE HELPERS
   ========================================================= */
function spriteHtml(poke, className = '', useLarge = false) {
  const primary   = useLarge ? poke.artwork  : poke.sprite;
  const secondary = useLarge ? poke.sprite   : '';
  const fallback  = poke.spriteFallback || '';
  const onerror   = secondary
    ? `if(this.dataset.step==='0'){this.dataset.step='1';this.src='${secondary}';}else if(this.dataset.step==='1'&&'${fallback}'){this.dataset.step='2';this.src='${fallback}';}else{this.onerror=null;}`
    : `if(this.dataset.step==='0'&&'${fallback}'){this.dataset.step='1';this.src='${fallback}';}else{this.onerror=null;}`;
  return `<img class="${className}" src="${primary}" alt="${poke.name}" data-step="0" onerror="${onerror}" />`;
}

function makeTypeBadge(type, small = false) {
  const el = document.createElement('span');
  el.className = `type-badge type-${type}${small ? ' type-sm' : ''}`;
  el.textContent = type;
  return el;
}

/* =========================================================
   3. STAT BAR RENDERING
   ========================================================= */
function renderStatBars(pokemon) {
  const container = document.getElementById('stat-bars');
  container.innerHTML = '';
  const { stats } = pokemon;
  const values  = STAT_KEYS.map(k => stats[k]);
  const highest = Math.max(...values);
  const lowest  = Math.min(...values);
  document.getElementById('stat-total').textContent = `BST: ${stats.total}`;
  STAT_KEYS.forEach(key => {
    const val = stats[key];
    const pct = Math.round((val / STAT_MAX) * 100);
    const cls = val === highest ? 'highest' : val === lowest ? 'lowest' : 'normal';
    const row = document.createElement('div');
    row.className = `stat-row ${cls}`;
    row.innerHTML = `
      <span class="stat-label">${STAT_NAMES[key]}</span>
      <span class="stat-value">${val}</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct}%"></div></div>`;
    container.appendChild(row);
  });
}

/* =========================================================
   4. POKEMON CARD
   ========================================================= */
function renderPokemonCard(pokemon) {
  document.getElementById('pokemon-placeholder').classList.add('hidden');
  document.getElementById('pokemon-card').classList.remove('hidden');

  document.getElementById('poke-name').textContent =
    pokemon.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const spriteEl = document.getElementById('poke-sprite');
  spriteEl.src = pokemon.artwork || pokemon.sprite;
  spriteEl.alt = pokemon.name;
  spriteEl.dataset.step = '0';
  spriteEl.onerror = function () {
    if (this.dataset.step === '0' && pokemon.sprite) {
      this.dataset.step = '1'; this.src = pokemon.sprite;
    } else if (this.dataset.step === '1' && pokemon.spriteFallback) {
      this.dataset.step = '2'; this.src = pokemon.spriteFallback; this.onerror = null;
    } else { this.onerror = null; }
  };

  const typesEl = document.getElementById('poke-types');
  typesEl.innerHTML = '';
  pokemon.types.forEach(t => typesEl.appendChild(makeTypeBadge(t)));

  const abilitiesEl = document.getElementById('poke-abilities');
  abilitiesEl.innerHTML = '';
  getAbilitySuggestions(pokemon.abilities, detectRole(pokemon.stats)).forEach(a => {
    const el = document.createElement('div');
    el.className = 'ability-tag';
    el.title = a.tip;
    el.innerHTML = `<span class="${a.hidden ? 'ability-hidden' : 'ability-name'}">${
      a.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }${a.hidden ? ' (HA)' : ''}</span>`;
    abilitiesEl.appendChild(el);
  });

  document.getElementById('poke-role').textContent = detectRole(pokemon.stats);
  renderStatBars(pokemon);
  buildEVIVInputs(pokemon);
  renderSpeedTiers(pokemon);
}

/* =========================================================
   5. EV / IV CALCULATOR
   ========================================================= */
function buildEVIVInputs(pokemon) {
  const container = document.getElementById('ev-iv-inputs');
  container.innerHTML = '';
  STAT_KEYS.forEach(key => {
    const col = document.createElement('div');
    col.className = 'eviv-col';
    col.innerHTML = `
      <label>${STAT_NAMES[key]} EV
        <input type="number" class="ev-input" data-stat="${key}" value="0" min="0" max="252" />
      </label>
      <label>IV
        <input type="number" class="iv-input" data-stat="${key}" value="31" min="0" max="31" />
      </label>`;
    container.appendChild(col);
  });
  container.querySelectorAll('input').forEach(inp => inp.addEventListener('input', recalcStats));
  document.getElementById('calc-level').addEventListener('input', recalcStats);
  document.getElementById('calc-nature').addEventListener('change', recalcStats);
  recalcStats();
}

function recalcStats() {
  const pokemon = state.currentPokemon;
  if (!pokemon) return;
  const level      = Math.max(1, Math.min(100, parseInt(document.getElementById('calc-level').value) || 50));
  const natureName = document.getElementById('calc-nature').value;
  const evs = {}, ivs = {};
  STAT_KEYS.forEach(k => {
    evs[k] = Math.max(0, Math.min(252, parseInt(document.querySelector(`.ev-input[data-stat="${k}"]`)?.value) || 0));
    ivs[k] = Math.max(0, Math.min(31,  parseInt(document.querySelector(`.iv-input[data-stat="${k}"]`)?.value) ?? 31));
  });
  const finals = computeFinalStats(pokemon.stats, evs, ivs, level, natureName);
  const mults  = getNatureMultipliers(natureName);
  const container = document.getElementById('calc-results');
  container.innerHTML = '';
  STAT_KEYS.forEach(k => {
    const cls = k !== 'hp' ? (mults[k] > 1 ? 'boosted' : mults[k] < 1 ? 'reduced' : '') : '';
    const item = document.createElement('div');
    item.className = `calc-stat-item ${cls}`;
    item.innerHTML = `<div class="cs-label">${STAT_NAMES[k]}</div><div class="cs-val">${finals[k]}</div>`;
    container.appendChild(item);
  });
  renderSpeedTiersWithValue(finals.spe);
}

/* =========================================================
   6. SPEED TIER PREDICTOR
   ========================================================= */
function renderSpeedTiers(pokemon) {
  renderSpeedTiersWithValue(calcStat(pokemon.stats.spe, 0, 31, 50, 1.0));
}

function renderSpeedTiersWithValue(calcSpeed) {
  const container = document.getElementById('speed-tiers');
  container.innerHTML = '';
  COMMON_SPEED_TIERS.forEach(tier => {
    const row = document.createElement('div');
    let cls, verdict;
    if      (calcSpeed > tier.base) { cls = 'faster'; verdict = `✓ Outspeeds (${calcSpeed} > ${tier.base})`; }
    else if (calcSpeed < tier.base) { cls = 'slower'; verdict = `✗ Slower (${calcSpeed} < ${tier.base})`; }
    else                            { cls = 'equal';  verdict = `= Speed tie (${calcSpeed})`; }
    row.className = `speed-tier-row ${cls}`;
    row.innerHTML = `<span>${tier.label}</span><span>${verdict}</span>`;
    container.appendChild(row);
  });
}

/* =========================================================
   7. MATCHUP COMPARISON PANEL
   ========================================================= */
function renderSpeedComparison() {
  const a = state.currentPokemon;
  const b = state.comparePokemon;
  const container = document.getElementById('compare-results');
  container.innerHTML = '';
  if (!a || !b) {
    container.innerHTML = '<p class="placeholder-msg">Search a Pokémon on the left, then enter one here to compare.</p>';
    return;
  }

  const sA = calcStat(a.stats.spe, 0, 31, 50, 1.0);
  const sB = calcStat(b.stats.spe, 0, 31, 50, 1.0);
  const aSuperEff = Math.max(...a.types.map(t => getTypeEffectiveness(t, b.types)));
  const bSuperEff = Math.max(...b.types.map(t => getTypeEffectiveness(t, a.types)));
  const aWins = (sA >= sB ? 1 : 0) + (aSuperEff > bSuperEff ? 1 : 0) + (a.stats.total > b.stats.total ? 1 : 0);
  const bWins = (sB > sA ? 1 : 0) + (bSuperEff > aSuperEff ? 1 : 0) + (b.stats.total > a.stats.total ? 1 : 0);
  let verdictCls, verdictText;
  if (aWins > bWins)      { verdictCls = 'win';  verdictText = `${cap(a.name)} has the advantage`; }
  else if (bWins > aWins) { verdictCls = 'lose'; verdictText = `${cap(b.name)} has the advantage`; }
  else                    { verdictCls = 'tie';  verdictText = 'Even matchup — situational'; }

  const headerEl = document.createElement('div');
  headerEl.className = 'matchup-header';
  headerEl.innerHTML = `
    <div class="matchup-poke-col">
      ${spriteHtml(a, 'matchup-sprite')}
      <div class="matchup-name">${cap(a.name)}</div>
      <div class="type-badges" style="justify-content:center">${a.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}</div>
      <div class="matchup-bst">BST ${a.stats.total}</div>
    </div>
    <div class="matchup-vs-col">
      <div class="speed-verdict ${verdictCls}">${verdictText}</div>
      <div class="matchup-vs-label">VS</div>
    </div>
    <div class="matchup-poke-col">
      ${spriteHtml(b, 'matchup-sprite')}
      <div class="matchup-name">${cap(b.name)}</div>
      <div class="type-badges" style="justify-content:center">${b.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}</div>
      <div class="matchup-bst">BST ${b.stats.total}</div>
    </div>`;
  container.appendChild(headerEl);

  const tableEl = document.createElement('div');
  tableEl.className = 'matchup-stat-table';
  STAT_KEYS.forEach(key => {
    const vA = a.stats[key], vB = b.stats[key];
    const pA = Math.round((vA / STAT_MAX) * 100), pB = Math.round((vB / STAT_MAX) * 100);
    const cA = vA > vB ? 'winning' : vA < vB ? 'losing' : 'tied';
    const cB = vB > vA ? 'winning' : vB < vA ? 'losing' : 'tied';
    tableEl.innerHTML += `
      <div class="mst-row">
        <div class="mst-bar-wrap left">
          <div class="mst-val ${cA}">${vA}</div>
          <div class="mst-track"><div class="mst-fill ${cA}" style="width:${pA}%;margin-left:auto"></div></div>
        </div>
        <div class="mst-label">${STAT_NAMES[key]}</div>
        <div class="mst-bar-wrap right">
          <div class="mst-track"><div class="mst-fill ${cB}" style="width:${pB}%"></div></div>
          <div class="mst-val ${cB}">${vB}</div>
        </div>
      </div>`;
  });
  const cSA = sA >= sB ? 'winning' : 'losing', cSB = sB > sA ? 'winning' : 'losing';
  tableEl.innerHTML += `
    <div class="mst-row mst-speed-calc">
      <div class="mst-bar-wrap left">
        <div class="mst-val ${cSA}">${sA}</div>
        <div class="mst-track"><div class="mst-fill ${cSA}" style="width:${Math.round(sA/250*100)}%;margin-left:auto"></div></div>
      </div>
      <div class="mst-label">Spd Lv50</div>
      <div class="mst-bar-wrap right">
        <div class="mst-track"><div class="mst-fill ${cSB}" style="width:${Math.round(sB/250*100)}%"></div></div>
        <div class="mst-val ${cSB}">${sB}</div>
      </div>
    </div>`;
  container.appendChild(tableEl);

  const analysisEl = document.createElement('div');
  analysisEl.className = 'matchup-analysis';
  analysisEl.innerHTML = '<div class="matchup-analysis-title">Matchup Breakdown</div>';
  generateMatchupAnalysis(a, b, sA, sB).forEach(line => {
    const p = document.createElement('div');
    p.className = `matchup-line matchup-${line.type}`;
    p.innerHTML = line.text;
    analysisEl.appendChild(p);
  });
  container.appendChild(analysisEl);
}

/* =========================================================
   8. TEAM SPEED RANKINGS
   ========================================================= */
function renderTeamSpeedRankings() {
  const members = state.team.filter(Boolean);
  const section = document.getElementById('team-speed-section');
  const list    = document.getElementById('team-speed-list');
  if (members.length < 2) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');
  list.innerHTML = '';
  [...members]
    .map(p => ({ p, speed: calcStat(p.stats.spe, 0, 31, 50, 1.0) }))
    .sort((a, b) => b.speed - a.speed)
    .forEach((entry, i, arr) => {
      const row = document.createElement('div');
      row.className = 'speed-rank-row';
      const vc = i === 0 ? 'rank-1' : i < arr.length / 2 ? 'rank-fast' : 'rank-slow';
      row.innerHTML = `
        <span class="speed-rank-num">#${i + 1}</span>
        ${spriteHtml(entry.p, 'speed-rank-sprite')}
        <span class="speed-rank-name">${entry.p.name.replace(/-/g, ' ')}</span>
        <span class="speed-rank-val ${vc}">${entry.speed}</span>`;
      list.appendChild(row);
    });
}

/* =========================================================
   9. TEAM MANAGEMENT
   ========================================================= */
function addToTeam(pokemon) {
  const slot = state.team.indexOf(null);
  if (slot === -1) { showNotification('Team is full! Remove a Pokémon first.', 'warn'); return; }
  if (state.team.some(p => p && p.name === pokemon.name)) {
    showNotification(`${cap(pokemon.name)} is already in your team.`, 'warn'); return;
  }
  state.team[slot] = pokemon;
  _refreshTeam();
  showNotification(`${cap(pokemon.name)} added to slot ${slot + 1}!`, 'info');
}

function removeFromTeam(slot) { state.team[slot] = null; _refreshTeam(); }

function _refreshTeam() {
  renderTeamSlots(); renderTeamStats(); renderWeaknessChart();
  renderTeamSpeedRankings(); renderTeamRecommendations(); syncTeamToStorage();
}

function syncTeamToStorage() {
  try {
    localStorage.setItem('poke_overlay_team', JSON.stringify(
      state.team.map(p => p ? { name:p.name, id:p.id, types:p.types, stats:p.stats,
        sprite:p.sprite, spriteFallback:p.spriteFallback } : null)
    ));
  } catch (_) {}
}

/* =========================================================
   10. TEAM SLOTS RENDERING
   ========================================================= */
function renderTeamSlots() {
  const slots = document.querySelectorAll('.team-slot');
  document.getElementById('team-count').textContent = `${state.team.filter(Boolean).length}/6`;
  slots.forEach((slotEl, i) => {
    const poke = state.team[i];
    if (!poke) { slotEl.className = 'team-slot empty'; slotEl.innerHTML = `Slot ${i + 1}`; return; }
    slotEl.className = 'team-slot filled';
    slotEl.innerHTML = `
      ${spriteHtml(poke, 'slot-sprite')}
      <div class="slot-info">
        <div class="slot-name">${poke.name.replace(/-/g, ' ')}</div>
        <div class="slot-types">${poke.types.map(t =>
          `<span class="type-badge type-${t}" style="font-size:0.68rem;padding:0.1rem 0.4rem">${t}</span>`
        ).join('')}</div>
      </div>
      <button class="slot-remove" data-slot="${i}" title="Remove">✕</button>`;
  });
  document.querySelectorAll('.slot-remove').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); removeFromTeam(+btn.dataset.slot); });
  });
}

/* =========================================================
   11. TEAM RECOMMENDATIONS
   ========================================================= */
let activeRecFilter = 'all';

function initRecFilters() {
  document.querySelectorAll('.rec-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rec-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeRecFilter = btn.dataset.filter;
      renderTeamRecommendations();
    });
  });
}

function renderTeamRecommendations() {
  const section = document.getElementById('team-recommendations');
  if (!section) return;
  if (!state.team.filter(Boolean).length) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');

  const recs     = getTeamRecommendations(state.team, activeRecFilter);
  const grid     = document.getElementById('recs-grid');
  const subtitle = document.getElementById('recs-subtitle');
  grid.innerHTML = '';

  if (!recs.length) { subtitle.textContent = 'No strong candidates for this filter — try another.'; return; }
  const topScore = recs[0].score;
  subtitle.textContent = `${recs.length} candidate${recs.length > 1 ? 's' : ''} found based on your team gaps.`;

  recs.forEach(({ candidate, score, reasons }) => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.title     = `Click to look up ${candidate.name}`;
    const local  = `sprites/sprites/pokemon/${candidate.id}.png`;
    const cdn    = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${candidate.id}.png`;
    const inTeam = state.team.some(p => p && p.name === candidate.name);
    card.innerHTML = `
      <img src="${local}" alt="${candidate.name}" onerror="this.onerror=null;this.src='${cdn}'" />
      <div class="rec-info">
        <div class="rec-name">${candidate.name.replace(/-/g, ' ')}</div>
        <div class="rec-types">${candidate.types.map(t =>
          `<span class="type-badge type-${t}" style="font-size:0.68rem;padding:0.1rem 0.4rem">${t}</span>`
        ).join('')}</div>
        <div class="rec-reason">${reasons.map(r => `<span class="${r.cls}">${r.text}</span>`).join('')}</div>
      </div>
      <button class="rec-add-btn" ${inTeam ? 'disabled' : ''}>${inTeam ? '✓ In Team' : '+ Search'}</button>
      <div class="rec-score-bar" style="transform:scaleX(${Math.round(score/topScore*100)/100})"></div>`;
    card.querySelector('.rec-add-btn').addEventListener('click', e => {
      e.stopPropagation();
      if (!inTeam) {
        document.getElementById('search-input').value = candidate.name;
        searchPokemon(candidate.name).then(() => {
          if (state.currentPokemon && state.team.includes(null)) addToTeam(state.currentPokemon);
        });
      }
    });
    card.addEventListener('click', () => {
      document.getElementById('search-input').value = candidate.name;
      searchPokemon(candidate.name);
    });
    grid.appendChild(card);
  });
}

/* =========================================================
   12. TEAM OVERVIEW + WARNINGS
   ========================================================= */
function renderTeamStats() {
  const members  = state.team.filter(Boolean);
  const statsEl  = document.getElementById('team-stats');
  const grid     = document.getElementById('team-overview-grid');
  const warnings = document.getElementById('type-warnings');
  if (!members.length) { statsEl.classList.add('hidden'); return; }
  statsEl.classList.remove('hidden');
  grid.innerHTML = warnings.innerHTML = '';

  const avg = {};
  STAT_KEYS.forEach(k => { avg[k] = Math.round(members.reduce((s,p) => s+p.stats[k], 0) / members.length); });
  const bySpd   = [...members].sort((a, b) => b.stats.spe - a.stats.spe);
  const balance = avg.atk-avg.spa > 20 ? 'Physical-leaning' : avg.spa-avg.atk > 20 ? 'Special-leaning' : 'Balanced';
  const defBal  = avg.def-avg.spd > 15 ? 'Physical Wall bias' : avg.spd-avg.def > 15 ? 'Special Wall bias' : 'Balanced';

  [
    {label:'Avg HP',       val:avg.hp},
    {label:'Avg Speed',    val:avg.spe},
    {label:'Fastest',      val:bySpd[0].name.replace(/-/g,' ')},
    {label:'Slowest',      val:bySpd[bySpd.length-1].name.replace(/-/g,' ')},
    {label:'Offense Bias', val:balance},
    {label:'Defense Bias', val:defBal},
    {label:'Avg Atk',      val:avg.atk},
    {label:'Avg Sp.Def',   val:avg.spd},
  ].forEach(item => {
    const el = document.createElement('div');
    el.className = 'overview-item';
    el.innerHTML = `<div class="ov-label">${item.label}</div><div class="ov-val">${item.val}</div>`;
    grid.appendChild(el);
  });

  const typeCounts = {};
  members.flatMap(p => p.types).forEach(t => { typeCounts[t] = (typeCounts[t]||0)+1; });
  const dupTypes = Object.entries(typeCounts).filter(([,c]) => c >= 3).map(([t]) => t);
  if (dupTypes.length) {
    const w = document.createElement('div'); w.className = 'warning-tag';
    w.innerHTML = `<span class="warn-icon">⚠</span> Duplicate typing: ${dupTypes.join(', ')} (3+ members)`;
    warnings.appendChild(w);
  }

  const sharedWeak = ALL_TYPES.filter(atk =>
    members.filter(p => getTypeEffectiveness(atk, p.types) >= 2).length >= 3);
  if (sharedWeak.length) {
    const w = document.createElement('div'); w.className = 'warning-tag';
    w.innerHTML = `<span class="warn-icon">🔥</span> Shared weaknesses (3+ members): ${sharedWeak.join(', ')}`;
    warnings.appendChild(w);
  }

  const roles = members.map(p => detectRole(p.stats));
  if (!roles.some(r => r.includes('Sweeper'))) addInfo(warnings, '💡 No sweeper — consider a fast offensive Pokémon.');
  if (!roles.some(r => r==='Wall'||r==='Tank')) addInfo(warnings, '💡 No wall/tank — team may struggle with stall.');
  if (!roles.some(r => r==='Support'))          addInfo(warnings, '💡 No support — consider Stealth Rock / Tailwind user.');
}

function addInfo(container, msg) {
  const el = document.createElement('div'); el.className = 'warning-tag info-tag';
  el.innerHTML = `<span class="warn-icon">ℹ</span> ${msg}`;
  container.appendChild(el);
}

/* =========================================================
   13. WEAKNESS COVERAGE CHART
   ========================================================= */
const DISPLAY_TYPES = [
  'fire','water','electric','ground','ice','dragon',
  'fairy','dark','ghost','steel','fighting','psychic',
  'flying','rock','bug','poison','grass','normal',
];

function renderWeaknessChart() {
  const members   = state.team.filter(Boolean);
  const container = document.getElementById('weakness-chart');
  const section   = document.getElementById('weakness-section');
  container.innerHTML = '';
  if (!members.length) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');

  DISPLAY_TYPES.forEach(atk => {
    const avg      = members.reduce((s,p) => s + getTypeEffectiveness(atk, p.types), 0) / members.length;
    const vulCount = members.filter(p => getTypeEffectiveness(atk, p.types) >= 2).length;
    let cls, label;
    if      (avg === 0)  { cls='wk-0';   label='0×'; }
    else if (avg <= 0.3) { cls='wk-025'; label='¼×'; }
    else if (avg <= 0.6) { cls='wk-05';  label='½×'; }
    else if (avg <= 1.5) { cls='wk-1';   label='1×'; }
    else if (avg <= 2.5) { cls='wk-2';   label='2×'; }
    else                 { cls='wk-4';   label='4×'; }
    const cell = document.createElement('div');
    cell.className = `weakness-cell ${cls}`;
    cell.title = `${vulCount}/${members.length} members weak to ${atk}`;
    cell.innerHTML = `
      <span class="type-badge type-${atk} wk-type">${atk}</span>
      <span class="wk-mult">${label}</span>
      <span style="font-size:0.7rem;opacity:0.7">${vulCount}/${members.length}</span>`;
    container.appendChild(cell);
  });
}

/* =========================================================
   14. FOOTER TYPE CALCULATOR
   ========================================================= */
let selectedAtkType = null;
const selectedDefTypes = new Set();

function initTypeCalc() {
  const atkGroup = document.getElementById('atk-type-buttons');
  const defGroup = document.getElementById('def-type-buttons');
  ALL_TYPES.forEach(t => {
    const atkBtn = document.createElement('button');
    atkBtn.className = `type-calc-btn type-${t}`;
    atkBtn.textContent = t;
    atkBtn.addEventListener('click', () => {
      atkGroup.querySelectorAll('.type-calc-btn').forEach(b => b.classList.remove('selected'));
      atkBtn.classList.add('selected'); selectedAtkType = t; updateTypeCalcResult();
    });
    atkGroup.appendChild(atkBtn);

    const defBtn = document.createElement('button');
    defBtn.className = `type-calc-btn type-${t}`;
    defBtn.textContent = t;
    defBtn.addEventListener('click', () => {
      if (selectedDefTypes.has(t)) { selectedDefTypes.delete(t); defBtn.classList.remove('selected'); }
      else {
        if (selectedDefTypes.size >= 2) { showNotification('Max 2 defense types.', 'warn'); return; }
        selectedDefTypes.add(t); defBtn.classList.add('selected');
      }
      updateTypeCalcResult();
    });
    defGroup.appendChild(defBtn);
  });
}

function updateTypeCalcResult() {
  const result = document.getElementById('type-calc-result');
  if (!selectedAtkType || !selectedDefTypes.size) {
    result.style.background = ''; result.textContent = 'Select an attacking type and 1–2 defending types.';
    return;
  }
  const mult = getTypeEffectiveness(selectedAtkType, [...selectedDefTypes]);
  const map  = {
    0: ['rgba(139,148,158,0.2)', '0× — No effect!'],
    0.25: ['rgba(88,166,255,0.15)', '¼× — Not very effective…'],
    0.5: ['rgba(88,166,255,0.15)', '½× — Not very effective.'],
    1: ['rgba(255,255,255,0.05)', '1× — Neutral.'],
    2: ['rgba(248,81,73,0.15)', '2× — Super effective!'],
    4: ['rgba(248,81,73,0.3)', '4× — Double super effective!!'],
  };
  const [bg, text] = map[mult] || map[1];
  result.style.background = bg;
  result.textContent = `${selectedAtkType.toUpperCase()} → ${[...selectedDefTypes].join('+')} = ${text}`;
}

/* =========================================================
   15. AUTOCOMPLETE
   ========================================================= */
function initAutocomplete(inputId, suggestionId, onSelect) {
  const input = document.getElementById(inputId), dropdown = document.getElementById(suggestionId);
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { dropdown.classList.add('hidden'); return; }
    debounce = setTimeout(async () => {
      const list    = await loadPokemonList().catch(() => []);
      const matches = list.filter(n => n.startsWith(q) || n.includes(q)).slice(0, 8);
      dropdown.innerHTML = '';
      if (!matches.length) { dropdown.classList.add('hidden'); return; }
      matches.forEach(name => {
        const item = document.createElement('div');
        item.className = 'suggestion-item'; item.textContent = name;
        item.addEventListener('mousedown', e => {
          e.preventDefault(); input.value = name; dropdown.classList.add('hidden'); onSelect(name);
        });
        dropdown.appendChild(item);
      });
      dropdown.classList.remove('hidden');
    }, 200);
  });
  input.addEventListener('blur',    () => setTimeout(() => dropdown.classList.add('hidden'), 150));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { dropdown.classList.add('hidden'); onSelect(input.value.trim().toLowerCase()); }
  });
}

/* =========================================================
   16. SEARCH
   ========================================================= */
async function searchPokemon(name) {
  if (!name) return;
  showLoading('pokemon-card', 'pokemon-placeholder');
  try {
    const poke = await fetchPokemon(name);
    state.currentPokemon = poke;
    renderPokemonCard(poke);
    renderSpeedComparison();
    injectMoveRecommendations(poke);
  } catch (err) {
    showError('pokemon-placeholder', err.message);
    document.getElementById('pokemon-card').classList.add('hidden');
  }
}

async function searchCompare(name) {
  if (!name) return;
  try {
    state.comparePokemon = await fetchPokemon(name);
    renderSpeedComparison(); renderTeamSpeedRankings();
  } catch (err) { showNotification(err.message, 'error'); }
}

function injectMoveRecommendations(poke) {
  let el = document.getElementById('move-recs');
  if (!el) {
    el = document.createElement('div'); el.id = 'move-recs'; el.className = 'calc-block';
    document.getElementById('pokemon-card').appendChild(el);
  }
  el.innerHTML = `<h4>Move Suggestions (Role-based)</h4>${
    getMoveRecommendations(poke).map(r =>
      `<div style="font-size:0.83rem;color:var(--text-secondary);padding:0.3rem 0;border-bottom:1px solid var(--border)">• ${r}</div>`
    ).join('')}`;
}

/* =========================================================
   17. EXPORT / SAVE / LOAD
   ========================================================= */
function exportTeamJSON() {
  const members = state.team.filter(Boolean);
  if (!members.length) { showNotification('No team to export.', 'warn'); return; }
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([JSON.stringify(members.map(p => ({
      name: p.name, types: p.types, stats: p.stats, abilities: p.abilities, role: detectRole(p.stats),
    })), null, 2)], { type: 'application/json' })),
    download: `pokemon-team-${Date.now()}.json`,
  });
  a.click(); URL.revokeObjectURL(a.href);
  showNotification('Team exported!', 'info');
}

function openSaveModal() {
  const members = state.team.filter(Boolean);
  if (!members.length) { showNotification('No team to save.', 'warn'); return; }
  const modal = document.getElementById('modal-overlay'), body = document.getElementById('modal-body');
  document.getElementById('modal-title').textContent = 'Save Team';
  body.innerHTML = `
    <div class="modal-form">
      <label>Team Name <input type="text" id="save-team-name" placeholder="My Team…" maxlength="40" /></label>
      <button id="confirm-save-btn">Save</button>
    </div>`;
  modal.classList.remove('hidden');
  document.getElementById('confirm-save-btn').addEventListener('click', async () => {
    const name = document.getElementById('save-team-name').value.trim() || 'Unnamed Team';
    await dbSaveTeam(name, state.team.map(p => p ? p.name : null));
    showNotification(`Team "${name}" saved!`, 'info');
    modal.classList.add('hidden');
  });
}

function openLoadModal() {
  const modal = document.getElementById('modal-overlay'), body = document.getElementById('modal-body');
  document.getElementById('modal-title').textContent = 'Load Team';
  dbLoadTeams().then(teams => {
    if (!teams.length) { body.innerHTML = '<p class="placeholder-msg">No saved teams found.</p>'; }
    else {
      body.innerHTML = '';
      teams.forEach(team => {
        const names = (team.pokemonNames || []).filter(Boolean).join(', ') || '(empty)';
        const row = document.createElement('div'); row.className = 'saved-team-row';
        row.innerHTML = `
          <div>
            <div class="st-name">${escapeHTML(team.name)}</div>
            <div class="st-date">${escapeHTML(team.savedAt || '')} — ${escapeHTML(names)}</div>
          </div>
          <button class="load-team-btn" data-id="${team.id}">Load</button>
          <button class="del-btn" data-id="${team.id}">✕</button>`;
        body.appendChild(row);
      });
      body.querySelectorAll('.load-team-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const team = teams.find(t => String(t.id) === btn.dataset.id); if (!team) return;
          modal.classList.add('hidden'); showNotification('Loading team…', 'info');
          state.team = new Array(MAX_TEAM_SIZE).fill(null);
          await Promise.all((team.pokemonNames || []).map(async (n, i) => {
            if (n) { try { state.team[i] = await fetchPokemon(n); } catch (_) {} }
          }));
          _refreshTeam(); showNotification(`Team "${team.name}" loaded!`, 'info');
        });
      });
      body.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', async () => { await dbDeleteTeam(+btn.dataset.id); openLoadModal(); });
      });
    }
    modal.classList.remove('hidden');
  });
}

/* =========================================================
   18. UI UTILITIES
   ========================================================= */
function showLoading(cardId, phId) {
  document.getElementById(cardId)?.classList.add('hidden');
  const ph = document.getElementById(phId);
  if (ph) { ph.classList.remove('hidden'); ph.innerHTML = '<div class="loading-spinner">Loading…</div>'; }
}

function showError(phId, msg) {
  const ph = document.getElementById(phId);
  if (ph) { ph.classList.remove('hidden'); ph.innerHTML = `<p style="color:var(--red);text-align:center;padding:1rem">${escapeHTML(msg)}</p>`; }
}

let _notifTimeout;
function showNotification(msg, type = 'info') {
  let notif = document.getElementById('notif-bar');
  if (!notif) {
    notif = document.createElement('div'); notif.id = 'notif-bar';
    notif.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:999;padding:0.75rem 1.2rem;border-radius:8px;font-size:0.9rem;font-weight:600;max-width:320px;box-shadow:0 4px 16px rgba(0,0,0,0.4);transition:opacity 0.3s;pointer-events:none;';
    document.body.appendChild(notif);
  }
  const c = {info:{bg:'rgba(31,111,235,0.9)',color:'#fff'},warn:{bg:'rgba(227,179,65,0.9)',color:'#222'},error:{bg:'rgba(248,81,73,0.9)',color:'#fff'}}[type] || {bg:'rgba(31,111,235,0.9)',color:'#fff'};
  Object.assign(notif.style, {background:c.bg, color:c.color, opacity:'1'});
  notif.textContent = msg;
  clearTimeout(_notifTimeout);
  _notifTimeout = setTimeout(() => { notif.style.opacity = '0'; }, 3500);
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

/* =========================================================
   19. EVENT BINDING
   ========================================================= */
function bindEvents() {
  document.getElementById('search-btn').addEventListener('click', () =>
    searchPokemon(document.getElementById('search-input').value.trim().toLowerCase()));
  document.getElementById('compare-btn').addEventListener('click', () =>
    searchCompare(document.getElementById('compare-input').value.trim().toLowerCase()));
  document.getElementById('add-to-team-btn').addEventListener('click', () => {
    if (state.currentPokemon) addToTeam(state.currentPokemon);
  });
  document.getElementById('export-btn').addEventListener('click', exportTeamJSON);
  document.getElementById('save-btn').addEventListener('click', openSaveModal);
  document.getElementById('load-btn').addEventListener('click', openLoadModal);
  document.getElementById('modal-close').addEventListener('click', () =>
    document.getElementById('modal-overlay').classList.add('hidden'));
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('modal-overlay').classList.add('hidden');
  });
}

/* =========================================================
   20. INIT
   ========================================================= */

/** Trickle-prefetch top-tier Pokémon using idle time only. */
function prefetchTopPool() {
  const idle = typeof requestIdleCallback === 'function'
    ? fn => requestIdleCallback(fn, { timeout: 3000 })
    : fn => setTimeout(fn, 200);
  let i = 0;
  const step = () => { if (i < TOP_PREFETCH.length) { fetchPokemon(TOP_PREFETCH[i++]).catch(()=>{}); idle(step); } };
  idle(step);
}

async function init() {
  await migrateFromOldStorage().catch(() => {});
  bindEvents();
  initTypeCalc();
  initRecFilters();
  initAutocomplete('search-input',  'search-suggestions', name => searchPokemon(name));
  initAutocomplete('compare-input', 'compare-suggestions', name => searchCompare(name));
  renderTeamSlots();
  loadPokemonList().catch(() => {});
  prefetchTopPool();
  console.log('[PokéTracker] Ready — modular build');
}

document.addEventListener('DOMContentLoaded', init);
