export type EditionId = "digital" | "paperback";

export type Edition = {
  id: string;
  format: EditionId;
  name: string;
  shortName: string;
  price: number;
  comparisonPrice?: number;
  currency: "NGN";
  description: string;
  features: readonly string[];
};

export const siteConfig = {
  title: "Omugwo: The Season Mother Came",
  shortTitle: "Omugwo",
  description:
    "A warm, funny, emotionally rich novella about mothers, daughters, new life, and the stories families carry across generations.",
  cover: {
    front: "/books/Omugwo_Paperback_Front.jpg",
    spine: "/books/Omugwo_Paperback_Spine.jpg",
    back: "/books/Omugwo_Paperback_Back.jpg",
    digital: "/books/Omugwo_KDP_Kindle_Cover.jpg",
    fullWrap: "/books/Omugwo_Paperback_Full_Wrap.jpg",
  },
  interiorPages: [
    "/books/interior/omugwo-page-01.webp",
    "/books/interior/omugwo-page-02.webp",
    "/books/interior/omugwo-page-03.webp",
    "/books/interior/omugwo-page-04.webp",
    "/books/interior/omugwo-page-05.webp",
    "/books/interior/omugwo-page-06.webp",
    "/books/interior/omugwo-page-07.webp",
    "/books/interior/omugwo-page-08.webp",
  ],
  navigation: [
    { label: "The Story", href: "/#story" },
    { label: "Inside Omugwo", href: "/#inside-omugwo" },
    { label: "Read a Sample", href: "/#sample" },
    { label: "Editions", href: "/#editions" },
  ],
} as const;

export const editions: Record<EditionId, Edition> = {
  digital: {
    id: "omugwo-digital",
    format: "digital",
    name: "Digital Edition",
    shortName: "Digital",
    price: 1999,
    comparisonPrice: 5000,
    currency: "NGN",
    description: "A reading edition delivered to the email address you provide.",
    features: [
      "Digital reading edition",
      "No account required",
      "Name and email collected for delivery",
    ],
  },
  paperback: {
    id: "omugwo-paperback",
    format: "paperback",
    name: "Paperback Pre-order",
    shortName: "Paperback Pre-order",
    price: 4999,
    comparisonPrice: 8000,
    currency: "NGN",
    description: "Reserve a physical paperback from the forthcoming print run.",
    features: [
      "Pre-order the forthcoming paperback",
      "Shipping information collected at checkout",
      "Shipping arranged separately when copies are ready",
    ],
  },
};

export const faqs = [
  {
    question: "Do I need an account to buy the book?",
    answer:
      "No. The checkout is designed for guest purchase. You only provide the information needed to deliver your selected edition.",
  },
  {
    question: "How will I receive the digital edition?",
    answer:
      "After payment is verified, the digital edition will be sent manually to the email address entered at checkout.",
  },
  {
    question: "What details are needed for a paperback order?",
    answer:
      "You will be asked for an email address, recipient name, phone number, and full delivery address.",
  },
  {
    question: "When will the paperback be delivered?",
    answer:
      "The paperback is currently available for pre-order. We will contact you when printed copies are ready and arrange shipping based on your delivery location.",
  },
  {
    question: "Can I place an order now?",
    answer:
      "Yes. You can buy the digital edition or reserve a paperback pre-order. A payment is confirmed only after secure server-side verification.",
  },
] as const;

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}
