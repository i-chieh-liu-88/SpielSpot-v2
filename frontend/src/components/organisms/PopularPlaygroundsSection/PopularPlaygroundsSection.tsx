import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import type { Playground } from "../../../types/content";
import Button from "../../atoms/Button";
import { LoadingSpinner } from "../../atoms/LoadingSpinner";
import { Marquee } from "../../atoms/Marquee";
import { SectionHeading } from "../../atoms/SectionHeading/SectionHeading";
import { PlaygroundCard } from "../../molecules/PlaygroundCard/PlaygroundCard";
import { useLanguage } from "../../../providers/LanguageProvider";

type PopularPlaygroundsSectionProps = {
  playgrounds: Playground[];
  isLoading: boolean;
  error?: string;
};

export function PopularPlaygroundsSection({
  playgrounds,
  isLoading,
  error,
}: PopularPlaygroundsSectionProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const popularPlaygrounds = useMemo(
    () =>
      [...playgrounds]
        .sort(
          (first, second) =>
            Number(second.rating) - Number(first.rating) ||
            second.reviews.length - first.reviews.length ||
            first.name.localeCompare(second.name),
        )
        .slice(0, 10),
    [playgrounds],
  );

  return (
    <section
      id="playgrounds"
      className="scroll-mt-24 bg-white px-6 py-24"
      aria-labelledby="playgrounds-heading"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="playgrounds-heading"
          title={t("Popular playgrounds")}
          tone="sand"
        />
        {isLoading && (
          <LoadingSpinner
            className="py-8"
            label={t("Loading popular playgrounds…")}
            size="xl"
          />
        )}
        {error && (
          <p className="text-center font-bold text-red-700" role="alert">
            {error}
          </p>
        )}
        {!isLoading && !error && (
          <div
            className="mt-10"
            role="region"
            aria-label={t("Popular playground marquee")}
          >
            <Marquee
              className="py-8"
              direction="left"
              speed={30}
              gap="1.25rem"
              pauseOnHover
              fade
            >
              {popularPlaygrounds.map((playground) => (
                <Link
                  className="block h-[23rem] w-[280px] rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-green-500 focus-visible:ring-offset-4 [&>article]:h-full [&_h3]:line-clamp-2 [&_ul]:max-h-16 [&_ul]:overflow-hidden sm:w-[300px]"
                  to="/playgrounds/$playgroundId"
                  params={{ playgroundId: playground.id }}
                  key={playground.id}
                  aria-label={t("View details for {name}", {
                    name: playground.name,
                  })}
                >
                  <PlaygroundCard playground={playground} />
                </Link>
              ))}
            </Marquee>
          </div>
        )}
        <div className="mt-12 text-center">
          <Button
            type="button"
            size="lg"
            onClick={() => navigate({ to: "/playgrounds" })}
          >
            {t("View All Playgrounds")}
          </Button>
        </div>
      </div>
    </section>
  );
}
