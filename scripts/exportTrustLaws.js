/**
 * Export trust laws data to JSON for the embedder
 */
const fs = require('fs');
const path = require('path');

// Read the TypeScript source file
const sourcePath = path.join(__dirname, '../src/data/stateTrustLaws.ts');
const content = fs.readFileSync(sourcePath, 'utf8');

// Extract state names and their data
const states = [];
const stateRegex = /state:\s*'([^']+)'/g;
let match;

while ((match = stateRegex.exec(content)) !== null) {
  states.push(match[1]);
}

console.log(`Found ${states.length} states:`);
states.forEach(s => console.log(`  - ${s}`));
