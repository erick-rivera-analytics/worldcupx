# Deploy en GitHub Pages

## Build local

```bash
npm install
npm run build
```

## Base path

`vite.config.ts` usa `base: '/worldcupx/'` porque el repositorio se publica como GitHub Pages de proyecto.

Si el repositorio cambia de nombre, ajustar `base` a `/<NOMBRE_REPO>/`. Si se usa dominio custom o despliegue en raíz, cambiarlo a `/`.

## Publicación por GitHub Actions

El workflow `.github/workflows/deploy.yml` instala dependencias, ejecuta `npm run build` y publica `dist/`.

En GitHub Pages, la fuente debe ser:

```text
Settings -> Pages -> Build and deployment -> Source: GitHub Actions
```

## Variables

GitHub Pages no debe almacenar `service_role`. Solo:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
