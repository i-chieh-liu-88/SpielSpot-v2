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
import "./PlaygroundDetailPage.css";
import { PlaygroundGallery } from "../../components/molecules/PlaygroundGallery/PlaygroundGallery";

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
      variant="secondary"
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
  const { t } = useLanguage();

  if (!authorId || user?.id !== authorId) return null;

  return (
    <Button type="button" onClick={onEdit}>
      {t("Edit review")}
    </Button>
  );
}

/* -------------------- 建立負責取得 Clerk token 和送出 PATCH 的按鈕 -------------------- */
function ReviewSaveButton({
  reviewId,
  reviewText,
  reviewRating,
  onSaved, //讓 Save 按鈕通知詳細頁「儲存成功」
}: {
  reviewId: string;
  reviewText: string;
  reviewRating: number;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
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
      if (!token) {
        throw new Error(
          "Please sign in to save your changes. Your edits are still here.",
        );
      } //使用者會知道下一步怎麼做，也知道輸入仍保留

      await updateReview(reviewId, reviewText.trim(), reviewRating, token);
      onSaved();
    } catch (error) {
      setSaveError(
        error instanceof TypeError
          ? "Could not connect to the server. Your edits are still here. Please try again."
          : error instanceof Error
            ? error.message
            : "Could not save your review. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={handleSave} disabled={isSaving}>
        {isSaving ? t("Saving...") : t("Save")}
      </Button>
      {saveError && <p role="alert">{t(saveError)}</p>}
    </>
  );
}

export function PlaygroundDetailPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { playgroundId } = useParams({ from: "/playgrounds_/$playgroundId" });
  const [refreshKey, setRefreshKey] = useState(0);
  const { playground, isLoading, error } = usePlayground(
    playgroundId,
    refreshKey,
  );
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  //這個狀態會記錄目前要編輯的評論 ID；null 表示沒有開啟編輯。
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [saveNotice, setSaveNotice] = useState("");

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
    <article className="detail-page relative min-h-screen px-4 py-8 sm:px-6">
      <div className="relative mx-auto max-w-5xl">
        <Button
          type="button"
          className="mb-7"
          onClick={() => navigate({ to: "/playgrounds" })}
        >
          {t("Back to map")}
        </Button>

        <div className="detail-panel">
          <header className="detail-header">
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
                {playground.name}
              </h1>
              <p className="detail-location">
                <LocationOnOutlined aria-hidden="true" />
                {playground.location}
              </p>
              <p className="detail-rating">
                <StarOutlined aria-hidden="true" />
                <strong>
                  {playground.reviews.length
                    ? (
                        playground.reviews.reduce(
                          (sum, review) => sum + review.rating,
                          0,
                        ) / playground.reviews.length
                      ).toFixed(1) + " / 5"
                    : t("Not rated")}
                </strong>
                <span>
                  {t("Community rating")} ·{" "}
                  {t("{count} reviews", { count: playground.reviews.length })}
                </span>
              </p>
            </div>

            <OwnerEditButton
              ownerId={playground.ownerId}
              playgroundId={playground.id}
            />
          </header>
          <PlaygroundGallery
            key={playground.id}
            name={playground.name}
            images={
              playground.imageUrls?.length
                ? playground.imageUrls
                : [playground.image].filter(Boolean)
            }
          />
          <div className="detail-body">
            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              {t(playground.description)}
            </p>

            <dl className="detail-facts mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/45 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("Best for")}
                </dt>
                <dd className="mt-1 font-black text-gray-800">
                  {playground.ageRange
                    ? t(playground.ageRange)
                    : t("Not provided")}
                </dd>
              </div>
              <div className="rounded-2xl bg-white/45 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("Safety")}
                </dt>
                <dd className="mt-1 font-black text-gray-800">
                  {Number(playground.safetyRating) >= 1 &&
                  Number(playground.safetyRating) <= 5
                    ? playground.safetyRating + " / 5"
                    : t(playground.safetyRating || "Not provided")}
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
              <h2
                id="parent-reviews-heading"
                className="text-2xl font-bold leading-tight text-gray-800 sm:text-3xl"
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
          </div>

          {/* 把成功訊息顯示在評論列表上方 */}
          {saveNotice && (
            <p
              role="status" //讓螢幕閱讀器也能讀出成功提示
              className="mb-4 rounded-xl bg-green-50 p-3 text-green-800"
            >
              {t(saveNotice)}
            </p>
          )}

          {playground.reviews.length === 0 && (
            <p className="detail-empty">
              {t("No reviews yet. Be the first to share your experience.")}
            </p>
          )}
          <div className="grid gap-5 md:grid-cols-2">
            {playground.reviews.map((review) => (
              <figure className="detail-review" key={review.id}>
                <StarRating className="text-amber-400" rating={review.rating} />
                <blockquote className="mt-3 font-medium leading-relaxed text-gray-600">
                  “{t(review.text)}”
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <strong className="text-gray-800">{review.author}</strong>
                  <span className="ml-2 text-gray-500">
                    {t("Published {date}", {
                      date: Number.isNaN(Date.parse(review.visitedAt))
                        ? t(review.visitedAt)
                        : new Intl.DateTimeFormat(
                            language === "de" ? "de-DE" : "en-GB",
                            { day: "numeric", month: "short", year: "numeric" },
                          ).format(new Date(review.visitedAt)),
                    })}
                  </span>
                </figcaption>
                {/* 按鈕放進每則評論卡片 */}
                {isClerkConfigured && (
                  <ReviewEditButton
                    authorId={review.authorId}
                    onEdit={() => {
                      setSaveNotice("");
                      setEditingReviewId(review.id);
                      setEditText(review.text);
                      setEditRating(review.rating);
                    }} // 點擊按鈕時執行的動作
                  />
                )}

                {/* 先讓點擊與取消動作能運作 */}
                {editingReviewId === review.id && (
                  <div className="mt-4">
                    <label htmlFor={`review-text-${review.id}`}>
                      {t("Review")}
                    </label>
                    <textarea
                      id={`review-text-${review.id}`}
                      autoFocus
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      className="mt-2 w-full rounded-xl border p-3"
                    />

                    {/* 星級選項 */}
                    <label
                      htmlFor={`review-rating-${review.id}`}
                      className="mt-4 block"
                    >
                      {t("Overall rating")}
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
                          {t("{rating} out of 5 stars", { rating })}
                        </option>
                      ))}
                    </select>
                    {isClerkConfigured && (
                      <ReviewSaveButton
                        reviewId={review.id}
                        reviewText={editText}
                        reviewRating={editRating}
                        onSaved={() => {
                          setEditingReviewId(null);
                          setSaveNotice("Your review has been updated.");
                          setRefreshKey((current) => current + 1);
                        }}
                      />
                    )}
                    <Button
                      type="button"
                      onClick={() => setEditingReviewId(null)}
                    >
                      {t("Cancel")}
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
