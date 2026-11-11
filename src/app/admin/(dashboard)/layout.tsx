import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/firebase/auth";

export const instant = false;

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const administrator = await getAdminSession().catch(() => null);
  if (!administrator) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
