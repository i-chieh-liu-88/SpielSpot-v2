import { useState, type FormEvent } from "react";
import Button from "../../atoms/Button";
import type { PlaygroundFilters } from "../../../services/playgrounds";
import { usePlaygrounds } from "../../../hooks/usePlaygrounds";

type PlaygroundFiltersFormProps = {
  onApply: (filters: PlaygroundFilters) => void;
};

/* --------------------------------- 建立篩選表單; -------------------------------- */
export function PlaygroundFiltersForm({ onApply }: PlaygroundFiltersFormProps) {
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
      className="mb-6 rounded-2xl bg-white/60 p-4"
      aria-label="Filter playgrounds"
    >
      <label htmlFor="filter-location" className="block font-semibold">
        Location
      </label>
      <input
        id="filter-location"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        className="mt-2 w-full rounded-xl border p-3"
      />
      <label htmlFor="filter-age" className="mt-4 block font-semibold">
        Age range
      </label>
      <select
        id="filter-age"
        value={ageRange}
        onChange={(event) => setAgeRange(event.target.value)}
        className="mt-2 w-full rounded-xl border p-3"
      >
        <option value="">All ages</option>
        {ageOptions.map((age) => (
          <option key={age} value={age}>
            {age}
          </option>
        ))}
      </select>
      <fieldset className="mt-4">
        <legend className="font-semibold">Tags — match any selected tag</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {tagOptions.map((tag) => (
            <label key={tag} className="flex items-center gap-2">
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
              {tag}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit" className="mt-4">
        Apply filters
      </Button>
      {/* Reset 與請求狀態 */}
      <Button
        type="button"
        className="ml-3 mt-4"
        onClick={() => {
          setLocation("");
          setAgeRange("");
          setSelectedTags([]);
          onApply({});
        }}
      >
        Reset filters
      </Button>
    </form>
  );
}
