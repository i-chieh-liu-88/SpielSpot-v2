import { useNavigate } from "@tanstack/react-router";
import balloonImage from "../../../image/image-Hot Air Balloon.png";
import kidsImage from "../../../image/image-kids-and-nature.png";
import rainbowImage from "../../../image/image-rainbow.png";
import treeBirdImage from "../../../image/image-tree&bird.png";
import { ExpandingArrowButton } from "../../atoms/ExpandingArrowButton";
import { InteractiveText } from "../../atoms/InteractiveText/InteractiveText";
import { SplitText } from "../../atoms/SplitText";
import { useLanguage } from "../../../providers/LanguageProvider";

export function HeroSection() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const decorations = [
    { src: balloonImage, className: "left-[8%] top-24 hero-float-1" },
    { src: rainbowImage, className: "right-[10%] top-36 hero-float-2" },
    { src: kidsImage, className: "bottom-36 left-[14%] hero-float-3" },
    { src: treeBirdImage, className: "bottom-28 right-[8%] hero-float-1" },
  ];

  return (
    <section
      id="top"
      className="relative z-0 flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-6 pb-32 pt-10 text-center"
    >
      <div className="dot-grid absolute inset-0 opacity-70" />
      <div className="animate-blob absolute -left-20 top-10 z-0 h-72 w-72 rounded-full bg-sand/60 blur-2xl" />
      <div className="animate-blob absolute -right-16 bottom-20 z-0 h-64 w-64 rounded-full bg-sky/40 blur-2xl" />
      {decorations.map(({ src, className }) => (
        <img
          className={`absolute hidden h-25 w-25 select-none object-contain md:block ${className}`}
          src={src}
          alt=""
          key={src}
        />
      ))}
      <div className="relative z-10 mx-auto max-w-4xl">
        {/* HERO TEXT------------------------------------------------------------------------------------ */}

        <SplitText
          key={language}
          tag="h1"
          text={t("Find the Super Spiel Spot Nearby")}
          id="shake-headline"
          aria-label={t("Find the Super Spiel Spot Nearby")}
          className={`display mb-4 w-full text-[clamp(3.5rem,9vw,9rem)] font-black tracking-[-0.01em] text-black ${
            language === "de" ? "leading-[1.08]" : "leading-[0.95]"
          }`}
          delay={45}
          duration={0.8}
          ease="power3.out"
          splitType="words, chars"
          from={{ opacity: 0, y: 48, rotateX: -35 }}
          to={{ opacity: 1, y: 0, rotateX: 0 }}
          threshold={0.1}
          rootMargin="-60px"
        >
          <InteractiveText text={t("Find the")} />
          <br />
          <span className="relative inline-block font-black text-grass">
            <InteractiveText text={t("Super Spiel")} colorOffset={7} />
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 12"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M4 8 Q75 2 150 8 Q225 14 296 8"
                stroke="#f97066"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
          <br />
          <span className="inline-block">
            <InteractiveText text={t("Spot")} colorOffset={17} />
          </span>{" "}
          <span className="inline-block">
            <InteractiveText text={t("Nearby")} colorOffset={21} />
          </span>
        </SplitText>
        <p className="animate-fadeUp3 mx-auto mt-8 max-w-xl text-m font-light leading-relaxed text-gray-800 md:text-xl">
          {t(
            "Discover safe, fun, age-appropriate playgrounds right around the corner, rated by parents in your community.",
          )}
        </p>
        <div className="animate-fadeUp4 mt-10">
          <ExpandingArrowButton
            onClick={() => navigate({ to: "/playgrounds" })}
          >
            {t("Go to playgrounds")}
          </ExpandingArrowButton>
        </div>
      </div>
    </section>
  );
}
