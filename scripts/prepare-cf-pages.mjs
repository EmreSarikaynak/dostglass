import { copyFile, mkdir, access, cp } from "node:fs/promises";
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

  const requiredDirs = [
    "cloudflare",
    "middleware",
    "server-functions",
    ".build",
    "dynamodb-provider"
  ];

  for (const dir of requiredDirs) {
    const sourceDir = path.join(projectRoot, ".open-next", dir);
    const targetDir = path.join(assetsDir, dir);
    try {
      await access(sourceDir, constants.R_OK);
      await cp(sourceDir, targetDir, { recursive: true });
      console.log(
        `[prepare-cf-pages] Synced ${dir} -> ${path.relative(projectRoot, targetDir)}`
      );
    } catch (error) {
      if (error?.code === "ENOENT") {
        console.warn(
          `[prepare-cf-pages] Skipping missing directory: ${path.relative(
            projectRoot,
            sourceDir
          )}`
        );
      } else {
        throw error;
      }
    }
  }
}

main().catch((error) => {
  console.error("[prepare-cf-pages] Failed to prepare Cloudflare Pages output:");
  console.error(error);
  process.exit(1);
});
