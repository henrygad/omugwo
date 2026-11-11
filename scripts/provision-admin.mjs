import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!projectId || !clientEmail || !privateKey || !email) {
  throw new Error(
    "Set Firebase Admin credentials and ADMIN_EMAIL before running this script.",
  );
}

const app =
  getApps()[0] ??
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);

let user;
try {
  user = await auth.getUserByEmail(email);
} catch (error) {
  if (error?.code !== "auth/user-not-found") throw error;
  if (!password || password.length < 12) {
    throw new Error(
      "For a new account, set ADMIN_PASSWORD to a temporary password of at least 12 characters.",
    );
  }
  user = await auth.createUser({ email, password, emailVerified: true });
}

await auth.setCustomUserClaims(user.uid, {
  ...user.customClaims,
  admin: true,
});
await getFirestore(app).collection("adminUsers").doc(user.uid).set(
  {
    email,
    active: true,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);

console.log(`Administrator provisioned: ${email}`);
