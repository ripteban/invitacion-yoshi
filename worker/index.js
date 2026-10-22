// Cloudflare Worker: sirve /medios/* (videos de fondo y música) con soporte de rangos.
// Safari en iPhone solo reproduce audio/video si el servidor responde por partes (206 Partial
// Content); los archivos estáticos de Workers responden siempre completos (200), por eso este Worker.
// Solo corre para /medios/* (run_worker_first en wrangler.jsonc); el resto lo sirven los estáticos.
// Es la misma función que Katalina usaba como Pages Function, adaptada a Workers.
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/medios/')) return medios(request, env);
    return env.ASSETS.fetch(request);
  },
};

async function medios(request, env) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  }

  // Archivo original desde los estáticos (sin la cabecera Range, que los estáticos ignoran)
  const original = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));
  if (!original.ok) return original;
  const datos = await original.arrayBuffer();
  const total = datos.byteLength;

  // _headers no se aplica a respuestas generadas por el Worker: se repiten aquí
  const headers = new Headers({
    'Content-Type': original.headers.get('Content-Type') ?? 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=604800',
    'X-Robots-Tag': 'noindex, nofollow',
  });
  const etag = original.headers.get('ETag');
  if (etag) headers.set('ETag', etag);
  const cuerpo = (b) => (request.method === 'HEAD' ? null : b);

  const rango = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('Range') ?? '');
  if (!rango || (rango[1] === '' && rango[2] === '')) {
    headers.set('Content-Length', String(total));
    return new Response(cuerpo(datos), { status: 200, headers });
  }

  // bytes=a-b · bytes=a- · bytes=-n (últimos n)
  let inicio, fin;
  if (rango[1] === '') {
    inicio = Math.max(0, total - Number(rango[2]));
    fin = total - 1;
  } else {
    inicio = Number(rango[1]);
    fin = rango[2] === '' ? total - 1 : Math.min(Number(rango[2]), total - 1);
  }
  if (inicio >= total || inicio > fin) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
  }

  headers.set('Content-Range', `bytes ${inicio}-${fin}/${total}`);
  headers.set('Content-Length', String(fin - inicio + 1));
  return new Response(cuerpo(datos.slice(inicio, fin + 1)), { status: 206, headers });
}
