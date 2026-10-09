const fs = require('fs');
let code = fs.readFileSync('game.js', 'utf8');
code = code.replace(
  "bossState.hp--;",
  "// Apply rebirth multiplier to boss damage\n    const damage = Math.max(1, state.rebirthMultiplier);\n    bossState.hp -= damage;"
);
fs.writeFileSync('game.js', code);
