import { resolve, sep } from 'node:path';

const root = resolve(import.meta.dir, 'dist');
const server = Bun.serve({
  hostname: '127.0.0.1',
  port: Number(process.env.PORT || 4173),
  async fetch(request) {
    let pathname: string;
    try { pathname = decodeURIComponent(new URL(request.url).pathname); }
    catch { return new Response('Bad request', { status: 400 }); }
    const path = resolve(root, '.' + pathname);
    if (path !== root && !path.startsWith(root + sep)) return new Response('Forbidden', { status: 403 });
    const file = Bun.file(pathname.includes('.') ? path : resolve(path, 'index.html'));
    if (await file.exists()) return new Response(file);
    return new Response(Bun.file(resolve(root, '404.html')), { status: 404 });
  },
});
console.log(`SZO ART: ${server.url}`);
