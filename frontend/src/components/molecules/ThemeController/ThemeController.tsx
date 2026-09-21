import { ThemeToggle } from "../../atoms/ThemeToggle";

export function ThemeController() {
  return (
    <ThemeToggle
      className="animate-fadeUp"
      variant="circle-blur"
      start="bottom-up"
      iconClassName="h-5 w-5"
    />
  );
}
