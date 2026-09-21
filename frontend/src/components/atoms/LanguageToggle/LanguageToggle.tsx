import { Languages } from "lucide-react";
import { useLanguage } from "../../../providers/LanguageProvider";

export function LanguageToggle() {
  const { language, t, toggleLanguage } = useLanguage();
  const targetLanguage = language === "en" ? "German" : "English";

  return (
    <button
      type="button"
      className="animate-fadeUp inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-slate-900/20 bg-white/70 px-2.5 text-xs font-black text-slate-950 shadow-sm backdrop-blur transition-colors hover:border-grass hover:bg-grass/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grass focus-visible:ring-offset-2 dark:border-white/35 dark:bg-white/10 dark:text-white"
      aria-label={t(`Switch language to ${targetLanguage}`)}
      onClick={toggleLanguage}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span aria-hidden="true">{language === "en" ? "DE" : "EN"}</span>
    </button>
  );
}
