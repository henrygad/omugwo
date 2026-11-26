"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Book3D } from "./Book3D";

gsap.registerPlugin(ScrollTrigger);

type StagePose = {
  selector: string;
  y: number;
  scale: number;
  opacity: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  coverRotationY: number;
  pageRotations: readonly [number, number, number, number];
  pageBends: readonly [number, number, number, number];
  pointerStrength: number;
  shadowOpacity: number;
  shadowScale: number;
};

const stages: readonly StagePose[] = [
  {
    selector: "#reader-promise",
    y: 65,
    scale: 1,
    opacity: 1,
    rotationX: 66,
    rotationY: -12,
    rotationZ: 90,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
    pointerStrength: 0.3,
    shadowOpacity: 0.48,
    shadowScale: 1.18,
  },
  {
    selector: "#story",
    y: 84,
    scale: 1,
    opacity: 1,
    rotationX: 56,
    rotationY: -8,
    rotationZ: 90,
    coverRotationY: -152,
    pageRotations: [-28, -4, 0, 0],
    pageBends: [12, 2, 0, 0],
    pointerStrength: 0.22,
    shadowOpacity: 0.42,
    shadowScale: 1.12,
  },
  {
    selector: "#inside-omugwo",
    y: 104,
    scale: 1,
    opacity: 1,
    rotationX: 53,
    rotationY: 3,
    rotationZ: 90,
    coverRotationY: -166,
    pageRotations: [-166, -78, -8, 0],
    pageBends: [0, 18, 3, 0],
    pointerStrength: 0.18,
    shadowOpacity: 0.4,
    shadowScale: 1.1,
  },
  {
    selector: "#sample",
    y: 124,
    scale: 1,
    opacity: 1,
    rotationX: 50,
    rotationY: 9,
    rotationZ: 90,
    coverRotationY: -164,
    pageRotations: [-166, -166, -82, -8],
    pageBends: [0, 0, 18, 3],
    pointerStrength: 0.18,
    shadowOpacity: 0.38,
    shadowScale: 1.08,
  },
  {
    selector: "#editions",
    y: 142,
    scale: 1,
    opacity: 1,
    rotationX: 10,
    rotationY: 18,
    rotationZ: 0,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
    pointerStrength: 0.75,
    shadowOpacity: 0.26,
    shadowScale: 0.92,
  },
  {
    selector: "#creators",
    y: 152,
    scale: 1,
    opacity: 1,
    rotationX: 8,
    rotationY: -16,
    rotationZ: 2,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
    pointerStrength: 0.9,
    shadowOpacity: 0.24,
    shadowScale: 0.88,
  },
  {
    selector: "#faq",
    y: 164,
    scale: 1,
    opacity: 1,
    rotationX: 10,
    rotationY: 12,
    rotationZ: -1,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
    pointerStrength: 0.9,
    shadowOpacity: 0.24,
    shadowScale: 0.88,
  },
  {
    selector: "#final-purchase",
    y: 176,
    scale: 0.92,
    opacity: 1,
    rotationX: 6,
    rotationY: -8,
    rotationZ: -1,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
    pointerStrength: 1,
    shadowOpacity: 0.28,
    shadowScale: 0.92,
  },
  {
    selector: "#final-purchase",
    y: 188,
    scale: 0.72,
    opacity: 1,
    rotationX: 17,
    rotationY: 8,
    rotationZ: 0,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
    pointerStrength: 0.8,
    shadowOpacity: 0.2,
    shadowScale: 0.8,
  },
  {
    selector: "#footer",
    y: 220,
    scale: 0.64,
    opacity: 0,
    rotationX: 14,
    rotationY: -8,
    rotationZ: 0,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
    pointerStrength: 0,
    shadowOpacity: 0,
    shadowScale: 0.62,
  },
];

const heroPose: Omit<StagePose, "selector"> = {
  y: -8,
  scale: 1,
  opacity: 1,
  rotationX: 3,
  rotationY: 10,
  rotationZ: 0,
  coverRotationY: 0,
  pageRotations: [0, 0, 0, 0],
  pageBends: [0, 0, 0, 0],
  pointerStrength: 1,
  shadowOpacity: 0.2,
  shadowScale: 0.82,
};

