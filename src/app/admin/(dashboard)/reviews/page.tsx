import Link from "next/link";
import { ReviewActions } from "@/components/admin/AdminActions";
import { listReviews } from "@/lib/admin-data";
import { Icon } from "@/components/Icon";

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const reviews = await listReviews(status);
  return (
    <>
      <header className="admin-page-header"><div><p>Moderation</p><h1 className="icon-heading"><Icon name="message" /> Reviews</h1></div></header>
      <nav className="admin-tabs"><Link className="icon-label" href="/admin/reviews"><Icon name="message" /> All</Link><Link className="icon-label" href="/admin/reviews?status=pending"><Icon name="clock" /> Pending</Link><Link className="icon-label" href="/admin/reviews?status=approved"><Icon name="check" /> Approved</Link><Link className="icon-label" href="/admin/reviews?status=rejected"><Icon name="x" /> Rejected</Link></nav>
      <section className="admin-review-list">
        {reviews.length === 0 ? <p className="admin-empty">No reviews in this view.</p> : reviews.map((review) => <article className="admin-panel" key={review.id}><div className="admin-review-meta"><strong>{review.name}</strong><span>{review.rating}/5 · {review.status}</span></div><blockquote>{review.comment}</blockquote><p>{review.email} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-NG") : ""}</p>{review.status === "pending" && <ReviewActions reviewId={review.id} />}</article>)}
      </section>
    </>
  );
}
