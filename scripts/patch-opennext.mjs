// Next.js 16.4 added `.next/server/preview-props.json`, which @opennextjs/cloudflare (1.20.11) doesn't inline yet,
// so every request crashed with "Unexpected loadManifest(/.next/server/preview-props.json) call!".
// This adds it to the adapter's manifest glob. Idempotent; remove once the adapter includes it.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const file = join(process.cwd(), "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/load-manifest.js");
const from = "{*-manifest,required-server-files,prefetch-hints}.json";
const to = "{*-manifest,required-server-files,prefetch-hints,preview-props}.json";

const src = readFileSync(file, "utf8");
if (src.includes(to)) console.log("opennext patch: already applied");
else if (src.includes(from)) {
  writeFileSync(file, src.replace(from, to));
  console.log("opennext patch: preview-props.json is now inlined");
} else console.log("opennext patch: pattern not found (adapter changed?), skipping");
