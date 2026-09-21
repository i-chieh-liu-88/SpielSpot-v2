import { useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import Button from "../../components/atoms/Button";
import { LoadingSpinner } from "../../components/atoms/LoadingSpinner";
import { ReviewForm } from "../../components/organisms/ReviewForm/ReviewForm";
import { usePlayground } from "../../hooks/usePlaygrounds";
import { useLanguage } from "../../providers/LanguageProvider";

export function ReviewPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { playgroundId } = useSearch({ from: "/reviews/new" });
  const { playground, isLoading, error } = usePlayground(playgroundId);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <section className="grass-bg relative min-h-screen overflow-hidden px-6 py-16">
      <div className="dot-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-4xl">
        <Button
          type="button"
          className="mb-8"
          onClick={() => navigate({ to: "/" })}
        >
          {t("Back to SpielSpot")}
        </Button>
        <header className="mb-10 text-center">
          <p className="mb-4 inline-block rounded-full bg-white/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-grass backdrop-blur">
            {t("Share your experience")}
          </p>
          <h1 className="display text-5xl font-black text-gray-800 md:text-6xl">
            {t("Review a playground")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-gray-600">
            {t(
              "Compare nearby playgrounds by facilities, ages, safety, and parent ratings.",
            )}{" "}
            {t("Your details help another family plan a better day out.")}
          </p>
        </header>
        {playgroundId && isLoading ? (
          <LoadingSpinner label={t("Loading playground details…")} size="xl" />
        ) : playgroundId && (error || !playground) ? (
          <p
            className="rounded-3xl bg-red-50 p-8 text-center font-bold text-red-700"
            role="alert"
          >
            {error ?? t("Playground not found.")}
          </p>
        ) : (
          <ReviewForm
            previewOnly
            playground={playground ?? undefined}
            onSubmitted={() => navigate({ to: "/playgrounds", search: {} })}
          />
        )}
      </div>
    </section>
  );
}
