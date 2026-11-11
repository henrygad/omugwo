"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function TypographyMotion() {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const hero = document.querySelector<HTMLElement>(".hero");

        if (hero) {
          const eyebrow = hero.querySelector(".eyebrow");
          const title = hero.querySelector(".book-title-line");
          const headline = hero.querySelector("h1");
          const supportingCopy = hero.querySelector(".hero-lede");
          const actions = hero.querySelector(".hero-actions");
          const priceCue = hero.querySelector(".price-cue");
          const heroTimeline = gsap.timeline({ delay: 0.08 });

          heroTimeline
            .fromTo(
              [eyebrow, title],
              { y: 14, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.7,
                stagger: 0.1,
                ease: "power3.out",
              },
            )
            .fromTo(
              headline,
              { y: 28, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 1.05, ease: "power3.out" },
              "-=0.42",
            )
            .fromTo(
              supportingCopy,
              { y: 18, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.85, ease: "power3.out" },
              "-=0.56",
            )
            .fromTo(
              [actions, priceCue],
              { y: 14, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.75,
                stagger: 0.1,
                ease: "power3.out",
              },
              "-=0.48",
            );

          if (headline) {
            gsap.to(headline, {
              y: -1.5,
              duration: 4.8,
              delay: 1.4,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });
          }
        }

        document
          .querySelectorAll<HTMLElement>("main section:not(.hero)")
          .forEach((section) => {
            const headingElements = [
              section.querySelector(".section-index"),
              section.querySelector("h2"),
            ].filter((element): element is Element => element !== null);

            if (headingElements.length === 0) return;

            gsap.fromTo(
              headingElements,
              { y: 26, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.9,
                stagger: 0.11,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 78%",
                  once: true,
                },
              },
            );
          });
      });
    });

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return null;
}
