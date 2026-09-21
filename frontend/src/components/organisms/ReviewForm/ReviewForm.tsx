import { useState, type ChangeEvent, type FormEvent } from "react";
import Button from "../../atoms/Button";
import { GlassSelect } from "../../atoms/GlassSelect";
import { createReview } from "../../../services/reviews";
import { playgroundReviewSchema } from "./ReviewForm.schema";
import type { PlaygroundReview, ReviewFormErrors } from "./ReviewForm.types";
import { useLanguage } from "../../../providers/LanguageProvider";

const facilities = [
  "Fenced",
  "Shade",
  "Accessible",
  "Toilets",
  "Water play",
  "Picnic area",
];

const ageGroupOptions = [
  { value: "0–3", label: "Toddlers (0–3)" },
  { value: "4–8", label: "Juniors (4–8)" },
  { value: "9–12", label: "Big kids (9–12)" },
  { value: "All ages", label: "All ages" },
];

const safetyRatingOptions = [1, 2, 3, 4, 5].map((rating) => ({
  value: String(rating),
  label: `${rating} — ${
    rating === 5 ? "Excellent" : rating === 1 ? "Needs attention" : "Good"
  }`,
}));

const overallRatingOptions = [1, 2, 3, 4, 5].map((rating) => ({
  value: String(rating),
  label: `${rating} ${rating === 1 ? "star" : "stars"}`,
}));

const initialReview: PlaygroundReview = {
  playgroundName: "",
  location: "",
  ageGroup: "",
  facilities: [],
  safetyRating: "",
  overallRating: "",
  recommendation: "",
  review: "",
  parentName: "",
};

const fieldClass =
  "w-full rounded-2xl border border-white/60 bg-white/40 px-4 py-3 text-gray-800 shadow-sm outline-none backdrop-blur transition focus:border-green-500 focus:ring-4 focus:ring-green-200/60 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-red-100/70";

function FieldError({ id, message }: { id: string; message?: string }) {
  const { t } = useLanguage();

  return message ? (
    <span id={id} className="mt-1 block text-sm font-semibold text-red-600">
      {t(message)}
    </span>
  ) : null;
}

function getSubmissionErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Unable to save your review. Please try again.";
}

type ReviewFormProps = {
  previewOnly?: boolean;
  onSubmitted?: (review: PlaygroundReview) => void | Promise<void>;
  playground?: {
    id: string;
    name: string;
    location: string;
  };
};

