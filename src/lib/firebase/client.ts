import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseClientConfigured = Object.values(firebaseConfig).every(
  Boolean,
);

export function getFirebaseClientApp(): FirebaseApp {
  if (!isFirebaseClientConfigured) {
    throw new Error("Firebase client configuration is incomplete.");
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseClientAuth() {
  return getAuth(getFirebaseClientApp());
}

let appCheckPromise: Promise<string | null> | null = null;

export async function getAppCheckToken(): Promise<string | null> {
  const siteKey =
    process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_ENTERPRISE_KEY;
  if (!siteKey || typeof window === "undefined") return null;

  appCheckPromise ??= import("firebase/app-check").then(
    async ({ ReCaptchaEnterpriseProvider, getToken, initializeAppCheck }) => {
      const appCheck = initializeAppCheck(getFirebaseClientApp(), {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      return (await getToken(appCheck)).token;
    },
  );

  try {
    return await appCheckPromise;
  } catch {
    appCheckPromise = null;
    return null;
  }
}
