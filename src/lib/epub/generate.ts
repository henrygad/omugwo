import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAdminStorage } from "@/lib/firebase/admin";
import {
  personalizeEpubBuffer,
  type EpubPersonalization,
} from "@/lib/epub/personalize";

const localMasterPath = path.join(
  process.cwd(),
  "private",
  "epub",
  "omugwo-readers.epub",
);

async function loadMasterEpub() {
  try {
    return await readFile(localMasterPath);
  } catch {
    const storagePath =
      process.env.EPUB_MASTER_STORAGE_PATH?.trim() ||
      "epub-masters/omugwo-readers.epub";
    const [buffer] = await getAdminStorage().file(storagePath).download();
    return buffer;
  }
}

export async function generatePersonalizedEpub(input: EpubPersonalization) {
  return personalizeEpubBuffer(await loadMasterEpub(), input);
}
