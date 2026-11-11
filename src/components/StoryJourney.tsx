"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Book3D } from "./Book3D";

gsap.registerPlugin(ScrollTrigger);

const themeItems = [
  {
    number: "01",
    title: "The mothers who show up",
    text: "In warm meals, sleepless nights, practical instruction, and the quiet work no one applauds, care becomes its own language—even when tenderness is harder to say aloud.",
  },
  {
    number: "02",
    title: "The stories we inherit",
    text: "Families pass down more than names. Memory, silence, grief, and the instinct to protect can travel through generations before anyone finds words for them.",
  },
  {
    number: "03",
    title: "The love we learn to give",
    text: "Becoming a mother changes how Akudo sees the women who raised her—and asks what understanding might look like when love arrives imperfectly.",
  },
] as const;

export function StoryJourney() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          const book = container.querySelector<HTMLElement>(".journey-book-pose");
          const stages = gsap.utils.toArray<HTMLElement>(
            ".journey-stage",
            container,
          );
          if (!book) return;

          const poses = [
            { rotationY: -5, rotationX: 4, rotationZ: 1, y: -10, scale: 0.95 },
            { rotationY: -24, rotationX: 2, rotationZ: -1, y: 4, scale: 0.88 },
            { rotationY: 11, rotationX: -2, rotationZ: 1, y: -6, scale: 0.92 },
            { rotationY: -32, rotationX: 3, rotationZ: -2, y: 12, scale: 0.86 },
          ];

          stages.forEach((stage, index) => {
            gsap.to(book, {
              ...poses[index],
              ease: "none",
              scrollTrigger: {
                trigger: stage,
                start: "top 82%",
                end: "center 42%",
                scrub: 1.2,
                invalidateOnRefresh: true,
              },
            });

            gsap.fromTo(
              stage.querySelectorAll("[data-stage-reveal]"),
              { y: 22, autoAlpha: 0.55 },
              {
                y: 0,
                autoAlpha: 1,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: stage,
                  start: "top 76%",
                  end: "top 48%",
                  scrub: 0.7,
                },
              },
            );
          });

        },
      );
    }, container);

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="story-journey" id="story">
      <div className="journey-book-column" aria-hidden="true">
        <div className="journey-book-pose">
          <Book3D compact />
          <p>Scroll to turn the story</p>
        </div>
      </div>

      <div className="journey-content">
        <section className="journey-stage emotional-hook" aria-labelledby="hook-title">
          <p className="section-index" data-stage-reveal>
            01 — The emotional heart
          </p>
          <h2 id="hook-title" data-stage-reveal>
            Some things a mother carries are never spoken aloud.
          </h2>
          <div className="editorial-rule" data-stage-reveal />
          <p className="large-copy" data-stage-reveal>
            Care can look like hands that know what to do before you ask. It can
            sound like instruction when what you need is understanding. And
            sometimes, inside the rituals that hold a family together, love keeps
            the shape of everything that was never said.
          </p>
        </section>

        <section className="journey-stage story-synopsis" aria-labelledby="story-title">
          <p className="section-index" data-stage-reveal>
            02 — About the story
          </p>
          <h2 id="story-title" data-stage-reveal>
            One newborn. One mother&apos;s visit. Generations of untold stories.
          </h2>
          <p data-stage-reveal>
            In the tender, disorienting weeks after giving birth to Kamsi, Akudo
            is learning the rhythms of new motherhood. Then Nwagaga arrives for
            omugwo—the Igbo tradition of postpartum care—bringing capable hands,
            firm opinions, and a closeness that is both comfort and complication.
          </p>
          <p data-stage-reveal>
            As mother and daughter move through long nights and intimate routines,
            the distance between being cared for and being understood begins to
            surface. Family memories press closer. Old grief refuses to remain
            neatly buried. And a sealed letter from Akudo&apos;s late grandmother,
            M̀má, waits with the weight of a history no one has fully named.
          </p>
          <p data-stage-reveal>
            <em>Omugwo: The Season Mother Came</em> is a quiet, emotionally layered
            novella about maternal sacrifice, inherited silence, and the difficult
            grace of seeing our mothers as women with unfinished stories of their
            own.
          </p>
          <a className="text-link" href="#editions" data-stage-reveal>
            Read Omugwo <span aria-hidden="true">↗</span>
          </a>
        </section>

        <section className="journey-stage themes" aria-labelledby="themes-title">
          <p className="section-index" data-stage-reveal>
            03 — Why this story resonates
          </p>
          <h2 id="themes-title" data-stage-reveal>
            A story for readers who notice what love does—not only what it says.
          </h2>
          <div className="theme-list">
            {themeItems.map((item) => (
              <article key={item.number} className="theme-item" data-stage-reveal>
                <span>{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="journey-stage omugwo-explainer"
          id="about-omugwo"
          aria-labelledby="omugwo-title"
        >
          <p className="section-index" data-stage-reveal>
            04 — The tradition at its centre
          </p>
          <h2 id="omugwo-title" data-stage-reveal>
            What is omugwo?
          </h2>
          <div className="drop-cap-copy" data-stage-reveal>
            <p>
              <span aria-hidden="true">O</span>mugwo is an Igbo tradition of
              postpartum care in which a mother or older female relative comes to
              support a new mother and baby. The season is practical and intimate:
              food is prepared, the baby is tended, and hard-won knowledge moves
              from one generation to the next.
            </p>
            <p>
              In this novella, that closeness becomes the setting for a more
              difficult kind of care—the work of listening, remembering, and
              seeing what a family has carried beneath its everyday rituals.
            </p>
          </div>
          <blockquote data-stage-reveal>
            “In this story, the season of care becomes a season of remembering.”
          </blockquote>
          <p className="copy-note" data-stage-reveal>
            Marketing copy—not a quotation from the novella.
          </p>
        </section>
      </div>
    </div>
  );
}
