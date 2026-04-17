/* =========================================================
   ITEMS.JS — Competitive held items database
   ========================================================= */
'use strict';

const ITEMS = {
  // ── CHOICE ITEMS ──
  "choice-scarf": {
    name: "Choice Scarf",
    image: "/sprites/sprites/items/choice-scarf.png",
    category: "speed",
    effect: "Boosts Speed by 50% but locks into one move",
    description: "Essential for revenge killing and speed control. Best on fast attackers or slow threats that need to outspeed.",
    tags: ["speed control", "revenge killer", "setup stopper"],
    speedMult: 1.5,
    lockMove: true,
    roles: ["sweeper", "revenge-killer"],
    priority: 95
  },
  "choice-band": {
    name: "Choice Band",
    image: "/sprites/sprites/items/choice-band.png",
    category: "damage",
    effect: "Boosts Attack by 50% but locks into one move",
    description: "Massive physical power boost. Best on strong physical attackers with good coverage.",
    tags: ["wallbreaker", "physical offense", "high damage"],
    attackMult: 1.5,
    lockMove: true,
    roles: ["sweeper", "wallbreaker"],
    priority: 90
  },
  "choice-specs": {
    name: "Choice Specs",
    image: "/sprites/sprites/items/choice-specs.png",
    category: "damage",
    effect: "Boosts Sp. Atk by 50% but locks into one move",
    description: "Massive special power boost. Best on strong special attackers with wide coverage.",
    tags: ["wallbreaker", "special offense", "high damage"],
    spAttackMult: 1.5,
    lockMove: true,
    roles: ["sweeper", "wallbreaker"],
    priority: 90
  },

  // ── POWER ITEMS ──
  "life-orb": {
    name: "Life Orb",
    image: "/sprites/sprites/items/life-orb.png",
    category: "damage",
    effect: "Boosts all moves by 30% but takes 10% HP per attack",
    description: "Flexible damage boost without move-locking. Best on mixed attackers or versatile sweepers.",
    tags: ["offense", "wallbreaker", "mixed attacker", "versatile"],
    powerMult: 1.3,
    recoil: 0.1,
    roles: ["sweeper", "wallbreaker", "mixed-attacker"],
    priority: 85
  },
  "expert-belt": {
    name: "Expert Belt",
    image: "/sprites/sprites/items/expert-belt.png",
    category: "damage",
    effect: "Boosts super-effective moves by 20%",
    description: "Rewards good coverage. Best on Pokémon with diverse move pools.",
    tags: ["coverage", "versatile", "sneaky damage"],
    superEffectiveMult: 1.2,
    roles: ["sweeper", "wallbreaker"],
    priority: 70
  },
  "weakness-policy": {
    name: "Weakness Policy",
    image: "/sprites/sprites/items/weakness-policy.png",
    category: "setup",
    effect: "Sharply boosts Attack and Sp. Atk when hit super-effectively",
    description: "High-risk setup tool. Best on bulky attackers that can survive a super-effective hit.",
    tags: ["setup", "comeback", "offensive bulk"],
    consumable: true,
    roles: ["tank", "sweeper"],
    priority: 75
  },

  // ── DEFENSIVE ITEMS ──
  "leftovers": {
    name: "Leftovers",
    image: "/sprites/sprites/items/leftovers.png",
    category: "recovery",
    effect: "Restores 1/16 of max HP every turn",
    description: "Reliable passive recovery. Best on defensive Pokémon and stall builds.",
    tags: ["bulk", "stall", "longevity", "recovery"],
    recovery: 0.0625,
    roles: ["tank", "wall", "support"],
    priority: 95
  },
  "assault-vest": {
    name: "Assault Vest",
    image: "/sprites/sprites/items/assault-vest.png",
    category: "bulk",
    effect: "Boosts Sp. Def by 50% but prevents status moves",
    description: "Massive special bulk. Best on bulky attackers facing special threats.",
    tags: ["special tank", "pivot", "bulk"],
    spDefMult: 1.5,
    noStatus: true,
    roles: ["tank", "wallbreaker"],
    priority: 85
  },
  "rocky-helmet": {
    name: "Rocky Helmet",
    image: "/sprites/sprites/items/rocky-helmet.png",
    category: "bulk",
    effect: "Damages attackers by 1/6 of their max HP on contact",
    description: "Punishes physical attackers. Best on physical walls that force switches.",
    tags: ["chip damage", "physical wall", "hazard stacking"],
    contactDamage: 0.166,
    roles: ["wall", "tank"],
    priority: 80
  },
  "eviolite": {
    name: "Eviolite",
    image: "/sprites/sprites/items/eviolite.png",
    category: "bulk",
    effect: "Boosts Defense and Sp. Def by 50% on unevolved Pokémon",
    description: "Makes unevolved Pokémon incredibly bulky. Only works on non-final evolutions.",
    tags: ["bulk", "unevolved", "defensive"],
    defMult: 1.5,
    spDefMult: 1.5,
    evolvedOnly: false,
    roles: ["wall", "tank"],
    priority: 100
  },

  // ── SURVIVAL ITEMS ──
  "focus-sash": {
    name: "Focus Sash",
    image: "/sprites/sprites/items/focus-sash.png",
    category: "survival",
    effect: "Guarantees survival of one OHKO at full HP",
    description: "Essential for frail setup sweepers and suicide leads. Vulnerable to hazards.",
    tags: ["setup", "lead", "survival", "glass cannon"],
    consumable: true,
    surviveOHKO: true,
    hazardWeak: true,
    roles: ["sweeper", "lead"],
    priority: 90
  },
  "sitrus-berry": {
    name: "Sitrus Berry",
    image: "/sprites/sprites/items/sitrus-berry.png",
    category: "recovery",
    effect: "Restores 25% HP when HP drops below 50%",
    description: "One-time bulk boost. Good on Pokémon that need extra survivability.",
    tags: ["recovery", "bulk", "clutch"],
    consumable: true,
    recovery: 0.25,
    roles: ["tank", "sweeper", "support"],
    priority: 75
  },

  // ── UTILITY ITEMS ──
  "heavy-duty-boots": {
    name: "Heavy-Duty Boots",
    image: "/sprites/sprites/items/heavy-duty-boots.png",
    category: "utility",
    effect: "Grants immunity to entry hazards",
    description: "Critical for hazard-weak Pokémon. Best on 4× Stealth Rock weak types or fragile pivots.",
    tags: ["hazard immunity", "pivot", "utility"],
    hazardImmune: true,
    roles: ["any"],
    priority: 100
  },
  "lum-berry": {
    name: "Lum Berry",
    image: "/sprites/sprites/items/lum-berry.png",
    category: "utility",
    effect: "Cures any status condition once",
    description: "One-time status immunity. Good anti-status tech or for setup sweepers.",
    tags: ["status immunity", "setup", "anti-support"],
    consumable: true,
    statusImmune: true,
    roles: ["sweeper", "support"],
    priority: 70
  },
  "air-balloon": {
    name: "Air Balloon",
    image: "/sprites/sprites/items/air-balloon.png",
    category: "utility",
    effect: "Grants Ground immunity until hit",
    description: "Temporary Ground immunity. Best on slow Ground-weak Pokémon.",
    tags: ["type immunity", "surprise factor"],
    consumable: true,
    groundImmune: true,
    roles: ["any"],
    priority: 65
  },

  // ── BERRIES ──
  "wiki-berry": {
    name: "Wiki Berry",
    image: "/sprites/sprites/items/berries/wiki.png",
    category: "recovery",
    effect: "Restores 33% HP at 25% HP (dislikes spicy)",
    description: "Strong recovery berry for physically defensive Pokémon.",
    tags: ["recovery", "bulk"],
    consumable: true,
    recovery: 0.33,
    roles: ["tank", "wall"],
    priority: 70
  },
  "iapapa-berry": {
    name: "Iapapa Berry",
    image: "/sprites/sprites/items/berries/iapapa.png",
    category: "recovery",
    effect: "Restores 33% HP at 25% HP (dislikes sour)",
    description: "Strong recovery berry for specially defensive Pokémon.",
    tags: ["recovery", "bulk"],
    consumable: true,
    recovery: 0.33,
    roles: ["tank", "wall"],
    priority: 70
  }
};

// Type-based hazard weakness
const HAZARD_WEAK_TYPES = ["fire", "flying", "bug", "ice"];

// Item sprite fallback
const ITEM_SPRITE_FALLBACK = "/sprites/sprites/items/gen5/poke-ball.png";
