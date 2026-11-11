"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/firebase/client";
import { Icon } from "@/components/Icon";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNotice("");
    try {
      const auth = getFirebaseClientAuth();
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence,
      );
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken(true);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, remember }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Login failed.");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Login failed.");
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!email) {
      setNotice("Enter your administrator email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(getFirebaseClientAuth(), email);
      setNotice("Password reset email sent.");
    } catch {
      setNotice("A reset email could not be sent. Check the address and configuration.");
    }
  }

  return (
    <form className="admin-login-form" onSubmit={login}>
      <label>
        <span className="icon-label"><Icon name="mail" /> Email address</span>
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        <span className="icon-label"><Icon name="lock" /> Password</span>
        <span className="admin-password-field">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="button" onClick={() => setShowPassword((value) => !value)}>
            <Icon name={showPassword ? "eye-off" : "eye"} />
            <span className="visually-hidden">{showPassword ? "Hide password" : "Show password"}</span>
          </button>
        </span>
      </label>
      <label className="admin-check">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        />
        <Icon name="shield" /> Remember this session
      </label>
      <button className="button button--primary" disabled={loading}>
        <Icon name="log-in" />
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <button className="admin-text-button" type="button" onClick={resetPassword}>
        <Icon name="refresh" /> Forgot password?
      </button>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
    </form>
  );
}
