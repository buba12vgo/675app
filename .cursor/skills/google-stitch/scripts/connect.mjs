import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Stitch, StitchToolClient } from "@google/stitch-sdk";

export const STITCH_HOST = "https://stitch.googleapis.com/mcp";

function findEnvFile() {
  const fromSkill = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../../../.env",
  );
  const candidates = [resolve(process.cwd(), ".env"), fromSkill];
  let dir = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    candidates.push(resolve(dir, ".env"));
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return candidates.find((path) => existsSync(path)) ?? null;
}

export function loadStitchEnv() {
  const envFile = findEnvFile();
  if (!envFile) return;
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

export function getStitchApiKey() {
  loadStitchEnv();
  const key = process.env.STITCH_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Falta STITCH_API_KEY. Cópiala en `.env` (ver `.env.example`).",
    );
  }
  return key;
}

export function stitchAuthHeaders(apiKey = getStitchApiKey()) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "X-Goog-Api-Key": apiKey,
  };
}

export function createStitchClient(apiKey = getStitchApiKey()) {
  return new StitchToolClient({
    apiKey,
    baseUrl: process.env.STITCH_HOST || STITCH_HOST,
    timeout: 300_000,
  });
}

export function createStitch(apiKey = getStitchApiKey()) {
  return new Stitch(createStitchClient(apiKey));
}

export async function pingStitch() {
  const client = createStitchClient();
  try {
    const { tools } = await client.listTools();
    const projects = await client.callTool("list_projects", {});
    return {
      ok: true,
      host: process.env.STITCH_HOST || STITCH_HOST,
      toolCount: tools.length,
      toolNames: tools.map((tool) => tool.name),
      projects,
    };
  } finally {
    await client.close();
  }
}

function isMain() {
  const self = fileURLToPath(import.meta.url);
  const invoked = process.argv[1] && resolve(process.argv[1]);
  return invoked === self;
}

if (isMain()) {
  const result = await pingStitch();
  const projectItems =
    result.projects?.projects ??
    result.projects?.data?.projects ??
    (Array.isArray(result.projects) ? result.projects : []);
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        host: result.host,
        toolCount: result.toolCount,
        toolNames: result.toolNames,
        projectCount: Array.isArray(projectItems) ? projectItems.length : null,
      },
      null,
      2,
    ),
  );
}
