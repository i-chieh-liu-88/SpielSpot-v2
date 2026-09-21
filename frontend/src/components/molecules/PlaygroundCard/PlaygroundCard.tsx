import StarOutlined from "@mui/icons-material/StarOutlined";
import type { Playground } from "../../../types/content";
import { useLanguage } from "../../../providers/LanguageProvider";

export function PlaygroundCard({ playground }: { playground: Playground }) {
  const { t } = useLanguage();

  return (
    <article className="card-hover overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div
        className={`relative flex h-44 items-end bg-linear-to-br ${playground.gradient} p-5`}
      >
        <img
          className="animate-floatY absolute right-4 top-4 h-30 w-30 select-none object-contain"
          src={playground.image}
          alt=""
        />
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-700">
          {t("{distance} away", { distance: playground.distance })}
        </span>
      </div>
      <div className="p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-lg font-extrabold text-gray-800">
            {playground.name}
          </h3>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
            <StarOutlined className="text-sm" aria-hidden="true" />{" "}
            {playground.rating}
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
