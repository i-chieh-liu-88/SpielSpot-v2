import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import EditLocationAltOutlined from "@mui/icons-material/EditLocationAltOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import Button from "../../components/atoms/Button";
import { LoadingSpinner } from "../../components/atoms/LoadingSpinner";
import { StarRating } from "../../components/atoms/StarRating";
import { usePlayground } from "../../hooks/usePlaygrounds";
import { isClerkConfigured } from "../../config/clerk";
import { useLanguage } from "../../providers/LanguageProvider";
import { useState } from "react";
import { updateReview } from "../../services/reviews";

function AuthenticatedEditButton({
  ownerId,
  playgroundId,
}: {
  ownerId?: string;
  playgroundId: string;
}) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useUser();

  if (!ownerId || user?.id !== ownerId) return null;

  return (
    <Button
      type="button"
      onClick={() =>
        navigate({
          to: "/playgrounds/$playgroundId/edit",
          params: { playgroundId },
        })
      }
    >
      <EditLocationAltOutlined aria-hidden="true" /> {t("Edit playground")}
    </Button>
  );
}

function OwnerEditButton(props: { ownerId?: string; playgroundId: string }) {
  return isClerkConfigured ? <AuthenticatedEditButton {...props} /> : null;
}

function ReviewEditButton({
  authorId,
  onEdit,
}: {
  authorId?: string;
  onEdit: () => void;
}) {
  const { user } = useUser();

  if (!authorId || user?.id !== authorId) return null;

  return (
    <Button type="button" onClick={onEdit}>
      Edit review
    </Button>
  );
}

