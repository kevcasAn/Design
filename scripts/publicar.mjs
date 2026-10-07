/**
 * Copia el build (dist/) a la carpeta compartida desde la que IIS sirve la app.
 *
 *   yarn build:test   compila con .env.pruebas    y publica en pruebas    (192.168.1.13)
 *   yarn build:prod   compila con .env.production y publica en producción (192.168.1.11)
 *   yarn build:all    las dos, una después de la otra
 *   yarn build        solo compila; no publica nada
 *
 * Cada ambiente se compila por separado porque las URLs de la API van dentro
 * del build: el de pruebas apunta a la API de pruebas y el de producción a la
 * de producción. No se puede copiar el mismo dist/ a los dos sitios.
 *
 * Los destinos se pueden cambiar sin tocar este archivo, con variables de
 * entorno (útil para probar en una carpeta local):
 *
 *   REFUNDY_DESTINO_TEST=D:\pruebas\refundyTaxFront yarn build:test
 *   REFUNDY_DESTINO_PROD=D:\pruebas\refundyTaxFront yarn build:prod
 *
 * ORDEN DE LAS OPERACIONES
 * Se copia encima de lo que haya, con index.html al final, y recién después se
 * limpia lo que sobró de la versión anterior. Así el sitio nunca queda a medias:
 * mientras no cambie index.html, sigue sirviendo la versión anterior completa.
 */
import { access, cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEN = join(RAIZ, 'dist');

const DESTINOS = {
  test: {
    nombre: 'pruebas (192.168.1.13)',
    ruta: process.env.REFUNDY_DESTINO_TEST || '\\\\192.168.1.13\\compartida\\refundyTaxFront',
  },
  prod: {
    nombre: 'producción (192.168.1.11)',
    ruta: process.env.REFUNDY_DESTINO_PROD || '\\\\192.168.1.11\\compartida\\refundyTaxFront',
  },
};

/** Se copia de último: es lo que hace visible la versión nueva. */
const ULTIMO = 'index.html';

/**
 * Lo único que se limpia del destino. Se limita a lo que este build genera:
 * si alguien dejó algo más en la carpeta, no se toca.
 */
const GENERADOS = ['assets', 'index.html', 'web.config', 'plantillas', 'favicon.svg', 'icons.svg', 'logo.svg'];

const log = (mensaje) => console.log(`  ${mensaje}`);

const existe = async (ruta) => {
  try {
    await access(ruta, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

/** Rutas relativas de todos los archivos bajo `raiz`. */
const listarArchivos = async (raiz, base = raiz) => {
  const salida = [];
  for (const entrada of await readdir(raiz, { withFileTypes: true })) {
    const completa = join(raiz, entrada.name);
    if (entrada.isDirectory()) salida.push(...(await listarArchivos(completa, base)));
    else salida.push(relative(base, completa));
  }
  return salida;
};

/** Verdadero si la ruta relativa cae dentro de lo que este build administra. */
const esNuestro = (rutaRelativa) => GENERADOS.includes(rutaRelativa.split(sep)[0]);

const publicarEn = async ({ nombre, ruta: destino }) => {
  console.log(`\n▪ Publicando RefundyTax en ${nombre}`);
  log(`origen  ${ORIGEN}`);
  log(`destino ${destino}`);

  if (!(await existe(ORIGEN))) {
    throw new Error('No existe dist/. Corre "vite build" antes de publicar.');
  }

  // Se comprueba el recurso compartido, no la carpeta: si el servidor no
  // responde, el mensaje debe decir eso y no "no existe la carpeta".
  const padre = dirname(destino);
  if (!(await existe(padre))) {
    throw new Error(
      `No se llega a ${padre}.\n` +
        '  Revisa que el equipo esté en la red de la oficina y que tengas acceso\n' +
        '  al recurso compartido.',
    );
  }

  if (!(await existe(destino))) {
    log('la carpeta de destino no existía; se crea');
    await mkdir(destino, { recursive: true });
  } else if (!(await stat(destino)).isDirectory()) {
    throw new Error(`${destino} existe pero no es una carpeta.`);
  }

  const archivos = await listarArchivos(ORIGEN);

  // 1) Todo menos index.html, encima de lo que haya.
  for (const relativa of archivos) {
    if (relativa === ULTIMO) continue;
    const hacia = join(destino, relativa);
    await mkdir(dirname(hacia), { recursive: true });
    await cp(join(ORIGEN, relativa), hacia);
  }

  // 2) index.html al final.
  if (archivos.includes(ULTIMO)) {
    await cp(join(ORIGEN, ULTIMO), join(destino, ULTIMO));
  }

  // 3) Recién ahora se retira lo que quedó de la versión anterior: sobre todo
  //    los assets viejos, que llevan hash y si no se acumularían para siempre.
  const publicados = new Set(archivos);
  let retirados = 0;
  for (const relativa of await listarArchivos(destino)) {
    if (publicados.has(relativa) || !esNuestro(relativa)) continue;
    await rm(join(destino, relativa), { force: true });
    retirados += 1;
  }

  console.log(
    `▪ Publicado en ${nombre}: ${archivos.length} archivos` +
      `${retirados ? `, ${retirados} obsoletos retirados` : ''}\n`,
  );
};

const ambiente = (process.argv[2] || '').toLowerCase();
if (!DESTINOS[ambiente]) {
  console.error('\n▪ Indica a dónde publicar: node scripts/publicar.mjs test | prod\n');
  console.error('  (para los dos ambientes usa "yarn build:all", que compila cada uno con su .env)\n');
  process.exit(1);
}

try {
  await publicarEn(DESTINOS[ambiente]);
} catch (error) {
  console.error(`\n▪ No se pudo publicar\n  ${error.message}\n`);
  console.error('  El build quedó en dist/; puedes copiarlo a mano.\n');
  process.exit(1);
}
