import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const newEmail = process.env.NEW_ADMIN_EMAIL?.trim().toLowerCase();
const currentEmail = process.env.CURRENT_ADMIN_EMAIL?.trim().toLowerCase();

if (!projectId || !clientEmail || !privateKey || !newEmail) {
  throw new Error(
    "Set Firebase Admin credentials and NEW_ADMIN_EMAIL before running this script.",
  );
}

const app =
  getApps()[0] ??
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);

let administrator;

if (currentEmail) {
  administrator = await auth.getUserByEmail(currentEmail);
  if (administrator.customClaims?.admin !== true) {
    throw new Error(`${currentEmail} does not have the admin claim.`);
  }
} else {
  const administrators = [];
  let pageToken;

  do {
    const page = await auth.listUsers(1000, pageToken);
    administrators.push(
      ...page.users.filter((user) => user.customClaims?.admin === true),
    );
    pageToken = page.pageToken;
  } while (pageToken);

  if (administrators.length !== 1) {
    throw new Error(
      `Expected exactly one administrator, but found ${administrators.length}. Set CURRENT_ADMIN_EMAIL to select one explicitly.`,
    );
  }

  [administrator] = administrators;
}

const previousEmail = administrator.email;
if (!previousEmail) {
  throw new Error("The administrator account does not have an email address.");
}

if (previousEmail.toLowerCase() !== newEmail) {
  try {
    await auth.getUserByEmail(newEmail);
    throw new Error(`An account already uses ${newEmail}.`);
  } catch (error) {
    if (error?.code !== "auth/user-not-found") throw error;
  }

  await auth.updateUser(administrator.uid, {
    email: newEmail,
    emailVerified: true,
  });
}

try {
  await getFirestore(app).collection("adminUsers").doc(administrator.uid).set(
    {
      email: newEmail,
      active: true,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
} catch (error) {
  if (previousEmail.toLowerCase() !== newEmail) {
    await auth.updateUser(administrator.uid, { email: previousEmail });
  }
  throw error;
}

console.log(`Administrator email updated: ${previousEmail} -> ${newEmail}`);
