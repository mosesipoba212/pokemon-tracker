/* =========================================================
   DATA/POOL.JS — Curated competitive Pokémon pool.
   Deduplicated, cleaned IDs, slim schema.
   TOP_PREFETCH: top ~20 most-used, pre-warmed on startup.
   ========================================================= */
'use strict';

/**
 * Top 20 Pokémon to silently pre-cache at startup.
 * Chosen by competitive prevalence in PokéMMO / VGC formats.
 */
const TOP_PREFETCH = [
  'garchomp', 'dragapult', 'corviknight', 'ferrothorn', 'toxapex',
  'clefable', 'togekiss', 'tyranitar', 'scizor', 'blissey',
  'umbreon', 'sylveon', 'rotom-wash', 'incineroar', 'rillaboom',
  'grimmsnarl', 'urshifu', 'salamence', 'metagross', 'mimikyu',
];

/**
 * Competitive pool with corrected IDs and deduplicated names.
 * Fields: id, name, types[], roles[], bst, speed
 */
const COMPETITIVE_POOL = [
  // ── Physical Sweepers ──
  { id:445, name:'garchomp',         types:['dragon','ground'],    roles:['physical-sweeper'],                   bst:600, speed:102 },
  { id:248, name:'tyranitar',        types:['rock','dark'],        roles:['physical-sweeper','tank'],            bst:600, speed:61  },
  { id:212, name:'scizor',           types:['bug','steel'],        roles:['physical-sweeper'],                   bst:500, speed:65  },
  { id:373, name:'salamence',        types:['dragon','flying'],    roles:['physical-sweeper','hybrid'],          bst:600, speed:100 },
  { id:376, name:'metagross',        types:['steel','psychic'],    roles:['physical-sweeper','tank'],            bst:600, speed:70  },
  { id:472, name:'gliscor',          types:['ground','flying'],    roles:['wall','physical-sweeper'],            bst:510, speed:95  },
  { id:701, name:'hawlucha',         types:['fighting','flying'],  roles:['physical-sweeper'],                   bst:500, speed:118 },
  { id:812, name:'rillaboom',        types:['grass'],              roles:['physical-sweeper'],                   bst:530, speed:85  },
  { id:887, name:'dragapult',        types:['dragon','ghost'],     roles:['physical-sweeper','special-sweeper'], bst:600, speed:142 },
  { id:214, name:'heracross',        types:['bug','fighting'],     roles:['physical-sweeper'],                   bst:500, speed:85  },
  { id:257, name:'blaziken',         types:['fire','fighting'],    roles:['physical-sweeper','special-sweeper'], bst:530, speed:80  },
  { id:645, name:'landorus',         types:['ground','flying'],    roles:['physical-sweeper','support'],         bst:600, speed:101 },
  { id:889, name:'zacian',           types:['fairy'],              roles:['physical-sweeper'],                   bst:660, speed:138 },
  { id:727, name:'incineroar',       types:['fire','dark'],        roles:['tank','support'],                     bst:530, speed:60  },
  { id:625, name:'bisharp',          types:['dark','steel'],       roles:['physical-sweeper'],                   bst:490, speed:70  },
  { id:892, name:'urshifu',          types:['fighting','dark'],    roles:['physical-sweeper'],                   bst:550, speed:97  },
  { id:430, name:'honchkrow',        types:['dark','flying'],      roles:['physical-sweeper'],                   bst:505, speed:71  },
  { id:260, name:'swampert',         types:['water','ground'],     roles:['tank','physical-sweeper'],            bst:535, speed:60  },
  { id:534, name:'conkeldurr',       types:['fighting'],           roles:['physical-sweeper','tank'],            bst:505, speed:45  },
  // ── Special Sweepers ──
  { id:6,   name:'charizard',        types:['fire','flying'],      roles:['special-sweeper'],                    bst:534, speed:100 },
  { id:149, name:'dragonite',        types:['dragon','flying'],    roles:['physical-sweeper','special-sweeper'], bst:600, speed:80  },
  { id:196, name:'espeon',           types:['psychic'],            roles:['special-sweeper'],                    bst:525, speed:110 },
  { id:282, name:'gardevoir',        types:['psychic','fairy'],    roles:['special-sweeper','support'],          bst:518, speed:80  },
  { id:380, name:'latias',           types:['dragon','psychic'],   roles:['special-sweeper','support'],          bst:600, speed:110 },
  { id:381, name:'latios',           types:['dragon','psychic'],   roles:['special-sweeper'],                    bst:600, speed:110 },
  { id:479, name:'rotom-wash',       types:['electric','water'],   roles:['support','special-sweeper'],          bst:520, speed:86  },
  { id:609, name:'chandelure',       types:['ghost','fire'],       roles:['special-sweeper'],                    bst:520, speed:61  },
  { id:635, name:'hydreigon',        types:['dark','dragon'],      roles:['special-sweeper'],                    bst:600, speed:98  },
  { id:658, name:'greninja',         types:['water','dark'],       roles:['special-sweeper'],                    bst:530, speed:122 },
  { id:637, name:'volcarona',        types:['bug','fire'],         roles:['special-sweeper'],                    bst:550, speed:100 },
  { id:778, name:'mimikyu',          types:['ghost','fairy'],      roles:['physical-sweeper'],                   bst:476, speed:96  },
  { id:462, name:'magnezone',        types:['electric','steel'],   roles:['special-sweeper'],                    bst:535, speed:60  },
  { id:849, name:'toxtricity',       types:['electric','poison'],  roles:['special-sweeper'],                    bst:502, speed:75  },
  { id:243, name:'raikou',           types:['electric'],           roles:['special-sweeper'],                    bst:580, speed:115 },
  { id:596, name:'galvantula',       types:['bug','electric'],     roles:['special-sweeper','support'],          bst:472, speed:108 },
  { id:716, name:'xerneas',          types:['fairy'],              roles:['special-sweeper','support'],          bst:680, speed:99  },
  { id:717, name:'yveltal',          types:['dark','flying'],      roles:['special-sweeper','tank'],             bst:680, speed:99  },
  // ── Walls / Tanks ──
  { id:9,   name:'blastoise',        types:['water'],              roles:['tank','support'],                     bst:530, speed:78  },
  { id:143, name:'snorlax',          types:['normal'],             roles:['wall','tank'],                        bst:540, speed:30  },
  { id:242, name:'blissey',          types:['normal'],             roles:['wall'],                               bst:540, speed:55  },
  { id:250, name:'ho-oh',            types:['fire','flying'],      roles:['tank'],                               bst:680, speed:90  },
  { id:302, name:'sableye',          types:['dark','ghost'],       roles:['support','wall'],                     bst:380, speed:50  },
  { id:350, name:'milotic',          types:['water'],              roles:['wall','support'],                     bst:540, speed:81  },
  { id:395, name:'empoleon',         types:['water','steel'],      roles:['tank','wall'],                        bst:530, speed:60  },
  { id:437, name:'bronzong',         types:['steel','psychic'],    roles:['wall','support'],                     bst:500, speed:33  },
  { id:598, name:'ferrothorn',       types:['grass','steel'],      roles:['wall','support'],                     bst:489, speed:20  },
  { id:700, name:'sylveon',          types:['fairy'],              roles:['wall','support'],                     bst:525, speed:60  },
  { id:730, name:'primarina',        types:['water','fairy'],      roles:['special-sweeper','wall'],             bst:530, speed:60  },
  { id:748, name:'toxapex',          types:['poison','water'],     roles:['wall','support'],                     bst:364, speed:35  },
  { id:879, name:'copperajah',       types:['steel'],              roles:['tank','wall'],                        bst:485, speed:30  },
  { id:488, name:'cresselia',        types:['psychic'],            roles:['wall','support'],                     bst:600, speed:85  },
  { id:80,  name:'slowbro',          types:['water','psychic'],    roles:['wall','tank'],                        bst:490, speed:30  },
  { id:113, name:'chansey',          types:['normal'],             roles:['wall','support'],                     bst:450, speed:50  },
  // ── Support ──
  { id:36,  name:'clefable',         types:['fairy'],              roles:['support','wall'],                     bst:483, speed:60  },
  { id:197, name:'umbreon',          types:['dark'],               roles:['wall','support'],                     bst:525, speed:65  },
  { id:227, name:'skarmory',         types:['steel','flying'],     roles:['wall','support'],                     bst:465, speed:70  },
  { id:407, name:'roserade',         types:['grass','poison'],     roles:['support','special-sweeper'],          bst:515, speed:90  },
  { id:468, name:'togekiss',         types:['fairy','flying'],     roles:['support','tank'],                     bst:545, speed:80  },
  { id:823, name:'corviknight',      types:['flying','steel'],     roles:['wall','support'],                     bst:495, speed:67  },
  { id:861, name:'grimmsnarl',       types:['dark','fairy'],       roles:['support'],                            bst:510, speed:60  },
  { id:800, name:'necrozma',         types:['psychic'],            roles:['special-sweeper','tank'],             bst:600, speed:79  },
  // ── Hybrid / Utility ──
  { id:503, name:'samurott',         types:['water'],              roles:['physical-sweeper','special-sweeper'], bst:528, speed:70  },
  { id:537, name:'seismitoad',       types:['water','ground'],     roles:['tank','wall'],                        bst:509, speed:74  },
  { id:623, name:'golurk',           types:['ground','ghost'],     roles:['physical-sweeper'],                   bst:495, speed:55  },
];

/* Deduplicate by name (name is the unique key) */
const POOL_DEDUPED = Array.from(
  new Map(COMPETITIVE_POOL.map(p => [p.name, p])).values()
);
