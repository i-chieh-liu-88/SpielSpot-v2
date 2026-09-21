import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import PhotoCameraOutlined from "@mui/icons-material/PhotoCameraOutlined";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { Playground } from "../../../types/content";
import Button from "../../atoms/Button";
import { LocationPickerMap } from "../../molecules/LocationPickerMap/LocationPickerMap";
import { playgroundEditorSchema } from "./PlaygroundForm.schema";
import { useLanguage } from "../../../providers/LanguageProvider";

const facilityOptions = [
  "Fenced",
  "Shade",
  "Accessible",
  "Toilets",
  "Water play",
  "Picnic area",
  "Climbing",
  "Sand play",
  "Swings",
  "Slides",
];

const fieldClass =
  "mt-2 w-full rounded-2xl border border-white/60 bg-white/45 px-4 py-3 text-gray-800 shadow-sm outline-none backdrop-blur transition focus:border-green-500 focus:ring-4 focus:ring-green-200/60";

type PlaygroundFormState = {
  name: string;
  location: string;
  postcode: string;
  latitude: string;
  longitude: string;
  ageRange: string;
  safetyRating: string;
  description: string;
  tags: string[];
};

type PlaygroundFormProps = {
  mode: "create" | "edit";
  playground?: Playground;
  onSaved: (playground: Playground, writeReview: boolean) => void;
};

function getInitialState(playground?: Playground): PlaygroundFormState {
  return {
    name: playground?.name ?? "",
    location: playground?.location ?? "",
    postcode: playground?.postcode ?? "",
    latitude: playground ? String(playground.coordinates[0]) : "",
    longitude: playground ? String(playground.coordinates[1]) : "",
    ageRange: playground?.ageRange ?? "Ages 2–12",
    safetyRating: playground
      ? String(
          Math.min(
            5,
            Math.max(
              1,
              Math.round(Number.parseFloat(playground.safetyRating) || 3),
            ),
          ),
        )
      : "3",
    description: playground?.description ?? "",
    tags: playground?.tags ?? [],
  };
}

