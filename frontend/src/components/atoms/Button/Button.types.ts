import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "size"> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressScale?: number;
  ripple?: boolean;
  loading?: boolean;
}