/* -------------------- 建立負責取得 Clerk token 和送出 PATCH 的按鈕 -------------------- */
function ReviewSaveButton({
  reviewId,
  reviewText,
  reviewRating,
}: {
  reviewId: string;
  reviewText: string;
  reviewRating: number;
}) {
  const { getToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSave() {
    if (!reviewText.trim()) {
      setSaveError("Review cannot be empty.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const token = await getToken();
      if (!token) throw new Error("Please sign in again.");

      await updateReview(reviewId, reviewText.trim(), reviewRating, token);
      window.location.reload();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </Button>
      {saveError && <p role="alert">{saveError}</p>}
    </>
  );
}

export function PlaygroundDetailPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { playgroundId } = useParams({ from: "/playgrounds_/$playgroundId" });
  const { playground, isLoading, error } = usePlayground(playgroundId);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  //這個狀態會記錄目前要編輯的評論 ID；null 表示沒有開啟編輯。
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(0);

  if (isLoading) {
    return (
      <section className="grass-bg min-h-[70vh] px-6 py-24 text-center text-lg font-bold text-gray-700">
        <LoadingSpinner label={t("Loading playground…")} size="xl" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="grass-bg min-h-[70vh] px-6 py-24 text-center">
        <h1 className="text-4xl font-black text-gray-800">
          {t("Could not load this playground")}
        </h1>
        <p className="mt-3 text-red-700" role="alert">
          {error}
        </p>
        <Button
          type="button"
          className="mt-7"
          size="lg"
          onClick={() => navigate({ to: "/playgrounds" })}
        >
          {t("Back to map")}
        </Button>
      </section>
    );
  }

  if (!playground) {
    return (
      <section className="grass-bg min-h-[70vh] px-6 py-24 text-center">
        <h1 className="text-4xl font-black text-gray-800">
          {t("Playground not found")}
        </h1>
        <Button
          type="button"
          className="mt-7"
          size="lg"
          onClick={() => navigate({ to: "/playgrounds" })}
        >
          {t("Back to map")}
        </Button>
      </section>
    );
  }

  return (
    <article className="grass-bg relative min-h-screen overflow-hidden px-6 py-12">
      <div className="dot-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-5xl">
        <Button
          type="button"
          className="mb-7"
          onClick={() => navigate({ to: "/playgrounds" })}
        >
          {t("Back to map")}
        </Button>

        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/40 shadow-xl backdrop-blur-xl">
          <div
            className={`relative h-72 bg-linear-to-br ${playground.gradient} sm:h-96`}
          >
            <img
              className="absolute inset-0 h-full w-full object-contain p-8"
              src={playground.image}
              alt=""
            />
            <span className="absolute bottom-5 left-5 inline-flex items-center gap-1 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-gray-700 backdrop-blur">
              <LocationOnOutlined className="text-base" aria-hidden="true" />{" "}
              {playground.location}
            </span>
          </div>
          <div className="p-6 sm:p-9">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-grass">
                  {t("Playground details")}
                </p>
                <h1 className="mt-2 text-4xl font-black text-gray-800 sm:text-5xl">
                  {playground.name}
                </h1>
              </div>
              <span className="inline-flex items-center gap-1 self-start rounded-full bg-amber-100 px-4 py-2 font-black text-amber-800">
                <StarOutlined aria-hidden="true" /> {playground.rating}
              </span>
            </div>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              {t(playground.description)}
            </p>

            <dl className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/45 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("Best for")}
                </dt>
                <dd className="mt-1 font-black text-gray-800">
                  {t(playground.ageRange)}
                </dd>
              </div>
              <div className="rounded-2xl bg-white/45 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("Safety")}
                </dt>
                <dd className="mt-1 font-black text-gray-800">
                  {t(playground.safetyRating)}
                </dd>
              </div>
              <div className="rounded-2xl bg-white/45 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("Community rating")}
                </dt>
                <dd className="mt-1 font-black text-gray-800">
                  {playground.rating} / 5
                </dd>
              </div>
            </dl>

            <section className="mt-8" aria-labelledby="facilities-heading">
              <h2
                id="facilities-heading"
                className="text-2xl font-black text-gray-800"
              >
                {t("Facilities")}
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {playground.tags.map((tag) => (
                  <li
                    className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800"
                    key={tag}
                  >
                    {t(tag)}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <section className="mt-10" aria-labelledby="parent-reviews-heading">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-grass">
                {t("Community voices")}
              </p>
              <h2
                id="parent-reviews-heading"
                className="text-3xl font-black text-gray-800"
              >
                {t("Parent reviews")}
              </h2>
            </div>
            <Button
              type="button"
              onClick={() =>
                navigate({
                  to: "/reviews/new",
                  search: { playgroundId: playground.id },
                })
              }
            >
              {t("Write a review")}
            </Button>
            <OwnerEditButton
              ownerId={playground.ownerId}
              playgroundId={playground.id}
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {playground.reviews.map((review) => (
              <figure
                className="rounded-3xl border border-white/60 bg-white/35 p-6 shadow-lg backdrop-blur-xl"
                key={review.id}
              >
                <StarRating className="text-amber-400" rating={review.rating} />
                <blockquote className="mt-3 font-medium leading-relaxed text-gray-600">
                  “{t(review.text)}”
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <strong className="text-gray-800">{review.author}</strong>
                  <span className="ml-2 text-gray-500">
                    {t("Visited {date}", { date: t(review.visitedAt) })}
                  </span>
                </figcaption>
                {/* 按鈕放進每則評論卡片 */}
                {isClerkConfigured && (
                  <ReviewEditButton
                    authorId={review.authorId}
                    onEdit={() => {
                      setEditingReviewId(review.id);
                      setEditText(review.text);
                      setEditRating(review.rating);
                    }} // 點擊按鈕時執行的動作
                  />
                )}

                {/* 先讓點擊與取消動作能運作 */}
                {editingReviewId === review.id && (
                  <div className="mt-4">
                    <label htmlFor={`review-text-${review.id}`}>Review</label>
                    <textarea
                      id={`review-text-${review.id}`}
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      className="mt-2 w-full rounded-xl border p-3"
                    />

                    {/* 星級選項 */}
                    <label
                      htmlFor={`review-rating-${review.id}`}
                      className="mt-4 block"
                    >
                      Overall rating
                    </label>
                    <select
                      id={`review-rating-${review.id}`}
                      value={editRating}
                      onChange={(event) =>
                        setEditRating(Number(event.target.value))
                      }
                      className="mt-2 w-full rounded-xl border p-3"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} {rating === 1 ? "star" : "stars"}
                        </option>
                      ))}
                    </select>
                    {isClerkConfigured && (
                      <ReviewSaveButton
                        reviewId={review.id}
                        reviewText={editText}
                        reviewRating={editRating}
                      />
                    )}
                    <Button
                      type="button"
                      onClick={() => setEditingReviewId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </figure>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
