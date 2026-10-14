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
    <section className="grass-bg relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 sm:py-12">
      <div className="dot-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-4xl">
        <Button
          type="button"
          className="mb-6 min-h-11"
          variant="secondary"
          onClick={() => navigate({ to: "/" })}
        >
          {t("Back to SpielSpot")}
        </Button>
        <header className="mb-8 max-w-3xl text-left">
          <h1 className="display text-3xl font-bold leading-tight tracking-tight text-balance text-gray-800 sm:text-4xl lg:text-5xl">
            {t("Review a playground")}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-pretty text-gray-600 sm:text-lg">
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
            playground={playground ?? undefined}
            onSubmitted={() => navigate({ to: "/playgrounds", search: {} })}
          />
        )}
      </div>
    </section>
  );
}
