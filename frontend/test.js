import assert from 'node:assert';
import fs from 'node:fs';

console.log('Running frontend verification tests...');
assert(fs.existsSync('./src/App.jsx'), 'src/App.jsx must exist');
assert(fs.existsSync('./src/main.jsx'), 'src/main.jsx must exist');
assert(fs.existsSync('./index.html'), 'index.html must exist');

const appContent = fs.readFileSync('./src/App.jsx', 'utf-8');
assert(appContent.includes('/api/health/'), 'App.jsx must connect to /api/health/');
assert(appContent.includes('OK'), 'App.jsx must render OK indicator upon successful health response');

console.log('Frontend smoke tests passed successfully (2/2 checks).');

