/* =========================================================
   MOVESETS.JS — Competitive moveset recommendation engine
   ========================================================= */
'use strict';

/**
 * Generate recommended moveset for a Pokémon
 * @param {Object} pokemon - Pokémon data
 * @param {Object} context - Additional context (item, team, opponent)
 * @returns {Object} - Moveset recommendation with main + alternatives
 */
function getRecommendedMoveset(pokemon, context = {}) {
  const stats = pokemon.stats;
  const types = pokemon.types;
  const role = pokemon.role || detectRole(stats);
  const item = context.item || pokemon.selectedItem;
  
  // Determine offensive preference
  const isPhysical = stats.atk > stats.spa;
  const isSpecial = stats.spa > stats.atk;
  const isMixed = Math.abs(stats.atk - stats.spa) < 20;
  const isFast = stats.spe >= 100;
  const isSlow = stats.spe <= 60;
  const isBulky = (stats.hp + stats.def + stats.spd) >= 300;
  
  let recommendations = [];
  let alternatives = [];
  
  // ═══════════════════════════════════════════════════════
  // STEP 1: ADD STAB MOVES
  // ═══════════════════════════════════════════════════════
  const stabMoves = getSTABMoves(types, isPhysical ? "physical" : "special");
  recommendations.push(...stabMoves.slice(0, 2)); // Top 2 STAB moves
  
  // ═══════════════════════════════════════════════════════
  // STEP 2: ADD COVERAGE MOVES
  // ═══════════════════════════════════════════════════════
  if (recommendations.length < 3) {
    const coverageMoves = getCoverageMoves(types, isPhysical ? "physical" : "special", context.opponent);
    recommendations.push(...coverageMoves.slice(0, 3 - recommendations.length));
  }
  
  // ═══════════════════════════════════════════════════════
  // STEP 3: ADD UTILITY / SETUP BASED ON ROLE & ITEM
  // ═══════════════════════════════════════════════════════
  const hasChoiceItem = item && item.startsWith('choice-');
  const hasAssaultVest = item === 'assault-vest';
  
  if (!hasAssaultVest && recommendations.length < 4) {
    let utilityMove = null;
    
    // Setup moves for sweepers (if not Choice locked)
    if (!hasChoiceItem && (role === "Sweeper" || role === "Mixed Attacker")) {
      if (isFast) {
        utilityMove = isPhysical ? "swords-dance" : "nasty-plot";
      } else if (isSlow && isBulky) {
        utilityMove = isPhysical ? "dragon-dance" : "calm-mind";
      }
    }
    
    // Recovery for bulky mons
    if (!utilityMove && isBulky) {
      if (types.includes("flying")) utilityMove = "roost";
      else if (stats.hp >= 90) utilityMove = "recover";
    }
    
    // Utility moves for support
    if (!utilityMove && (role === "Support" || role === "Tank" || role === "Wall")) {
      if (types.includes("flying") || types.includes("bug")) utilityMove = "defog";
      else if (types.includes("rock") || types.includes("ground")) utilityMove = "stealth-rock";
      else if (types.includes("fire") || types.includes("ghost")) utilityMove = "will-o-wisp";
      else if (types.includes("electric")) utilityMove = "thunder-wave";
    }
    
    // Pivot moves for Choice items
    if (!utilityMove && hasChoiceItem) {
      if (types.includes("electric")) utilityMove = "volt-switch";
      else if (types.includes("bug")) utilityMove = "u-turn";
    }
    
    if (utilityMove && MOVES[utilityMove]) {
      recommendations.push({ moveId: utilityMove, ...MOVES[utilityMove], reason: getRoleReason(utilityMove, role, item) });
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // STEP 4: FILL REMAINING SLOTS WITH COVERAGE
  // ═══════════════════════════════════════════════════════
  while (recommendations.length < 4) {
    const allCoverage = getCoverageMoves(types, isPhysical ? "physical" : "special", context.opponent);
    const unusedCoverage = allCoverage.filter(m => !recommendations.find(r => r.moveId === m.moveId));
    if (unusedCoverage.length > 0) {
      recommendations.push(unusedCoverage[0]);
    } else {
      recommendations.push({ moveId: "substitute", ...MOVES["substitute"], reason: "Utility filler" });
      break;
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // STEP 5: GENERATE ALTERNATIVES
  // ═══════════════════════════════════════════════════════
  alternatives = getAlternativeMoves(types, isPhysical ? "physical" : "special", recommendations, role);
  
  return {
    role: role,
    mainMoves: recommendations.slice(0, 4),
    alternatives: alternatives.slice(0, 6)
  };
}

/**
 * Get STAB moves for given types
 */
function getSTABMoves(types, category) {
  const moves = [];
  
  for (const [moveId, move] of Object.entries(MOVES)) {
    if (types.includes(move.type) && move.category === category && move.power > 0) {
      moves.push({
        moveId: moveId,
        ...move,
        reason: `${move.power}-power ${move.type.toUpperCase()} STAB`
      });
    }
  }
  
  // Sort by priority
  return moves.sort((a, b) => b.priority - a.priority);
}

/**
 * Get coverage moves
 */
function getCoverageMoves(types, category, opponent = null) {
  const moves = [];
  
  for (const [moveId, move] of Object.entries(MOVES)) {
    if (!types.includes(move.type) && move.category === category && move.power > 0) {
      let reason = `Coverage vs ${getCoverageTypes(move.type).slice(0, 2).join(", ")}`;
      let priority = move.priority;
      
      // Boost priority if super effective vs opponent
      if (opponent && opponent.types) {
        const effectiveness = getTypeEffectiveness(move.type, opponent.types);
        if (effectiveness >= 2) {
          reason = `Super effective vs ${opponent.name}`;
          priority += 20;
        }
      }
      
      moves.push({
        moveId: moveId,
        ...move,
        reason: reason,
        priority: priority
      });
    }
  }
  
  return moves.sort((a, b) => b.priority - a.priority);
}

/**
 * Get alternative moves
 */
function getAlternativeMoves(types, category, currentMoves, role) {
  const alternatives = [];
  const usedIds = currentMoves.map(m => m.moveId);
  
  // Add alternative STAB
  for (const [moveId, move] of Object.entries(MOVES)) {
    if (usedIds.includes(moveId)) continue;
    
    if (types.includes(move.type) && move.category === category) {
      alternatives.push({
        moveId: moveId,
        ...move,
        reason: `Alternative ${move.type} STAB`
      });
    }
  }
  
  // Add alternative coverage
  for (const [moveId, move] of Object.entries(MOVES)) {
    if (usedIds.includes(moveId)) continue;
    
    if (!types.includes(move.type) && move.category === category && move.power > 0) {
      alternatives.push({
        moveId: moveId,
        ...move,
        reason: `Alternative coverage`
      });
    }
  }
  
  // Add alternative utility
  for (const [moveId, move] of Object.entries(MOVES)) {
    if (usedIds.includes(moveId)) continue;
    
    if (move.category === "status" && move.tags.includes("utility")) {
      alternatives.push({
        moveId: moveId,
        ...move,
        reason: `Utility option`
      });
    }
  }
  
  return alternatives.sort((a, b) => b.priority - a.priority);
}

/**
 * Get coverage types for a move type
 */
function getCoverageTypes(moveType) {
  return COVERAGE_MATCHUPS[moveType] || [];
}

/**
 * Get reason for role-specific moves
 */
function getRoleReason(moveId, role, item) {
  const move = MOVES[moveId];
  
  if (move.tags.includes("setup")) {
    return "Setup sweep potential";
  }
  if (move.tags.includes("recovery")) {
    return "Sustain for longevity";
  }
  if (move.tags.includes("hazard")) {
    return "Essential entry hazard";
  }
  if (move.tags.includes("hazard-removal")) {
    return "Clear hazards for team";
  }
  if (move.tags.includes("pivot")) {
    if (item && item.startsWith('choice-')) {
      return "Pivot to maintain momentum";
    }
    return "Gain momentum advantage";
  }
  if (move.tags.includes("status")) {
    return "Cripple physical attackers";
  }
  
  return move.description;
}

/**
 * Get moveset role label
 */
function getMovesetRoleLabel(role, item) {
  if (item === "choice-scarf") return "Fast Revenge Killer";
  if (item === "choice-band") return "Physical Wallbreaker";
  if (item === "choice-specs") return "Special Wallbreaker";
  if (item === "focus-sash") return "Suicide Lead";
  if (item === "assault-vest") return "Offensive Tank";
  
  return role;
}

/**
 * Check if opponent is weak to move
 */
function isEffectiveVsOpponent(move, opponent) {
  if (!opponent || !opponent.types) return false;
  const effectiveness = getTypeEffectiveness(move.type, opponent.types);
  return effectiveness >= 2;
}
