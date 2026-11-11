import { getAdminAppCheck } from "./admin";

export async function verifyAppCheckRequest(request: Request) {
  if (process.env.FIREBASE_APP_CHECK_ENFORCED !== "true") return;

  const token = request.headers.get("x-firebase-appcheck");
  if (!token) throw new Error("App Check token is required.");

  await getAdminAppCheck().verifyToken(token);
}
