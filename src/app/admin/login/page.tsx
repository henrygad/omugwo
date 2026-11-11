import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/firebase/auth";

export const metadata: Metadata = { title: "Admin login | Omugwo", robots: { index: false } };
export const instant = false;

export default async function AdminLoginPage() {
  await connection();
  try {
    if (await getAdminSession()) redirect("/admin");
  } catch {
    // The form explains incomplete configuration through its secure endpoint.
  }
  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <p className="section-index">Omugwo administration</p>
        <h1>Welcome back.</h1>
        <p>Sign in with a manually provisioned administrator account.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
