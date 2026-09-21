import StarBorderOutlined from "@mui/icons-material/StarBorderOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import { useLanguage } from "../../../providers/LanguageProvider";

type StarRatingProps = {
  rating: number;
  className?: string;
};

export function StarRating({ rating, className = "" }: StarRatingProps) {
  const { t } = useLanguage();
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span
      className={`inline-flex items-center ${className}`.trim()}
      aria-label={t("{rating} out of 5 stars", { rating: roundedRating })}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const Icon = index < roundedRating ? StarOutlined : StarBorderOutlined;

        return (
          <Icon className="text-[1.15em]" aria-hidden="true" key={index} />
        );
      })}
    </span>
  );
}
