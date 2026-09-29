// scripts/add-nojekyll.cjs
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'build'); // cambia in 'dist' se usi Svelte senza Kit
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
console.log('✅ Creato build/.nojekyll');