export function ReviewForm({ onSubmitted, playground, previewOnly = false }: ReviewFormProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState<PlaygroundReview>(() => ({
    ...initialReview,
    playgroundName: playground?.name ?? "",
    location: playground?.location ?? "",
  }));
  const [errors, setErrors] = useState<ReviewFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string>();

  function updateField(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const field = event.target.name as keyof PlaygroundReview;
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateSelectField(
    field: "ageGroup" | "safetyRating" | "overallRating",
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleFacility(event: ChangeEvent<HTMLInputElement>) {
    const { checked, value } = event.target;
    setForm((current) => ({
      ...current,
      facilities: checked
        ? [...current.facilities, value]
        : current.facilities.filter((facility) => facility !== value),
    }));
    setErrors((current) => ({ ...current, facilities: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (previewOnly) return;
    const result = playgroundReviewSchema.safeParse(form);

    if (!result.success) {
      const nextErrors: ReviewFormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof PlaygroundReview | undefined;
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      setSubmissionError(undefined);
      return;
    }

    setErrors({});
    setSubmissionError(undefined);
    setIsSubmitting(true);

    try {
      await createReview({ ...result.data, playgroundId: playground?.id });
      await onSubmitted?.(result.data);
    } catch (error) {
      setSubmissionError(t(getSubmissionErrorMessage(error)));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-3xl border border-white/60 bg-white/35 p-6 shadow-xl backdrop-blur-xl sm:p-9"
      onSubmit={handleSubmit}
      aria-label={t("Playground review")}
      noValidate
    >
      {Object.keys(errors).length > 0 && (
        <p
          className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 font-bold text-red-700"
          role="alert"
        >
          {t("Please fix the highlighted fields before submitting.")}
        </p>
      )}
      {submissionError && (
        <div
          className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-red-700"
          role="alert"
        >
          <strong className="block font-black">
            {t("Could not save your review")}
          </strong>
          <span className="mt-1 block text-sm font-semibold">
            {submissionError}
          </span>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <label className="font-bold text-gray-700">
          {t("Playground name")}
          <input
            className={`${fieldClass} mt-2`}
            name="playgroundName"
            aria-label={t("Playground name")}
            value={form.playgroundName}
            onChange={updateField}
            readOnly={Boolean(playground)}
            required
            aria-invalid={Boolean(errors.playgroundName)}
            aria-describedby={
              errors.playgroundName ? "playground-name-error" : undefined
            }
            placeholder={t("e.g. Wald Abenteuerplatz")}
          />
          <FieldError
            id="playground-name-error"
            message={errors.playgroundName}
          />
        </label>
        <label className="font-bold text-gray-700">
          {t("City or neighbourhood")}
          <input
            className={`${fieldClass} mt-2`}
            name="location"
            aria-label={t("City or neighbourhood")}
            value={form.location}
            onChange={updateField}
            readOnly={Boolean(playground)}
            required
            aria-invalid={Boolean(errors.location)}
            aria-describedby={errors.location ? "location-error" : undefined}
            placeholder={t("e.g. Kreuzberg, Berlin")}
          />
          <FieldError id="location-error" message={errors.location} />
        </label>
        <div>
          <GlassSelect
            className="gap-2"
            label={t("Best suited age")}
            labelClassName="font-bold text-gray-700"
            name="ageGroup"
            ariaLabel={t("Best suited age")}
            value={form.ageGroup}
            onChange={(value) => updateSelectField("ageGroup", value)}
            options={ageGroupOptions.map((option) => ({
              ...option,
              label: t(option.label),
            }))}
            placeholder={t("Select an age group")}
            isRequired
            isInvalid={Boolean(errors.ageGroup)}
            ariaDescribedBy={errors.ageGroup ? "age-group-error" : undefined}
          />
          <FieldError id="age-group-error" message={errors.ageGroup} />
        </div>
        <div>
          <GlassSelect
            className="gap-2"
            label={t("Safety rating")}
            labelClassName="font-bold text-gray-700"
            name="safetyRating"
            ariaLabel={t("Safety rating")}
            value={form.safetyRating}
            onChange={(value) => updateSelectField("safetyRating", value)}
            options={safetyRatingOptions.map((option) => ({
              ...option,
              label: t(option.label),
            }))}
            placeholder={t("Choose 1–5")}
            isRequired
            isInvalid={Boolean(errors.safetyRating)}
            ariaDescribedBy={
              errors.safetyRating ? "safety-rating-error" : undefined
            }
          />
          <FieldError id="safety-rating-error" message={errors.safetyRating} />
        </div>
      </div>

      <fieldset
        className="mt-7"
        aria-invalid={Boolean(errors.facilities)}
        aria-describedby={errors.facilities ? "facilities-error" : undefined}
      >
        <legend className="font-bold text-gray-700">
          {t("Available facilities")}
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {facilities.map((facility) => (
            <label
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/60 bg-white/30 px-4 py-3 text-sm font-semibold text-gray-700 backdrop-blur"
              key={facility}
            >
              <input
                className="h-4 w-4 accent-green-600"
                type="checkbox"
                value={facility}
                checked={form.facilities.includes(facility)}
                onChange={toggleFacility}
              />
              {t(facility)}
            </label>
          ))}
        </div>
        <FieldError id="facilities-error" message={errors.facilities} />
      </fieldset>

      <div className="mt-7 grid gap-6 md:grid-cols-2">
        <div>
          <GlassSelect
            className="gap-2"
            label={t("Overall parent rating")}
            labelClassName="font-bold text-gray-700"
            name="overallRating"
            ariaLabel={t("Overall parent rating")}
            value={form.overallRating}
            onChange={(value) => updateSelectField("overallRating", value)}
            options={overallRatingOptions.map((option) => ({
              ...option,
              label: t(option.label),
            }))}
            placeholder={t("Choose 1–5 stars")}
            isRequired
            isInvalid={Boolean(errors.overallRating)}
            ariaDescribedBy={
              errors.overallRating ? "overall-rating-error" : undefined
            }
          />
          <FieldError
            id="overall-rating-error"
            message={errors.overallRating}
          />
        </div>
        <fieldset
          aria-invalid={Boolean(errors.recommendation)}
          aria-describedby={
            errors.recommendation ? "recommendation-error" : undefined
          }
        >
          <legend className="font-bold text-gray-700">
            {t("Would you recommend it?")}
          </legend>
          <div className="mt-3 flex gap-3">
            {["Yes", "No"].map((answer) => (
              <label
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/30 px-4 py-3 font-semibold text-gray-700 backdrop-blur"
                key={answer}
              >
                <input
                  type="radio"
                  name="recommendation"
                  value={answer}
                  checked={form.recommendation === answer}
                  onChange={updateField}
                  required
                />
                {t(answer)}
              </label>
            ))}
          </div>
          <FieldError
            id="recommendation-error"
            message={errors.recommendation}
          />
        </fieldset>
      </div>

      <div className="mt-7">
        <label className="block font-bold text-gray-700" htmlFor="review">
          {t("Tell other parents about your visit")}
        </label>
        <textarea
          id="review"
          className={`${fieldClass} mt-2 min-h-36 resize-y`}
          name="review"
          value={form.review}
          onChange={updateField}
          required
          minLength={20}
          maxLength={1000}
          aria-invalid={Boolean(errors.review)}
          aria-describedby={
            errors.review ? "review-help review-error" : "review-help"
          }
          placeholder={t(
            "How were the equipment, safety, cleanliness, shade, and facilities?",
          )}
        />
        <span
          id="review-help"
          className="mt-1 block text-xs font-medium text-gray-500"
        >
          {t("Minimum 20 characters")}
        </span>
        <FieldError id="review-error" message={errors.review} />
      </div>

      <label className="mt-6 block font-bold text-gray-700">
        {t("Your name")}{" "}
        <span className="font-normal text-gray-500">{t("(optional)")}</span>
        <input
          className={`${fieldClass} mt-2`}
          name="parentName"
          value={form.parentName}
          onChange={updateField}
          maxLength={60}
          aria-invalid={Boolean(errors.parentName)}
          aria-describedby={errors.parentName ? "parent-name-error" : undefined}
          placeholder={t("Shown with your review")}
        />
        <FieldError id="parent-name-error" message={errors.parentName} />
      </label>

      {previewOnly && <p className="mt-6 font-semibold" role="status">{t("Preview only. Your changes will not be saved.")}</p>}
      <Button
        disabled={previewOnly}
        type="submit"
        className="mt-8 w-full sm:w-auto"
        size="lg"
        loading={isSubmitting}
      >
        {isSubmitting ? t("Saving review…") : t("Submit review")}
      </Button>
    </form>
  );
}
