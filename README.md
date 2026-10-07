# RefundyTax web

Aplicación React de RefundyTax. Habla con RefundyTaxAPI (.NET) y con AndersenCoreAPI para el login.

## Correr en local

```bash
yarn
yarn dev
```

Abre http://localhost:5174. Necesita RefundyTaxAPI corriendo en http://localhost:5121
(perfil `http` de Visual Studio) y acceso a AndersenCoreAPI para entrar.

Las URLs están en `.env.development` y `.env.production`.

## Publicar

```bash
yarn build:test   # compila con .env.pruebas y copia a \\192.168.1.13\compartida\refundyTaxFront
yarn build:prod   # compila con .env.production y copia a \\192.168.1.11\compartida\refundyTaxFront
yarn build:all    # los dos, uno después del otro
```

`yarn build` solo compila en `dist/`, sin publicar. Cada ambiente se compila aparte porque las
URLs de la API quedan dentro del build. Hace falta estar en la red de la oficina (o VPN) y tener
acceso a la carpeta compartida; el script avisa si no llega.

`public/web.config` viaja con el build: hace que IIS entregue `index.html` en cualquier ruta, para
que un F5 sobre una pantalla interna no devuelva 404.

## GitHub Pages

Al empujar a `main`, `.github/workflows/pages.yml` compila con el prefijo del repositorio
(`/Design/`) y publica el sitio. En el repositorio, Pages tiene que usar el origen
**GitHub Actions** (Settings → Pages).

`yarn build` sin variables sigue saliendo en la raíz, para IIS. Para armar el mismo
build de Pages en local:

```bash
VITE_BASE_PATH=/Design/ yarn build
yarn preview
```

La vista publicada no llama a las APIs. Impuestos, el tipo de devolución, los trámites
y el expediente salen de `src/datos/demo.ts`.

## Cómo está organizado

Ver `AGENTS.md`: una carpeta por feature, igual que la API, y todos los colores y tamaños en `src/index.css`.

## Plantillas de archivos

Los Excel de plantilla van en `public/plantillas/`, con el nombre `{IdCatalogoArchivo}.xlsx` o
`{Nombre del catálogo}.xlsx`, igual que en ComplyTax. Si no hay archivo, la plantilla se genera
sola desde el catálogo (ver `public/plantillas/LEEME.txt`).
