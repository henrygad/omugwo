"use client";

import { useEffect, useRef, useState } from "react";
import { getAppCheckToken } from "@/lib/firebase/client";
import type { PublicReview } from "@/types/commerce";
import { Icon } from "@/components/Icon";

type ReviewForm = {
  name: string;
  email: string;
  rating: string;
  comment: string;
};

const emptyForm: ReviewForm = {
  name: "",
  email: "",
  rating: "5",
  comment: "",
};

const reviewPreviewLength = 210;

function shortenReview(comment: string) {
  if (comment.length <= reviewPreviewLength) return comment;

  const preview = comment.slice(0, reviewPreviewLength);
  const lastSpace = preview.lastIndexOf(" ");
  return `${preview.slice(0, lastSpace > 150 ? lastSpace : reviewPreviewLength).trim()}…`;
}

export function ReaderReviews({
  showForm = true,
  showReviews = true,
}: {
  showForm?: boolean;
  showReviews?: boolean;
}) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showReviews) return;
    const controller = new AbortController();
    fetch("/api/reviews", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const result = (await response.json()) as { reviews: PublicReview[] };
        setReviews(result.reviews);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [showReviews]);

  function moveCarousel(direction: -1 | 1) {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * carousel.clientWidth,
      behavior: "smooth",
    });
  }

  function toggleReview(reviewId: string) {
    setExpandedReviews((current) =>
      current.includes(reviewId)
        ? current.filter((id) => id !== reviewId)
        : [...current, reviewId],
    );
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setNotice("Submitting your review…");

    try {
      const appCheckToken = await getAppCheckToken();
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(appCheckToken
            ? { "X-Firebase-AppCheck": appCheckToken }
            : {}),
        },
        body: JSON.stringify({ ...form, rating: Number(form.rating) }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Review submission failed.");
      setForm(emptyForm);
      setNotice(result.message ?? "Your review is awaiting moderation.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Review submission failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!showForm && reviews.length === 0) return null;

  return (
    <section className={`reader-reviews ${!showForm ? "reader-reviews--public" : ""}`} aria-labelledby="reader-reviews-title">
      <div className="section-shell reader-reviews__shell">
        <div className="reader-reviews__heading">
          <p className="section-index icon-label"><Icon name="message" /> Reader responses</p>
          <h2 id="reader-reviews-title">
            {showForm ? "Share what stayed with you." : "What readers are saying."}
          </h2>
          <p>
            {showForm
              ? "Reviews are checked before publication. Your email is used for moderation only and is never shown publicly."
              : "Genuine responses from readers, published after moderation."}
          </p>
        </div>

        {reviews.length > 0 && (
          <div className="reader-reviews__carousel">
            <div className="reader-reviews__carousel-heading">
              <p>Swipe to explore more reader responses.</p>
              {reviews.length > 1 && (
                <div className="reader-reviews__controls" aria-label="Review carousel controls">
                  <button type="button" onClick={() => moveCarousel(-1)} aria-label="Show previous reviews">
                    <Icon name="arrow-left" />
                  </button>
                  <button type="button" onClick={() => moveCarousel(1)} aria-label="Show next reviews">
                    <Icon name="arrow-right" />
                  </button>
                </div>
              )}
            </div>
            <div
              ref={carouselRef}
              className="reader-reviews__list"
              aria-label="Approved reader reviews"
              aria-roledescription="carousel"
              role="region"
              tabIndex={0}
            >
              {reviews.map((review, index) => {
                const isExpanded = expandedReviews.includes(review.id);
                const isLongReview = review.comment.length > reviewPreviewLength;

                return (
                  <article
                    key={review.id}
                    aria-label={`Review ${index + 1} of ${reviews.length}`}
                    role="group"
                  >
                    <p className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                      {"★".repeat(review.rating)}
                      <span aria-hidden="true">{"☆".repeat(5 - review.rating)}</span>
                    </p>
                    <blockquote>
                      <p>{isExpanded ? review.comment : shortenReview(review.comment)}</p>
                    </blockquote>
                    {isLongReview && (
                      <button
                        className="review-read-more"
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleReview(review.id)}
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                    <p className="review-author">— {review.name}</p>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {showForm && <form className="reader-review-form" onSubmit={submitReview}>
          <div className="form-field">
            <label htmlFor="review-name"><Icon name="user" /> Name</label>
            <input
              id="review-name"
              value={form.name}
              minLength={2}
              maxLength={100}
              required
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>
          <div className="form-field">
            <label htmlFor="review-email"><Icon name="mail" /> Email</label>
            <input
              id="review-email"
              type="email"
              value={form.email}
              maxLength={254}
              required
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </div>
          <div className="form-field">
            <label htmlFor="review-rating"><Icon name="star" /> Rating</label>
            <select
              id="review-rating"
              value={form.rating}
              onChange={(event) =>
                setForm((current) => ({ ...current, rating: event.target.value }))
              }
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option value={rating} key={rating}>
                  {rating} {rating === 1 ? "star" : "stars"}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field form-field--full">
            <label htmlFor="review-comment"><Icon name="message" /> Your review</label>
            <textarea
              id="review-comment"
              rows={4}
              minLength={20}
              maxLength={1200}
              required
              value={form.comment}
              onChange={(event) =>
                setForm((current) => ({ ...current, comment: event.target.value }))
              }
            />
          </div>
          <button className="button button--primary" disabled={submitting}>
            <Icon name="send" />
            {submitting ? "Submitting…" : "Submit review"}
          </button>
          {notice && <p className="review-notice" role="status">{notice}</p>}
        </form>}
      </div>
    </section>
  );
}
