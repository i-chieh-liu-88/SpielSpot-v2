import { useLanguage } from "../../../providers/LanguageProvider";

export function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();

  return (
    <a href="/#top" className="inline-flex items-center" aria-label={t("SpielSpot home")}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48" width={compact ? 180 : 200} height={compact ? 44 : 48} role="img" aria-label="SpielSpot">
        <rect x="0" y="7" width="34" height="34" rx="7" ry="7" fill="#16a34a" />
        <rect x="2.5" y="9.5" width="29" height="29" rx="5" ry="5" fill="none" stroke="white" strokeWidth="1.4" opacity="0.55" />
        <text x="17" y="31" textAnchor="middle" fontFamily="'Hanken Grotesk', sans-serif" fontWeight="800" fontSize="22" fill="white">S</text>
        <text x="42" y="34" fontFamily="'Hanken Grotesk', sans-serif" fontWeight="900" fontSize="26" fill="#16a34a" letterSpacing="-0.5">SpielSpot</text>
      </svg>
    </a>
  )
}
