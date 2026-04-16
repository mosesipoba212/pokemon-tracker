/* =========================================================
   CALC/TYPECHART.JS — Type effectiveness helpers
   ========================================================= */
'use strict';

function getTypeEffectiveness(attackingType, defendingTypes) {
  let mult = 1;
  defendingTypes.forEach(def => {
    const row = TYPE_CHART[attackingType];
    if (row && row[def] !== undefined) mult *= row[def];
  });
  return mult;
}

function getTeamWeaknesses(team) {
  const validMembers = team.filter(Boolean);
  const result = {};
  ALL_TYPES.forEach(attackType => {
    let totalMult = 0;
    validMembers.forEach(p => { totalMult += getTypeEffectiveness(attackType, p.types); });
    result[attackType] = totalMult;
  });
  return result;
}

function computeDefenderWeaknesses(defTypes) {
  const result = {};
  ALL_TYPES.forEach(atk => { result[atk] = getTypeEffectiveness(atk, defTypes); });
  return result;
}

/* Best STAB multiplier an attacker can get vs defender types */
function bestSTAB(attackerTypes, defTypes) {
  return Math.max(...attackerTypes.map(t => getTypeEffectiveness(t, defTypes)), 0);
}
