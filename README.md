# 675app

App de clubes de baloncesto: clubes → equipos → plantilla, calendario, dashboard y estadísticas.

Roles: **superadmin**, **coordinador**, **entrenador** y **preparador físico**. Un club puede tener varios coordinadores; gestionan equipos y escudos. El entrenador trabaja la plantilla (jugador/a, entrenador o ayudante), el dashboard del equipo y las sesiones (entreno/partido/físico; hasta 4 favoritos). El preparador físico accede a los equipos del club (hasta 10 favoritos), crea y edita entrenamientos físicos (asistencia y valoración propias) y solo consulta entrenos/partidos.

**Cómo usar la app:** https://675basket.com/como-funciona (también desde el login o Opciones: **Cómo funciona la app**). La guía cubre el aspecto actual (pista, modo claro/oscuro) y el uso de cada pantalla.

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
