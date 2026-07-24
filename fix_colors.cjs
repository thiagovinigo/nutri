const fs = require('fs');
const path = require('path');

const directories = [
  'src/features/nutricionista/components',
  'src/features/paciente/components'
];

// Mapeamento de cores hardcoded para CSS variables (CRM e Patient)
const colorMap = {
  // Whites and light grays to Surface or Bg
  '#FFFFFF': 'var(--crm-surface)',
  '#ffffff': 'var(--crm-surface)',
  '#FFF': 'var(--crm-surface)',
  '#fff': 'var(--crm-surface)',
  '#F8FAFC': 'var(--crm-surface-2, var(--crm-bg))',
  '#f8fafc': 'var(--crm-surface-2, var(--crm-bg))',
  '#F1F5F9': 'var(--crm-surface-2)',
  '#f1f5f9': 'var(--crm-surface-2)',
  
  // Borders
  '#E2E8F0': 'var(--crm-border)',
  '#e2e8f0': 'var(--crm-border)',
  '#CBD5E1': 'var(--crm-border)',
  '#cbd5e1': 'var(--crm-border)',
  
  // Text Main
  '#1E293B': 'var(--crm-text-main)',
  '#1e293b': 'var(--crm-text-main)',
  '#0F172A': 'var(--crm-text-main)',
  '#0f172a': 'var(--crm-text-main)',
  '#334155': 'var(--crm-text-main)',
  '#334155': 'var(--crm-text-main)',
  '#1E3A8A': 'var(--crm-text-main)',
  '#1e3a8a': 'var(--crm-text-main)',
  '#475569': 'var(--crm-text-main)',
  '#475569': 'var(--crm-text-main)',
  
  // Text Muted
  '#64748B': 'var(--crm-text-muted)',
  '#64748b': 'var(--crm-text-muted)',
  '#94A3B8': 'var(--crm-text-muted)',
  '#94a3b8': 'var(--crm-text-muted)',
  
  // Soft backgrounds
  '#EFF6FF': 'var(--crm-surface-2, var(--crm-bg))',
  '#eff6ff': 'var(--crm-surface-2, var(--crm-bg))',
  '#FFFBEB': 'var(--crm-warn-soft, #FEF3C7)',
  '#fffbeb': 'var(--crm-warn-soft, #FEF3C7)',
  '#FEF2F2': 'var(--crm-danger-soft, #FEE2E2)',
  '#fef2f2': 'var(--crm-danger-soft, #FEE2E2)'
};

function processFile(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Substituição simples
  for (const [hex, cssVar] of Object.entries(colorMap)) {
    // Escapa o # para a regex
    const regex = new RegExp(`['"]${hex}['"]`, 'g');
    content = content.replace(regex, `'${cssVar}'`);
  }

  // Lidar com a tabela onMouseEnter/onMouseLeave de PatientList (onde tinha o hover branco)
  if (filePath.includes('PatientList.jsx')) {
    content = content.replace(/e\.currentTarget\.style\.backgroundColor = ['"]#f8fafc['"]/g, "e.currentTarget.style.backgroundColor = 'var(--crm-surface-2, var(--crm-bg))'");
    content = content.replace(/e\.currentTarget\.style\.backgroundColor = ['"]transparent['"]/g, "e.currentTarget.style.backgroundColor = 'transparent'");
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    traverseDir(dir);
  }
});

console.log('Finished replacing colors.');
