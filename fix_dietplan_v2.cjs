const fs = require('fs');
const path = 'src/features/paciente/components/DietPlan.jsx';
let text = fs.readFileSync(path, 'utf8');

if (!text.includes('import { createPortal }')) {
    text = text.replace('import React, { useState } from \'react\';', 'import React, { useState } from \'react\';\nimport { createPortal } from \'react-dom\';');
}

text = text.replace(
  'const baseDbFood = tacoData.find(db => db.id === food.foodId);',
  'const baseDbFood = tacoData.find(db => String(db.id) === String(food.foodId) || db.name === food.name);'
);

text = text.replace(
  'const alts = tacoData.filter(t => t.category === tacoData.find(db => db.id === food.foodId)?.category && t.id !== food.foodId);',
  'const baseForAlts = tacoData.find(db => String(db.id) === String(food.foodId) || db.name === food.name);\n    const alts = tacoData.filter(t => t.category === baseForAlts?.category && String(t.id) !== String(food.foodId));'
);

text = text.replace(
  'const dbFood = tacoData.find(db => db.id === f.foodId);',
  'const dbFood = tacoData.find(db => String(db.id) === String(f.foodId) || db.name === f.name);'
);

// We need to carefully replace the portal parts.
// The portals are at the bottom of the file.

text = text.replace(
  '{subModal && (\n        <div style={{ position: \\'fixed\\',',
  '{subModal && createPortal(\n        <div style={{ position: \\'fixed\\','
);

// We find the closing div of subModal.
text = text.replace(
  '</p>\n              )}\n            </div>\n          </div>\n        </div>\n      )}',
  '</p>\n              )}\n            </div>\n          </div>\n        </div>,\n        document.body\n      )}'
);

text = text.replace(
  '{showShoppingList && (\n        <div style={{ position: \\'fixed\\',',
  '{showShoppingList && createPortal(\n        <div style={{ position: \\'fixed\\','
);

text = text.replace(
  '</button>\n          </div>\n        </div>\n      )}',
  '</button>\n          </div>\n        </div>,\n        document.body\n      )}'
);

fs.writeFileSync(path, text);
console.log('Script executed');
