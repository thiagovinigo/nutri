const fs = require('fs');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix crashes caused by m.name being undefined
  code = code.replace(/m\.name\.match\(\/Dia/g, "(m.name || '').match(/Dia");
  code = code.replace(/test\(m\.name\)/g, "test(m.name || '')");

  if (filePath.includes('DietPlan.jsx')) {
    code = code.replace(/handleOpenSub\(m, mIdx, f, fIdx\)/g, "handleOpenSub(f)");
  }

  fs.writeFileSync(filePath, code, 'utf8');
}

fixFile('src/features/paciente/components/DietPlan.jsx');
fixFile('src/features/paciente/components/QuestBoard.jsx');

console.log('Crashes fixed successfully');
