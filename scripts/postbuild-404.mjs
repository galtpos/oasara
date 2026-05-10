// Copy build/index.html → build/404.html so Netlify serves the SPA shell
// (which renders the 404 component client-side) with a real HTTP 404 status
// for unknown paths. Paired with explicit route prefixes in public/_redirects.
// Note: oasara is CRA (react-scripts) which outputs to build/, not dist/.
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(process.cwd(), 'build');
const src = resolve(out, 'index.html');
const dst = resolve(out, '404.html');

if (!existsSync(src)) {
  console.error('postbuild-404: build/index.html missing — react-scripts build failed?');
  process.exit(1);
}
copyFileSync(src, dst);
console.log('postbuild-404: wrote build/404.html');
