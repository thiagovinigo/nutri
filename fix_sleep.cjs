const fs = require('fs');
const path = 'src/features/paciente/components/QuestBoard.jsx';
let text = fs.readFileSync(path, 'utf8');

if (!text.includes('import { createPortal }')) {
    text = text.replace('import React, { useState, useRef, useEffect } from \'react\';', 'import React, { useState, useRef, useEffect } from \'react\';\nimport { createPortal } from \'react-dom\';');
}

text = text.replace('{showSleepModal && (\\n        <div style={{', '{showSleepModal && createPortal(\\n        <div style={{');
text = text.replace('</button>\\n              </div>\\n            </div>\\n          </div>\\n        )}', '</button>\\n              </div>\\n            </div>\\n          </div>,\\n          document.body\\n        )}');

fs.writeFileSync(path, text);
