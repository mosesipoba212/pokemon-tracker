/* =========================================================
   CALC/STATS.JS — Stat formulae, nature multipliers, role detection
   ========================================================= */
'use strict';

function calcHP(base, ev = 0, iv = 31, level = 50) {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

function calcStat(base, ev = 0, iv = 31, level = 50, nature = 1.0) {
  return Math.floor(
    (Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * nature
  );
}

function getNatureMultipliers(natureName) {
  const n = NATURES[natureName] || [null, null];
  const mults = { hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1 };
  if (n[0]) mults[n[0]] = 1.1;
  if (n[1]) mults[n[1]] = 0.9;
  return mults;
}

function computeFinalStats(baseStats, evs, ivs, level, natureName) {
  const mults = getNatureMultipliers(natureName);
  const result = {};
  STAT_KEYS.forEach(k => {
    const base = baseStats[k] || 0;
    const ev   = evs[k]  || 0;
    const iv   = ivs[k]  !== undefined ? ivs[k] : 31;
    result[k]  = k === 'hp'
      ? calcHP(base, ev, iv, level)
      : calcStat(base, ev, iv, level, mults[k]);
  });
  return result;
}

function detectRole(stats) {
  const { atk, def, spa, spd, spe, hp } = stats;
  const bulk = hp + def + spd;
  if (spe >= 100 && atk >= 100 && spa < 80) return 'Physical Sweeper';
  if (spe >= 100 && spa >= 100 && atk < 80) return 'Special Sweeper';
  if (spe >= 100 && atk >= 90 && spa >= 90)  return 'Hybrid Sweeper';
  if (bulk >= 350 && atk < 70 && spa < 70)   return 'Wall';
  if (bulk >= 290 && (hp >= 95 || def >= 90 || spd >= 90)) return 'Tank';
  if (stats.total < 500 || (spe >= 70 && atk < 70 && spa < 70)) return 'Support';
  return 'Hybrid';
}

function getMoveRecommendations(poke) {
  const { stats, types } = poke;
  const role = detectRole(stats);
  const recs = [];
  if (role.includes('Physical')) {
    recs.push('Return / Body Slam (STAB filler)');
    recs.push('Close Combat (coverage)');
    if (types.includes('dragon')) recs.push('Dragon Claw / Outrage (STAB)');
    if (types.includes('fire'))   recs.push('Flare Blitz (STAB)');
    recs.push('Sword Dance (setup)');
  } else if (role.includes('Special')) {
    recs.push('Nasty Plot (setup)');
    recs.push('Shadow Ball / Dark Pulse (coverage)');
    if (types.includes('fire'))    recs.push('Flamethrower / Fire Blast (STAB)');
    if (types.includes('water'))   recs.push('Surf / Hydro Pump (STAB)');
    if (types.includes('psychic')) recs.push('Psyshock (STAB)');
  } else if (role === 'Wall' || role === 'Tank') {
    recs.push('Recover / Roost (sustain)');
    recs.push('Toxic / Will-O-Wisp (chip)');
    recs.push('Stealth Rock (support)');
    recs.push('Protect (scouting)');
  } else {
    recs.push('Stealth Rock / Spikes (hazards)');
    recs.push('U-turn / Volt Switch (momentum)');
    recs.push('Heal Bell / Aromatherapy (cleric)');
    recs.push('Tailwind / Trick Room (speed control)');
  }
  recs.push('Coverage move (fill weakness)');
  return recs.slice(0, 4);
}

function getAbilitySuggestions(abilities, role) {
  const synergies = {
    'speed-boost':    'Perfect for sweepers — Speed triples in extended games.',
    'intimidate':     'Great on physical attackers/tanks — nerfs physical threats on switch-in.',
    'levitate':       'Immunity to Ground-type moves — situational but powerful.',
    'regenerator':    'Ideal for pivots and walls — restores 1/3 HP on switch.',
    'magic-guard':    'No residual damage — perfect for Life Orb, entry hazard immunity.',
    'prankster':      'Priority status/support moves — excellent on support Pokémon.',
    'rough-skin':     'Chips physical attackers — good on bulky or defensive Pokémon.',
    'unburden':       'Doubles Speed after item use — strong on sweepers with berries.',
    'huge-power':     'Doubles Attack — essential offensive ability.',
    'multiscale':     'Halves damage at full HP — superb for tanky pivots.',
    'drought':        'Sets sun — great for Fire/Grass synergy teams.',
    'drizzle':        'Sets rain — enables Swift Swim abusers.',
    'sand-stream':    'Sets sand — pairs with Rock/Ground/Steel types.',
    'snow-warning':   'Sets hail/snow — enables Blizzard and Aurora Veil.',
    'protean':        'Changes type before every move — massive offensive coverage.',
    'libero':         'Same as Protean — high offensive utility.',
  };
  return abilities.map(a => ({
    name:   a.name,
    hidden: a.hidden,
    tip:    synergies[a.name] || 'No specific synergy note. Check Bulbapedia for details.',
  }));
}
