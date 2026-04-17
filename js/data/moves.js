/* =========================================================
   MOVES.JS — Competitive moves database
   ========================================================= */
'use strict';

const MOVES = {
  // ══════════════════════════════════════════════════════
  // PHYSICAL ATTACKS
  // ══════════════════════════════════════════════════════
  "earthquake": {
    name: "Earthquake",
    type: "ground",
    category: "physical",
    power: 100,
    accuracy: 100,
    pp: 10,
    tags: ["stab", "coverage", "reliable"],
    description: "Powerful Ground-type STAB with perfect accuracy",
    priority: 95
  },
  "dragon-claw": {
    name: "Dragon Claw",
    type: "dragon",
    category: "physical",
    power: 80,
    accuracy: 100,
    pp: 15,
    tags: ["stab", "reliable"],
    description: "Reliable Dragon STAB attack",
    priority: 85
  },
  "stone-edge": {
    name: "Stone Edge",
    type: "rock",
    category: "physical",
    power: 100,
    accuracy: 80,
    pp: 5,
    tags: ["coverage", "high-risk"],
    description: "High-power coverage vs Flying, Fire, Ice, and Bug",
    priority: 90
  },
  "fire-fang": {
    name: "Fire Fang",
    type: "fire",
    category: "physical",
    power: 65,
    accuracy: 95,
    pp: 15,
    tags: ["coverage", "flinch"],
    description: "Fire coverage for Steel and Grass types",
    priority: 75
  },
  "outrage": {
    name: "Outrage",
    type: "dragon",
    category: "physical",
    power: 120,
    accuracy: 100,
    pp: 10,
    tags: ["stab", "high-power", "risky"],
    description: "Massive Dragon damage but locks user in",
    priority: 85
  },
  "close-combat": {
    name: "Close Combat",
    type: "fighting",
    category: "physical",
    power: 120,
    accuracy: 100,
    pp: 5,
    tags: ["stab", "coverage", "high-power"],
    description: "Powerful Fighting coverage with defense drops",
    priority: 90
  },
  "u-turn": {
    name: "U-turn",
    type: "bug",
    category: "physical",
    power: 70,
    accuracy: 100,
    pp: 20,
    tags: ["pivot", "momentum"],
    description: "Deals damage and switches out",
    priority: 95
  },
  "body-press": {
    name: "Body Press",
    type: "fighting",
    category: "physical",
    power: 80,
    accuracy: 100,
    pp: 10,
    tags: ["stab", "coverage", "defense-scaling"],
    description: "Uses Defense stat for damage calculation",
    priority: 90
  },
  "brave-bird": {
    name: "Brave Bird",
    type: "flying",
    category: "physical",
    power: 120,
    accuracy: 100,
    pp: 15,
    tags: ["stab", "recoil"],
    description: "Powerful Flying STAB with recoil",
    priority: 90
  },
  "iron-head": {
    name: "Iron Head",
    type: "steel",
    category: "physical",
    power: 80,
    accuracy: 100,
    pp: 15,
    tags: ["stab", "flinch"],
    description: "Reliable Steel STAB with flinch chance",
    priority: 85
  },
  "thunder-punch": {
    name: "Thunder Punch",
    type: "electric",
    category: "physical",
    power: 75,
    accuracy: 100,
    pp: 15,
    tags: ["coverage"],
    description: "Electric coverage for Water and Flying",
    priority: 80
  },
  "ice-punch": {
    name: "Ice Punch",
    type: "ice",
    category: "physical",
    power: 75,
    accuracy: 100,
    pp: 15,
    tags: ["coverage"],
    description: "Ice coverage for Dragon, Grass, Flying, Ground",
    priority: 85
  },
  "poison-jab": {
    name: "Poison Jab",
    type: "poison",
    category: "physical",
    power: 80,
    accuracy: 100,
    pp: 20,
    tags: ["coverage"],
    description: "Poison coverage for Fairy types",
    priority: 80
  },
  "shadow-claw": {
    name: "Shadow Claw",
    type: "ghost",
    category: "physical",
    power: 70,
    accuracy: 100,
    pp: 15,
    tags: ["coverage", "high-crit"],
    description: "Ghost coverage with high crit rate",
    priority: 80
  },
  "knock-off": {
    name: "Knock Off",
    type: "dark",
    category: "physical",
    power: 65,
    accuracy: 100,
    pp: 20,
    tags: ["utility", "coverage"],
    description: "Removes opponent's held item",
    priority: 90
  },
  
  // ══════════════════════════════════════════════════════
  // SPECIAL ATTACKS
  // ══════════════════════════════════════════════════════
  "hydro-pump": {
    name: "Hydro Pump",
    type: "water",
    category: "special",
    power: 110,
    accuracy: 80,
    pp: 5,
    tags: ["stab", "high-power"],
    description: "Powerful Water STAB attack",
    priority: 90
  },
  "volt-switch": {
    name: "Volt Switch",
    type: "electric",
    category: "special",
    power: 70,
    accuracy: 100,
    pp: 20,
    tags: ["pivot", "momentum", "stab"],
    description: "Electric damage + switch out",
    priority: 95
  },
  "thunderbolt": {
    name: "Thunderbolt",
    type: "electric",
    category: "special",
    power: 90,
    accuracy: 100,
    pp: 15,
    tags: ["stab", "coverage", "reliable"],
    description: "Reliable Electric STAB or coverage",
    priority: 90
  },
  "ice-beam": {
    name: "Ice Beam",
    type: "ice",
    category: "special",
    power: 90,
    accuracy: 100,
    pp: 10,
    tags: ["coverage", "reliable"],
    description: "Reliable Ice coverage vs Dragon, Grass, Flying",
    priority: 90
  },
  "flamethrower": {
    name: "Flamethrower",
    type: "fire",
    category: "special",
    power: 90,
    accuracy: 100,
    pp: 15,
    tags: ["stab", "coverage", "reliable"],
    description: "Reliable Fire STAB or coverage",
    priority: 90
  },
  "shadow-ball": {
    name: "Shadow Ball",
    type: "ghost",
    category: "special",
    power: 80,
    accuracy: 100,
    pp: 15,
    tags: ["stab", "coverage"],
    description: "Ghost STAB with Sp. Def drop chance",
    priority: 85
  },
  "psychic": {
    name: "Psychic",
    type: "psychic",
    category: "special",
    power: 90,
    accuracy: 100,
    pp: 10,
    tags: ["stab", "coverage"],
    description: "Psychic STAB vs Fighting and Poison",
    priority: 85
  },
  "focus-blast": {
    name: "Focus Blast",
    type: "fighting",
    category: "special",
    power: 120,
    accuracy: 70,
    pp: 5,
    tags: ["coverage", "high-power", "risky"],
    description: "Powerful Fighting coverage but risky accuracy",
    priority: 85
  },
  "draco-meteor": {
    name: "Draco Meteor",
    type: "dragon",
    category: "special",
    power: 130,
    accuracy: 90,
    pp: 5,
    tags: ["stab", "nuke", "stat-drop"],
    description: "Massive Dragon nuke with Sp. Atk drop",
    priority: 90
  },
  "moonblast": {
    name: "Moonblast",
    type: "fairy",
    category: "special",
    power: 95,
    accuracy: 100,
    pp: 15,
    tags: ["stab", "coverage"],
    description: "Strong Fairy STAB vs Dragon, Dark, Fighting",
    priority: 90
  },
  "energy-ball": {
    name: "Energy Ball",
    type: "grass",
    category: "special",
    power: 90,
    accuracy: 100,
    pp: 10,
    tags: ["stab", "coverage"],
    description: "Grass STAB vs Water, Ground, Rock",
    priority: 85
  },
  "sludge-bomb": {
    name: "Sludge Bomb",
    type: "poison",
    category: "special",
    power: 90,
    accuracy: 100,
    pp: 10,
    tags: ["stab", "coverage"],
    description: "Poison STAB vs Fairy and Grass",
    priority: 85
  },
  
  // ══════════════════════════════════════════════════════
  // SETUP MOVES
  // ══════════════════════════════════════════════════════
  "swords-dance": {
    name: "Swords Dance",
    type: "normal",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 20,
    tags: ["setup", "boost"],
    description: "+2 Attack sharply raises physical damage",
    priority: 95
  },
  "dragon-dance": {
    name: "Dragon Dance",
    type: "dragon",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 20,
    tags: ["setup", "boost", "speed"],
    description: "+1 Attack and +1 Speed for sweep potential",
    priority: 98
  },
  "nasty-plot": {
    name: "Nasty Plot",
    type: "dark",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 20,
    tags: ["setup", "boost"],
    description: "+2 Sp. Atk sharply raises special damage",
    priority: 95
  },
  "calm-mind": {
    name: "Calm Mind",
    type: "psychic",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 20,
    tags: ["setup", "boost", "bulk"],
    description: "+1 Sp. Atk and +1 Sp. Def for special tank",
    priority: 95
  },
  "bulk-up": {
    name: "Bulk Up",
    type: "fighting",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 20,
    tags: ["setup", "boost", "bulk"],
    description: "+1 Attack and +1 Defense for physical bulk",
    priority: 90
  },
  "iron-defense": {
    name: "Iron Defense",
    type: "steel",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 15,
    tags: ["setup", "boost", "bulk"],
    description: "+2 Defense sharply raises physical bulk",
    priority: 85
  },
  
  // ══════════════════════════════════════════════════════
  // UTILITY / SUPPORT
  // ══════════════════════════════════════════════════════
  "roost": {
    name: "Roost",
    type: "flying",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 10,
    tags: ["recovery", "utility"],
    description: "Restores 50% HP for longevity",
    priority: 98
  },
  "recover": {
    name: "Recover",
    type: "normal",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 10,
    tags: ["recovery", "utility"],
    description: "Restores 50% HP for longevity",
    priority: 98
  },
  "slack-off": {
    name: "Slack Off",
    type: "normal",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 10,
    tags: ["recovery", "utility"],
    description: "Restores 50% HP for stalling",
    priority: 98
  },
  "pain-split": {
    name: "Pain Split",
    type: "normal",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 20,
    tags: ["recovery", "utility"],
    description: "Averages HP with opponent",
    priority: 85
  },
  "will-o-wisp": {
    name: "Will-O-Wisp",
    type: "fire",
    category: "status",
    power: 0,
    accuracy: 85,
    pp: 15,
    tags: ["utility", "status", "burn"],
    description: "Burns opponent to halve Attack",
    priority: 95
  },
  "thunder-wave": {
    name: "Thunder Wave",
    type: "electric",
    category: "status",
    power: 0,
    accuracy: 90,
    pp: 20,
    tags: ["utility", "status", "paralyze"],
    description: "Paralyzes opponent to cut Speed",
    priority: 90
  },
  "toxic": {
    name: "Toxic",
    type: "poison",
    category: "status",
    power: 0,
    accuracy: 90,
    pp: 10,
    tags: ["utility", "status", "poison"],
    description: "Badly poisons for stall damage",
    priority: 90
  },
  "stealth-rock": {
    name: "Stealth Rock",
    type: "rock",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 20,
    tags: ["hazard", "utility"],
    description: "Sets entry hazards for chip damage",
    priority: 98
  },
  "defog": {
    name: "Defog",
    type: "flying",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 15,
    tags: ["hazard-removal", "utility"],
    description: "Removes hazards from both sides",
    priority: 95
  },
  "rapid-spin": {
    name: "Rapid Spin",
    type: "normal",
    category: "physical",
    power: 50,
    accuracy: 100,
    pp: 40,
    tags: ["hazard-removal", "utility"],
    description: "Removes hazards + raises Speed",
    priority: 90
  },
  "protect": {
    name: "Protect",
    type: "normal",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 10,
    tags: ["utility", "stall"],
    description: "Protects from attacks this turn",
    priority: 95
  },
  "substitute": {
    name: "Substitute",
    type: "normal",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 10,
    tags: ["utility", "setup"],
    description: "Creates decoy at 25% HP cost",
    priority: 90
  },
  "taunt": {
    name: "Taunt",
    type: "dark",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 20,
    tags: ["utility", "anti-support"],
    description: "Prevents status moves for 3 turns",
    priority: 85
  },
  "trick": {
    name: "Trick",
    type: "psychic",
    category: "status",
    power: 0,
    accuracy: 100,
    pp: 10,
    tags: ["utility", "choice"],
    description: "Swaps held items with opponent",
    priority: 80
  }
};

// Move type matchups for coverage
const COVERAGE_MATCHUPS = {
  "fire": ["steel", "bug", "grass", "ice"],
  "water": ["fire", "ground", "rock"],
  "grass": ["water", "ground", "rock"],
  "electric": ["water", "flying"],
  "ice": ["dragon", "grass", "flying", "ground"],
  "fighting": ["normal", "ice", "rock", "dark", "steel"],
  "poison": ["grass", "fairy"],
  "ground": ["fire", "electric", "poison", "rock", "steel"],
  "flying": ["grass", "fighting", "bug"],
  "psychic": ["fighting", "poison"],
  "bug": ["grass", "psychic", "dark"],
  "rock": ["fire", "ice", "flying", "bug"],
  "ghost": ["ghost", "psychic"],
  "dragon": ["dragon"],
  "dark": ["psychic", "ghost"],
  "steel": ["ice", "rock", "fairy"],
  "fairy": ["dragon", "dark", "fighting"]
};
