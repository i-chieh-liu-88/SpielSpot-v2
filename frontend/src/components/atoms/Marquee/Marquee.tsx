import { Children, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../../lib/utils";

export interface MarqueeProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  speed?: number;
  pauseOnHover?: boolean;
  gap?: string;
  className?: string;
  fade?: boolean;
}

export function Marquee({
  children,
  direction = "left",
  speed = 30,
  pauseOnHover = true,
  gap = "1rem",
  className,
  fade = true,
}: MarqueeProps) {
  const vertical = direction === "up" || direction === "down";
  const reverse = direction === "right" || direction === "down";
  const items = Children.toArray(children);

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden",
        vertical ? "flex-col" : "flex-row",
        fade &&
          !vertical &&
          "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        fade &&
          vertical &&
          "[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
      style={{ "--gap": gap, gap } as CSSProperties}
    >
      {[0, 1].map((duplicateIndex) => (
        <div
          key={duplicateIndex}
          aria-hidden={duplicateIndex === 1}
          inert={duplicateIndex === 1}
          style={{
            animationDuration: `${speed}s`,
            animationDirection: reverse ? "reverse" : "normal",
            gap,
          }}
          className={cn(
            "flex shrink-0 items-center",
            vertical
              ? "animate-marquee-vertical flex-col"
              : "animate-marquee flex-row",
            pauseOnHover &&
              "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]",
            "motion-reduce:[animation-play-state:paused]",
          )}
        >
          {items.map((child, itemIndex) => (
            <div key={itemIndex} className="shrink-0">
              {child}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
