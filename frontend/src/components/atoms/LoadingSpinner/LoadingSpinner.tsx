import {
  Spinner as HeroUISpinner,
  type SpinnerProps,
} from "@heroui/react/spinner";

type LoadingSpinnerProps = {
  label?: string;
  size?: SpinnerProps["size"];
  className?: string;
};

export function LoadingSpinner({
  label = "Loading…",
  size = "lg",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 font-bold text-gray-700 ${className}`}
      role="status"
      aria-live="polite"
    >
      <HeroUISpinner color="success" size={size} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
