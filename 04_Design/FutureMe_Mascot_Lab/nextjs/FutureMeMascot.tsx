/**
 * FutureMeMascot — drop-in component for the FutureMe web app.
 *
 * Install
 *   1. copy mascot.js → lib/mascot.js  (it is already CommonJS/UMD)
 *   2. copy mascot.css → app/mascot.css and import it in app/layout.tsx
 *   3. copy this file and mascot-states.ts → components/mascot/
 *
 * The markup comes from the same builder the lab and the asset exporter use,
 * so there is exactly one drawing of this character in the codebase. It is
 * injected rather than written as JSX because hand-porting ~200 SVG nodes to
 * JSX would immediately fork the source. The string is generated from our own
 * module with no user input in it — the only interpolated value, `ariaLabel`,
 * is escaped by the builder.
 */
'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  MASCOT_SIZES,
  type MascotCrop,
  type MascotEmotion,
  type MascotPose,
  type MascotSize,
  type MascotView,
} from './mascot-states';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mascot = require('@/lib/mascot') as {
  mascotSVG: (opts: Record<string, unknown>) => string;
};

export interface FutureMeMascotProps {
  emotion?: MascotEmotion;
  pose?: MascotPose;
  view?: MascotView;
  /** `face` crops to the head — use it below ~140px so emotion still reads. */
  crop?: MascotCrop;
  size?: MascotSize | number;
  /** Blink and idle motion. Off for dense lists; always off under reduced motion. */
  animated?: boolean;
  /**
   * Set this only when the mascot's state carries information the text does
   * not. Leave it undefined for decoration and the mascot is hidden from
   * assistive tech, which is the correct default.
   */
  ariaLabel?: string;
  className?: string;
}

export function FutureMeMascot({
  emotion = 'smile',
  pose = 'idle',
  view = 'front',
  crop = 'full',
  size = 'md',
  animated = true,
  ariaLabel,
  className,
}: FutureMeMascotProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const width = typeof size === 'number' ? size : MASCOT_SIZES[size];

  /*
   * Built once. Emotion and pose changes are attribute writes on the existing
   * nodes, not a re-render — that is what lets the CSS transition the change
   * instead of popping to it.
   */
  const html = useMemo(
    () => Mascot.mascotSVG({ emotion, pose, view, crop, ariaLabel }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [crop, view],
  );

  useEffect(() => {
    const svg = hostRef.current?.firstElementChild;
    if (!svg) return;
    svg.setAttribute('data-emotion', emotion);
    svg.setAttribute('data-pose', pose);
    if (ariaLabel) svg.setAttribute('aria-label', ariaLabel);
  }, [emotion, pose, ariaLabel]);

  /* Irregular blink. A fixed interval reads as a machine. */
  useEffect(() => {
    if (!animated) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        const svg = hostRef.current?.firstElementChild;
        if (svg && svg.getAttribute('data-emotion') !== 'very-happy') {
          svg.setAttribute('data-blink', '1');
          setTimeout(() => svg.removeAttribute('data-blink'), 150);
        }
        schedule();
      }, 3000 + Math.random() * 4000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [animated]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width, flex: 'none' }}
      data-fm-anim={animated ? 'on' : 'off'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default FutureMeMascot;
