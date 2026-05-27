import { defineConfig, loadEnv, Plugin } from 'vite';
import { resolve } from 'path';
import * as fs from 'fs';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// 🎯 THE SOURCE OF TRUTH
const REPLACEMENTS = [
  {
    placeholder: /__VITE_JACKPOT_URL__/g,
    envKey: 'VITE_JACKPOT_URL',
    fallbackUrl: 'assets/',
  },
  {
    placeholder: /__VITE_LOTTO_URL__/g,
    envKey: 'VITE_LOTTO_URL',
    fallbackUrl: 'assets/',
  },
];

/**
 * Dynamically scans the root directory for active legacy screen folders
 */
function getLegacyFolderNames(): string[] {
  const folders: string[] = [];
  const items = fs.readdirSync(__dirname);

  items.forEach((item) => {
    const itemPath = resolve(__dirname, item);
    if (
      fs.statSync(itemPath).isDirectory() &&
      item !== 'node_modules' &&
      item !== 'dev-tools' &&
      item !== 'dist' &&
      fs.existsSync(resolve(itemPath, 'index.html'))
    ) {
      folders.push(item);
    }
  });
  return folders;
}

/**
 * Production Config: Handles moving and processing text vs binary assets
 */
function getLegacyScreenTargets(env: Record<string, string>) {
  const targets: any[] = [];
  const folders = getLegacyFolderNames();

  folders.forEach((folder) => {
    // 1. Text files (.html, .js, .css) that require environmental replacements
    targets.push({
      src: `${folder}/**/*.{html,js,css}`,
      dest: './',
      flatten: false,
      transform: (contents: string) => {
        let updatedContents = contents;
        REPLACEMENTS.forEach(({ placeholder, envKey, fallbackUrl }) => {
          const assetsUrl = env[envKey] || fallbackUrl;
          updatedContents = updatedContents.replace(placeholder, assetsUrl);
        });
        return updatedContents;
      },
    });

    // 2. Binary files (images, fonts) copied completely untouched
    targets.push({
      src: [`${folder}/**/*`, `!${folder}/**/*.{html,js,css}`],
      dest: './',
      flatten: false,
    });
  });

  return targets;
}

// Dev tools injection, text replacement, and Dev-Server Static Asset Router
function viteDevPanelInjectionPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'vite-dev-panel-injection',

    // 🌟 THE FIX FOR DEV MODE: Intercept asset requests and serve them directly
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        const folders = getLegacyFolderNames();

        // Check if the browser is requesting a file from a legacy folder (e.g., /jackpot/images/...)
        const matchedFolder = folders.find((f) => url.startsWith(`/${f}/`));

        if (matchedFolder) {
          const filePath = resolve(__dirname, url.slice(1)); // strip leading slash

          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            // Dynamic content-type header mapper
            const ext = filePath.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = {
              jpg: 'image/jpeg',
              jpeg: 'image/jpeg',
              png: 'image/png',
              gif: 'image/gif',
              svg: 'image/svg+xml',
              webp: 'image/webp',
              css: 'text/css',
              js: 'application/javascript',
              json: 'application/json',
              woff: 'font/woff',
              woff2: 'font/woff2',
              ttf: 'font/ttf',
            };

            if (ext && mimeTypes[ext]) {
              res.setHeader('Content-Type', mimeTypes[ext]);
            }

            // Stream the raw asset straight to the browser, bypassing Vite's blocks!
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    },

    transformIndexHtml(html: string): string {
      let modifiedHtml = html;

      REPLACEMENTS.forEach(({ placeholder, envKey, fallbackUrl }) => {
        const assetsUrl = env[envKey] || fallbackUrl;
        modifiedHtml = modifiedHtml.replace(placeholder, assetsUrl);
      });

      const panelPath = resolve(__dirname, 'dev-tools/master-panel.html');
      if (fs.existsSync(panelPath)) {
        const panelContent = fs.readFileSync(panelPath, 'utf-8');
        const headScript =
          panelContent.match(/<g-dev-head>([\s\S]*?)<\/g-dev-head>/)?.[1] || '';
        const bodyUI =
          panelContent.match(/<g-dev-body>([\s\S]*?)<\/g-dev-body>/)?.[1] || '';

        modifiedHtml = modifiedHtml.replace('<head>', `<head>\n${headScript}`);
        modifiedHtml = modifiedHtml.replace('</body>', `${bodyUI}\n</body>`);
      }

      return modifiedHtml;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  console.log(`\n⚙️  Vite is bundling in [${mode}] mode.`);
  console.log('🔗 Loaded Environment Variables:');
  REPLACEMENTS.forEach(({ envKey }) => {
    console.log(
      `   🔹 ${envKey}: ${env[envKey] || '❌ NOT FOUND - USING FALLBACK'}`,
    );
  });
  console.log('');

  return {
    root: __dirname,

    plugins: [
      viteDevPanelInjectionPlugin(env),
      viteStaticCopy({
        targets: getLegacyScreenTargets(env),
      }),
    ],

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
    },
  };
});
