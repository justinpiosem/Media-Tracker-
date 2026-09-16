import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { defineConfig, Plugin } from 'vite';

function exportZipPlugin(): Plugin {
  return {
    name: 'export-zip-plugin',
    configureServer(server) {
      server.middlewares.use('/api/export-zip', (req, res) => {
        try {
          const zipPath = path.join('/tmp', 'coab-media-operations-hub.zip');
          execSync(`python3 ${path.join(process.cwd(), 'scripts/export_zip.py')} ${zipPath}`);
          const stat = fs.statSync(zipPath);
          res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename="coab-media-operations-hub.zip"',
          });
          const readStream = fs.createReadStream(zipPath);
          readStream.pipe(res);
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Failed to generate ZIP: ${err.message}`);
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), exportZipPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
