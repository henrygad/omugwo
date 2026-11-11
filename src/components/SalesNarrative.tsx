const promiseItems = [
  {
    title: "An Igbo family story",
    text: "An intimate homecoming shaped by the ordinary work of care and the complicated love inside a family.",
  },
  {
    title: "Igbo tradition",
    text: "Omugwo places postpartum care and intergenerational knowledge at the living centre of the story.",
  },
  {
    title: "Warmth and humour",
    text: "Tender domestic moments and family wit give the emotional questions room to breathe.",
  },
  {
    title: "Motherhood in many forms",
    text: "A daughter becomes a mother while learning to see the women before her more fully.",
  },
] as const;

const insideItems = [
  ["Family", "The closeness, friction, and fierce loyalty between generations."],
  ["Culture", "A tradition of postpartum care rendered as lived experience."],
  ["Humour", "The familiar comedy of advice, opinions, and a full family home."],
  ["Motherhood", "New life changes the meaning of being cared for—and of caring back."],
  ["Mystery", "A family silence waits beneath the routines of the season."],
] as const;

export function SalesNarrative() {
  return (
    <>
      <section
        className="sales-stage promise-section"
        id="reader-promise"
        aria-labelledby="promise-title"
      >
        <div className="stage-copy stage-copy--left">
          <p className="section-index">02 — The reader promise</p>
          <h2 id="promise-title">Come for the new baby. Stay for the family.</h2>
          <p className="stage-intro">
            <em>Omugwo</em> is for readers who want a culturally grounded family
            story with heart, humour, and an emotional mystery that unfolds
            through the small rituals of everyday care.
          </p>
          <div className="promise-grid">
            {promiseItems.map((item) => (
              <article key={item.title}>
                <span aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="sales-stage synopsis-section"
        id="story"
        aria-labelledby="synopsis-title"
      >
        <div className="stage-copy stage-copy--right editorial-panel">
          <p className="section-index">03 — The story</p>
          <h2 id="synopsis-title">A season of care opens a door to the past.</h2>
          <p className="synopsis-lead">
            In the tender, disorienting weeks after giving birth, Akudo is
            learning the rhythms of new motherhood. Then her mother arrives for
            omugwo, bringing capable hands, firm opinions, laughter—and a
            closeness that is both comfort and complication.
          </p>
          <p>
            As mother and daughter move through long nights and intimate
            routines, old family memories press closer. What begins as a visit to
            care for a newborn becomes a chance to understand the women who came
            before, and the secret their family has carried in silence.
          </p>
          <p className="spoiler-note">A spoiler-free introduction to the novella.</p>
        </div>
      </section>

      <section
        className="sales-stage inside-section"
        id="inside-omugwo"
        aria-labelledby="inside-title"
      >
        <div className="stage-copy stage-copy--left">
          <p className="section-index">04 — Inside Omugwo</p>
          <h2 id="inside-title">What you will find inside.</h2>
          <div className="inside-list">
            {insideItems.map(([title, text], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="sales-stage sample-section"
        id="sample"
        aria-labelledby="sample-title"
      >
        <div className="stage-copy stage-copy--right sample-card">
          <p className="section-index">05 — Read a sample</p>
          <h2 id="sample-title">Meet the story in its own words.</h2>
          <figure className="sample-excerpt">
            <span>From page 14</span>
            <blockquote>
              <p>
                “All of them!” Nwagaga called back. “All of them?”
              </p>
              <p>
                “David, my son, how many times must an onion receive permission
                before it enters a pot?”
              </p>
              <p>
                Akudo might have enjoyed the exchange on another day. She
                returned to the wardrobe and began hanging the remaining
                clothes, leaving the space between herself and her mother
                undisturbed.
              </p>
              <p>
                By evening, the apartment smelled of peppers, dried fish, and
                the spices Nwagaga had carried from Nigeria.
              </p>
            </blockquote>
            <figcaption>
              An excerpt from <em>Omugwo: The Season Mother Came</em>
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
