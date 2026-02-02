import fs from "node:fs/promises";
import path from "node:path";

const backendBaseUrl = process.env.BACKEND_BASE_URL;
const targets = ["/api-docs-json", "/api-docs/swagger.json"];

if (!backendBaseUrl) {
  console.warn("[sync-openapi] BACKEND_BASE_URL is not set. Using existing docs/openapi.json.");
  process.exit(0);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${res.status}`);
  return res.json();
}

async function run() {
  for (const target of targets) {
    const url = `${backendBaseUrl.replace(/\/$/, "")}${target}`;
    try {
      const json = await fetchJson(url);
      const outputPath = path.join(process.cwd(), "docs", "openapi.json");
      await fs.writeFile(outputPath, JSON.stringify(json, null, 2));
      console.log(`[sync-openapi] Saved OpenAPI to ${outputPath} from ${url}`);
      return;
    } catch (error) {
      console.warn(`[sync-openapi] Failed to fetch ${url}: ${error.message}`);
    }
  }

  console.warn(
    "[sync-openapi] Could not fetch OpenAPI. Keeping existing docs/openapi.json. Ensure backend is running and BACKEND_BASE_URL is set."
  );
}

run();
