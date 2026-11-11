"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { siteConfig } from "@/config/site";

type Book3DProps = {
  className?: string;
  interactive?: boolean;
  includeInterior?: boolean;
  eager?: boolean;
  compact?: boolean;
  animateIn?: boolean;
};

type PageTextureStyle = CSSProperties & {
  "--page-front": string;
  "--page-back": string;
};

type PageSegmentStyle = CSSProperties & {
  "--segment-position": string;
};

function PageSegments() {
  let segments: ReactNode = null;

  for (let index = 5; index >= 0; index -= 1) {
    const style: PageSegmentStyle = {
      "--segment-position": `${index * 20}%`,
    };

    segments = (
      <span className="book-page-segment" style={style}>
        {segments}
      </span>
    );
  }

  return segments;
}

function BookPageLeaf({ index }: { index: number }) {
  const front = siteConfig.interiorPages[index * 2];
  const back = siteConfig.interiorPages[index * 2 + 1];
  const style: PageTextureStyle = {
    "--page-front": `url("${front}")`,
    "--page-back": `url("${back}")`,
  };

  return (
    <div
      className={`book-page-leaf book-page-leaf--${index + 1}`}
      style={style}
    >
      <PageSegments />
    </div>
  );
}

export function Book3D({
  className = "",
  interactive = false,
  includeInterior = false,
  eager = false,
  compact = false,
  animateIn = true,
}: Book3DProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const rotationXToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const rotationYToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    const book = bookRef.current;
    if (!scene || !book) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    if (interactive) {
      rotationXToRef.current = gsap.quickTo(book, "rotationX", {
        duration: 1,
        ease: "power3.out",
      });
      rotationYToRef.current = gsap.quickTo(book, "rotationY", {
        duration: 1.05,
        ease: "power3.out",
      });
    }

    const context = gsap.context(() => {
      if (animateIn) {
        gsap.fromTo(
          scene.querySelector(".book-pose"),
          { autoAlpha: 0, y: 34, rotateZ: -1.5 },
          {
            autoAlpha: 1,
            y: 0,
            rotateZ: 0,
            duration: 1,
            ease: "power3.out",
            clearProps: "opacity,visibility",
          },
        );
      }
    }, scene);

    return () => {
      rotationXToRef.current?.tween.kill();
      rotationYToRef.current?.tween.kill();
      rotationXToRef.current = null;
      rotationYToRef.current = null;
      context.revert();
    };
  }, [animateIn, interactive]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (
      !interactive ||
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !bookRef.current ||
      !rotationXToRef.current ||
      !rotationYToRef.current
    )
      return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    rotationYToRef.current(x * 155);
    rotationXToRef.current(-y * 18);
  }

  function handlePointerLeave() {
    if (
      !interactive ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !bookRef.current ||
      !rotationXToRef.current ||
      !rotationYToRef.current
    )
      return;

    rotationYToRef.current(0);
    rotationXToRef.current(0);
  }

  return (
    <div
      ref={sceneRef}
      className={`book-scene ${compact ? "book-scene--compact" : ""} ${interactive ? "book-scene--interactive" : ""} ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="book-pose">
        <div ref={bookRef} className="book-object">
          <div className="book-front-cover">
            <div className="book-face book-face--front">
              <Image
                src={siteConfig.cover.front}
                alt={`${siteConfig.title} approved cover artwork`}
                fill
                sizes={compact ? "220px" : "(max-width: 768px) 260px, 360px"}
                loading={eager ? "eager" : "lazy"}
                fetchPriority={eager ? "high" : "auto"}
              />
            </div>
            <div className="book-cover-inside" />
          </div>
          <div className="book-face book-face--back">
            <Image
              src={siteConfig.cover.back}
              alt={`${siteConfig.title} approved back-cover artwork`}
              fill
              sizes={compact ? "220px" : "(max-width: 768px) 260px, 360px"}
            />
          </div>
          <div className="book-face book-face--spine">
            <Image
              src={siteConfig.cover.spine}
              alt={`${siteConfig.title} approved spine artwork`}
              fill
              sizes="16px"
            />
          </div>
          <div className="book-page-stack" />
          {includeInterior &&
            siteConfig.interiorPages.slice(0, 4).map((_, index) => (
              <BookPageLeaf key={index} index={index} />
            ))}
          <div className="book-pages book-pages--top" />
          <div className="book-pages book-pages--side" />
          <div className="book-pages book-pages--bottom" />
        </div>
        <div className="book-floor-shadow" />
      </div>
    </div>
  );
}
