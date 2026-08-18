/**
 * FutureMe mascot — shared state vocabulary.
 *
 * These strings are the contract between product code, the SVG classes, the
 * Rive state machine and the GLB animation clips. Renaming one here means
 * renaming it in every format; see docs/asset-naming.md.
 */

export type MascotEmotion =
  | 'dislike'
  | 'not-okay'
  | 'neutral'
  | 'smile'
  | 'very-happy';

export type MascotPose =
  | 'idle'
  | 'wave'
  | 'think'
  | 'listen'
  | 'point-left'
  | 'point-right'
  | 'celebrate'
  | 'jump'
  | 'sit';

export type MascotView = 'front' | 'three-quarter' | 'side' | 'back';

/** `face` crops to the head so emotion still reads below ~140px. */
export type MascotCrop = 'full' | 'face';

export type MascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const MASCOT_SIZES: Record<MascotSize, number> = {
  xs: 64,
  sm: 96,
  md: 200,
  lg: 300,
  xl: 440,
};

/**
 * The five-point preference scale. `value` is what the assessment stores, so a
 * questionnaire never has to map between a number and an emotion by hand.
 */
export const MASCOT_SCALE: ReadonlyArray<{
  value: 1 | 2 | 3 | 4 | 5;
  emotion: MascotEmotion;
  labelTh: string;
}> = [
  { value: 1, emotion: 'dislike', labelTh: 'ไม่ใช่ฉันเลย' },
  { value: 2, emotion: 'not-okay', labelTh: 'ไม่ค่อยใช่ฉัน' },
  { value: 3, emotion: 'neutral', labelTh: 'เฉย ๆ' },
  { value: 4, emotion: 'smile', labelTh: 'ค่อนข้างใช่ฉัน' },
  { value: 5, emotion: 'very-happy', labelTh: 'ใช่ฉันมาก' },
];

/**
 * Product state → mascot state. Keeping this in one place is what stops the
 * character from being re-invented per page.
 */
export const MASCOT_PRODUCT_STATES = {
  onboarding: { emotion: 'smile', pose: 'wave' },
  assessment: { emotion: 'neutral', pose: 'idle' },
  interviewListening: { emotion: 'neutral', pose: 'listen' },
  aiThinking: { emotion: 'neutral', pose: 'think' },
  routeReady: { emotion: 'smile', pose: 'point-right' },
  planReady: { emotion: 'very-happy', pose: 'celebrate' },
  empty: { emotion: 'not-okay', pose: 'sit' },
  warning: { emotion: 'not-okay', pose: 'idle' },
  success: { emotion: 'very-happy', pose: 'jump' },
} as const satisfies Record<string, { emotion: MascotEmotion; pose: MascotPose }>;

export type MascotProductState = keyof typeof MASCOT_PRODUCT_STATES;
