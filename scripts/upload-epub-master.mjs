import { readFile } from "node:fs/promises";
import path from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const bucketName =
  process.env.FIREBASE_STORAGE_BUCKET ??
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const storagePath =
  process.env.EPUB_MASTER_STORAGE_PATH ??
  "epub-masters/omugwo-readers.epub";

if (!projectId || !clientEmail || !privateKey || !bucketName) {
  throw new Error("Firebase Admin and Storage environment variables are required.");
}

const localPath = path.join(
  process.cwd(),
  "private",
  "epub",
  "omugwo-readers.epub",
);
const file = await readFile(localPath);
const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  storageBucket: bucketName,
});

await getStorage(app).bucket(bucketName).file(storagePath).save(file, {
  resumable: false,
  contentType: "application/epub+zip",
  metadata: { cacheControl: "private, no-store, max-age=0" },
});

console.log(`Protected EPUB master uploaded to gs://${bucketName}/${storagePath}`);
