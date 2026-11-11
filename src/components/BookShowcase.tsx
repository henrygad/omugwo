import Image from "next/image";
import { Book3D } from "./Book3D";
import { siteConfig } from "@/config/site";

export function BookShowcase() {
  return (
    <section className="book-showcase section-shell" aria-labelledby="object-title">
      <div className="showcase-heading">
        <div>
          <p className="section-index">05 — Made to be held close</p>
          <h2 id="object-title">A story to keep beside you.</h2>
        </div>
        <p>
          Choose the immediacy of a digital reading edition or the quiet pleasure
          of a paperback on your shelf.
        </p>
      </div>

      <div className="showcase-grid">
        <article className="showcase-card showcase-card--paperback">
          <div className="showcase-label">
            <span>Paperback</span>
            <small>Physical edition</small>
          </div>
          <Book3D compact />
          <p className="asset-status">
            The approved paperback artwork wraps continuously from back to spine
            to front.
          </p>
        </article>

        <article className="showcase-card showcase-card--digital">
          <div className="showcase-label">
            <span>Digital</span>
            <small>Reading edition</small>
          </div>
          <div className="digital-device" aria-label="Digital edition preview">
            <div className="digital-device__camera" aria-hidden="true" />
            <div className="digital-device__screen">
              <Image
                src={siteConfig.cover.digital}
                alt={`${siteConfig.title} approved digital cover`}
                fill
                sizes="260px"
              />
            </div>
          </div>
          <p>Read wherever you keep your most intimate stories.</p>
        </article>
      </div>
    </section>
  );
}
