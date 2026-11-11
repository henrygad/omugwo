export function CreatorsSection() {
  return (
    <section
      className="creators-section sales-stage"
      id="creators"
      aria-labelledby="creators-title"
    >
      <div className="stage-copy stage-copy--left">
        <p className="section-index">07 — About the creators</p>
        <h2 id="creators-title">The people behind Omugwo.</h2>
        <p className="creators-intro">
          An Igbo family story shaped with care, cultural specificity, and an
          eye for the things families feel before they can say them.
        </p>
        <div className="creator-credits" aria-label="Book credits">
          <article>
            <span>Written by</span>
            <h3>Ifeoma Clark</h3>
          </article>
          <article>
            <span>Story by</span>
            <h3>Henry Loveday</h3>
          </article>
        </div>
      </div>
    </section>
  );
}
