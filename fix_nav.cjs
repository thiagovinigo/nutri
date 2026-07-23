const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(
  '.crm-table {',
  `.crm-nav-btn:hover {
  background-color: var(--crm-hover, var(--crm-surface-2));
}
.crm-nav-btn.active {
  background-color: var(--crm-hover, var(--crm-surface-2));
  font-weight: 600;
  border-left-color: var(--crm-accent);
}
.crm-table {`
);

fs.writeFileSync('src/index.css', css, 'utf8');
console.log('Fixed generic hover states in index.css');
