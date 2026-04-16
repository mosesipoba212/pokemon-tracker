/* =========================================================
   DATA/CONSTANTS.JS — All static configuration constants
   ========================================================= */
'use strict';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const MAX_TEAM_SIZE = 6;
const STAT_MAX = 255;

const NATURES = {
  neutral:  [null,   null],
  lonely:   ['atk',  'def'],
  brave:    ['atk',  'spe'],
  adamant:  ['atk',  'spa'],
  naughty:  ['atk',  'spd'],
  bold:     ['def',  'atk'],
  relaxed:  ['def',  'spe'],
  impish:   ['def',  'spa'],
  lax:      ['def',  'spd'],
  modest:   ['spa',  'atk'],
  mild:     ['spa',  'def'],
  quiet:    ['spa',  'spe'],
  rash:     ['spa',  'spd'],
  calm:     ['spd',  'atk'],
  gentle:   ['spd',  'def'],
  sassy:    ['spd',  'spe'],
  careful:  ['spd',  'spa'],
  timid:    ['spe',  'atk'],
  hasty:    ['spe',  'def'],
  jolly:    ['spe',  'spa'],
  naive:    ['spe',  'spd'],
};

const STAT_KEYS  = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
const STAT_NAMES = { hp:'HP', atk:'Attack', def:'Defense', spa:'Sp.Atk', spd:'Sp.Def', spe:'Speed' };
const API_STAT_MAP = {
  'hp': 'hp', 'attack': 'atk', 'defense': 'def',
  'special-attack': 'spa', 'special-defense': 'spd', 'speed': 'spe',
};

const COMMON_SPEED_TIERS = [
  { label: 'Base 30 (Azumarill)', base: 50 },
  { label: 'Base 60 (Clefable)',  base: 97 },
  { label: 'Base 80 (Nidoking)', base: 128 },
  { label: 'Base 85 (Gengar)',   base: 135 },
  { label: 'Base 90 (Togekiss)', base: 142 },
  { label: 'Base 100 (Garchomp)',base: 157 },
  { label: 'Base 108 (Weavile)', base: 169 },
  { label: 'Base 110 (Mienshao)',base: 172 },
  { label: 'Base 115 (Latios)',  base: 179 },
  { label: 'Base 120 (Starmie)', base: 187 },
  { label: 'Base 130 (Jolteon)', base: 202 },
  { label: 'Base 145 (Deoxys-S)',base: 225 },
];

const TYPE_CHART = {
  normal:   { rock:0.5, ghost:0, steel:0.5 },
  fire:     { fire:0.5, water:0.5, grass:2, ice:2, bug:2, rock:0.5, dragon:0.5, steel:2 },
  water:    { fire:2, water:0.5, grass:0.5, ground:2, rock:2, dragon:0.5 },
  electric: { water:2, electric:0.5, grass:0.5, ground:0, flying:2, dragon:0.5 },
  grass:    { fire:0.5, water:2, grass:0.5, poison:0.5, ground:2, flying:0.5, bug:0.5, rock:2, dragon:0.5, steel:0.5 },
  ice:      { fire:0.5, water:0.5, grass:2, ice:0.5, ground:2, flying:2, dragon:2, steel:0.5 },
  fighting: { normal:2, ice:2, poison:0.5, flying:0.5, psychic:0.5, bug:0.5, rock:2, ghost:0, dark:2, steel:2, fairy:0.5 },
  poison:   { grass:2, poison:0.5, ground:0.5, rock:0.5, ghost:0.5, steel:0, fairy:2 },
  ground:   { fire:2, electric:2, grass:0.5, poison:2, flying:0, bug:0.5, rock:2, steel:2 },
  flying:   { electric:0.5, grass:2, fighting:2, bug:2, rock:0.5, steel:0.5 },
  psychic:  { fighting:2, poison:2, psychic:0.5, dark:0, steel:0.5 },
  bug:      { fire:0.5, grass:2, fighting:0.5, flying:0.5, psychic:2, ghost:0.5, dark:2, steel:0.5, fairy:0.5 },
  rock:     { fire:2, ice:2, fighting:0.5, ground:0.5, flying:2, bug:2, steel:0.5 },
  ghost:    { normal:0, fighting:0, poison:0.5, bug:0.5, ghost:2, dark:0.5 },
  dragon:   { dragon:2, steel:0.5, fairy:0 },
  dark:     { fighting:0.5, psychic:2, ghost:2, dark:0.5, fairy:0.5 },
  steel:    { fire:0.5, water:0.5, electric:0.5, ice:2, rock:2, steel:0.5, fairy:2,
              fighting:0.5, ground:0.5, flying:0.5, normal:0.5, grass:0.5,
              psychic:0.5, dragon:0.5, dark:0.5, bug:0.5, ghost:0.5, poison:0 },
  fairy:    { fire:0.5, fighting:2, poison:0.5, dragon:2, dark:2, steel:0.5, bug:0.5 },
};

const ALL_TYPES = Object.keys(TYPE_CHART);

/* Utility: capitalise a pokémon name for display */
function cap(name) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
