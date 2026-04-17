/* =========================================================
   CALC/MATCHUP.JS — Matchup analysis with memoisation.
   Key: `nameA|nameB|sA|sB` — pure function of inputs.
   ========================================================= */
'use strict';

const _matchupMemo = new Map();

function generateMatchupAnalysis(a, b, sA, sB) {
  const key = `${a.name}|${b.name}|${sA}|${sB}`;
  if (_matchupMemo.has(key)) return _matchupMemo.get(key);

  const lines = [];

  // Speed
  if (sA > sB)      lines.push({ type:'good',    text:`<b>${cap(a.name)}</b> outspeeds ${cap(b.name)} by ${sA - sB} points at Lv50 — it moves first.` });
  else if (sB > sA) lines.push({ type:'bad',     text:`<b>${cap(b.name)}</b> outspeeds ${cap(a.name)} by ${sB - sA} points — ${cap(a.name)} will be attacked first.` });
  else              lines.push({ type:'neutral',  text:`Both tie at ${sA} Speed — priority moves or natures decide order.` });

  // STAB type matchups
  let aSuperEff = 0, bSuperEff = 0;
  a.types.forEach(atk => { aSuperEff = Math.max(aSuperEff, getTypeEffectiveness(atk, b.types)); });
  b.types.forEach(atk => { bSuperEff = Math.max(bSuperEff, getTypeEffectiveness(atk, a.types)); });

  if (aSuperEff >= 2)
    lines.push({ type:'good',    text:`<b>${cap(a.name)}</b>'s STAB type${a.types.length>1?'s':''} (${a.types.join('/')}) hit${aSuperEff===4?' for 4×':' super-effectively'} against ${cap(b.name)}.` });
  else if (aSuperEff === 0)
    lines.push({ type:'bad',     text:`<b>${cap(a.name)}</b>'s STAB is completely negated by ${cap(b.name)}'s typing — needs coverage moves.` });
  else if (aSuperEff < 1)
    lines.push({ type:'bad',     text:`<b>${cap(a.name)}</b>'s STAB is resisted by ${cap(b.name)} — relies on coverage moves.` });
  else
    lines.push({ type:'neutral', text:`<b>${cap(a.name)}</b>'s STAB lands neutrally against ${cap(b.name)}.` });

  if (bSuperEff >= 2)
    lines.push({ type:'bad',     text:`<b>${cap(b.name)}</b>'s STAB type${b.types.length>1?'s':''} (${b.types.join('/')}) hit${bSuperEff===4?' for 4×':' super-effectively'} against ${cap(a.name)}.` });
  else if (bSuperEff === 0)
    lines.push({ type:'good',    text:`<b>${cap(b.name)}</b>'s STAB is completely negated by ${cap(a.name)}'s typing.` });
  else if (bSuperEff < 1)
    lines.push({ type:'good',    text:`<b>${cap(b.name)}</b>'s STAB is resisted by ${cap(a.name)}.` });
  else
    lines.push({ type:'neutral', text:`<b>${cap(b.name)}</b>'s STAB lands neutrally against ${cap(a.name)}.` });

  // Physical vs Special offense/defense matchup
  const aOffPhys = a.stats.atk >= a.stats.spa;
  if (aOffPhys && b.stats.def < b.stats.spd)
    lines.push({ type:'good',    text:`<b>${cap(a.name)}</b> is a physical attacker and ${cap(b.name)}'s Defense (${b.stats.def}) is lower than its Sp.Def (${b.stats.spd}) — exploitable.` });
  else if (aOffPhys && b.stats.def > b.stats.spd + 20)
    lines.push({ type:'bad',     text:`<b>${cap(b.name)}</b> has high physical Defense (${b.stats.def}) — ${cap(a.name)}'s physical attacks are less effective.` });

  const bOffPhys = b.stats.atk >= b.stats.spa;
  if (bOffPhys && a.stats.def < a.stats.spd)
    lines.push({ type:'bad',     text:`<b>${cap(b.name)}</b> is a physical attacker vs ${cap(a.name)}'s weaker Defense (${a.stats.def}) — vulnerable.` });
  else if (!bOffPhys && a.stats.spd < a.stats.def)
    lines.push({ type:'bad',     text:`<b>${cap(b.name)}</b> is a special attacker vs ${cap(a.name)}'s lower Sp.Def (${a.stats.spd}) — vulnerable.` });

  // Bulk comparison
  const bulkA = a.stats.hp + a.stats.def + a.stats.spd;
  const bulkB = b.stats.hp + b.stats.def + b.stats.spd;
  if (bulkA > bulkB + 60)
    lines.push({ type:'good',    text:`<b>${cap(a.name)}</b> is significantly bulkier (${bulkA} vs ${bulkB}) — more likely to survive a hit.` });
  else if (bulkB > bulkA + 60)
    lines.push({ type:'bad',     text:`<b>${cap(b.name)}</b> is significantly bulkier (${bulkB} vs ${bulkA}) — ${cap(a.name)} may need two hits.` });

  // Role summary
  lines.push({ type:'neutral', text:`Roles — ${cap(a.name)}: <b>${detectRole(a.stats)}</b> | ${cap(b.name)}: <b>${detectRole(b.stats)}</b>` });

  // Evict oldest entry if cache grows large
  if (_matchupMemo.size > 200) {
    _matchupMemo.delete(_matchupMemo.keys().next().value);
  }
  _matchupMemo.set(key, lines);
  return lines;
}
