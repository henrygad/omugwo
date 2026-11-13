import { createHash } from "node:crypto";
import JSZip from "jszip";

export type EpubPersonalization = {
  purchaserName: string;
  purchaserEmail: string;
  orderReference: string;
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function insertBefore(source: string, marker: string, content: string) {
  const index = source.indexOf(marker);
  if (index < 0) throw new Error(`The EPUB is missing the required ${marker} marker.`);
  return `${source.slice(0, index)}${content}${source.slice(index)}`;
}

function ownershipPage(input: EpubPersonalization) {
  const name = escapeXml(input.purchaserName);
  const email = escapeXml(input.purchaserEmail);
  const reference = escapeXml(input.orderReference);
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Personal Copy Notice</title>
    <link rel="stylesheet" href="style.css" type="text/css" />
    <link rel="stylesheet" type="text/css" href="Styles/epub-restyler.css" />
  </head>
  <body class="epub-restyler personalized-copy-page">
    <h1>Personal Copy Notice</h1>
    <p><strong>Omugwo: The Season Mother Came</strong></p>
    <p>Written by Ifeoma Clark<br />Story by Henry Loveday</p>
    <div class="personalized-copy-details">
      <p>This copy is personalized for:</p>
      <p><strong>${name}</strong><br />${email}<br />Order reference: ${reference}</p>
    </div>
    <p>This electronic edition is licensed only to the named recipient for personal, non-commercial reading. It must not be reproduced, uploaded, shared, distributed, sublicensed, sold, or resold except where applicable law expressly permits.</p>
    <p>Copyright and rights enquiries: Henrygad.orji@gmail.com</p>
  </body>
</html>`;
}

function chapterNotice(input: EpubPersonalization) {
  return `<aside class="personalized-running-notice" aria-label="Personal copy notice">Personal copy licensed to ${escapeXml(input.purchaserName)} · ${escapeXml(input.orderReference)}</aside>`;
}

function personalizeOpf(source: string, input: EpubPersonalization) {
  const identifier = `urn:omugwo:personal-copy:${escapeXml(input.orderReference)}`;
  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  let output = source.replace(
    /<meta property="dcterms:modified">[^<]+<\/meta>/,
    `<meta property="dcterms:modified">${modified}</meta>`,
  );
  output = output.replace(
    "<dc:creator>Henry Loveday</dc:creator>",
    "<dc:creator>Ifeoma Clark</dc:creator>",
  );
  output = insertBefore(
    output,
    "</metadata>",
    `<dc:identifier id="personalized-copy-id">${identifier}</dc:identifier>`,
  );
  output = insertBefore(
    output,
    "</manifest>",
    '<item id="personalized-copy" href="personalized-copy.xhtml" media-type="application/xhtml+xml"/>',
  );
  const publicationSpineItem = '<itemref idref="s1"/>';
  if (!output.includes(publicationSpineItem)) {
    throw new Error("The EPUB publication-information spine entry is missing.");
  }
  return output.replace(
    publicationSpineItem,
    `${publicationSpineItem}<itemref idref="personalized-copy"/>`,
  );
}

function personalizeNavigation(source: string) {
  const publicationLink = '<li><a href="s1.xhtml">Publication Information</a></li>';
  if (!source.includes(publicationLink)) {
    throw new Error("The EPUB navigation publication-information entry is missing.");
  }
  return source.replace(
    publicationLink,
    `${publicationLink}<li><a href="personalized-copy.xhtml">Personal Copy Notice</a></li>`,
  );
}

export async function personalizeEpubBuffer(
  master: Buffer,
  input: EpubPersonalization,
) {
  const masterHash = createHash("sha256").update(master).digest("hex");
  const source = await JSZip.loadAsync(master, { checkCRC32: true });
  const modifications = new Map<string, string>();

  const opf = await source.file("OEBPS/content.opf")?.async("string");
  const nav = await source.file("OEBPS/nav.xhtml")?.async("string");
  const stylesheet = await source.file("OEBPS/style.css")?.async("string");
  if (!opf || !nav || stylesheet === undefined) {
    throw new Error("The EPUB package files are incomplete.");
  }

  modifications.set("OEBPS/content.opf", personalizeOpf(opf, input));
  modifications.set("OEBPS/nav.xhtml", personalizeNavigation(nav));
  modifications.set("OEBPS/personalized-copy.xhtml", ownershipPage(input));
  modifications.set(
    "OEBPS/style.css",
    `${stylesheet}\n.personalized-copy-page{margin:8%;line-height:1.6}.personalized-copy-details{margin:2em 0;padding:1.25em;border:1px solid #8a6b61}.personalized-running-notice{margin:3em 0 1em;padding-top:.75em;border-top:1px solid #b7a69e;font-size:.72em;color:#6f615a;text-align:center}`,
  );

  for (let chapter = 3; chapter <= 10; chapter += 1) {
    const chapterPath = `OEBPS/s${chapter}.xhtml`;
    const chapterSource = await source.file(chapterPath)?.async("string");
    if (!chapterSource?.includes("</body>")) {
      throw new Error(`The EPUB chapter ${chapterPath} is invalid.`);
    }
    modifications.set(
      chapterPath,
      chapterSource.replace("</body>", `${chapterNotice(input)}</body>`),
    );
  }

  const output = new JSZip();
  output.file("mimetype", "application/epub+zip", { compression: "STORE" });

  const entries = Object.values(source.files).filter(
    (entry) => entry.name !== "mimetype",
  );
  for (const entry of entries) {
    if (entry.dir) {
      output.folder(entry.name);
      continue;
    }
    const replacement = modifications.get(entry.name);
    output.file(
      entry.name,
      replacement ?? (await entry.async("nodebuffer")),
      { date: entry.date, compression: "DEFLATE" },
    );
    modifications.delete(entry.name);
  }

  for (const [fileName, content] of modifications) {
    output.file(fileName, content, { compression: "DEFLATE" });
  }

  const buffer = await output.generateAsync({
    type: "nodebuffer",
    mimeType: "application/epub+zip",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
  await validateGeneratedEpub(buffer, input.orderReference);

  const safeReference = input.orderReference.replace(/[^a-zA-Z0-9_-]/g, "-");
  return {
    buffer,
    fileName: `Omugwo-${safeReference}.epub`,
    masterHash,
    generatedHash: createHash("sha256").update(buffer).digest("hex"),
  };
}

export async function validateGeneratedEpub(
  buffer: Buffer,
  orderReference: string,
) {
  if (buffer.readUInt32LE(0) !== 0x04034b50) {
    throw new Error("Generated EPUB does not begin with a ZIP local-file header.");
  }
  const compressionMethod = buffer.readUInt16LE(8);
  const fileNameLength = buffer.readUInt16LE(26);
  const extraLength = buffer.readUInt16LE(28);
  const firstFileName = buffer.subarray(30, 30 + fileNameLength).toString("utf8");
  const contentStart = 30 + fileNameLength + extraLength;
  const firstContent = buffer
    .subarray(contentStart, contentStart + "application/epub+zip".length)
    .toString("utf8");
  if (
    firstFileName !== "mimetype" ||
    compressionMethod !== 0 ||
    firstContent !== "application/epub+zip"
  ) {
    throw new Error("Generated EPUB has an invalid mimetype archive entry.");
  }

  const zip = await JSZip.loadAsync(buffer, { checkCRC32: true });
  const required = [
    "META-INF/container.xml",
    "OEBPS/content.opf",
    "OEBPS/nav.xhtml",
    "OEBPS/personalized-copy.xhtml",
  ];
  for (const fileName of required) {
    if (!zip.file(fileName)) throw new Error(`Generated EPUB is missing ${fileName}.`);
  }
  const personalizedPage = await zip
    .file("OEBPS/personalized-copy.xhtml")
    ?.async("string");
  if (!personalizedPage?.includes(escapeXml(orderReference))) {
    throw new Error("Generated EPUB personalization could not be verified.");
  }
}
