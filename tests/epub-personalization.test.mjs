import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import JSZip from "jszip";
import {
  personalizeEpubBuffer,
  validateGeneratedEpub,
} from "../src/lib/epub/personalize.ts";

const masterPath = path.join(
  process.cwd(),
  "private",
  "epub",
  "omugwo-readers.epub",
);

test("creates distinct valid personalized EPUB copies without changing the master", async () => {
  const masterBefore = await readFile(masterPath);
  const masterHash = createHash("sha256").update(masterBefore).digest("hex");
  const first = await personalizeEpubBuffer(masterBefore, {
    purchaserName: "Ada Reader",
    purchaserEmail: "ada@example.com",
    orderReference: "OMG-TEST-001",
  });
  const second = await personalizeEpubBuffer(masterBefore, {
    purchaserName: "Chidi Reader",
    purchaserEmail: "chidi@example.com",
    orderReference: "OMG-TEST-002",
  });

  await validateGeneratedEpub(first.buffer, "OMG-TEST-001");
  await validateGeneratedEpub(second.buffer, "OMG-TEST-002");
  assert.notEqual(first.generatedHash, second.generatedHash);
  assert.equal(first.fileName, "Omugwo-OMG-TEST-001.epub");

  const firstZip = await JSZip.loadAsync(first.buffer, { checkCRC32: true });
  const notice = await firstZip
    .file("OEBPS/personalized-copy.xhtml")
    ?.async("string");
  assert.match(notice ?? "", /Ada Reader/);
  assert.match(notice ?? "", /ada@example\.com/);
  assert.doesNotMatch(notice ?? "", /Chidi Reader/);

  const sourceZip = await JSZip.loadAsync(masterBefore, { checkCRC32: true });
  const sourceChapter = await sourceZip.file("OEBPS/s3.xhtml")?.async("string");
  const personalizedChapter = await firstZip
    .file("OEBPS/s3.xhtml")
    ?.async("string");
  assert.ok(sourceChapter && personalizedChapter);
  const originalChapterContent = sourceChapter.slice(
    0,
    sourceChapter.indexOf("</body>"),
  );
  assert.ok(
    personalizedChapter.startsWith(originalChapterContent),
    "original chapter content should remain intact",
  );
  assert.match(personalizedChapter, /OMG-TEST-001/);

  const masterAfter = await readFile(masterPath);
  assert.equal(
    createHash("sha256").update(masterAfter).digest("hex"),
    masterHash,
  );
});
