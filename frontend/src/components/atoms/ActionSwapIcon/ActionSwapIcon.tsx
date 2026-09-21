import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";

export interface ActionSwapIconProps {
  value: string;
  children: ReactNode;
  className?: string;
}

const ICON_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    scale: 0.25,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.25,
    filter: "blur(8px)",
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

export function ActionSwapIcon({
  value,
  children,
  className,
}: ActionSwapIconProps) {
  const reduceMotion = useReducedMotion();

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden",
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`blur-${value}`}
          aria-hidden="true"
          variants={ICON_VARIANTS}
          initial={reduceMotion ? false : "initial"}
          animate={
            reduceMotion
              ? { opacity: 1, filter: "blur(0px)", scale: 1 }
              : "animate"
          }
          exit={reduceMotion ? undefined : "exit"}
          className="absolute inset-0 flex items-center justify-center leading-none will-change-[opacity,filter,transform]"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
