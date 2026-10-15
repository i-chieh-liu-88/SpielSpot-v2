import type { Review } from "../../../types/content";
import { StarRating } from "../../atoms/StarRating";
import { useLanguage } from "../../../providers/LanguageProvider";
import "./ReviewCard.css";

export function ReviewCard({ review }: { review: Review }) {
  const { t } = useLanguage();

  return (
    <figure className="review-card card-hover text-left">
      <StarRating className="mb-4 text-lg text-amber-400" rating={5} />
      <blockquote className="mb-6 text-sm font-semibold leading-relaxed text-gray-500">
        “{t(review.quote)}”
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span
          className="review-card-avatar grid h-10 w-10 place-items-center rounded-full text-sm font-extrabold"
          aria-hidden="true"
        >
          {review.initials}
        </span>
        <span>
          <strong className="block text-sm text-gray-700">{review.name}</strong>
          <span className="text-xs text-gray-400">{t(review.detail)}</span>
        </span>
      </figcaption>
    </figure>
  );
}
