import { Moon, Sun } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../../lib/utils";
import { useLanguage } from "../../../providers/LanguageProvider";
import { ActionSwapIcon } from "../ActionSwapIcon";

export type ThemeVariant = "rectangle" | "circle" | "circle-blur";

export type RectStart =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center"
  | "bottom-up";

export interface ThemeToggleProps
  extends Omit<
    ComponentPropsWithoutRef<"button">,
    "children" | "onClick" | "onToggle"
  > {
  variant?: ThemeVariant;
  start?: RectStart;
  iconClassName?: string;
}

const VIEW_TRANSITION_STYLE_ID = "beui-theme-toggle-vt";
const RECT_FROM: Record<RectStart, string> = {
  "top-left": "inset(0 100% 100% 0)",
  "top-right": "inset(0 0 100% 100%)",
  "bottom-left": "inset(100% 100% 0 0)",
  "bottom-right": "inset(100% 0 0 100%)",
  center: "inset(50% 50% 50% 50%)",
  "bottom-up": "inset(100% 0 0 0)",
};
const CIRCLE_ORIGIN: Record<RectStart, string> = {
  "top-left": "0% 0%",
  "top-right": "100% 0%",
  "bottom-left": "0% 100%",
  "bottom-right": "100% 100%",
  center: "50% 50%",
  "bottom-up": "50% 100%",
};
const VIEW_TRANSITION_CSS = `
html[data-beui-vt="rect"]::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
}
html[data-beui-vt="rect"]::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: beui-rect-reveal 400ms ease-out;
}
html[data-beui-vt="circle"]::view-transition-old(root),
html[data-beui-vt="circle-blur"]::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
}
html[data-beui-vt="circle"]::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: beui-circle-reveal 700ms cubic-bezier(0.4, 0, 0.2, 1);
}
html[data-beui-vt="circle-blur"]::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: beui-circle-blur-reveal 700ms cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes beui-rect-reveal {
  from { clip-path: var(--beui-vt-from, inset(100% 0 0 0)); }
  to   { clip-path: inset(0 0 0 0); }
}
@keyframes beui-circle-reveal {
  from { clip-path: circle(0% at var(--beui-vt-origin, 50% 100%)); }
  to   { clip-path: circle(150% at var(--beui-vt-origin, 50% 100%)); }
}
@keyframes beui-circle-blur-reveal {
  from { clip-path: circle(0% at var(--beui-vt-origin, 50% 100%)); filter: blur(8px); }
  to   { clip-path: circle(150% at var(--beui-vt-origin, 50% 100%)); filter: blur(0px); }
}
`;

type ViewTransitionDocument = Document & {
  startViewTransition(callback: () => void): { finished: Promise<void> };
};

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeToggle({
  variant = "rectangle",
  start = "bottom-up",
}: {
  variant?: ThemeVariant;
  start?: RectStart;
} = {}) {
  const { setTheme, resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);

  // next-themes resolves client state after mount; this mirrors beUI's guard.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (document.getElementById(VIEW_TRANSITION_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = VIEW_TRANSITION_STYLE_ID;
    style.textContent = VIEW_TRANSITION_CSS;
    document.head.appendChild(style);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const toggle = () => {
    const next = isDark ? "light" : "dark";

    if (reduceMotion || !("startViewTransition" in document)) {
      setTheme(next);
      return;
    }

    const root = document.documentElement;
    if (variant === "rectangle") {
      root.style.setProperty("--beui-vt-from", RECT_FROM[start]);
      root.dataset.beuiVt = "rect";
    } else {
      root.style.setProperty("--beui-vt-origin", CIRCLE_ORIGIN[start]);
      root.dataset.beuiVt = variant;
    }

    const transition = (
      document as ViewTransitionDocument
    ).startViewTransition(() => setTheme(next));

    transition.finished.finally(() => {
      delete root.dataset.beuiVt;
    });
  };

  return { isDark, mounted, toggle };
}

export function ThemeToggle({
  variant = "rectangle",
  start = "bottom-up",
  className,
  iconClassName = "h-3 w-3",
  ...rest
}: ThemeToggleProps) {
  const { isDark, mounted, toggle } = useThemeToggle({ variant, start });
  const { t } = useLanguage();

  return (
    <button
      type="button"
      aria-label={t(
        isDark ? "Switch to light mode" : "Switch to dark mode",
      )}
      onClick={toggle}
      className={cn(
        "flex h-8 w-8 aspect-square shrink-0 items-center justify-center rounded-full border border-slate-900/20 bg-white/70 p-0 text-slate-950 shadow-sm backdrop-blur",
        "dark:border-white/35 dark:bg-white/10 dark:text-white",
        "transition-colors hover:border-grass hover:bg-grass/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grass focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        className,
      )}
      {...rest}
    >
      {mounted ? (
        <ActionSwapIcon
          value={isDark ? "dark" : "light"}
          className={iconClassName}
        >
          {isDark ? (
            <Sun className={iconClassName} />
          ) : (
            <Moon className={iconClassName} />
          )}
        </ActionSwapIcon>
      ) : (
        <span className={iconClassName} aria-hidden="true" />
      )}
    </button>
  );
}
