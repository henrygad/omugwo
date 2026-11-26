"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";

const links: ReadonlyArray<readonly [string, string, IconName]> = [
  ["Overview", "/affiliate/dashboard", "dashboard"],
  ["Offer links", "/affiliate/offers", "send"],
  ["Earnings", "/affiliate/earnings", "money"],
  ["Settings", "/affiliate/settings", "settings"],
];

export function AffiliateShell({ publicName, children }: { publicName: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const navigation = links.map(([label, href, icon]) => (
    <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
      <Icon name={icon} /><span>{label}</span>
    </Link>
  ));
  async function logout() {
    await fetch("/api/affiliate/auth/logout", { method: "POST" });
    router.push("/affiliate/login");
    router.refresh();
  }
  return (
    <div className="affiliate-app">
      <aside className="affiliate-sidebar">
        <Link className="affiliate-brand" href="/affiliate/dashboard"><span className="brand-mark">O</span><span><strong>Omugwo</strong><small>Affiliate Programme</small></span></Link>
        <p className="affiliate-welcome">Welcome, <strong>{publicName}</strong></p>
        <nav aria-label="Affiliate navigation">{navigation}</nav>
        <button type="button" onClick={logout}><Icon name="log-out" /> Sign out</button>
      </aside>
      <header className="affiliate-mobile-header">
        <Link className="affiliate-brand" href="/affiliate/dashboard"><span className="brand-mark">O</span><span><strong>Omugwo</strong><small>Hi, {publicName}</small></span></Link>
        <button type="button" onClick={logout} aria-label="Sign out"><Icon name="log-out" /></button>
      </header>
      <main className="affiliate-main">{children}</main>
      <nav className="affiliate-mobile-nav" aria-label="Affiliate mobile navigation">{navigation}</nav>
    </div>
  );
}
