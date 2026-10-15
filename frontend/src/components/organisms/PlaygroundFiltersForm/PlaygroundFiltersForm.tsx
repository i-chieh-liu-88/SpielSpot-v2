import { useLanguage } from "../../../providers/LanguageProvider";
import { useState, type FormEvent } from "react";
import Button from "../../atoms/Button";
import type { PlaygroundFilters } from "../../../services/playgrounds";
import { usePlaygrounds } from "../../../hooks/usePlaygrounds";

type PlaygroundFiltersFormProps = {
  onApply: (filters: PlaygroundFilters) => void;
};

/* --------------------------------- 建立篩選表單; -------------------------------- */
export function PlaygroundFiltersForm({ onApply }: PlaygroundFiltersFormProps) {
  const { t } = useLanguage();
  const [location, setLocation] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { playgrounds: availablePlaygrounds } = usePlaygrounds();

  const ageOptions = [
    ...new Set(availablePlaygrounds.map((p) => p.ageRange).filter(Boolean)),
  ].sort();

  const tagOptions = [
    ...new Set(availablePlaygrounds.flatMap((p) => p.tags)),
  ].sort();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply({ location, ageRange, tags: selectedTags });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="playground-filters-form mb-6 rounded-2xl bg-white/60 p-4 sm:p-5"
      aria-label={t("Filter playgrounds")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="filter-location" className="block font-semibold">
            {t("Filter playground addresses")}
          </label>
          <input
            id="filter-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="mt-2 w-full rounded-xl border p-3"
          />
        </div>
        <div>
          <label htmlFor="filter-age" className="block font-semibold">
            {t("Age range")}
          </label>
          <select
            id="filter-age"
            value={ageRange}
            onChange={(event) => setAgeRange(event.target.value)}
            className="mt-2 w-full rounded-xl border p-3"
          >
            <option value="">{t("All ages")}</option>
            {ageOptions.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className="mt-4">
        <legend className="font-semibold">
          {t("Facilities: match any selected option")}
        </legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {tagOptions.map((tag) => (
            <label
              key={tag}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2"
            >
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setSelectedTags((current) =>
                    checked
                      ? [...current, tag]
                      : current.filter((value) => value !== tag),
                  );
                }}
              />
              {t(tag)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="submit" className="min-h-11 w-auto">
          {t("Apply filters")}
        </Button>
        {/* Reset 與請求狀態 */}
        <Button
          type="button"
          className="min-h-11 w-auto"
          variant="secondary"
          onClick={() => {
            setLocation("");
            setAgeRange("");
            setSelectedTags([]);
            onApply({});
          }}
        >
          {t("Reset filters")}
        </Button>
      </div>
    </form>
  );
}
