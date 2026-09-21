import LocationSearchingOutlined from "@mui/icons-material/LocationSearchingOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { useRef, useState, type FormEvent } from "react";
import { searchMapLocation } from "../../../services/geocoding";
import type { MapLocation } from "../../../types/map";
import Button from "../../atoms/Button";
import {
  useLanguage,
  type TranslationValues,
} from "../../../providers/LanguageProvider";

type MapLocationSearchProps = {
  onLocationFound: (location: MapLocation) => void;
};

type Translate = (source: string, values?: TranslationValues) => string;

function getGeolocationError(error: GeolocationPositionError, t: Translate) {
  if (error.code === error.PERMISSION_DENIED) {
    return t(
      "Location access was denied. Allow location access or search by address.",
    );
  }
  if (error.code === error.TIMEOUT) {
    return t("Your location took too long to respond. Please try again.");
  }
  return t("Your current location could not be determined.");
}

export function MapLocationSearch({
  onLocationFound,
}: MapLocationSearchProps) {
  const [query, setQuery] = useState("");
  const { t } = useLanguage();
  const [status, setStatus] = useState<string>();
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const requestController = useRef<AbortController | undefined>(undefined);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setStatus(t("Enter an address, postcode, or place name."));
      return;
    }

    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setIsSearching(true);
    setStatus(undefined);

    try {
      const location = await searchMapLocation(
        normalizedQuery,
        controller.signal,
      );

      if (!location) {
        setStatus(t("No matching location was found in Germany."));
        return;
      }

      onLocationFound(location);
      setStatus(t("Map moved to {location}.", { location: location.label }));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus(
        error instanceof Error
          ? error.message
          : t("Location search is temporarily unavailable."),
      );
    } finally {
      if (requestController.current === controller) setIsSearching(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setStatus(t("This browser does not support location services."));
      return;
    }

    setIsLocating(true);
    setStatus(t("Finding your current location…"));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: MapLocation = {
          coordinates: [position.coords.latitude, position.coords.longitude],
          label: t("Your current location"),
        };
        onLocationFound(location);
        setStatus(t("Map moved to your current location."));
        setIsLocating(false);
      },
      (error) => {
        setStatus(getGeolocationError(error, t));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <section
      className="mb-5 rounded-3xl border border-white/60 bg-white/45 p-4 shadow-lg backdrop-blur-xl sm:p-5"
      aria-labelledby="map-location-heading"
    >
      <div className="mb-3">
        <h2 id="map-location-heading" className="font-black text-gray-800">
          {t("Choose a map location")}
        </h2>
        <p className="mt-1 text-sm font-medium text-gray-600">
          {t("Search for a German address or use your device location.")}
        </p>
      </div>

      <form className="flex flex-col gap-3 lg:flex-row" onSubmit={handleSearch}>
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t("Address, postcode, or place")}</span>
          <SearchOutlined
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-500"
            aria-hidden="true"
          />
          <input
            className="w-full rounded-2xl border border-white/70 bg-white/75 py-3 pl-12 pr-4 font-medium text-gray-800 shadow-sm outline-none transition placeholder:text-gray-500 focus:border-green-500 focus:ring-4 focus:ring-green-200/60"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("Address, postcode, or place in Germany")}
            autoComplete="street-address"
          />
        </label>
        <Button type="submit" disabled={isSearching || isLocating}>
          <SearchOutlined aria-hidden="true" />
          {isSearching ? t("Searching…") : t("Search map")}
        </Button>
        <Button
          type="button"
          disabled={isSearching || isLocating}
          onClick={useCurrentLocation}
        >
          <LocationSearchingOutlined aria-hidden="true" />
          {isLocating ? t("Locating…") : t("Use my location")}
        </Button>
      </form>

      {status && (
        <p className="mt-3 text-sm font-semibold text-gray-700" role="status">
          {status}
        </p>
      )}

      <p className="mt-3 text-xs font-medium text-gray-500">
        {t("Address search ©")}{" "}
        <a
          className="underline transition hover:text-green-700"
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap contributors
        </a>
        .
      </p>
    </section>
  );
}
