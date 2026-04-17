/* =========================================================
   ITEMS.JS — Item recommendation engine
   ========================================================= */
'use strict';

/* =========================================================
   ITEM RECOMMENDATION LOGIC
   ========================================================= */

/**
 * Get top item recommendations for a Pokémon
 * @param {Object} pokemon - Pokémon data with stats, types, role
 * @param {Object} context - Additional context (team, matchup, hazards)
 * @returns {Array} - Sorted array of recommended items with reasons
 */
function getItemRecommendations(pokemon, context = {}) {
  const recommendations = [];
  const role = pokemon.role || detectRole(pokemon.stats);
  const stats = pokemon.stats;
  const types = pokemon.types;
  
  // Calculate various factors
  const isPhysical = stats.atk > stats.spa;
  const isSpecial = stats.spa > stats.atk;
  const isMixed = Math.abs(stats.atk - stats.spa) < 20;
  const isFast = stats.spe >= 100;
  const isSlow = stats.spe <= 60;
  const isBulky = (stats.hp + stats.def + stats.spd) >= 300;
  const isFragile = (stats.hp + stats.def + stats.spd) < 200;
  const isHazardWeak = types.some(t => HAZARD_WEAK_TYPES.includes(t));
  const hasEvolution = context.hasEvolution === false; // Eviolite eligible

  // Score each item
  for (const [itemId, item] of Object.entries(ITEMS)) {
    let score = 0;
    let reasons = [];

    // Role-based scoring
    if (item.roles.includes("any") || item.roles.includes(role.toLowerCase())) {
      score += item.priority;
    } else {
      score += item.priority * 0.5;
    }

    // Specific item logic
    switch (itemId) {
      case "choice-scarf":
        if (isSlow && (isPhysical || isSpecial)) {
          score += 40;
          reasons.push("Fixes low speed to revenge kill");
        } else if (isFast) {
          score += 25;
          reasons.push("Ensures you outspeed everything");
        }
        if (context.needsSpeedControl) {
          score += 30;
          reasons.push("Team needs speed control");
        }
        break;

      case "choice-band":
        if (isPhysical && stats.atk >= 110) {
          score += 40;
          reasons.push("Massive damage with high Attack");
        } else if (isPhysical && isSlow) {
          score += 30;
          reasons.push("Slow powerful wallbreaker");
        }
        break;

      case "choice-specs":
        if (isSpecial && stats.spa >= 110) {
          score += 40;
          reasons.push("Massive damage with high Sp. Atk");
        } else if (isSpecial && isSlow) {
          score += 30;
          reasons.push("Slow powerful wallbreaker");
        }
        break;

      case "life-orb":
        if (isMixed) {
          score += 40;
          reasons.push("Perfect for mixed attacking sets");
        } else if ((isPhysical || isSpecial) && !isSlow) {
          score += 35;
          reasons.push("High damage without move-locking");
        }
        if (isBulky) {
          score += 10;
          reasons.push("Can afford the HP cost");
        }
        break;

      case "leftovers":
        if (isBulky && isSlow) {
          score += 45;
          reasons.push("Excellent for defensive builds");
        }
        if (role === "Wall" || role === "Tank") {
          score += 35;
          reasons.push("Perfect for stall and recovery");
        }
        break;

      case "assault-vest":
        if (isBulky && (isPhysical || isSpecial) && !isSlow) {
          score += 40;
          reasons.push("Bulky attacker with special bulk boost");
        }
        if (stats.spd < 90 && isBulky) {
          score += 25;
          reasons.push("Patches low Sp. Def weakness");
        }
        break;

      case "focus-sash":
        if (isFragile && isFast) {
          score += 50;
          reasons.push("Guarantees setup for fragile sweeper");
        }
        if (role === "Sweeper" && stats.hp < 70) {
          score += 40;
          reasons.push("Essential survival for glass cannon");
        }
        if (context.hasHazards) {
          score -= 40;
          reasons.push("Ineffective with hazards up");
        }
        break;

      case "heavy-duty-boots":
        if (isHazardWeak) {
          score += 60;
          reasons.push("Critical for 4× Stealth Rock weakness");
        }
        if (context.hasHazards || context.hazardThreat) {
          score += 30;
          reasons.push("Protects against common hazards");
        }
        if (isFast && !isBulky) {
          score += 20;
          reasons.push("Safe pivot without hazard damage");
        }
        break;

      case "rocky-helmet":
        if (isBulky && stats.def >= 100) {
          score += 35;
          reasons.push("Punishes physical attackers");
        }
        if (role === "Wall") {
          score += 30;
          reasons.push("Stacks chip damage on switch-ins");
        }
        break;

      case "eviolite":
        if (hasEvolution) {
          score += 70;
          reasons.push("Makes unevolved mon incredibly bulky");
        } else {
          score = 0; // Can't use on evolved Pokémon
        }
        break;

      case "weakness-policy":
        if (isBulky && (isPhysical || isSpecial || isMixed)) {
          score += 35;
          reasons.push("Can survive hit and sweep");
        }
        if (types.length === 1 && isFragile) {
          score -= 20;
          reasons.push("May not survive super-effective hit");
        }
        break;

      case "expert-belt":
        if ((isPhysical || isSpecial) && !isSlow) {
          score += 25;
          reasons.push("Boosts coverage moves");
        }
        break;

      case "sitrus-berry":
        if (isBulky) {
          score += 20;
          reasons.push("Extra bulk for key matchups");
        }
        break;

      case "lum-berry":
        if (role === "Sweeper") {
          score += 25;
          reasons.push("Prevents status from stopping setup");
        }
        break;

      case "air-balloon":
        if (types.includes("electric") || types.includes("steel")) {
          score += 30;
          reasons.push("Temporary Ground immunity");
        }
        break;
    }

    // Context-specific boosts
    if (context.matchupType) {
      // Adjust based on specific matchup needs
      if (context.needsBulk && item.category === "bulk") score += 15;
      if (context.needsSpeed && item.category === "speed") score += 20;
      if (context.needsDamage && item.category === "damage") score += 15;
    }

    if (score > 0) {
      recommendations.push({
        id: itemId,
        item: item,
        score: score,
        reasons: reasons.length > 0 ? reasons : [item.description],
        badge: getCategoryBadge(item.category)
      });
    }
  }

  // Sort by score and return top recommendations
  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Get the best single item for a Pokémon
 */
function getBestItem(pokemon, context = {}) {
  const recommendations = getItemRecommendations(pokemon, context);
  return recommendations.length > 0 ? recommendations[0] : null;
}

/**
 * Get category badge info
 */
function getCategoryBadge(category) {
  const badges = {
    speed: { text: "Speed Control", class: "badge-speed" },
    damage: { text: "Damage Boost", class: "badge-damage" },
    bulk: { text: "Defensive", class: "badge-bulk" },
    recovery: { text: "Recovery", class: "badge-recovery" },
    survival: { text: "Survival", class: "badge-survival" },
    utility: { text: "Utility", class: "badge-utility" },
    setup: { text: "Setup Tool", class: "badge-setup" }
  };
  return badges[category] || { text: "Other", class: "badge-other" };
}

/**
 * Check if Pokémon is hazard-weak
 */
function isHazardWeak(types) {
  return types.some(t => HAZARD_WEAK_TYPES.includes(t));
}

/**
 * Calculate effective stats with item
 */
function applyItemEffects(pokemon, itemId) {
  const item = ITEMS[itemId];
  if (!item) return pokemon.stats;

  const modifiedStats = { ...pokemon.stats };

  if (item.speedMult) {
    modifiedStats.spe = Math.floor(modifiedStats.spe * item.speedMult);
  }
  if (item.defMult) {
    modifiedStats.def = Math.floor(modifiedStats.def * item.defMult);
  }
  if (item.spDefMult) {
    modifiedStats.spd = Math.floor(modifiedStats.spd * item.spDefMult);
  }

  return modifiedStats;
}

/**
 * Analyze team item distribution
 */
function analyzeTeamItems(team) {
  const warnings = [];
  const itemCounts = {};
  const choiceCount = team.filter(p => p && p.item && p.item.startsWith('choice-')).length;
  const sashCount = team.filter(p => p && p.item === 'focus-sash').length;

  team.forEach((pokemon, idx) => {
    if (!pokemon || !pokemon.item) return;
    
    itemCounts[pokemon.item] = (itemCounts[pokemon.item] || 0) + 1;
    
    // Check for duplicates
    if (itemCounts[pokemon.item] > 1 && !ITEMS[pokemon.item]?.consumable) {
      warnings.push({
        type: "duplicate",
        message: `Multiple Pokémon using ${ITEMS[pokemon.item]?.name}`,
        severity: "medium"
      });
    }
  });

  // Too many choice items
  if (choiceCount >= 3) {
    warnings.push({
      type: "flexibility",
      message: "Team has 3+ Choice items - may lack flexibility",
      severity: "medium"
    });
  }

  // Multiple Focus Sash
  if (sashCount > 1) {
    warnings.push({
      type: "redundant",
      message: "Multiple Focus Sash - only one can activate per battle",
      severity: "high"
    });
  }

  return { warnings, distribution: itemCounts };
}

/**
 * Get matchup-specific item recommendation
 */
function getMatchupItemRecommendation(yourPokemon, opponentPokemon) {
  const yourStats = yourPokemon.stats;
  const oppStats = opponentPokemon.stats;
  const speedDiff = yourStats.spe - oppStats.spe;
  
  let recommendation = null;

  // Need speed?
  if (speedDiff < 0 && speedDiff > -50) {
    recommendation = {
      item: "choice-scarf",
      reason: `Outspeeds ${opponentPokemon.name} (${oppStats.spe}) with Choice Scarf`
    };
  }
  // Bulk vs one-shot?
  else if (yourStats.hp + yourStats.def < 150) {
    recommendation = {
      item: "focus-sash",
      reason: `Survives OHKO from ${opponentPokemon.name} with Focus Sash`
    };
  }
  // Damage boost needed?
  else if (yourStats.atk > yourStats.spa) {
    recommendation = {
      item: "choice-band",
      reason: `Maximize damage output vs ${opponentPokemon.name}`
    };
  }

  return recommendation;
}
