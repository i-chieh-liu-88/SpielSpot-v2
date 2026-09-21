import { X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import {
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { EASE_OUT } from "../../../lib/ease";
import { cn } from "../../../lib/utils";
import { useLanguage } from "../../../providers/LanguageProvider";

type CenterMorphModalContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  contentId: string;
};

const CenterMorphModalContext =
  createContext<CenterMorphModalContextValue | null>(null);

function useCenterMorphModalContext(component: string) {
  const context = useContext(CenterMorphModalContext);

  if (!context) {
    throw new Error(`${component} must be used within <CenterMorphModal>`);
  }

  return context;
}

export interface CenterMorphModalProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CenterMorphModal({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: CenterMorphModalProps) {
  const id = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const value = useMemo<CenterMorphModalContextValue>(
    () => ({
      open,
      setOpen,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
    }),
    [id, open, setOpen],
  );

  return (
    <CenterMorphModalContext.Provider value={value}>
      {children}
    </CenterMorphModalContext.Provider>
  );
}

export interface CenterMorphModalTriggerProps {
  children: ReactElement;
}

export function CenterMorphModalTrigger({
  children,
}: CenterMorphModalTriggerProps) {
  const context = useCenterMorphModalContext("CenterMorphModalTrigger");

  if (!isValidElement(children)) {
    return children;
  }

  const child = children as ReactElement<Record<string, unknown>>;
  const childOnClick = child.props.onClick as
    | ((event: React.MouseEvent<HTMLElement>) => void)
    | undefined;

  return cloneElement(child, {
    id: context.triggerId,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      childOnClick?.(event);
      if (!event.defaultPrevented) {
        context.setOpen(!context.open);
      }
    },
    "aria-haspopup": "dialog",
    "aria-expanded": context.open,
    "aria-controls": context.open ? context.contentId : undefined,
  });
}

export interface CenterMorphModalCloseProps {
  children: ReactElement;
}

export function CenterMorphModalClose({
  children,
}: CenterMorphModalCloseProps) {
  const context = useCenterMorphModalContext("CenterMorphModalClose");

  if (!isValidElement(children)) {
    return children;
  }

  const child = children as ReactElement<Record<string, unknown>>;
  const childOnClick = child.props.onClick as
    | ((event: React.MouseEvent<HTMLElement>) => void)
    | undefined;

  return cloneElement(child, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      childOnClick?.(event);
      if (!event.defaultPrevented) {
        context.setOpen(false);
      }
    },
  });
}

export interface CenterMorphModalContentProps {
  children: ReactNode;
  ariaLabel: string;
  ariaDescribedBy?: string;
  dismissible?: boolean;
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  className?: string;
  backdropClassName?: string;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const CENTER_FOLDED_CLIP = "inset(48% 48% 48% 48% round 30px)";
const CENTER_OPEN_CLIP = "inset(0% 0% 0% 0% round 30px)";
const CENTER_UNFOLD_TRANSITION = {
  duration: 0.43,
  ease: [0.2, 0, 0.2, 1],
} as const;

function getFocusableElements(root: HTMLElement | null) {
  if (!root) {
    return [];
  }

  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => element.tabIndex >= 0);
}

function PresencePointerGate({
  children,
}: {
  children: (isPresent: boolean) => ReactNode;
}) {
  return children(useIsPresent());
}

export function CenterMorphModalContent({
  children,
  ariaLabel,
  ariaDescribedBy,
  dismissible = true,
  showCloseButton = true,
  closeButtonLabel = "Close modal",
  className,
  backdropClassName,
}: CenterMorphModalContentProps) {
  const context = useCenterMorphModalContext("CenterMorphModalContent");
  const { t } = useLanguage();
  const reduce = useReducedMotion() ?? false;
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!context.open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = requestAnimationFrame(() => {
      const [firstFocusable] = getFocusableElements(overlayRef.current);
      (firstFocusable ?? panelRef.current)?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        context.setOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(overlayRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.getElementById(context.triggerId)?.focus();
    };
  }, [context, dismissible]);

  return createPortal(
    <AnimatePresence>
      {context.open ? (
        <PresencePointerGate>
          {(isPresent) => (
            <div
              ref={overlayRef}
              className="pointer-events-none fixed inset-0 z-[10000] xl:hidden"
            >
              <motion.button
                type="button"
                aria-label={t("Dismiss menu")}
                tabIndex={-1}
                disabled={!dismissible}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ pointerEvents: isPresent ? "auto" : "none" }}
                transition={{
                  duration: reduce ? 0.1 : 0.28,
                  ease: EASE_OUT,
                }}
                onClick={() => context.setOpen(false)}
                className={cn(
                  "pointer-events-auto absolute inset-0 h-full w-full cursor-default bg-black/15 backdrop-blur-sm",
                  backdropClassName,
                )}
              />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-y-auto p-4 drop-shadow-2xl">
                <div className="flex w-full flex-col items-center py-8">
                  <motion.div
                    ref={panelRef}
                    id={context.contentId}
                    role="dialog"
                    aria-modal="true"
                    aria-label={ariaLabel}
                    aria-describedby={ariaDescribedBy}
                    tabIndex={-1}
                    initial={
                      reduce
                        ? { opacity: 0, clipPath: CENTER_OPEN_CLIP }
                        : { opacity: 1, clipPath: CENTER_FOLDED_CLIP }
                    }
                    animate={{ opacity: 1, clipPath: CENTER_OPEN_CLIP }}
                    exit={
                      reduce
                        ? { opacity: 0, clipPath: CENTER_OPEN_CLIP }
                        : { opacity: 1, clipPath: CENTER_FOLDED_CLIP }
                    }
                    style={{ pointerEvents: isPresent ? "auto" : "none" }}
                    transition={
                      reduce
                        ? { duration: 0.14, ease: EASE_OUT }
                        : CENTER_UNFOLD_TRANSITION
                    }
                    className={cn(
                      "pointer-events-auto relative w-full max-w-[26rem] origin-center overflow-hidden rounded-[30px] border border-green-100 bg-white will-change-[clip-path]",
                      className,
                    )}
                  >
                    {children}

                    {showCloseButton ? (
                      <motion.button
                        type="button"
                        aria-label={closeButtonLabel}
                        onClick={() => context.setOpen(false)}
                        initial={
                          reduce
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.8 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: reduce ? 1 : 0.88,
                          transition: { duration: 0.1, ease: EASE_OUT },
                        }}
                        transition={{
                          delay: reduce ? 0 : 0.16,
                          duration: reduce ? 0.12 : 0.2,
                          ease: EASE_OUT,
                        }}
                        className="center-morph-modal-close absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-gray-100 text-gray-600 transition-colors hover:bg-green-100 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </motion.button>
                    ) : null}
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </PresencePointerGate>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
