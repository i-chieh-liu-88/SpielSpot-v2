import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import Button from "../../atoms/Button";
import { useLanguage } from "../../../providers/LanguageProvider";

export function SearchForm() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [location, setLocation] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = location.trim();
    if (query) navigate({ to: "/playgrounds", search: { q: query } });
  }

  return (
    <form
      className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row"
      onSubmit={handleSubmit}
      aria-label={t("Playground search")}
    >
      <label className="relative w-full max-w-sm">
        <span className="sr-only">{t("City, postcode, or neighbourhood")}</span>
        <LocationOnOutlined
          className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-green-700"
          aria-hidden="true"
        />
        <input
          className="search-input w-full rounded-2xl border-2 border-green-400 bg-white/90 py-4 pl-11 pr-4 text-sm font-medium text-gray-700 placeholder-gray-400 shadow-sm"
          aria-label={t("City, postcode, or neighbourhood")}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder={t("City, postcode, or neighbourhood")}
        />
      </label>
      <Button className="shrink-0 tracking-wide" size="lg" type="submit">
        {t("Search")}
      </Button>
    </form>
  );
}
