/* =========================================================
   DATA/POKEAPI.JS — PokéAPI fetching (mem → IDB → network)
   Stores slim normalised data: no raw API bloat.
   ========================================================= */
'use strict';

async function fetchPokemon(nameOrId) {
  const key = String(nameOrId).toLowerCase().trim();

  // 1. Mem + IDB cache (getCached checks both internally)
  const cached = await getCached(key);
  if (cached) return cached;

  // 2. Network fetch
  const res = await fetch(`${POKEAPI_BASE}/pokemon/${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error(`Pokémon "${key}" not found (${res.status})`);
  const raw = await res.json();

  // Build slim normalised stats object
  const stats = {};
  raw.stats.forEach(s => {
    const k = API_STAT_MAP[s.stat.name];
    if (k) stats[k] = s.base_stat;
  });
  stats.total = Object.values(stats).reduce((a, b) => a + b, 0);

  // Store only what we need — omit raw API noise
  const data = {
    id:             raw.id,
    name:           raw.name,
    sprite:         `/sprites/sprites/pokemon/${raw.id}.png`,
    shiny:          `/sprites/sprites/pokemon/shiny/${raw.id}.png`,
    artwork:        `/sprites/sprites/pokemon/other/official-artwork/${raw.id}.png`,
    spriteFallback: raw.sprites.front_default || '',
    types:          raw.types.map(t => t.type.name),
    abilities:      raw.abilities.map(a => ({
      name: a.ability.name, hidden: a.is_hidden, slot: a.slot,
    })),
    stats,
  };

  await setCached(key, data);
  return data;
}

let _listCache = null;

async function loadPokemonList() {
  if (_listCache) return _listCache;
  const cached = localStorage.getItem('poke_list_cache');
  if (cached) { _listCache = JSON.parse(cached); return _listCache; }
  const res  = await fetch(`${POKEAPI_BASE}/pokemon?limit=10000`);
  const json = await res.json();
  _listCache = json.results.map(p => p.name);
  localStorage.setItem('poke_list_cache', JSON.stringify(_listCache));
  return _listCache;
}
