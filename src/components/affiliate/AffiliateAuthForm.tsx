"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signOut,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { Icon } from "@/components/Icon";
import { getFirebaseClientAuth } from "@/lib/firebase/client";

export function AffiliateAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");

  async function createSession(user: User) {
    const response = await fetch("/api/affiliate/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: await user.getIdToken(true), remember: true }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(result.error ?? "Sign in failed.");
    router.push("/affiliate/dashboard");
    router.refresh();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNotice("");
    try {
      const auth = getFirebaseClientAuth();
      await setPersistence(auth, browserLocalPersistence);
      const credential = mode === "signup"
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);
      if (!credential.user.emailVerified) {
        setVerificationEmail(credential.user.email ?? email);
        if (mode === "signup") {
          await sendVerification(credential.user);
        } else {
          setNotice("Your email is not verified yet. Check your inbox or resend the verification email.");
        }
        return;
      }
      await createSession(credential.user);
    } catch (error) {
      setNotice(friendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    setNotice("");
    try {
      const auth = getFirebaseClientAuth();
      await setPersistence(auth, browserLocalPersistence);
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      await createSession(credential.user);
    } catch (error) {
      setNotice(friendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  async function sendVerification(user: User) {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/affiliate/login`,
    });
    setNotice(`Verification email sent to ${user.email ?? email}. Check your inbox and spam folder.`);
  }

  async function resendVerification() {
    const user = getFirebaseClientAuth().currentUser;
    if (!user) {
      setVerificationEmail("");
      setNotice("Sign in again to resend the verification email.");
      return;
    }
    setLoading(true);
    setNotice("");
    try {
      await sendVerification(user);
    } catch (error) {
      setNotice(friendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  async function continueAfterVerification() {
    const user = getFirebaseClientAuth().currentUser;
    if (!user) {
      setVerificationEmail("");
      setNotice("Sign in again after verifying your email.");
      return;
    }
    setLoading(true);
    setNotice("");
    try {
      await reload(user);
      if (!user.emailVerified) {
        setNotice("Your email is not verified yet. Open the link in the verification email first.");
        return;
      }
      await createSession(user);
    } catch (error) {
      setNotice(friendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  async function useDifferentEmail() {
    await signOut(getFirebaseClientAuth());
    setVerificationEmail("");
    setEmail("");
    setPassword("");
    setMode("login");
    setNotice("");
  }

  async function reset() {
    if (!email) return setNotice("Enter your email address first.");
    try {
      await sendPasswordResetEmail(getFirebaseClientAuth(), email);
      setNotice("A password-reset email has been sent.");
    } catch {
      setNotice("The reset email could not be sent. Check the address and try again.");
    }
  }

  if (verificationEmail) {
    return (
      <div className="affiliate-auth-card affiliate-verification-card">
        <span className="affiliate-verification-icon"><Icon name="mail" /></span>
        <p className="eyebrow">Verify your email</p>
        <h2>Check your inbox.</h2>
        <p>We sent a verification link to <strong>{verificationEmail}</strong>. Verify that address before completing your affiliate application.</p>
        <ol>
          <li>Open the email from Firebase.</li>
          <li>Select the verification link.</li>
          <li>Return here and continue.</li>
        </ol>
        <button className="button button--primary" type="button" onClick={continueAfterVerification} disabled={loading}><Icon name="check" /> {loading ? "Checking…" : "I’ve verified my email"}</button>
        <button className="button affiliate-verification-resend" type="button" onClick={resendVerification} disabled={loading}><Icon name="refresh" /> Resend verification email</button>
        <button className="affiliate-text-button" type="button" onClick={useDifferentEmail} disabled={loading}><Icon name="arrow-left" /> Use a different email</button>
        {notice && <p className="affiliate-notice" role="status"><Icon name="message" /> {notice}</p>}
      </div>
    );
  }

  return (
    <div className="affiliate-auth-card">
      <div className="affiliate-auth-tabs" role="tablist" aria-label="Affiliate account">
        <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => setMode("signup")}>Create account</button>
        <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => setMode("login")}>Sign in</button>
      </div>
      <button type="button" className="button affiliate-google-button" onClick={google} disabled={loading}>
        {loading ? <><Icon name="refresh" /> Connecting…</> : <><GoogleLogo /> Continue with Google</>}
      </button>
      <div className="affiliate-divider"><span>or use email</span></div>
      <form onSubmit={submit} className="affiliate-auth-form">
        <label><span><Icon name="mail" /> Email address</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label><span><Icon name="lock" /> Password</span><span className="affiliate-password-field"><input type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}><Icon name={showPassword ? "eye-off" : "eye"} /></button></span></label>
        <button className="button button--primary" disabled={loading}>{loading ? <><Icon name="refresh" /> Please wait…</> : mode === "signup" ? <><Icon name="user" /> Create affiliate account</> : <><Icon name="log-in" /> Sign in</>}</button>
        {mode === "login" && <button className="affiliate-text-button" type="button" onClick={reset}><Icon name="refresh" /> Forgot password?</button>}
      </form>
      {notice && <p className="affiliate-notice" role="status"><Icon name="message" /> {notice}</p>}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg
      className="affiliate-google-mark"
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
    >
      <path fill="#4285f4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.909c1.702-1.567 2.684-3.874 2.684-6.615Z" />
      <path fill="#34a853" d="M9 18c2.43 0 4.468-.806 5.956-2.18l-2.909-2.258c-.806.54-1.835.859-3.047.859-2.344 0-4.328-1.585-5.037-3.714H.957v2.332A9 9 0 0 0 9 18Z" />
      <path fill="#fbbc05" d="M3.963 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.281-1.707V4.961H.957A9 9 0 0 0 0 9c0 1.452.347 2.827.957 4.039l3.006-2.332Z" />
      <path fill="#ea4335" d="M9 3.58c1.322 0 2.508.455 3.441 1.346l2.581-2.58C13.464.892 11.43 0 9 0A9 9 0 0 0 .957 4.961l3.006 2.332C4.672 5.165 6.656 3.58 9 3.58Z" />
    </svg>
  );
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : "Authentication failed.";
  if (message.includes("email-already-in-use")) return "An account already uses this email. Choose Sign in instead.";
  if (message.includes("invalid-credential")) return "The email or password is incorrect.";
  if (message.includes("popup-closed")) return "Google sign-in was cancelled.";
  if (message.includes("weak-password")) return "Use a password containing at least eight characters.";
  if (message.includes("too-many-requests")) return "Too many attempts were made. Wait a few minutes before trying again.";
  if (message.includes("Verify your email")) return "Verify your email address before continuing.";
  return "We could not sign you in. Please try again.";
}
