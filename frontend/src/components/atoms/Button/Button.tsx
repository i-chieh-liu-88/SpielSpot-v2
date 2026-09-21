import { Loader2 } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  forwardRef,
  type PointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_PRESS } from "../../../lib/ease";
import { useHoverCapable } from "../../../lib/hooks/useHoverCapable";
import { cn } from "../../../lib/utils";
import "./Button.css";
import type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./Button.types";

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "beui-button-primary",
  secondary: "beui-button-secondary",
  ghost: "beui-button-ghost",
  outline: "beui-button-outline",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-full px-3 text-xs",
  md: "h-10 gap-2 rounded-full px-5 text-sm",
  lg: "h-12 gap-2 rounded-full px-6 text-base",
  icon: "h-8 w-8 rounded-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    pressScale = 0.93,
    ripple = false,
    loading = false,
    className,
    children,
    disabled,
    onPointerDown,
    ...rest
  },
  ref,
) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);
  const isDisabled = disabled || loading;

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (ripple && !reduce) {
        const rect = event.currentTarget.getBoundingClientRect();
        const rippleSize = Math.max(rect.width, rect.height) * 2;
        const id = nextId.current++;

        setRipples((currentRipples) => [
          ...currentRipples,
          {
            id,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            size: rippleSize,
          },
        ]);
      }

      onPointerDown?.(event);
    },
    [onPointerDown, reduce, ripple],
  );

  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={isDisabled}
      aria-busy={loading || undefined}
      whileTap={reduce || isDisabled ? undefined : { scale: pressScale }}
      whileHover={
        reduce || !canHover || isDisabled ? undefined : { scale: 1.02 }
      }
      transition={SPRING_PRESS}
      onPointerDown={handlePointerDown}
      className={cn(
        "beui-button inline-flex select-none items-center justify-center font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        ripple && "relative overflow-hidden",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {ripple && !reduce ? (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <AnimatePresence>
            {ripples.map((rippleItem) => (
              <motion.span
                key={rippleItem.id}
                className="absolute rounded-full bg-current"
                style={{
                  left: rippleItem.x,
                  top: rippleItem.y,
                  width: rippleItem.size,
                  height: rippleItem.size,
                  x: "-50%",
                  y: "-50%",
                }}
                initial={{ scale: 0.05, opacity: 0.3 }}
                animate={{ scale: 1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: EASE_OUT }}
                onAnimationComplete={() =>
                  setRipples((currentRipples) =>
                    currentRipples.filter(
                      (currentRipple) => currentRipple.id !== rippleItem.id,
                    ),
                  )
                }
              />
            ))}
          </AnimatePresence>
        </span>
      ) : null}
      {loading ? (
        <Loader2
          className="h-4 w-4 animate-spin"
          aria-hidden="true"
          data-testid="button-loading-icon"
        />
      ) : null}
      {children}
    </motion.button>
  );
});

export default Button;
