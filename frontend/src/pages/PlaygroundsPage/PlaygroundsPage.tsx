import MapOutlined from "@mui/icons-material/MapOutlined";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import Button from "../../components/atoms/Button";
import { LoadingSpinner } from "../../components/atoms/LoadingSpinner";
import { MapLocationSearch } from "../../components/molecules/MapLocationSearch";
import { PlaygroundCarousel } from "../../components/molecules/PlaygroundCarousel";
import {
  PlaygroundMap,
  type PlaygroundMapArea,
} from "../../components/organisms/PlaygroundMap/PlaygroundMap";
import { usePlaygrounds } from "../../hooks/usePlaygrounds";
import { filterPlaygrounds } from "../../utils/filterPlaygrounds";
import type { MapLocation } from "../../types/map";
import { useLanguage } from "../../providers/LanguageProvider";

function getAreaCardLimit(zoom: number) {
  if (zoom >= 15) return 6;
  if (zoom >= 13) return 8;
  return 12;
}

export function PlaygroundsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { q } = useSearch({ from: "/playgrounds" });
  const { playgrounds, isLoading, error } = usePlaygrounds();
  const [focusLocation, setFocusLocation] = useState<MapLocation>();
  const [mapArea, setMapArea] = useState<PlaygroundMapArea>();
  const mappedPlaygrounds = useMemo(
    () => filterPlaygrounds(playgrounds, q),
    [playgrounds, q],
  );
  const areaPlaygrounds = useMemo(() => {
    if (!mapArea) return mappedPlaygrounds.slice(0, 12);

    const playgroundById = new Map(
      mappedPlaygrounds.map((playground) => [playground.id, playground]),
    );
    const limit = getAreaCardLimit(mapArea.zoom);
    return mapArea.playgroundIds
      .map((playgroundId) => playgroundById.get(playgroundId))
      .filter((playground) => playground !== undefined)
      .slice(0, limit);
  }, [mapArea, mappedPlaygrounds]);
  const visibleAreaCount = mapArea
    ? mapArea.playgroundIds.length
    : mappedPlaygrounds.length;

  const updateMapArea = useCallback(
    (nextArea: PlaygroundMapArea) => setMapArea(nextArea),
    [],
  );

  const openPlayground = useCallback(
    (playgroundId: string) => {
      navigate({ to: "/playgrounds/$playgroundId", params: { playgroundId } });
    },
    [navigate],
  );

  if (isLoading) {
    return (
      <section
        className="grass-bg min-h-screen px-6 py-24 text-center text-lg font-bold text-gray-700"
      >
        <LoadingSpinner label={t("Loading playgrounds…")} size="xl" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="grass-bg min-h-screen px-6 py-24 text-center">
        <h1 className="text-4xl font-black text-gray-800">
          {t("Could not load playgrounds")}
        </h1>
        <p className="mt-3 text-red-700" role="alert">
          {error}
        </p>
        <Button
          type="button"
          className="mt-7"
          size="lg"
          onClick={() => window.location.reload()}
        >
          {t("Try again")}
        </Button>
      </section>
    );
  }

  return (
    <section className="grass-bg relative min-h-screen overflow-hidden px-4 py-12 sm:px-6">
      <div className="dot-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-7xl">
        <header className="mx-auto mb-9 max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-white/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-grass backdrop-blur">
            {t("Explore the map")}
          </p>
          <h1 className="display text-5xl font-black text-gray-800 md:text-6xl">
            {q
              ? t("Playgrounds near “{query}”", { query: q })
              : t("Playgrounds on the map")}
          </h1>
          <p className="mt-4 text-lg font-medium text-gray-600">
            {t(
              "Every pin represents a listed playground. Select a pin to open facilities, age guidance, safety information, and parent reviews.",
            )}
          </p>
        </header>

        <MapLocationSearch onLocationFound={setFocusLocation} />

        {mappedPlaygrounds.length > 0 ? (
          <PlaygroundMap
            playgrounds={mappedPlaygrounds}
            onSelect={openPlayground}
            focusLocation={focusLocation}
            onAreaChange={updateMapArea}
          />
        ) : (
          <section
            className="rounded-3xl border border-white/60 bg-white/40 px-6 py-16 text-center shadow-xl backdrop-blur-xl"
            role="status"
          >
            <MapOutlined className="text-5xl text-grass" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-black text-gray-800">
              {t("No mapped playgrounds found")}
            </h2>
            <p className="mt-2 text-gray-600">
              {t("Try another city, postcode, or neighbourhood.")}
            </p>
            <Button
              type="button"
              className="mt-6"
              size="lg"
              onClick={() => navigate({ to: "/playgrounds", search: {} })}
            >
              {t("Show all playgrounds")}
            </Button>
          </section>
        )}

        <section className="mt-10" aria-labelledby="mapped-playgrounds-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="mapped-playgrounds-heading"
                className="scroll-mt-24 text-2xl font-black text-gray-800"
              >
                {t("Playgrounds in this map area")}
              </h2>
              <p className="mt-1 text-sm font-semibold text-gray-600">
                {t(
                  "Showing {shown} of {total} visible playgrounds, nearest to the map centre.",
                  {
                    shown: areaPlaygrounds.length,
                    total: visibleAreaCount,
                  },
                )}
              </p>
            </div>
            {visibleAreaCount > areaPlaygrounds.length && (
              <p className="text-sm font-semibold text-gray-600">
                {t("Move or zoom the map to explore another area.")}
              </p>
            )}
          </div>
          <PlaygroundCarousel
            playgrounds={areaPlaygrounds}
            onSelect={openPlayground}
          />
        </section>
      </div>
    </section>
  );
}
