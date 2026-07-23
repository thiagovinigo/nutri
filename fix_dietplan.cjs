const fs = require('fs');
const path = 'src/features/paciente/components/DietPlan.jsx';
let text = fs.readFileSync(path, 'utf8');

if (!text.includes('import { createPortal }')) {
    text = text.replace('import React, { useState } from \'react\';', 'import React, { useState } from \'react\';\nimport { createPortal } from \'react-dom\';');
}

// Fix tacoData lookups
text = text.replace(
  'const dbFood = tacoData.find(db => db.id === f.foodId);',
  'const dbFood = tacoData.find(db => String(db.id) === String(f.foodId) || db.name === f.name);'
);

text = text.replace(
  'const baseDbFood = tacoData.find(db => db.id === food.foodId);',
  'const baseDbFood = tacoData.find(db => String(db.id) === String(food.foodId) || db.name === food.name);'
);

text = text.replace(
  'const alts = tacoData.filter(t => t.category === tacoData.find(db => db.id === food.foodId)?.category && t.id !== food.foodId);',
  'const baseForAlts = tacoData.find(db => String(db.id) === String(food.foodId) || db.name === food.name);\n      const alts = tacoData.filter(t => t.category === baseForAlts?.category && String(t.id) !== String(food.foodId));'
);

// Fix portals for modals
text = text.replace(
  '{subModal && (\\n        <div style={{',
  '{subModal && createPortal(\\n        <div style={{'
);
text = text.replace(
  '</button>\\n              </div>\\n            </div>\\n          </div>\\n        )}',
  '</button>\\n              </div>\\n            </div>\\n          </div>,\\n          document.body\\n        )}'
);

text = text.replace(
  '{showShoppingList && (\\n        <div style={{',
  '{showShoppingList && createPortal(\\n        <div style={{'
);
text = text.replace(
  '</button>\\n              </div>\\n            </div>\\n          </div>\\n        )}',
  '</button>\\n              </div>\\n            </div>\\n          </div>,\\n          document.body\\n        )}'
);

text = text.replace(
  '{aiModal && (\\n        <div style={{',
  '{aiModal && createPortal(\\n        <div style={{'
);

text = text.replace(
  '</div>\\n            </div>\\n          </div>\\n        )}',
  '</div>\\n            </div>\\n          </div>,\\n          document.body\\n        )}'
);

fs.writeFileSync(path, text);
