import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import {
  forwardRef,
  useEffect,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

export interface ExpandingArrowButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "children"
> {
  children: ReactNode;
  accentClassName?: string;
  labelClassName?: string;
}

const ARROW_OPACITY = [1, 0.78, 0.54, 0.32, 0.16] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;
const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function useHoverCapable() {
  const [canHover, setCanHover] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );

  useEffect(() => {
    const hoverQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    const updateHoverCapability = (event: MediaQueryListEvent) =>
      setCanHover(event.matches);

    hoverQuery.addEventListener("change", updateHoverCapability);
    return () =>
      hoverQuery.removeEventListener("change", updateHoverCapability);
  }, []);

  return canHover;
}

function DottedChevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 28"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="4" cy="4" r="2" fill="currentColor" />
      <circle cx="10" cy="9" r="2" fill="currentColor" />
      <circle cx="16" cy="14" r="2" fill="currentColor" />
      <circle cx="10" cy="19" r="2" fill="currentColor" />
      <circle cx="4" cy="24" r="2" fill="currentColor" />
    </svg>
  );
}

export const ExpandingArrowButton = forwardRef<
  HTMLButtonElement,
  ExpandingArrowButtonProps
>(function ExpandingArrowButton(
  {
    children,
    className,
    accentClassName,
    labelClassName,
    disabled,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const canHover = useHoverCapable();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const active = !disabled && ((canHover && hovered) || focused);
  const layoutTransition = reduceMotion ? { duration: 0 } : SPRING_LAYOUT;

  const handleMouseEnter = (event: MouseEvent<HTMLButtonElement>) => {
    setHovered(true);
    onMouseEnter?.(event);
  };

  const handleMouseLeave = (event: MouseEvent<HTMLButtonElement>) => {
    setHovered(false);
    onMouseLeave?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.97 }}
      transition={SPRING_PRESS}
      className={mergeClassNames(
        "relative inline-flex h-16 min-w-72 select-none items-center overflow-hidden rounded-[22px] bg-neutral-950 p-1.5 text-white",
        "outline-none focus-visible:ring-2 focus-visible:ring-grass focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-slate-950",
        className,
      )}
      {...rest}
    >
      <motion.span
        layout="size"
        aria-hidden="true"
        transition={layoutTransition}
        style={{
          width: active ? "calc(100% - 12px)" : 52,
          borderRadius: 16,
        }}
        className={mergeClassNames(
          "absolute inset-y-1.5 left-1.5 z-10 overflow-hidden bg-grass text-neutral-950",
          accentClassName,
        )}
      >
        <motion.span
          animate={{ opacity: active ? 0 : 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.1, ease: EASE_OUT }}
          className="absolute inset-0 grid place-items-center"
        >
          <DottedChevron className="h-7 w-5" />
        </motion.span>

        <span className="absolute inset-0 flex items-center justify-around px-3">
          {ARROW_OPACITY.map((opacity, index) => (
            <motion.span
              key={opacity}
              animate={{
                opacity: active ? 1 : 0,
                transform:
                  active && !reduceMotion
                    ? "translateX(0px)"
                    : "translateX(-6px)",
              }}
              transition={{
                duration: reduceMotion ? 0 : 0.18,
                delay:
                  active && !reduceMotion ? 0.04 + index * 0.025 : 0,
                ease: EASE_OUT,
              }}
              style={{ color: `rgb(10 10 10 / ${opacity})` }}
              className="inline-grid place-items-center"
            >
              <DottedChevron className="h-7 w-5" />
            </motion.span>
          ))}
        </span>
      </motion.span>

      <motion.span
        animate={{
          opacity: active ? 0 : 1,
          transform:
            active && !reduceMotion ? "translateX(6px)" : "translateX(0px)",
        }}
        transition={{ duration: reduceMotion ? 0 : 0.12, ease: EASE_OUT }}
        className={mergeClassNames(
          "relative z-0 ml-[76px] mr-5 whitespace-nowrap text-lg font-medium tracking-[-0.02em]",
          labelClassName,
        )}
      >
        {children}
      </motion.span>
    </motion.button>
  );
});
