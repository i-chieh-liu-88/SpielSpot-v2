import rainbowImage from "../../../image/image-rainbow.png";
import treeBirdImage from "../../../image/image-tree&bird.png";
import Button from "../../atoms/Button";
import { useLanguage } from "../../../providers/LanguageProvider";

export function CtaSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section
      className="relative overflow-hidden bg-grass px-6 py-24"
      aria-labelledby="cta-heading"
    >
      <div className="dot-grid absolute inset-0 opacity-20" />
      <img
        className="animate-floatY absolute left-[5%] top-10 hidden h-30 w-30 select-none object-contain md:block"
        src={rainbowImage}
        alt=""
      />
      <img
        className="animate-floatY2 absolute bottom-10 right-[6%] hidden h-30 w-30 select-none object-contain md:block"
        src={treeBirdImage}
        alt=""
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <h2
          id="cta-heading"
          className="mb-4 text-5xl font-black leading-tight text-white md:text-6xl"
        >
          {t("Ready for your next adventure?")}
        </h2>
        <p className="mb-10 text-lg text-green-100">
          {t(
            "Find a playground everyone will love, before the kids ask “are we there yet?”",
          )}
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            type="button"
            className="text-white"
            size="lg"
            onClick={() => navigate({ to: "/playgrounds" })}
          >
            {t("Find Playgrounds Now")}
          </Button>
          <Button
            type="button"
            className="text-white"
            size="lg"
            onClick={() => {
              window.location.hash = "top";
            }}
          >
            {t("Get the App")}
          </Button>
        </div>
      </div>
    </section>
  );
}
import { useNavigate } from "@tanstack/react-router";
