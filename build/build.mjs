/**
 * build.mjs — produces a single self-contained HTML file of the game.
 *
 * Why: browsers refuse to load ES modules over file:// (CORS, origin
 * "null"). Bundling every module into one classic <script> and inlining
 * all CSS + the font removes every network request, so the result runs
 * when opened straight from phone storage.
 *
 * Usage:  node build/build.mjs
 * Output: dist/dont-get-deactivated.html
 */

import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'dist');
const OUT_FILE = path.join(OUT_DIR, 'dont-get-deactivated.html');

const CSS_FILES = [
    'styles/variables.css',
    'styles/layout.css',
    'styles/components.css',
    'styles/mobile.css',
];

async function bundleJS() {
    const result = await build({
        entryPoints: [path.join(ROOT, 'main.js')],
        bundle: true,
        format: 'iife',
        platform: 'browser',
        target: ['es2019'],
        minify: true,
        legalComments: 'none',
        write: false,
        logLevel: 'warning',
    });
    return result.outputFiles[0].text;
}

async function inlineCSS() {
    const fontPath = path.join(ROOT, 'assets/fonts/pressstart2p-latin.woff2');
    const fontB64 = (await readFile(fontPath)).toString('base64');
    const fontDataUri = `data:font/woff2;base64,${fontB64}`;

    const parts = [];
    for (const rel of CSS_FILES) {
        let css = await readFile(path.join(ROOT, rel), 'utf8');
        // Point the @font-face at the inlined data URI instead of a file.
        css = css.replace(
            /url\(['"]?\.\.\/assets\/fonts\/pressstart2p-latin\.woff2['"]?\)/g,
            `url(${fontDataUri})`
        );
        parts.push(css);
    }

    // Minify the combined stylesheet (keeps the single file small).
    const minified = await build({
        stdin: { contents: parts.join('\n'), loader: 'css' },
        minify: true,
        write: false,
        logLevel: 'warning',
    });
    return minified.outputFiles[0].text;
}

/**
 * Take index.html, strip the external <link>/<script> tags, and inject
 * the inlined CSS and JS in their place.
 */
async function buildHTML(css, js) {
    let html = await readFile(path.join(ROOT, 'index.html'), 'utf8');

    // Remove the stylesheet links (we inline them).
    html = html.replace(/[ \t]*<link rel="stylesheet"[^>]*>\s*\n/g, '');
    // Remove the module script (we inline the bundle).
    html = html.replace(/[ \t]*<script type="module"[^>]*><\/script>\s*\n/g, '');
    // A single file cannot carry a separate manifest or icon files —
    // drop those links so nothing 404s when opened from storage.
    html = html.replace(/[ \t]*<link rel="manifest"[^>]*>\s*\n/g, '');
    html = html.replace(/[ \t]*<link rel="(?:icon|apple-touch-icon)"[^>]*>\s*\n/g, '');

    // Inject CSS just before </head>.
    html = html.replace(
        '</head>',
        `  <style>\n${css}\n  </style>\n  </head>`
    );

    // Inject the bundle just before </body>.
    html = html.replace(
        '</body>',
        `  <script>\n${js}\n  </script>\n  </body>`
    );

    return html;
}

async function main() {
    await mkdir(OUT_DIR, { recursive: true });

    const [js, css] = await Promise.all([bundleJS(), inlineCSS()]);
    const html = await buildHTML(css, js);

    await writeFile(OUT_FILE, html, 'utf8');

    const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
    console.log(`built ${path.relative(ROOT, OUT_FILE)}  (${kb} KB)`);

    // Sanity: the output must not reference any external resource.
    const external = [...html.matchAll(/(?:src|href)="(?!data:|#)([^"]+)"/g)]
        .map((m) => m[1])
        .filter((u) => !u.startsWith('assets/icons/'));
    if (external.length) {
        console.warn('WARNING: external references remain:', external);
    } else {
        console.log('no external references — fully self-contained');
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
