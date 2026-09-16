---
name: google-stitch
description: >-
  Conecta con la API de Google Stitch (stitch.googleapis.com) para generar
  pantallas UI desde texto. Úsala cuando hablemos de Stitch, STITCH_API_KEY,
  diseño de pantallas, HTML/CSS generado o stitch.withgoogle.com.
---

# Google Stitch

Lee este skill **antes** de llamar a Stitch. El código de conexión está en
[`scripts/connect.mjs`](scripts/connect.mjs). No pongas la clave en archivos
que se suban a git.

## Autenticación

1. La clave vive en `.env` como `STITCH_API_KEY` (`.env*` está en `.gitignore`).
2. Header HTTP: `X-Goog-Api-Key`.
3. Endpoint MCP: `https://stitch.googleapis.com/mcp`.
4. Comprueba la conexión: `npm run stitch:connect`.

Si falta `.env`, copia `.env.example` y pega la clave de
[Stitch settings → API keys](https://stitch.withgoogle.com).

## Conectar (código canónico)

```js
import {
  createStitch,
  createStitchClient,
  getStitchApiKey,
  stitchAuthHeaders,
} from "./scripts/connect.mjs";

const apiKey = getStitchApiKey();
const client = createStitchClient(apiKey);
const stitch = createStitch(apiKey);

const { tools } = await client.listTools();
const projects = await stitch.projects();
```

Equivalente sin el helper, con el SDK oficial:

```js
import { Stitch, StitchToolClient } from "@google/stitch-sdk";

const client = new StitchToolClient({
  apiKey: process.env.STITCH_API_KEY,
  baseUrl: "https://stitch.googleapis.com/mcp",
  timeout: 300_000,
});
const stitch = new Stitch(client);
```

Fetch crudo (mismo auth):

```js
const res = await fetch("https://stitch.googleapis.com/mcp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "X-Goog-Api-Key": process.env.STITCH_API_KEY,
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "675app", version: "0.0.0" },
    },
  }),
});
```

## Operaciones habituales

Generar una pantalla tarda 1–3 minutos. **No reintentes** si hay timeout de red;
luego recupera con `get_screen`.

```js
const project = await stitch.createProject("675app");
const screen = await project.generate(
  "Pantalla de login de un club de baloncesto, móvil, tema oscuro naranja",
  "MOBILE",
);
const htmlUrl = await screen.getHtml();
const imageUrl = await screen.getImage();
```

Herramientas MCP:

| Tool | Uso |
| --- | --- |
| `create_project` | Crear contenedor de pantallas |
| `list_projects` / `get_project` / `delete_project` | Listar, leer o borrar un proyecto |
| `generate_screen_from_text` | Nueva pantalla (`projectId`, `prompt`, `deviceType`, `modelId`) |
| `list_screens` / `get_screen` | Listar o leer una pantalla |
| `edit_screens` | Cambios concretos sobre pantallas existentes |
| `generate_variants` | Variantes de layout/color/tipo |
| `upload_design_md` | Subir un design.md al proyecto |
| `create_design_system` / `create_design_system_from_design_md` / `apply_design_system` | Tema visual |

`deviceType`: `MOBILE` · `DESKTOP` · `TABLET` · `AGNOSTIC`  
`modelId`: `GEMINI_3_FLASH` o `GEMINI_3_1_PRO` (no uses `GEMINI_3_PRO`, está deprecado).

Cierra el cliente al terminar: `await client.close()`.

## MCP en Cursor

`.cursor/mcp.json` ya apunta al proxy local
[`scripts/mcp-proxy.mjs`](scripts/mcp-proxy.mjs), que reutiliza `getStitchApiKey()`.

Tras un reload de MCP, Stitch queda disponible como servidor `stitch`.

## Reglas

- No commitees `STITCH_API_KEY` ni la imprimas en logs, PRs o artifacts.
- Stitch es herramienta de diseño, no runtime de la app. El SDK es `devDependency`.
- En 675app respeta el tema de `src/theme.js` (oscuro naranja) si generas UI para esta app.
