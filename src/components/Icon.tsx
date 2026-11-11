import type { SVGProps } from "react";

export type IconName =
  | "arrow-left" | "arrow-right" | "book" | "check" | "clock"
  | "credit-card" | "dashboard" | "eye" | "eye-off" | "filter"
  | "lock" | "log-in" | "log-out" | "mail" | "map-pin"
  | "message" | "money" | "orders" | "phone" | "refresh"
  | "search" | "send" | "settings" | "shield" | "star"
  | "truck" | "user" | "x";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
  label?: string;
};

function IconPaths({ name }: { name: IconName }) {
  switch (name) {
    case "arrow-left": return <><path d="m15 18-6-6 6-6"/><path d="M9 12h12"/></>;
    case "arrow-right": return <><path d="m9 18 6-6-6-6"/><path d="M3 12h12"/></>;
    case "book": return <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>;
    case "check": return <path d="m5 12 4 4L19 6"/>;
    case "clock": return <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>;
    case "credit-card": return <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h2"/></>;
    case "dashboard": return <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>;
    case "eye": return <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>;
    case "eye-off": return <><path d="m3 3 18 18M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-2.1 2.8M6.6 6.6C3.6 8.4 2 12 2 12s3.5 6 10 6a10 10 0 0 0 4-.8"/></>;
    case "filter": return <path d="M4 5h16l-6 7v5l-4 2v-7Z"/>;
    case "lock": return <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>;
    case "log-in": return <><path d="M10 17l5-5-5-5M15 12H3M15 3h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-5"/></>;
    case "log-out": return <><path d="m14 8 4 4-4 4M18 12H7M10 4H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h6"/></>;
    case "mail": return <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>;
    case "map-pin": return <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>;
    case "message": return <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>;
    case "money": return <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M7 9H5v2M17 15h2v-2"/></>;
    case "orders": return <><path d="M6 3h12l2 5H4ZM5 8v13h14V8M9 12h6"/></>;
    case "phone": return <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>;
    case "refresh": return <><path d="M20 6v5h-5M4 18v-5h5M18 9a7 7 0 0 0-12-2L4 11M6 15a7 7 0 0 0 12 2l2-4"/></>;
    case "search": return <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>;
    case "send": return <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>;
    case "settings": return <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3A1.7 1.7 0 0 0 14 21v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14h-.2v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>;
    case "shield": return <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>;
    case "star": return <path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3.1L6.1 20l1.1-6.4L2.5 9 9 8Z"/>;
    case "truck": return <><path d="M3 6h11v11H3ZM14 10h4l3 3v4h-7Z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>;
    case "user": return <><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></>;
    case "x": return <path d="m6 6 12 12M18 6 6 18"/>;
  }
}

export function Icon({ name, label, className = "", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={`ui-icon ${className}`}
      aria-hidden={label ? undefined : true} role={label ? "img" : undefined} {...props}>
      {label && <title>{label}</title>}
      <IconPaths name={name} />
    </svg>
  );
}
