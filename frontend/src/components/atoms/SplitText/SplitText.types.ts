import type { ReactNode } from "react";
import type { gsap } from "gsap";

export type SplitTextTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";

export type SplitTextProps = {
  text: string;
  children?: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  tag?: SplitTextTag;
  id?: string;
  "aria-label"?: string;
  onLetterAnimationComplete?: () => void;
};
