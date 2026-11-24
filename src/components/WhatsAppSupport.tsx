import { Icon } from "@/components/Icon";

const message = encodeURIComponent("Hello, I need help with my Omugwo order.");

export function WhatsAppSupport() {
  return (
    <a
      className="whatsapp-support"
      href={`https://wa.me/2347081477330?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ask for Omugwo order help on WhatsApp"
    >
      <Icon name="message" />
      <span>Order help</span>
    </a>
  );
}

