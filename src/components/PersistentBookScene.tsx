"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
};

const stages: readonly StagePose[] = [
  {
    selector: "#reader-promise",
    y: 65,
    scale: 1,
    opacity: 1,
    rotationX: 16,
    rotationY: -18,
    rotationZ: 90,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
  },
  {
    selector: "#reader-promise",
    y: 80,
    scale: 1,
    opacity: 1,
    rotationX: 18,
    rotationY: 8,
    rotationZ: 0,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
  },
  {
    selector: "#story",
    y: 95,
    scale: 1,
    opacity: 1,
    rotationX: 14,
    rotationY: -8,
    rotationZ: 0,
    coverRotationY: -148,
    pageRotations: [-38, -8, 0, 0],
    pageBends: [9, 3, 0, 0],
  },
  {
    selector: "#inside-omugwo",
    y: 110,
    scale: 1,
    opacity: 1,
    rotationX: 18,
    rotationY: 8,
    rotationZ: 1,
    coverRotationY: -164,
    pageRotations: [-158, -112, -18, -4],
    pageBends: [0, 10, 5, 2],
  },
  {
    selector: "#sample",
    y: 125,
    scale: 1,
    opacity: 1,
    rotationX: 15,
    rotationY: 14,
    rotationZ: -2,
    coverRotationY: -158,
    pageRotations: [-160, -158, -128, -42],
    pageBends: [0, 0, 9, 12],
  },
  {
    selector: "#editions",
    y: 140,
    scale: 1,
    opacity: 1,
    rotationX: 17,
    rotationY: 20,
    rotationZ: 0,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
  },
  {
    selector: "#creators",
    y: 152,
    scale: 1,
    opacity: 1,
    rotationX: 14,
    rotationY: -16,
    rotationZ: 2,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
  },
  {
    selector: "#faq",
    y: 164,
    scale: 1,
    opacity: 1,
    rotationX: 18,
    rotationY: 12,
    rotationZ: -1,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
  },
  {
    selector: "#final-purchase",
    y: 176,
    scale: 0.86,
    opacity: 1,
    rotationX: 15,
    rotationY: -10,
    rotationZ: -1,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
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
  },
  {
    selector: "#footer",
    y: 200,
    scale: 0.62,
    opacity: 0,
    rotationX: 14,
    rotationY: -8,
    rotationZ: 0,
    coverRotationY: 0,
    pageRotations: [0, 0, 0, 0],
    pageBends: [0, 0, 0, 0],
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
};

export function PersistentBookScene() {
  const [isDesktop, setIsDesktop] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const travelRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 960px)");
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useLayoutEffect(() => {
    if (!isDesktop) return;

    const scene = sceneRef.current;
    const travel = travelRef.current;
    const pose = poseRef.current;
    if (!scene || !travel || !pose) return;

    const cover = scene.querySelector<HTMLElement>(".book-front-cover");
    const pages = Array.from(
      scene.querySelectorAll<HTMLElement>(".book-page-leaf"),
    );
    if (!cover || pages.length !== 4) return;
    const pageSegmentGroups = pages.map((page) =>
      Array.from(page.querySelectorAll<HTMLElement>(".book-page-segment")),
    );
    const curveWeights = [0.05, 0.12, 0.18, 0.18, 0.12, 0.05] as const;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(
        "(min-width: 960px) and (prefers-reduced-motion: no-preference)",
        () => {
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

            const dropDuration = duration * 0.82;
            const settleDuration = duration - dropDuration;

            timeline.to(
              travel,
              {
                y: stage.y + 9,
                duration: dropDuration,
                ease: "power2.in",
              },
              previousProgress,
            );
            timeline.to(
              travel,
              {
                y: stage.y,
                duration: settleDuration,
                ease: "back.out(1.7)",
              },
              previousProgress + dropDuration,
            );
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
              cover,
              {
                rotationY: stage.coverRotationY,
                duration,
              },
              previousProgress,
            );
            pages.forEach((page, index) => {
              timeline.to(
                page,
                {
                  rotationY: stage.pageRotations[index],
                  duration,
                },
                previousProgress,
              );
              pageSegmentGroups[index].forEach((segment, segmentIndex) => {
                timeline.to(
                  segment,
                  {
                    rotationY:
                      stage.pageBends[index] * curveWeights[segmentIndex],
                    duration,
                  },
                  previousProgress,
                );
              });
            });

            previousProgress = targetProgress;
          });
        },
      );
    }, scene);

    return () => {
      media.revert();
      context.revert();
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div className="persistent-book-scene" ref={sceneRef} aria-hidden="true">
      <div className="persistent-book-travel" ref={travelRef}>
        <div className="persistent-book-pose" ref={poseRef}>
          <Book3D interactive includeInterior eager animateIn={false} />
        </div>
      </div>
    </div>
  );
}