export function PersistentBookScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const travelRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 960px)").matches) return;

    const scene = sceneRef.current;
    const travel = travelRef.current;
    const pose = poseRef.current;
    if (!scene || !travel || !pose) return;

    const cover = scene.querySelector<HTMLElement>(".book-front-cover");
    const bookScene = scene.querySelector<HTMLElement>(".book-scene");
    const shadow = scene.querySelector<HTMLElement>(".book-floor-shadow");
    const lightSweep = scene.querySelector<HTMLElement>(".book-light-sweep");
    const ripple = scene.querySelector<HTMLElement>(".book-drop-ripple");
    const pages = Array.from(
      scene.querySelectorAll<HTMLElement>(".book-page-leaf"),
    );
    if (
      !cover ||
      !bookScene ||
      !shadow ||
      !lightSweep ||
      !ripple ||
      pages.length !== 4
    )
      return;
    const pageSegmentGroups = pages.map((page) =>
      Array.from(page.querySelectorAll<HTMLElement>(".book-page-segment")),
    );
    const curveWeights = [0.05, 0.12, 0.18, 0.18, 0.12, 0.05] as const;

    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

          gsap.set(travel, {
            y: heroPose.y,
            scale: heroPose.scale,
            autoAlpha: heroPose.opacity,
          });
          gsap.set(pose, {
            rotationX: heroPose.rotationX,
            rotationY: heroPose.rotationY,
            rotationZ: heroPose.rotationZ,
          });
          gsap.set(cover, { rotationY: heroPose.coverRotationY });
          gsap.set(bookScene, {
            "--book-pointer-strength": heroPose.pointerStrength,
          });
          gsap.set(shadow, {
            autoAlpha: heroPose.shadowOpacity,
            scaleX: heroPose.shadowScale,
            scaleY: heroPose.shadowScale,
          });
          gsap.set(ripple, { autoAlpha: 0, scale: 0.55 });
          gsap.set(lightSweep, { autoAlpha: 0, xPercent: -135 });
          pages.forEach((page, index) => {
            gsap.set(page, { rotationY: heroPose.pageRotations[index] });
            pageSegmentGroups[index].forEach((segment) => {
              gsap.set(segment, { rotationY: 0 });
            });
          });

          const scrollRange = Math.max(ScrollTrigger.maxScroll(window), 1);
          const timeline = gsap.timeline({
            defaults: { ease: "sine.inOut" },
            scrollTrigger: {
              trigger: document.documentElement,
              start: "top top",
              end: "max",
              scrub: 1.15,
              invalidateOnRefresh: true,
            },
          });

          let previousProgress = 0;
          let finalSweepAdded = false;

          stages.forEach((stage) => {
            const trigger = document.querySelector<HTMLElement>(stage.selector);
            if (!trigger) return;

            const rawProgress =
              stage.selector === "#footer"
                ? 1
                : (trigger.offsetTop - window.innerHeight * 0.48) / scrollRange;
            const targetProgress = Math.min(
              1,
              Math.max(previousProgress + 0.015, rawProgress),
            );
            const duration = targetProgress - previousProgress;

            const isLanding = stage.selector === "#reader-promise";

            if (isLanding) {
              const dropDuration = duration * 0.84;
              timeline.to(
                travel,
                {
                  y: stage.y + 12,
                  duration: dropDuration,
                  ease: "power3.in",
                },
                previousProgress,
              );
              timeline.to(
                travel,
                {
                  y: stage.y,
                  duration: duration - dropDuration,
                  ease: "back.out(1.35)",
                },
                previousProgress + dropDuration,
              );
              timeline.to(
                ripple,
                {
                  autoAlpha: 0.42,
                  scale: 1.08,
                  duration: duration * 0.1,
                  ease: "power2.out",
                },
                previousProgress + duration * 0.8,
              );
              timeline.to(
                ripple,
                {
                  autoAlpha: 0,
                  scale: 1.5,
                  duration: duration * 0.1,
                  ease: "power2.out",
                },
                previousProgress + duration * 0.9,
              );
            } else {
              timeline.to(
                travel,
                {
                  y: stage.y,
                  duration,
                  ease:
                    stage.selector === "#footer"
                      ? "power2.in"
                      : "sine.inOut",
                },
                previousProgress,
              );
            }
            timeline.to(
              travel,
              {
                scale: stage.scale,
                autoAlpha: stage.opacity,
                duration,
                ease: "sine.inOut",
              },
              previousProgress,
            );
            timeline.to(
              pose,
              {
                rotationX: stage.rotationX,
                rotationY: stage.rotationY,
                rotationZ: stage.rotationZ,
                duration,
              },
              previousProgress,
            );
            timeline.to(
              bookScene,
              {
                "--book-pointer-strength": stage.pointerStrength,
                duration,
              },
              previousProgress,
            );
            timeline.to(
              shadow,
              {
                autoAlpha: stage.shadowOpacity,
                scaleX: stage.shadowScale,
                scaleY: stage.shadowScale,
                duration,
              },
              previousProgress,
            );
            timeline.to(
              cover,
              {
                rotationY: stage.coverRotationY,
                duration,
              },
              previousProgress,
            );
            pages.forEach((page, index) => {
              const pageDelay = duration * index * 0.055;
              const pageDuration = duration * 0.82;
              timeline.to(
                page,
                {
                  rotationY: stage.pageRotations[index],
                  duration: pageDuration,
                  ease: "power2.inOut",
                },
                previousProgress + pageDelay,
              );
              pageSegmentGroups[index].forEach((segment, segmentIndex) => {
                timeline.to(
                  segment,
                  {
                    rotationY:
                      stage.pageBends[index] * curveWeights[segmentIndex],
                    duration: pageDuration,
                    ease: "sine.inOut",
                  },
                  previousProgress + pageDelay,
                );
              });
            });

            if (stage.selector === "#final-purchase" && !finalSweepAdded) {
              timeline.to(
                lightSweep,
                {
                  autoAlpha: 0.34,
                  xPercent: 0,
                  duration: duration * 0.45,
                  ease: "power2.out",
                },
                previousProgress,
              );
              timeline.to(
                lightSweep,
                {
                  autoAlpha: 0,
                  xPercent: 135,
                  duration: duration * 0.55,
                  ease: "power2.in",
                },
                previousProgress + duration * 0.45,
              );
              finalSweepAdded = true;
            }

            previousProgress = targetProgress;
          });
    }, scene);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <div className="persistent-book-scene" ref={sceneRef} aria-hidden="true">
      <div className="persistent-book-travel" ref={travelRef}>
        <div className="book-drop-ripple" />
        <div className="persistent-book-pose" ref={poseRef}>
          <Book3D interactive includeInterior eager animateIn={false} />
        </div>
      </div>
    </div>
  );
}
