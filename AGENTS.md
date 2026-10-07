# RefundyTax web · reglas para asistentes de IA y desarrolladores

Aplicación React de RefundyTax. Consume RefundyTaxAPI (.NET, repositorio AndersenDevEc/RefundyTaxApi)
y el login de AndersenCoreAPI. Está organizada por **features**, igual que la API.

## Stack (no agregar librerías sin motivo)

- React 19 + Vite + TypeScript. Gestor de paquetes: **yarn**.
- Tailwind v4: los tokens (colores, tipografía, tamaños, radios) viven en `src/index.css` dentro de `@theme`.
- Zustand: estado que comparten las pantallas (sesión, filtros, selección). Persistir solo lo necesario.
- TanStack Query: TODA llamada a la API pasa por `useQuery` / `useMutation`. Nunca `fetch` suelto en un componente.
- React Router: rutas en `src/app/router.tsx`.
- SweetAlert2 para confirmaciones, siempre a través de `shared/ui/dialogos.ts` (`confirmar`, `elegir`).
  Nunca `window.confirm` ni `alert`. Avisos cortos: `useAvisoStore().mostrar(...)`.

## Estructura

```
src/
├─ app/            router.tsx · RutaProtegida.tsx · queryClient.ts · env.ts (variables .env)
├─ shared/
│  ├─ api/http.ts  cliente HTTP único: URL base, token Bearer, errores (ApiError), 401 → cierra sesión
│  ├─ layout/      AppShell (barra superior + contenido) · Topbar
│  ├─ ui/          piezas visuales genéricas (Logo, …)
│  └─ lib/         utilidades puras (fechas, formato)
├─ features/       una carpeta por funcionalidad, con TODO lo suyo adentro
│  ├─ sesion/         sesionStore.ts (Zustand, persistido) · api.ts (login CoreAPI) · LoginPage.tsx
│  ├─ configuracion/  api.ts · hooks.ts (useConfiguracion, useEtiquetas → L("tramite"))
│  ├─ seguridad/      api.ts · hooks.ts (useMiRol)
│  └─ inicio/         InicioPage.tsx
└─ index.css       tokens de diseño + clases reutilizables (.btn, .card, .field, .badge, .grid-table…)
```

## Reglas

1. Un feature nuevo = carpeta `src/features/<nombre>/` con `api.ts` (funciones tipadas que llaman a
   `http<T>()`), `hooks.ts` (useQuery/useMutation con `queryKey` claros), sus pantallas `*Page.tsx`,
   sus componentes y, si comparte estado, `<nombre>Store.ts` con Zustand. Nada del feature vive fuera.
2. Los tipos de `api.ts` copian EXACTAMENTE los modelos de la API en C# (PascalCase: `NombreEmpresa`,
   `EsAdministrador`). No renombrar propiedades al pasar por la red.
3. Colores, tamaños y fuentes solo desde los tokens de `index.css`: clases Tailwind como `bg-burgundy`,
   `text-muted`, `text-small`, `rounded-card`, o las clases de componente `.btn`, `.card`, `.field`.
   Nunca un color o un tamaño escrito a mano en una pantalla.
4. Textos en español, simples, y las palabras de la empresa siempre con `useEtiquetas()`:
   `L("tramite")`, `lower("propuesta")`. Nunca "Trámite" fijo en el código.
5. URLs solo en `.env.development` / `.env.production`, leídas por `src/app/env.ts`.
6. Las rutas con sesión van dentro de `RutaProtegida` en `router.tsx`. El usuario y el token se leen de
   `useSesionStore`; el permiso de administrador de `useMiRol()`.
7. Errores de la API se muestran con `error.message` (ya viene en español desde `ApiError`).
8. Ejemplo de referencia: `features/configuracion` (lectura pública) y `features/sesion` (mutación).
   Copia su estilo exacto.
