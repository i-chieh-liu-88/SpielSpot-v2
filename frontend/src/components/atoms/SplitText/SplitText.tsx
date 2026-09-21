import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import type { SplitTextProps } from "./SplitText.types";
import "./SplitText.css";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

const defaultFrom = { opacity: 0, y: 40 };
const defaultTo = { opacity: 1, y: 0 };

export function SplitText({
  text,
  children,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = defaultFrom,
  to = defaultTo,
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  tag: Tag = "p",
  id,
  "aria-label": ariaLabel,
  onLetterAnimationComplete,
}: SplitTextProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const animationCompletedRef = useRef(false);
  const completionCallbackRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(
    () => !document.fonts || document.fonts.status === "loaded",
  );

  useEffect(() => {
    completionCallbackRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    let isMounted = true;
    const fontSet = document.fonts;

    if (!fontSet || fontsLoaded) return;

    void fontSet.ready.then(() => {
      if (isMounted) setFontsLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, [fontsLoaded]);

  useGSAP(
    () => {
      const element = elementRef.current;
      if (!element || !text || !fontsLoaded || animationCompletedRef.current) return;

      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        animationCompletedRef.current = true;
        completionCallbackRef.current?.();
        return;
      }

      const startPercentage = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? Number.parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch?.[2] || "px";
      const marginOffset =
        marginValue === 0
          ? ""
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;

      const splitInstance = new GSAPSplitText(element, {
        type: splitType,
        smartWrap: true,
        autoSplit: true,
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        reduceWhiteSpace: false,
        onSplit: (instance) => {
          element.setAttribute("aria-label", ariaLabel ?? text);
          const targets = splitType.includes("chars")
            ? instance.chars
            : splitType.includes("words")
              ? instance.words
              : instance.lines;

          return gsap.fromTo(targets, from, {
            ...to,
            duration,
            ease,
            stagger: delay / 1000,
            force3D: true,
            scrollTrigger: {
              trigger: element,
              start: `top ${startPercentage}%${marginOffset}`,
              once: true,
              fastScrollEnd: true,
              anticipatePin: 0.4,
            },
            onComplete: () => {
              animationCompletedRef.current = true;
              completionCallbackRef.current?.();
            },
          });
        },
      });

      return () => {
        ScrollTrigger.getAll()
          .filter((trigger) => trigger.trigger === element)
          .forEach((trigger) => trigger.kill());
        splitInstance.revert();
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
      ],
      scope: elementRef,
      revertOnUpdate: true,
    },
  );

  return (
    <Tag
      ref={elementRef as React.Ref<never>}
      id={id}
      aria-label={ariaLabel ?? text}
      className={`split-parent ${className}`.trim()}
      style={{ textAlign }}
    >
      {children ?? text}
    </Tag>
  );
}
