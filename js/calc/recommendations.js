/* =========================================================
   CALC/RECOMMENDATIONS.JS — Team recommendation scoring engine.
   Memoised by team hash + filter so the grid doesn't recompute
   on rerenders when nothing has actually changed.
   Requires: constants.js (ALL_TYPES), typeChart.js, stats.js,
             pool.js (POOL_DEDUPED)
   ========================================================= */
'use strict';

const _recMemo = new Map();

function _teamHash(team) {
  return team.map(p => p ? p.name : '_').join('|');
}

/**
 * Score every candidate in POOL_DEDUPED against the current
 * team's gaps and return the top 10 sorted by score desc.
 */
function getTeamRecommendations(team, filterMode = 'all') {
  const members = team.filter(Boolean);
  if (!members.length) return [];

  const cacheKey = _teamHash(team) + '||' + filterMode;
  if (_recMemo.has(cacheKey)) return _recMemo.get(cacheKey);

  const teamNames = new Set(members.map(m => m.name));

  /* ── Role gaps ── */
  const roles = members.map(m => detectRole(m.stats).toLowerCase().replace(' ', '-'));
  const wantsPhySweeper = !roles.some(r => r.includes('physical'));
  const wantsSpcSweeper = !roles.some(r => r.includes('special'));
  const wantsWallTank   = !roles.some(r => r === 'wall' || r === 'tank');
  const wantsSupport    = !roles.some(r => r === 'support');

  /* ── Type weaknesses ── */
  const weaknessScore = {};
  ALL_TYPES.forEach(atk => {
    weaknessScore[atk] = members.reduce((s, m) => s + getTypeEffectiveness(atk, m.types), 0);
  });
  const dangerousTypes = Object.entries(weaknessScore)
    .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);

  const avgSpeed  = members.reduce((s, m) => s + m.stats.spe, 0) / members.length;
  const teamTypes = new Set(members.flatMap(m => m.types));

  /* ── Score each candidate ── */
  const scored = POOL_DEDUPED
    .filter(c => !teamNames.has(c.name))
    .map(candidate => {
      let score = 0;
      const reasons = [];

      // Coverage: resists team's top weaknesses
      let coverageBonus = 0;
      dangerousTypes.forEach(atkType => {
        if (getTypeEffectiveness(atkType, candidate.types) <= 0.5) {
          coverageBonus += (weaknessScore[atkType] - 1) * 2;
          reasons.push({ text: `Resists ${atkType}`, cls: 'tag-coverage' });
        }
      });
      score += Math.min(coverageBonus, 30);

      // Role gaps
      if (wantsPhySweeper && candidate.roles.includes('physical-sweeper')) {
        score += 15; reasons.push({ text: 'Physical Sweeper gap', cls: 'tag-role' });
      }
      if (wantsSpcSweeper && candidate.roles.includes('special-sweeper')) {
        score += 15; reasons.push({ text: 'Special Sweeper gap', cls: 'tag-role' });
      }
      if (wantsWallTank && (candidate.roles.includes('wall') || candidate.roles.includes('tank'))) {
        score += 15; reasons.push({ text: 'Defensive gap', cls: 'tag-role' });
      }
      if (wantsSupport && candidate.roles.includes('support')) {
        score += 10; reasons.push({ text: 'Support gap', cls: 'tag-role' });
      }

      // Speed diversity
      const candSpeed50 = calcStat(candidate.speed, 0, 31, 50, 1.0);
      if (candSpeed50 > avgSpeed + 20) {
        score += 8; reasons.push({ text: `Fast (${candSpeed50} Spd)`, cls: 'tag-speed' });
      } else if (candSpeed50 < avgSpeed - 20) {
        score += 2; // Trick Room variety
      }

      // Type diversity
      const newTypes = candidate.types.filter(t => !teamTypes.has(t));
      score += newTypes.length * 5;

      // Meta-relevance: slight BST bonus
      score += Math.floor((candidate.bst - 400) / 40);

      // Apply active filter
      if (filterMode === 'coverage' && !reasons.some(r => r.cls === 'tag-coverage')) score = -1;
      else if (filterMode === 'role'  && !reasons.some(r => r.cls === 'tag-role'))    score = -1;
      else if (filterMode === 'speed' && !reasons.some(r => r.cls === 'tag-speed'))   score = -1;

      // Deduplicate reason tags
      const seen = new Set();
      const uniqueReasons = reasons.filter(r => {
        if (seen.has(r.text)) return false;
        seen.add(r.text); return true;
      }).slice(0, 3);

      return { candidate, score, reasons: uniqueReasons };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Evict oldest entry when cache is large
  if (_recMemo.size > 60) _recMemo.delete(_recMemo.keys().next().value);
  _recMemo.set(cacheKey, scored);
  return scored;
}
