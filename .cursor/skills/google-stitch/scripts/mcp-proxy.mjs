import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StitchProxy } from "@google/stitch-sdk";
import { getStitchApiKey, STITCH_HOST } from "./connect.mjs";

const apiKey = getStitchApiKey();
const proxy = new StitchProxy({
  apiKey,
  url: process.env.STITCH_HOST || STITCH_HOST,
});
const transport = new StdioServerTransport();
await proxy.start(transport);
