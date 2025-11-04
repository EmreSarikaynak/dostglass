import { copyFile, mkdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const workerSource = path.join(projectRoot, ".open-next", "worker.js");
const assetsDir = path.join(projectRoot, ".open-next", "assets");
const workerDestination = path.join(assetsDir, "_worker.js");

async function main() {
  try {
    await access(workerSource, constants.R_OK);
  } catch (error) {
    console.warn(
      "[prepare-cf-pages] OpenNext worker.js not found; skipping copy step."
    );
    console.warn(
      "[prepare-cf-pages] Expected worker at:",
      workerSource
    );
    return;
  }

  await mkdir(assetsDir, { recursive: true });
  await copyFile(workerSource, workerDestination);
  console.log(
    "[prepare-cf-pages] Copied .open-next/worker.js to Pages output directory."
  );
}

main().catch((error) => {
  console.error("[prepare-cf-pages] Failed to prepare Cloudflare Pages output:");
  console.error(error);
  process.exit(1);
});
