import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import Button from "../../components/atoms/Button";
import { LoadingSpinner } from "../../components/atoms/LoadingSpinner";
import { MapLocationSearch } from "../../components/molecules/MapLocationSearch";
import {
  PlaygroundMap,
  type PlaygroundMapArea,
} from "../../components/organisms/PlaygroundMap/PlaygroundMap";
import { PlaygroundFiltersForm } from "../../components/organisms/PlaygroundFiltersForm/PlaygroundFiltersForm";
import { usePlaygrounds } from "../../hooks/usePlaygrounds";
import { filterPlaygrounds } from "../../utils/filterPlaygrounds";
import type { MapLocation } from "../../types/map";
import { useLanguage } from "../../providers/LanguageProvider";
import type { PlaygroundFilters } from "../../services/playgrounds";
import "./PlaygroundsPage.css";

function subscribeDesktopView(onChange: () => void) {
  const query = window.matchMedia("(min-width: 64rem)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function PlaygroundsPage() {
  const isDesktop = useSyncExternalStore(
    subscribeDesktopView,
    () => window.matchMedia("(min-width: 64rem)").matches,
    () => false,
  );
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { q } = useSearch({ from: "/playgrounds" });
  const [filters, setFilters] = useState<PlaygroundFilters>({});
  const [filterFormKey, setFilterFormKey] = useState(0);
  const [filterRequestKey, setFilterRequestKey] = useState(0);
  const { playgrounds, isLoading, error } = usePlaygrounds(
    filters,
    filterRequestKey,
  );
  const [focusLocation, setFocusLocation] = useState<MapLocation>();
  const [pendingArea, setPendingArea] = useState<PlaygroundMapArea>();
  const [appliedArea, setAppliedArea] = useState<string[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const listViewRef = useRef<HTMLButtonElement>(null);
  const mappedPlaygrounds = useMemo(
    () => filterPlaygrounds(playgrounds, q),
    [playgrounds, q],
  );
  const results = useMemo(
    () =>
      appliedArea === null
        ? mappedPlaygrounds
        : mappedPlaygrounds.filter((p) => appliedArea.includes(p.id)),
    [mappedPlaygrounds, appliedArea],
  );
  const selected = mappedPlaygrounds.find((p) => p.id === selectedId);
  const updateMapArea = useCallback(
    (area: PlaygroundMapArea) => setPendingArea(area),
    [],
  );
  const selectPin = useCallback((id: string) => setSelectedId(id), []);

  function applyFilters(next: PlaygroundFilters) {
    setFilters(next);
    setAppliedArea(null);
    setPendingArea(undefined);
    setSelectedId(undefined);
    setFilterRequestKey((current) => current + 1);
  }

  function showAll() {
    applyFilters({});
    setFilterFormKey((current) => current + 1);
    navigate({ to: "/playgrounds", search: {} });
  }

  return (
    <section className="grass-bg min-h-screen px-4 pb-12 pt-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 max-w-3xl">
          <h1 className="display text-3xl font-black text-gray-800 sm:text-4xl">
            {q
              ? t("Playgrounds near “{query}”", { query: q })
              : t("Find a playground")}
          </h1>
          <p className="mt-2 text-base text-gray-700">
            {t(
              "Compare playgrounds in the list or explore their locations on the map.",
            )}
          </p>
        </header>
        <MapLocationSearch
          onLocationFound={(location) => {
            setFocusLocation(location);
            setMobileView("map");
          }}
        />
        <details className="mb-6 rounded-2xl bg-white/60 p-4">
          <summary className="min-h-11 cursor-pointer rounded-lg py-3 font-semibold text-gray-800 focus-visible:outline-2 focus-visible:outline-green-700">
            {t("Filters: address, age and facilities")}
          </summary>
          <PlaygroundFiltersForm key={filterFormKey} onApply={applyFilters} />
        </details>
        {isLoading && (
          <div className="py-8" role="status">
            <LoadingSpinner label={t("Loading playgrounds…")} size="xl" />
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="my-6 rounded-2xl bg-red-50 p-5 text-red-800"
          >
            <h2 className="font-bold">{t("Could not load playgrounds")}</h2>
            <p className="mt-2">{error}</p>
            <p className="mt-2">
              {t(
                "Use Apply filters to retry with your current choices, or Reset filters to start again.",
              )}
            </p>
          </div>
        )}
        {!isLoading && !error && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p role="status" className="font-semibold text-gray-800">
                {t("{count} playgrounds found", { count: results.length })}
              </p>
              <div
                className="explore-view-switch flex gap-2"
                role="group"
                aria-label={t("Results view")}
              >
                <Button
                  ref={listViewRef}
                  className="min-h-11"
                  variant={mobileView === "list" ? "primary" : "secondary"}
                  aria-pressed={mobileView === "list"}
                  aria-controls="playground-results"
                  onClick={() => setMobileView("list")}
                >
                  {t("List")}
                </Button>
                <Button
                  className="min-h-11"
                  variant={mobileView === "map" ? "primary" : "secondary"}
                  aria-pressed={mobileView === "map"}
                  aria-controls="playground-map-panel"
                  onClick={() => setMobileView("map")}
                >
                  {t("Map")}
                </Button>
              </div>
            </div>
            <div className="explore-layout" data-mobile-view={mobileView}>
              <section
                id="playground-results"
                className="explore-results min-w-0"
                aria-label={t("Playground results")}
              >
                {appliedArea !== null && (
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <p className="text-sm text-gray-700">
                      {t("Showing the area you searched.")}
                    </p>
                    <Button
                      variant="secondary"
                      className="min-h-11"
                      onClick={() => setAppliedArea(null)}
                    >
                      {t("Show all matching results")}
                    </Button>
                  </div>
                )}
                {results.length === 0 ? (
                  <div role="status" className="rounded-2xl bg-white/80 p-6">
                    <h2 className="text-xl font-bold">
                      {t("No mapped playgrounds found")}
                    </h2>
                    <p className="mt-2">
                      {t("Try another city, postcode, or neighbourhood.")}
                    </p>
                    <Button className="mt-4 min-h-11" onClick={showAll}>
                      {t("Show all playgrounds")}
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {results.map((p) => (
                      <li key={p.id}>
                        <article
                          className={`rounded-2xl border-2 bg-white/90 p-5 ${selectedId === p.id ? "border-green-700" : "border-transparent"}`}
                        >
                          <h2 className="break-words text-xl font-bold text-gray-900">
                            <Link
                              to="/playgrounds/$playgroundId"
                              params={{ playgroundId: p.id }}
                              className="rounded underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-green-700"
                            >
                              {p.name}
                            </Link>
                          </h2>
                          <p className="mt-1 break-words text-gray-700">
                            {p.location}
                          </p>
                          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                            <div>
                              <dt className="font-semibold">
                                {t("Age range")}
                              </dt>
                              <dd>
                                {p.ageRange ? t(p.ageRange) : t("Not provided")}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-semibold">
                                {t("Safety rating")}
                              </dt>
                              <dd>{p.safetyRating || t("Not provided")}</dd>
                            </div>
                          </dl>
                          {p.tags.length > 0 && (
                            <ul
                              className="mt-3 flex flex-wrap gap-2"
                              aria-label={t("Facilities")}
                            >
                              {p.tags.map((tag) => (
                                <li
                                  key={tag}
                                  className="rounded-lg bg-green-50 px-2 py-1 text-sm text-green-900"
                                >
                                  {t(tag)}
                                </li>
                              ))}
                            </ul>
                          )}
                          <p className="mt-3 line-clamp-2 break-words text-sm text-gray-700">
                            {p.description}
                          </p>
                          <Link
                            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-gray-900 px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                            to="/playgrounds/$playgroundId"
                            params={{ playgroundId: p.id }}
                            aria-label={t("View details for {name}", {
                              name: p.name,
                            })}
                          >
                            {t("View details")}
                          </Link>
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section
                id="playground-map-panel"
                className="explore-map-panel min-w-0"
                aria-label={t("Playground map")}
              >
                <div className="explore-map-sticky rounded-2xl bg-white/80 p-3 sm:p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-gray-800">
                      {t("Explore the map")}
                    </h2>
                    <Button
                      variant="secondary"
                      className="min-h-11"
                      disabled={!pendingArea}
                      onClick={() => {
                        if (pendingArea) {
                          setAppliedArea([...pendingArea.playgroundIds]);
                          setMobileView("list");
                          if (!isDesktop) listViewRef.current?.focus();
                        }
                      }}
                    >
                      {t("Search this area")}
                    </Button>
                  </div>
                  <p className="mb-3 text-sm text-gray-700">
                    {t(
                      "Scroll to move the page. Use + and − to zoom the map. Results change only when you search this area.",
                    )}
                  </p>
                  {mappedPlaygrounds.length > 0 ? (
                    (isDesktop || mobileView === "map") && (
                      <PlaygroundMap
                        playgrounds={mappedPlaygrounds}
                        onSelect={selectPin}
                        focusLocation={focusLocation}
                        onAreaChange={updateMapArea}
                      />
                    )
                  ) : (
                    <p className="p-6">{t("No mapped playgrounds found")}</p>
                  )}
                  {selected && (
                    <div
                      className="mt-3 rounded-xl bg-green-50 p-4"
                      role="status"
                    >
                      <p className="font-bold text-green-950">
                        {selected.name}
                      </p>
                      <p className="mt-1 text-sm text-green-950">
                        {selected.location}
                      </p>
                      <Link
                        className="mt-2 inline-flex min-h-11 items-center rounded px-2 font-semibold text-green-950 underline focus-visible:outline-2"
                        to="/playgrounds/$playgroundId"
                        params={{ playgroundId: selected.id }}
                      >
                        {t("View details")}
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
