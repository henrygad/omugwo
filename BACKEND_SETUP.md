# Omugwo backend setup

## 1. Firebase

1. Create or select the Firebase project for Omugwo.
2. Enable Email/Password in Authentication.
3. Create a Firestore database in production mode.
4. Register a web app and copy its public values into `.env.local`.
5. Create a service account and copy its project ID, client email, and private key into the server-only variables in `.env.local`.
6. Deploy the rules with `firebase deploy --only firestore:rules` after selecting the correct project.
7. Optionally register reCAPTCHA Enterprise for App Check. Add its public site key, verify checkout and review submission, then set `FIREBASE_APP_CHECK_ENFORCED=true`.

## 2. Initial administrator

Set `ADMIN_EMAIL` and a temporary `ADMIN_PASSWORD` in the terminal environment. Then run:

```text
npm run admin:provision
```

The script creates or updates that Firebase Authentication user, assigns the secure `admin: true` custom claim, and records the profile in `adminUsers`. Remove the temporary password from the environment afterwards. There is no public administrator signup.

## 3. Paystack test mode

1. Copy the Paystack test secret key to `PAYSTACK_SECRET_KEY`.
2. Add `https://your-domain/api/webhooks/paystack` as a test-mode webhook endpoint.
3. Copy its webhook signing secret to `PAYSTACK_WEBHOOK_SECRET`.
4. Complete successful, failed, abandoned, and repeated-webhook tests before replacing test keys with live keys.

The payment callback is generated from the domain serving the checkout request. It uses `/order/confirm` on localhost, preview deployments, and the production domain automatically. Non-local checkout requests must use HTTPS.

Orders are priced on the server from `src/config/site.ts`. A browser redirect never marks an order paid; the server re-verifies the reference, amount, currency, and Paystack status.
# Affiliate authentication setup

The affiliate portal reuses the existing Firebase project and server credentials. No new environment variable is required.

In Firebase Console:

1. Open **Authentication → Sign-in method**.
2. Keep **Email/Password** enabled.
3. Enable **Google**, select the project support email, and save.
4. Open **Authentication → Settings → Authorized domains**.
5. Add `omugwoseries.vercel.app` and any future custom production domain.

Customers do not use Firebase Authentication. These providers are only for affiliate and administrator accounts.

