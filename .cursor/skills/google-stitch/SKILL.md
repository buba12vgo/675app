---
name: google-stitch
description: >-
  Conecta con la API de Google Stitch (stitch.googleapis.com) para generar
  pantallas UI desde texto. Úsala en 675app, cuadrapp y Cloud Agents cuando
  hablemos de Stitch, STITCH_API_KEY, diseño de pantallas o stitch.withgoogle.com.
---

# Google Stitch

Lee este skill **antes** de llamar a Stitch. El código de conexión está en
[`scripts/connect.mjs`](scripts/connect.mjs). IDs de proyecto:
[`projects.json`](projects.json). No pongas la clave en git.

## Dónde aplica

| Repo | Proyecto Stitch | ID |
| --- | --- | --- |
| `675app` | 675app | `17811707176371225399` |
| `cuadrapp` | Gestor de Turnos Laborales | `604240272257492994` |

En **local** (Cursor Desktop) la clave va en `.env` como `STITCH_API_KEY`.
En **Cloud Agents** la misma variable sale del secreto del entorno; el
código de conexión ya lee `process.env.STITCH_API_KEY` antes que `.env`.

Comprueba la conexión: `npm run stitch:connect`.

## Autenticación

1. Header HTTP: `X-Goog-Api-Key`.
2. Endpoint MCP: `https://stitch.googleapis.com/mcp`.
3. Si falta `.env`, copia `.env.example` y pega la clave de
   [Stitch settings → API keys](https://stitch.withgoogle.com).

## Conectar (código canónico)

```js
import {
  createStitch,
  createStitchClient,
  getStitchApiKey,
  loadStitchProjects,
} from "./scripts/connect.mjs";

const apiKey = getStitchApiKey();
const client = createStitchClient(apiKey);
const stitch = createStitch(apiKey);
const projects = loadStitchProjects();

const { tools } = await client.listTools();
const list = await stitch.projects();
const current = stitch.project(projects["675app"].stitchProjectId);
```

En `cuadrapp` usa `projects.cuadrapp.stitchProjectId`.

Equivalente sin el helper:

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
      clientInfo: { name: "stitch-skill", version: "0.0.0" },
    },
  }),
});
```

## Cloud Agents

El `.cursor/mcp.json` del repo vale para el IDE. En la nube hay que activar
Stitch también en el dropdown MCP de [cursor.com/agents](https://cursor.com/agents):

- Transporte: **HTTP**
- URL: `https://stitch.googleapis.com/mcp`
- Header: `X-Goog-Api-Key` = secreto `STITCH_API_KEY`

Añade `STITCH_API_KEY` como secreto del entorno
[675app Cloud](https://cursor.com/dashboard/cloud-agents/environments/e/22ba40c6-a39c-11f1-a7d1-d6b4613131ce)
(tipo Runtime Secret). Los agentes nuevos la reciben como variable de entorno;
`connect.mjs` y el proxy MCP ya la usan.

## Operaciones habituales

Generar una pantalla tarda 1–3 minutos. **No reintentes** si hay timeout de red;
luego recupera con `get_screen`.

```js
const project = stitch.project("17811707176371225399");
const screen = await project.generate(
  "Pantalla de login de un club de baloncesto, móvil, tema oscuro naranja",
  "MOBILE",
);
const htmlUrl = await screen.getHtml();
const imageUrl = await screen.getImage();
```

Herramientas MCP: `create_project`, `list_projects`, `get_project`,
`delete_project`, `generate_screen_from_text`, `list_screens`, `get_screen`,
`edit_screens`, `generate_variants`, `upload_design_md`,
`create_design_system`, `create_design_system_from_design_md`,
`apply_design_system`.

`deviceType`: `MOBILE` · `DESKTOP` · `TABLET` · `AGNOSTIC`  
`modelId`: `GEMINI_3_FLASH` o `GEMINI_3_1_PRO` (no uses `GEMINI_3_PRO`).

Cierra el cliente al terminar: `await client.close()`.

## MCP en Cursor Desktop

`.cursor/mcp.json` lanza [`scripts/mcp-proxy.mjs`](scripts/mcp-proxy.mjs).
Lee `STITCH_API_KEY` del entorno (nube) o de `.env` (`envFile`).

## Reglas

- No commitees `STITCH_API_KEY` ni la imprimas en logs, PRs o artifacts.
- Stitch es herramienta de diseño, no runtime de la app. El SDK es `devDependency`.
- En 675app respeta `src/theme.js`. En cuadrapp respeta Tailwind y el diseño de turnos existente.
