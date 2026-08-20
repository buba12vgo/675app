# 675app

App de clubes de baloncesto: clubes → equipos → plantilla, calendario y estadísticas.

Roles: **superadmin**, **coordinador** y **entrenador**. El coordinador gestiona equipos y escudos del club. El entrenador trabaja la plantilla y las sesiones de sus equipos.

Stack: React 19 + Vite 8 + Firebase Auth/Firestore (plan Spark, **sin Storage**). Los escudos van en la colección `Logos` o como PNG en `public/logos/`.

## Desarrollo

```bash
npm install
npm run dev
```

Variables: configura `src/firebase.js` con el proyecto Firebase. Proyecto de producción: `app-33232`.

## Tests

```bash
npm test              # lint, build, unitarios e integración
npm run test:unit
npm run test:rules    # emulador Firestore (hace falta Java)
npm run test:full     # incluye Playwright
```

Desplegar reglas:

```bash
npm run deploy:rules
```
