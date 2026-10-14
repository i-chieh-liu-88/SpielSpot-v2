import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import PhotoCameraOutlined from "@mui/icons-material/PhotoCameraOutlined";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { Playground } from "../../../types/content";
import Button from "../../atoms/Button";
import { LocationPickerMap } from "../../molecules/LocationPickerMap/LocationPickerMap";
import { playgroundEditorSchema } from "./PlaygroundForm.schema";
import { useLanguage } from "../../../providers/LanguageProvider";
import { useAuth } from "@clerk/clerk-react";
import { createPlayground } from "../../../services/playgrounds";

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
  "mt-2 w-full rounded-2xl border border-white/60 bg-white/45 px-4 py-3 text-gray-800 shadow-sm outline-none backdrop-blur transition focus:border-green-500 focus:ring-4 focus:ring-green-200/60 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200";

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

type FieldErrors = Partial<Record<keyof PlaygroundFormState, string>>;

function FieldError({ id, message }: { id: string; message?: string }) {
  const { t } = useLanguage();
  return message ? (
    <span id={id} className="mt-1 block text-sm font-semibold text-red-700">
      {t(message)}
    </span>
  ) : null;
}

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
  onSaved,
}: PlaygroundFormProps) {
  const { t } = useLanguage();
  const { getToken } = useAuth();
  const formId = useId();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState(() => getInitialState(playground));
  const [photo, setPhoto] = useState<File>();
  const [writeReview, setWriteReview] = useState(mode === "create");
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false); //控制按鈕和提示
  const savingRef = useRef(false); //避免重複送出。確保同一時間只送出一次 request
  const photoPreview = useMemo(
    () => (photo ? URL.createObjectURL(photo) : playground?.image),
    [photo, playground?.image],
  );

  useEffect(() => {
    if (!photo || !photoPreview) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photo, photoPreview]);

  function errorId(field: keyof PlaygroundFormState) {
    return `${formId}-${field}-error`;
  }

  function errorAttributes(field: keyof PlaygroundFormState) {
    return {
      "aria-invalid": fieldErrors[field] ? true : undefined,
      "aria-describedby": fieldErrors[field] ? errorId(field) : undefined,
    };
  }

  function updateField(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setError(undefined);
  }

  function toggleTag(event: ChangeEvent<HTMLInputElement>) {
    setFieldErrors((current) => ({ ...current, tags: undefined }));
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
    setFieldErrors((current) => ({
      ...current,
      latitude: undefined,
      longitude: undefined,
    }));
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

  /* ------------------------------ handleSubmit; ----------------------------- */
  /* ------------------------------ handleSubmit; ----------------------------- */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (savingRef.current) return;

    if (mode !== "create") {
      setError(t("Saving is not available in this preview."));
      return;
    }

    const result = playgroundEditorSchema.safeParse(form);

    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof PlaygroundFormState;
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      }
      setFieldErrors(nextErrors);
      setError(t("Check the highlighted fields before saving."));
      const firstInvalidControl = Array.from(event.currentTarget.elements).find(
        (control) =>
          control instanceof HTMLElement &&
          nextErrors[control.getAttribute("name") as keyof PlaygroundFormState],
      );
      if (firstInvalidControl instanceof HTMLElement)
        firstInvalidControl.focus();
      return;
    }

    setFieldErrors({});
    savingRef.current = true;
    setIsSaving(true);
    setError(undefined);

    try {
      const token = await getToken();

      if (!token) {
        setError(t("Please sign in again."));
        return;
      }

      const savedPlayground = await createPlayground(result.data, token);
      onSaved(savedPlayground, writeReview);
    } catch {
      setError(
        t(
          "Could not save the playground. Your input is still here. Please try again.",
        ),
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  } //先驗證資料，再取得 Clerk token 並送出。失敗時保留輸入

  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);
  const coordinates =
    form.latitude.trim() !== "" &&
    form.longitude.trim() !== "" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
      ? ([latitude, longitude] as [number, number])
      : undefined;

  return (
    <form
      className="rounded-3xl border border-white/60 bg-white/35 p-6 shadow-xl backdrop-blur-xl sm:p-9"
      onSubmit={handleSubmit}
      aria-label={t(mode === "create" ? "Add a playground" : "Edit playground")}
      noValidate
    >
      <p className="mb-6 font-semibold" role="status">
        {/* 遊樂場資料可以儲存，照片目前只供預覽，不會上傳 */}
        {mode === "create"
          ? t(
              "Playground details can be saved. Photos are preview only and will not be uploaded.",
            )
          : t("Preview only. Your changes will not be saved.")}
      </p>
      {error && (
        <p
          className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 font-bold text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="font-bold text-gray-700">
          <label htmlFor={`${formId}-name`}>{t("Playground name")}</label>
          <input
            className={fieldClass}
            name="name"
            id={`${formId}-name`}
            {...errorAttributes("name")}
            value={form.name}
            onChange={updateField}
            required
          />
          <FieldError id={errorId("name")} message={fieldErrors.name} />
        </div>
        <div className="font-bold text-gray-700">
          <label htmlFor={`${formId}-location`}>
            {t("City or neighbourhood")}
          </label>
          <input
            className={fieldClass}
            name="location"
            id={`${formId}-location`}
            {...errorAttributes("location")}
            value={form.location}
            onChange={updateField}
            required
          />
          <FieldError id={errorId("location")} message={fieldErrors.location} />
        </div>
        <div className="font-bold text-gray-700">
          <label htmlFor={`${formId}-postcode`}>{t("Postcode")}</label>
          <input
            className={fieldClass}
            name="postcode"
            id={`${formId}-postcode`}
            {...errorAttributes("postcode")}
            value={form.postcode}
            onChange={updateField}
            required
          />
          <FieldError id={errorId("postcode")} message={fieldErrors.postcode} />
        </div>
        <div className="font-bold text-gray-700">
          <label htmlFor={`${formId}-ageRange`}>{t("Best suited ages")}</label>
          <input
            className={fieldClass}
            name="ageRange"
            id={`${formId}-ageRange`}
            {...errorAttributes("ageRange")}
            value={form.ageRange}
            onChange={updateField}
            placeholder={t("Ages 2–12")}
            required
          />
          <FieldError id={errorId("ageRange")} message={fieldErrors.ageRange} />
        </div>
        <div className="font-bold text-gray-700">
          <label htmlFor={`${formId}-safetyRating`}>{t("Safety rating")}</label>
          <select
            className={fieldClass}
            name="safetyRating"
            id={`${formId}-safetyRating`}
            {...errorAttributes("safetyRating")}
            value={form.safetyRating}
            onChange={updateField}
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <option value={rating} key={rating}>
                {rating} / 5
              </option>
            ))}
          </select>
          <FieldError
            id={errorId("safetyRating")}
            message={fieldErrors.safetyRating}
          />
        </div>
      </div>

      <div className="mt-6 block font-bold text-gray-700">
        <label htmlFor={`${formId}-description`}>{t("Description")}</label>
        <textarea
          className={`${fieldClass} min-h-32 resize-y`}
          name="description"
          id={`${formId}-description`}
          {...errorAttributes("description")}
          value={form.description}
          onChange={updateField}
          minLength={20}
          maxLength={1000}
          required
        />
        <FieldError
          id={errorId("description")}
          message={fieldErrors.description}
        />
      </div>

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
                name="tags"
                {...errorAttributes("tags")}
                value={facility}
                checked={form.tags.includes(facility)}
                onChange={toggleTag}
              />
              {t(facility)}
            </label>
          ))}
        </div>
        <FieldError id={errorId("tags")} message={fieldErrors.tags} />
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
          <div className="font-bold text-gray-700">
            <label htmlFor={`${formId}-latitude`}>{t("Latitude")}</label>
            <input
              className={fieldClass}
              name="latitude"
              id={`${formId}-latitude`}
              {...errorAttributes("latitude")}
              type="number"
              step="any"
              value={form.latitude}
              onChange={updateField}
              required
            />
            <FieldError
              id={errorId("latitude")}
              message={fieldErrors.latitude}
            />
          </div>
          <div className="font-bold text-gray-700">
            <label htmlFor={`${formId}-longitude`}>{t("Longitude")}</label>
            <input
              className={fieldClass}
              name="longitude"
              id={`${formId}-longitude`}
              {...errorAttributes("longitude")}
              type="number"
              step="any"
              value={form.longitude}
              onChange={updateField}
              required
            />
            <FieldError
              id={errorId("longitude")}
              message={fieldErrors.longitude}
            />
          </div>
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
        disabled={mode !== "create" || isSaving}
      >
        {isSaving
          ? t("Saving...")
          : mode === "create"
            ? t("Add playground")
            : t("Save changes")}
      </Button>
    </form>
  );
}
