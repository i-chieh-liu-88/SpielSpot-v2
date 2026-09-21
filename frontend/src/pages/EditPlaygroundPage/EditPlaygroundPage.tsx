import LockOutlined from "@mui/icons-material/LockOutlined";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import Button from "../../components/atoms/Button";
import { LoadingSpinner } from "../../components/atoms/LoadingSpinner";
import { PlaygroundForm } from "../../components/organisms/PlaygroundForm/PlaygroundForm";
import { isClerkConfigured } from "../../config/clerk";
import { usePlayground } from "../../hooks/usePlaygrounds";
import { useLanguage } from "../../providers/LanguageProvider";

function EditPlaygroundContent({ playgroundId }: { playgroundId: string }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isLoaded, userId } = useAuth();
  const { playground, isLoading, error } = usePlayground(playgroundId);

  if (!isLoaded || isLoading) {
    return <LoadingSpinner label={t("Loading playground…")} size="xl" />;
  }

  if (!userId) {
    return (
      <section className="rounded-3xl bg-white/45 p-10 text-center shadow-xl">
        <LockOutlined className="text-5xl text-grass" aria-hidden="true" />
        <h2 className="mt-4 text-3xl font-black text-gray-800">
          {t("Sign in to edit")}
        </h2>
        <SignInButton mode="modal">
          <Button type="button" className="mt-7" size="lg">
            {t("Log in")}
          </Button>
        </SignInButton>
      </section>
    );
  }

  if (error || !playground) {
    return (
      <p
        className="rounded-3xl bg-red-50 p-8 text-center font-bold text-red-700"
        role="alert"
      >
        {error ?? t("Playground not found.")}
      </p>
    );
  }

  if (playground.ownerId !== userId) {
    return (
      <section className="rounded-3xl bg-white/45 p-10 text-center shadow-xl">
        <LockOutlined className="text-5xl text-gray-500" aria-hidden="true" />
        <h2 className="mt-4 text-3xl font-black text-gray-800">
          {t("This listing is read-only")}
        </h2>
        <p className="mt-3 text-gray-600">
          {t(
            "Only the community member who added this playground can edit it.",
          )}
        </p>
      </section>
    );
  }

  return (
    <PlaygroundForm
      mode="edit"
      playground={playground}
      onSaved={(savedPlayground, writeReview) => {
        if (writeReview) {
          navigate({
            to: "/reviews/new",
            search: { playgroundId: savedPlayground.id },
          });
          return;
        }
        navigate({
          to: "/playgrounds/$playgroundId",
          params: { playgroundId: savedPlayground.id },
        });
      }}
    />
  );
}

export function EditPlaygroundPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { playgroundId } = useParams({
    from: "/playgrounds_/$playgroundId_/edit",
  });

  return (
    <section className="grass-bg relative min-h-screen overflow-hidden px-6 py-16">
      <div className="dot-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-5xl">
        <Button
          type="button"
          className="mb-8"
          onClick={() =>
            navigate({
              to: "/playgrounds/$playgroundId",
              params: { playgroundId },
            })
          }
        >
          {t("Back to playground")}
        </Button>
        <header className="mb-10 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-grass">
            {t("Your community listing")}
          </p>
          <h1 className="display text-5xl font-black text-gray-800">
            {t("Edit playground")}
          </h1>
        </header>
        {isClerkConfigured ? (
          <EditPlaygroundContent playgroundId={playgroundId} />
        ) : (
          <p role="alert">
            {t("Configure Clerk authentication to edit playgrounds.")}
          </p>
        )}
      </div>
    </section>
  );
}

