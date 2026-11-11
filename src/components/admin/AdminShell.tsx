"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";

const links: ReadonlyArray<readonly [string, string, IconName]> = [
  ["Overview", "/admin", "dashboard"],
  ["Orders", "/admin/orders", "orders"],
  ["Reviews", "/admin/reviews", "message"],
  ["Settings", "/admin/settings", "settings"],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">Omugwo <span>Administration</span></Link>
        <nav aria-label="Administrator navigation">
          {links.map(([label, href, icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon name={icon} /> {label}
            </Link>
          ))}
        </nav>
        <button onClick={logout}><Icon name="log-out" /> Sign out</button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