export function PlaygroundForm({
  mode,
  playground,
}: PlaygroundFormProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => getInitialState(playground));
  const [photo, setPhoto] = useState<File>();
  const [writeReview, setWriteReview] = useState(mode === "create");
  const [error, setError] = useState<string>();
  const photoPreview = useMemo(
    () => (photo ? URL.createObjectURL(photo) : playground?.image),
    [photo, playground?.image],
  );

  useEffect(() => {
    if (!photo || !photoPreview) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photo, photoPreview]);

  function updateField(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError(undefined);
  }

  function toggleTag(event: ChangeEvent<HTMLInputElement>) {
    const { checked, value } = event.target;
    setForm((current) => ({
      ...current,
      tags: checked
        ? [...current.tags, value]
        : current.tags.filter((tag) => tag !== value),
    }));
    setError(undefined);
  }

  function chooseCoordinates(coordinates: [number, number]) {
    setForm((current) => ({
      ...current,
      latitude: coordinates[0].toFixed(6),
      longitude: coordinates[1].toFixed(6),
    }));
    setError(undefined);
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const nextPhoto = event.target.files?.[0];
    if (!nextPhoto) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(nextPhoto.type)) {
      setError(t("Choose a JPEG, PNG, or WebP image."));
      return;
    }
    if (nextPhoto.size > 5 * 1024 * 1024) {
      setError(t("The playground photo must be 5 MB or smaller."));
      return;
    }

    setPhoto(nextPhoto);
    setError(undefined);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = playgroundEditorSchema.safeParse(form);

    if (!result.success) {
      setError(t(result.error.issues[0]?.message ?? "Check the form fields."));
      return;
    }

    setError(t("Saving is not available in this preview."));
  }

  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);
  const coordinates =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? ([latitude, longitude] as [number, number])
      : undefined;

  return (
    <form
      className="rounded-3xl border border-white/60 bg-white/35 p-6 shadow-xl backdrop-blur-xl sm:p-9"
      onSubmit={handleSubmit}
      aria-label={t(
        mode === "create" ? "Add a playground" : "Edit playground",
      )}
      noValidate
    >
      <p className="mb-6 font-semibold" role="status">{t("Preview only. Your changes will not be saved.")}</p>
      {error && (
        <p
          className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 font-bold text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <label className="font-bold text-gray-700">
          {t("Playground name")}
          <input
            className={fieldClass}
            name="name"
            value={form.name}
            onChange={updateField}
            required
          />
        </label>
        <label className="font-bold text-gray-700">
          {t("City or neighbourhood")}
          <input
            className={fieldClass}
            name="location"
            value={form.location}
            onChange={updateField}
            required
          />
        </label>
        <label className="font-bold text-gray-700">
          {t("Postcode")}
          <input
            className={fieldClass}
            name="postcode"
            value={form.postcode}
            onChange={updateField}
            required
          />
        </label>
        <label className="font-bold text-gray-700">
          {t("Best suited ages")}
          <input
            className={fieldClass}
            name="ageRange"
            value={form.ageRange}
            onChange={updateField}
            placeholder={t("Ages 2–12")}
            required
          />
        </label>
        <label className="font-bold text-gray-700">
          {t("Safety rating")}
          <select
            className={fieldClass}
            name="safetyRating"
            value={form.safetyRating}
            onChange={updateField}
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <option value={rating} key={rating}>
                {rating} / 5
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-6 block font-bold text-gray-700">
        {t("Description")}
        <textarea
          className={`${fieldClass} min-h-32 resize-y`}
          name="description"
          value={form.description}
          onChange={updateField}
          minLength={20}
          maxLength={1000}
          required
        />
      </label>

      <fieldset className="mt-7">
        <legend className="font-bold text-gray-700">{t("Facilities")}</legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {facilityOptions.map((facility) => (
            <label
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/60 bg-white/35 px-4 py-3 text-sm font-semibold text-gray-700"
              key={facility}
            >
              <input
                type="checkbox"
                value={facility}
                checked={form.tags.includes(facility)}
                onChange={toggleTag}
              />
              {t(facility)}
            </label>
          ))}
        </div>
      </fieldset>

      <section className="mt-8" aria-labelledby="pin-location-heading">
        <h2
          id="pin-location-heading"
          className="flex items-center gap-2 text-xl font-black text-gray-800"
        >
          <AddLocationAltOutlined aria-hidden="true" /> {t("Pin the location")}
        </h2>
        <p className="mb-4 mt-1 text-sm font-semibold text-gray-600">
          {t("Click the exact position on the map or enter the coordinates.")}
        </p>
        <LocationPickerMap
          coordinates={coordinates}
          onChange={chooseCoordinates}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="font-bold text-gray-700">
            {t("Latitude")}
            <input
              className={fieldClass}
              name="latitude"
              type="number"
              step="any"
              value={form.latitude}
              onChange={updateField}
              required
            />
          </label>
          <label className="font-bold text-gray-700">
            {t("Longitude")}
            <input
              className={fieldClass}
              name="longitude"
              type="number"
              step="any"
              value={form.longitude}
              onChange={updateField}
              required
            />
          </label>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="photo-heading">
        <h2
          id="photo-heading"
          className="flex items-center gap-2 text-xl font-black text-gray-800"
        >
          <PhotoCameraOutlined aria-hidden="true" /> {t("Playground photo")}
        </h2>
        <p className="mt-1 text-sm font-semibold text-gray-600">
          {t("JPEG, PNG, or WebP · maximum 5 MB")}
        </p>
        {photoPreview && (
          <img
            className="mt-4 h-56 w-full rounded-3xl object-cover"
            src={photoPreview}
            alt={t("Playground upload preview")}
          />
        )}
        <input
          aria-label={t("Upload playground photo")}
          className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-green-100 file:px-4 file:py-2 file:font-bold file:text-green-800`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={choosePhoto}
        />
      </section>

      <label className="mt-7 flex items-center gap-3 rounded-2xl bg-white/35 px-4 py-3 font-bold text-gray-700">
        <input
          type="checkbox"
          checked={writeReview}
          onChange={(event) => setWriteReview(event.target.checked)}
        />
        {t("Write a review after saving")}
      </label>

      <Button
        type="submit"
        className="mt-8 w-full sm:w-auto"
        size="lg"
        disabled
      >
        {mode === "create"
            ? t("Add playground")
            : t("Save changes")}
      </Button>
    </form>
  );
}
