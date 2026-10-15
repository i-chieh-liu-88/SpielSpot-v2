import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "@tanstack/react-router";
import Button from "../../components/atoms/Button";
import { LoadingSpinner } from "../../components/atoms/LoadingSpinner";
import { PlaygroundForm } from "../../components/organisms/PlaygroundForm/PlaygroundForm";
import { isClerkConfigured } from "../../config/clerk";
import { useLanguage } from "../../providers/LanguageProvider";
import { SplitText } from "../../components/atoms/SplitText";

function AddPlaygroundContent() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return <LoadingSpinner label={t("Loading your account…")} size="xl" />;
  }

  if (!userId) {
    return (
      <section className="rounded-3xl border border-white/60 bg-white/40 p-10 text-center shadow-xl backdrop-blur-xl">
        <AddLocationAltOutlined
          className="text-5xl text-grass"
          aria-hidden="true"
        />
        <h2 className="mt-4 text-3xl font-black text-gray-800">
          {t("Sign in to add a playground")}
        </h2>
        <p className="mt-3 text-gray-600">
          {t(
            "Your account protects the listing so only you can edit it later.",
          )}
        </p>
        <SignInButton mode="modal">
          <Button type="button" className="mt-7" size="lg">
            {t("Log in to continue")}
          </Button>
        </SignInButton>
      </section>
    );
  }

  return (
    <PlaygroundForm
      mode="create"
      onSaved={(playground, writeReview) => {
        if (writeReview) {
          navigate({
            to: "/reviews/new",
            search: { playgroundId: playground.id },
          });
          return;
        }
        navigate({
          to: "/playgrounds/$playgroundId",
          params: { playgroundId: playground.id },
        });
      }}
    />
  );
}

export function AddPlaygroundPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="spot-create-page grass-bg relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 sm:py-12">
      <div className="dot-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-4xl">
        <Button
          type="button"
          className="mb-6 min-h-11"
          variant="secondary"
          onClick={() => navigate({ to: "/playgrounds" })}
        >
          {t("Back to playgrounds")}
        </Button>
        <header className="mb-8 max-w-3xl text-left">
          <SplitText
            key={t("Add a playground")}
            tag="h1"
            text={t("Add a playground")}
            textAlign="left"
            className="display text-3xl font-bold leading-tight tracking-tight text-balance text-gray-800 sm:text-4xl lg:text-5xl"
            delay={45}
            duration={0.8}
            ease="power3.out"
            splitType="words, chars"
            from={{ opacity: 0, y: 48, rotateX: -35 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            threshold={0.1}
            rootMargin="-60px"
          />
          <p className="animate-fadeUp3 mt-3 max-w-2xl text-base leading-relaxed text-pretty text-gray-600 sm:text-lg">
            {t(
              "Pin a place you discovered, upload a photo, and help nearby families find it.",
            )}
          </p>
        </header>
        {isClerkConfigured ? (
          <AddPlaygroundContent />
        ) : (
          <p
            className="rounded-3xl bg-white/50 p-8 text-center font-bold text-red-700"
            role="alert"
          >
            {t("Configure Clerk authentication before adding playgrounds.")}
          </p>
        )}
      </div>
    </section>
  );
}
