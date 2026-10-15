import StarOutlined from "@mui/icons-material/StarOutlined";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
import { useState } from "react";
import type { Playground } from "../../../types/content";
import { useLanguage } from "../../../providers/LanguageProvider";
import "./PlaygroundCard.css";

export function PlaygroundCard({ playground }: { playground: Playground }) {
  const { t } = useLanguage();
  const [failedImage, setFailedImage] = useState<string>();
  const hasImage = Boolean(playground.image) && failedImage !== playground.image;
  const rating = Number(playground.rating);
  const hasRating = Number.isFinite(rating) && rating >= 1 && rating <= 5;

  return (
    <article className="playground-card overflow-hidden">
      <div className="playground-card-media">
        {hasImage ? <img
          className="playground-card-image"
          src={playground.image}
          alt=""
          onError={() => setFailedImage(playground.image)}
        /> : <div className="playground-card-placeholder">
          <ImageOutlined aria-hidden="true" />
          <span>{t("Photo unavailable")}</span>
        </div>}
        {playground.distance.trim() && <span className="playground-card-distance">
          {t("{distance} away", { distance: playground.distance })}
        </span>}
      </div>
      <div className="p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-lg font-extrabold text-gray-800">
            {playground.name}
          </h3>
          <span className="playground-card-rating" aria-label={hasRating ? t("{rating} out of 5 stars", { rating }) : t("Not rated")}>
            {hasRating && <StarOutlined aria-hidden="true" />}
            <span>{hasRating ? rating : t("Not rated")}</span>
            {hasRating && <span className="playground-card-rating-scale" aria-hidden="true">/5</span>}
          </span>
        </div>
        <p className="mb-4 text-sm font-semibold text-gray-400">
          {playground.location}
        </p>
        <ul className="flex flex-wrap gap-2" aria-label={t("Facilities")}>
          {playground.tags.map((tag) => (
            <li
              className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700"
              key={tag}
            >
              {t(tag)}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
