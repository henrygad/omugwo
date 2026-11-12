"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  editions,
  formatPrice,
  siteConfig,
  type EditionId,
} from "@/config/site";
import { getAppCheckToken } from "@/lib/firebase/client";
import { Icon } from "@/components/Icon";

type FormFields = {
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
};

type FieldName = keyof FormFields;

const emptyFields: FormFields = {
  name: "",
  email: "",
  phone: "",
  country: "Nigeria",
  state: "",
  city: "",
  address: "",
};

export function EditionSelector({
  checkout = false,
  initialEdition = "digital",
}: {
  checkout?: boolean;
  initialEdition?: EditionId;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<EditionId>(initialEdition);
  const [fields, setFields] = useState<FormFields>(emptyFields);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const edition = editions[selected];

  const errors = useMemo(() => {
    const next: Partial<Record<FieldName, string>> = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fields.email.trim()) next.email = "Enter an email address.";
    else if (!emailPattern.test(fields.email))
      next.email = "Enter a valid email address.";

    if (!fields.name.trim()) next.name = "Enter your name.";

    if (selected === "paperback") {
      if (!fields.phone.trim()) next.phone = "Enter a phone number.";
      if (!fields.country.trim()) next.country = "Enter a country.";
      if (!fields.state.trim()) next.state = "Enter a state.";
      if (!fields.city.trim()) next.city = "Enter a city.";
      if (!fields.address.trim()) next.address = "Enter a street address.";
    }

    return next;
  }, [fields, selected]);

  function selectEdition(id: EditionId) {
    if (!checkout) {
      router.push(`/checkout?edition=${id}`);
      return;
    }

    setSelected(id);
    setTouched({});
    setCheckoutNotice(null);
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function updateField(name: FieldName, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  function fieldError(name: FieldName) {
    return touched[name] ? errors[name] : undefined;
  }

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const required: FieldName[] =
      selected === "digital"
        ? ["name", "email"]
        : ["name", "email", "phone", "country", "state", "city", "address"];

    setTouched(Object.fromEntries(required.map((field) => [field, true])));

    if (Object.keys(errors).length > 0) {
      setCheckoutNotice("Check the highlighted details before continuing.");
      return;
    }
    if (!acceptedTerms) {
      setCheckoutNotice("Accept the Terms of Sale and Refund Policy before continuing.");
      return;
    }

    setIsSubmitting(true);
    setCheckoutNotice("Preparing your secure Paystack checkout…");

    try {
      const appCheckToken = await getAppCheckToken();
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(appCheckToken
            ? { "X-Firebase-AppCheck": appCheckToken }
            : {}),
        },
        body: JSON.stringify({ edition: selected, acceptedTerms, ...fields }),
      });
      const result = (await response.json()) as {
        authorizationUrl?: string;
        error?: string;
      };

      if (!response.ok || !result.authorizationUrl) {
        throw new Error(result.error ?? "Checkout could not be started.");
      }

      const checkoutUrl = new URL(result.authorizationUrl);
      if (
        checkoutUrl.protocol !== "https:" ||
        checkoutUrl.hostname !== "checkout.paystack.com"
      ) {
        throw new Error("The payment provider returned an invalid checkout URL.");
      }
      window.location.assign(checkoutUrl.toString());
    } catch (error) {
      setCheckoutNotice(
        error instanceof Error
          ? error.message
          : "Checkout could not be started. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <section className={`editions-section ${checkout ? "editions-section--checkout" : ""}`} id="editions" aria-labelledby="editions-title">
      <div className="section-shell">
        <div className="editions-heading">
          <div>
            <p className="section-index section-index--light">{checkout ? "Secure checkout" : "06 — Choose your edition"}</p>
            <h2 id="editions-title">{checkout ? "Complete your Omugwo order." : "How would you like to read Omugwo?"}</h2>
          </div>
          <p>
            {checkout
              ? "Confirm your edition, enter the delivery details, and continue to Paystack’s secure hosted checkout."
              : "No account is required. Choose your edition to continue to the secure purchase page."}
          </p>
        </div>

        <div className="edition-cards" role="list" aria-label="Book editions">
          {(Object.keys(editions) as EditionId[]).map((id) => {
            const item = editions[id];
            const isSelected = checkout && selected === id;
            return (
              <article
                className={`edition-card ${isSelected ? "edition-card--selected" : ""}`}
                key={item.id}
                role="listitem"
              >
                <div className="edition-card__topline">
                  <span>{item.name}</span>
                  <span className="selection-dot" aria-hidden="true" />
                </div>
                <p className="edition-price">{formatPrice(item.price)}</p>
                <p className="edition-description">{item.description}</p>
                <ul>
                  {item.features.map((feature) => (
                    <li key={feature}>
                      <Icon name="check" /> {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="button edition-button"
                  onClick={() => selectEdition(id)}
                  aria-pressed={isSelected}
                >
                  {isSelected
                    ? "Selected"
                    : checkout
                      ? `Switch to ${item.shortName}`
                      : `Buy ${item.shortName}`}
                  <Icon name={isSelected ? "check" : "arrow-right"} />
                </button>
              </article>
            );
          })}
        </div>

        {checkout && <div ref={formRef} className="purchase-panel">
          <form
            id="purchase-form"
            className="purchase-form"
            onSubmit={handleCheckout}
            noValidate
          >
            <div className="form-heading">
              <div>
                <span className="icon-label"><Icon name="credit-card" /> Purchase details</span>
                <h3>{edition.name}</h3>
              </div>
              <span className="form-step icon-label"><Icon name="shield" /> Secure checkout</span>
            </div>

            <p className="form-privacy-note">
              We use these details only to process and fulfil your order.
            </p>

            <div className="form-field">
              <label htmlFor="customer-name"><Icon name="user" /> Full name</label>
              <input
                id="customer-name"
                name="name"
                autoComplete="name"
                value={fields.name}
                onChange={(event) => updateField("name", event.target.value)}
                onBlur={() => setTouched((value) => ({ ...value, name: true }))}
                aria-invalid={Boolean(fieldError("name"))}
                aria-describedby={fieldError("name") ? "name-error" : undefined}
                placeholder="Your full name"
              />
              {fieldError("name") && (
                <span className="field-error" id="name-error" role="alert">
                  {fieldError("name")}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="customer-email"><Icon name="mail" /> Email address</label>
              <input
                id="customer-email"
                name="email"
                type="email"
                autoComplete="email"
                value={fields.email}
                onChange={(event) => updateField("email", event.target.value)}
                onBlur={() => setTouched((value) => ({ ...value, email: true }))}
                aria-invalid={Boolean(fieldError("email"))}
                aria-describedby={fieldError("email") ? "email-error" : undefined}
                placeholder="you@example.com"
              />
              {fieldError("email") && (
                <span className="field-error" id="email-error" role="alert">
                  {fieldError("email")}
                </span>
              )}
            </div>

            {selected === "paperback" && (
              <>
                <div className="form-field">
                  <label htmlFor="customer-phone"><Icon name="phone" /> Phone number</label>
                  <input
                    id="customer-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={fields.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    onBlur={() =>
                      setTouched((value) => ({ ...value, phone: true }))
                    }
                    aria-invalid={Boolean(fieldError("phone"))}
                    aria-describedby={
                      fieldError("phone") ? "phone-error" : undefined
                    }
                    placeholder="Your phone number"
                  />
                  {fieldError("phone") && (
                    <span className="field-error" id="phone-error" role="alert">
                      {fieldError("phone")}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="delivery-country"><Icon name="map-pin" /> Country</label>
                  <input
                    id="delivery-country"
                    name="country"
                    autoComplete="country-name"
                    value={fields.country}
                    onChange={(event) => updateField("country", event.target.value)}
                    onBlur={() => setTouched((value) => ({ ...value, country: true }))}
                    aria-invalid={Boolean(fieldError("country"))}
                    aria-describedby={fieldError("country") ? "country-error" : undefined}
                    placeholder="Country"
                  />
                  {fieldError("country") && <span className="field-error" id="country-error" role="alert">{fieldError("country")}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="delivery-state"><Icon name="map-pin" /> State</label>
                  <input
                    id="delivery-state"
                    name="state"
                    autoComplete="address-level1"
                    value={fields.state}
                    onChange={(event) => updateField("state", event.target.value)}
                    onBlur={() => setTouched((value) => ({ ...value, state: true }))}
                    aria-invalid={Boolean(fieldError("state"))}
                    aria-describedby={fieldError("state") ? "state-error" : undefined}
                    placeholder="State"
                  />
                  {fieldError("state") && <span className="field-error" id="state-error" role="alert">{fieldError("state")}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="delivery-city"><Icon name="map-pin" /> City</label>
                  <input
                    id="delivery-city"
                    name="city"
                    autoComplete="address-level2"
                    value={fields.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    onBlur={() => setTouched((value) => ({ ...value, city: true }))}
                    aria-invalid={Boolean(fieldError("city"))}
                    aria-describedby={fieldError("city") ? "city-error" : undefined}
                    placeholder="City"
                  />
                  {fieldError("city") && <span className="field-error" id="city-error" role="alert">{fieldError("city")}</span>}
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="delivery-address"><Icon name="map-pin" /> Street address</label>
                  <textarea
                    id="delivery-address"
                    name="address"
                    autoComplete="street-address"
                    rows={3}
                    value={fields.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    onBlur={() =>
                      setTouched((value) => ({ ...value, address: true }))
                    }
                    aria-invalid={Boolean(fieldError("address"))}
                    aria-describedby={
                      fieldError("address") ? "address-error" : undefined
                    }
                    placeholder="House number, street name, estate or landmark"
                  />
                  {fieldError("address") && (
                    <span className="field-error" id="address-error" role="alert">
                      {fieldError("address")}
                    </span>
                  )}
                </div>

              </>
            )}
            <label className="checkout-consent form-field--full">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>
                I agree to the <Link href="/policies/terms" target="_blank">Terms of Sale</Link> and <Link href="/policies/refunds" target="_blank">Refund Policy</Link>.
              </span>
            </label>
          </form>

          <aside className="order-summary" aria-labelledby="summary-title">
            <p className="summary-kicker icon-label"><Icon name="orders" /> Your order</p>
            <h3 id="summary-title" className="icon-heading"><Icon name="book" /> Order summary</h3>
            <div className="summary-product">
              <div className="summary-book">
                <Image
                  src={
                    selected === "digital"
                      ? siteConfig.cover.digital
                      : siteConfig.cover.front
                  }
                  alt={`${edition.name} cover of Omugwo`}
                  fill
                  sizes="52px"
                />
              </div>
              <div>
                <strong>Omugwo</strong>
                <span>{edition.name}</span>
              </div>
              <strong>{formatPrice(edition.price)}</strong>
            </div>
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatPrice(edition.price)}</strong>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{formatPrice(edition.price)}</strong>
            </div>
            {selected === "paperback" && (
              <p className="checkout-note"><Icon name="truck" /> This payment reserves your paperback. Shipping is arranged separately when printed copies are ready.</p>
            )}
            <button
              className="button button--checkout"
              type="submit"
              form="purchase-form"
              disabled={isSubmitting}
            >
              <Icon name="lock" />
              {isSubmitting ? "Preparing checkout…" : "Continue to payment"}
            </button>
            {checkoutNotice && (
              <p className="checkout-status" role="status">
                {checkoutNotice}
              </p>
            )}
            <p className="checkout-note">
              <Icon name="shield" />
              Card details are entered only on Paystack. We never store them.
            </p>
          </aside>
        </div>}
      </div>
    </section>
  );
}
