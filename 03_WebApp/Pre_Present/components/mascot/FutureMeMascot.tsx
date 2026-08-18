"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef } from "react";
import {
  MASCOT_SIZES,
  type MascotCrop,
  type MascotEmotion,
  type MascotPose,
  type MascotSize,
  type MascotView,
} from "@/lib/mascot/states";

// The synchronized design source is a UMD/CommonJS module so the standalone
// lab, exporter and Next.js app all render the same SVG geometry.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Mascot = require("@/lib/mascot/mascot") as {
  mascotSVG: (options: Record<string, unknown>) => string;
};

export interface FutureMeMascotProps {
  emotion?: MascotEmotion;
  pose?: MascotPose;
  view?: MascotView;
  crop?: MascotCrop;
  size?: MascotSize | number;
  animated?: boolean;
  motion?: "system" | "on" | "off";
  ariaLabel?: string;
  className?: string;
}

/** Live mascot renderer synchronized from the repository's Mascot Lab. */
export default function FutureMeMascot({
  emotion = "smile",
  pose = "idle",
  view = "front",
  crop = "full",
  size = "md",
  animated = true,
  motion = "system",
  ariaLabel,
  className,
}: FutureMeMascotProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const uid = useMemo(() => `fm-${reactId.replace(/[^a-zA-Z0-9_-]/g, "_")}`, [reactId]);
  const width = typeof size === "number" ? size : MASCOT_SIZES[size];

  const html = useMemo(
    () => Mascot.mascotSVG({ emotion, pose, view, crop, ariaLabel, uid }),
    // Emotion and pose update as attributes so CSS can transition the stable SVG.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [crop, uid, view],
  );

  /* React may restore dangerouslySetInnerHTML during an otherwise unrelated
   * parent render (for example, clearing the transcript). Reapply the live
   * attributes in the layout phase on every render so no unconfigured SVG is
   * ever painted. */
  useLayoutEffect(() => {
    const svg = hostRef.current?.firstElementChild;
    if (!svg) return;
    svg.setAttribute("data-emotion", emotion);
    svg.setAttribute("data-pose", pose);
    svg.setAttribute("data-fm-motion", motion);
    if (ariaLabel) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", ariaLabel);
      svg.removeAttribute("aria-hidden");
    } else {
      svg.setAttribute("role", "presentation");
      svg.setAttribute("aria-hidden", "true");
      svg.removeAttribute("aria-label");
    }
  });

  useEffect(() => {
    const svg = hostRef.current?.firstElementChild;
    if (!animated || motion === "off") {
      svg?.removeAttribute("data-blink");
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let blinkTimer: ReturnType<typeof setTimeout> | undefined;
    let scheduleTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const shouldReduceMotion = () => motion === "system" && reduceMotion.matches;

    const clearTimers = () => {
      if (scheduleTimer) clearTimeout(scheduleTimer);
      if (blinkTimer) clearTimeout(blinkTimer);
      scheduleTimer = undefined;
      blinkTimer = undefined;
      svg?.removeAttribute("data-blink");
    };

    const schedule = () => {
      if (cancelled || shouldReduceMotion()) return;
      scheduleTimer = setTimeout(() => {
        scheduleTimer = undefined;
        if (cancelled || shouldReduceMotion() || document.hidden) {
          if (!cancelled) schedule();
          return;
        }
        const currentSvg = hostRef.current?.firstElementChild;
        if (currentSvg && currentSvg.getAttribute("data-emotion") !== "very-happy") {
          currentSvg.setAttribute("data-blink", "1");
          blinkTimer = setTimeout(() => {
            currentSvg.removeAttribute("data-blink");
            blinkTimer = undefined;
          }, 150);
        }
        schedule();
      }, 3000 + Math.random() * 4000);
    };

    const handleMotionPreference = () => {
      clearTimers();
      if (!shouldReduceMotion()) schedule();
    };

    if (motion === "system") reduceMotion.addEventListener("change", handleMotionPreference);
    if (!shouldReduceMotion()) schedule();

    return () => {
      cancelled = true;
      if (motion === "system") reduceMotion.removeEventListener("change", handleMotionPreference);
      clearTimers();
    };
  }, [animated, motion]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width, flex: "none" }}
      data-fm-anim={animated && motion !== "off" ? "on" : "off"}
      data-fm-motion={motion}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
