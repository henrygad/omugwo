import { editions, formatPrice } from "@/config/site";
import { Icon } from "@/components/Icon";

export default function SettingsPage() {
  const services = [
    ["Firebase client", Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)],
    ["Firebase Admin", Boolean(process.env.FIREBASE_ADMIN_PROJECT_ID)],
    ["Paystack", Boolean(process.env.PAYSTACK_SECRET_KEY)],
    ["App Check enforcement", process.env.FIREBASE_APP_CHECK_ENFORCED === "true"],
  ] as const;
  return (
    <>
      <header className="admin-page-header"><div><p>Configuration</p><h1 className="icon-heading"><Icon name="settings" /> Settings</h1></div></header>
      <div className="admin-detail-grid">
        <section className="admin-panel"><h2 className="icon-heading"><Icon name="shield" /> Service status</h2><ul className="admin-settings-list">{services.map(([label, active]) => <li key={label}><span>{label}</span><strong className={`icon-label ${active ? "is-ready" : "is-missing"}`}><Icon name={active ? "check" : "x"} />{active ? "Configured" : "Not configured"}</strong></li>)}</ul><p className="admin-help">Secrets are intentionally never displayed or editable here.</p></section>
        <section className="admin-panel"><h2 className="icon-heading"><Icon name="money" /> Trusted edition pricing</h2><ul className="admin-settings-list">{Object.values(editions).map((edition) => <li key={edition.id}><span className="icon-label"><Icon name="book" />{edition.name}</span><strong>{formatPrice(edition.price)}</strong></li>)}</ul><p className="admin-help">Pricing is controlled in server-deployed configuration, not from the browser.</p></section>
      </div>
    </>
  );
}
