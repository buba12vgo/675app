# 675app

App de clubes de baloncesto: clubes → equipos → plantilla, calendario y estadísticas.

Roles: **superadmin**, **coordinador**, **entrenador** y **preparador físico**. El coordinador gestiona equipos y escudos del club. El entrenador trabaja la plantilla y las sesiones (entreno/partido/físico; hasta 4 favoritos). El preparador físico accede a los equipos del club (hasta 10 favoritos), crea y edita entrenamientos físicos (asistencia y valoración propias) y solo consulta entrenos/partidos.

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
