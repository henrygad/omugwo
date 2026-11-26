"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { Icon } from "@/components/Icon";
import { getFirebaseClientAuth } from "@/lib/firebase/client";
import type { AffiliateProfile } from "@/types/commerce";

type Notice = { tone: "success" | "error"; message: string } | null;

export function AffiliateAccountSettings({ profile }: { profile: AffiliateProfile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!deleteOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [deleteOpen]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/affiliate/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicName: form.get("publicName"),
          phone: form.get("phone"),
          marketingDetails: form.get("marketingDetails"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Profile settings could not be saved.");
      setNotice({ tone: "success", message: "Profile settings saved." });
      router.refresh();
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Profile settings could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  async function sendPasswordReset() {
    setResetting(true);
    setNotice(null);
    try {
      await sendPasswordResetEmail(getFirebaseClientAuth(), profile.email);
      setNotice({ tone: "success", message: "Password-reset instructions were sent to your email." });
    } catch {
      setNotice({ tone: "error", message: "The password-reset email could not be sent. Please try again." });
    } finally {
      setResetting(false);
    }
  }

  async function closeAccount() {
    if (confirmation !== "DELETE") return;
    setClosing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/affiliate/settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Your account could not be closed.");
      router.replace("/affiliate");
      router.refresh();
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Your account could not be closed." });
      setDeleteOpen(false);
    } finally {
      setClosing(false);
    }
  }

  return (
    <>
      <form className="affiliate-profile-settings affiliate-panel" onSubmit={saveProfile}>
        <div className="affiliate-panel-heading"><div><p>Public profile</p><h2>Your affiliate details</h2></div><Icon name="user" /></div>
        <p className="affiliate-help">Your public name appears with your offers. Your legal name and sign-in email cannot be changed here.</p>
        <label><span><Icon name="user" /> Legal name</span><input value={profile.fullName} disabled /></label>
        <label><span><Icon name="mail" /> Sign-in email</span><input value={profile.email} disabled /></label>
        <label><span><Icon name="star" /> Public affiliate name</span><input name="publicName" required minLength={2} maxLength={80} defaultValue={profile.publicName} /></label>
        <label><span><Icon name="phone" /> Phone number</span><input name="phone" type="tel" autoComplete="tel" required minLength={5} maxLength={30} defaultValue={profile.phone} /></label>
        <label className="affiliate-field-full"><span><Icon name="message" /> Marketing plan</span><textarea name="marketingDetails" required minLength={20} maxLength={1000} defaultValue={profile.marketingDetails} /></label>
        <button className="button button--primary affiliate-field-full" disabled={saving}>{saving ? <><Icon name="refresh" /> Saving…</> : <><Icon name="check" /> Save profile settings</>}</button>
      </form>

      <section className="affiliate-panel affiliate-security-settings">
        <div className="affiliate-panel-heading"><div><p>Account security</p><h2>Password and access</h2></div><Icon name="lock" /></div>
        <div><div><strong>Reset your password</strong><p>We will send secure password-reset instructions to {profile.email}.</p></div><button type="button" onClick={sendPasswordReset} disabled={resetting}><Icon name="mail" /> {resetting ? "Sending…" : "Send reset email"}</button></div>
      </section>

      <section className="affiliate-panel affiliate-danger-zone">
        <div className="affiliate-panel-heading"><div><p>Danger zone</p><h2>Close affiliate account</h2></div><Icon name="trash" /></div>
        <p>Closing your account permanently removes your profile and bank details, disables every offer link, and deletes your login. This cannot be undone.</p>
        <p className="affiliate-help">Accounts with pending earnings, an upcoming payout, or a reversal balance must be settled before closure. Completed financial records are retained for accounting.</p>
        <button type="button" onClick={() => setDeleteOpen(true)}><Icon name="trash" /> Close my account</button>
      </section>

      {notice && <p className="affiliate-action-toast" data-tone={notice.tone} role={notice.tone === "error" ? "alert" : "status"}><Icon name={notice.tone === "error" ? "x" : "check"} /> {notice.message}</p>}

      {deleteOpen && <div className="affiliate-account-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !closing) setDeleteOpen(false); }}>
        <section className="affiliate-account-dialog" role="dialog" aria-modal="true" aria-labelledby="close-account-title">
          <span className="affiliate-dialog-icon"><Icon name="trash" /></span>
          <h2 id="close-account-title">Permanently close your account?</h2>
          <p>Your affiliate links and login will stop working immediately. This action cannot be reversed.</p>
          <label><span><Icon name="lock" /> Type <strong>DELETE</strong> to confirm</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></label>
          <div>
            <button type="button" className="button button--secondary" onClick={() => setDeleteOpen(false)} disabled={closing}><Icon name="shield" /> Keep my account</button>
            <button type="button" className="button affiliate-confirm-delete" onClick={closeAccount} disabled={closing || confirmation !== "DELETE"}><Icon name="trash" /> {closing ? "Closing…" : "Permanently close account"}</button>
          </div>
        </section>
      </div>}
    </>
  );
}
