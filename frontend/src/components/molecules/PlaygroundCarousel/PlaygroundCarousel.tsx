import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import { Avatar, Card } from "@heroui/react";
import {
  BlossomCarousel,
  BlossomDot,
  BlossomDots,
  BlossomNext,
  BlossomPrev,
  type BlossomCarouselHandle,
} from "@blossom-carousel/react";
import { useEffect, useRef, type UIEvent } from "react";
import type { Playground } from "../../../types/content";
import Button from "../../atoms/Button";
import { useLanguage } from "../../../providers/LanguageProvider";
import "./PlaygroundCarousel.css";

const carouselId = "map-playground-cover-flow";

type PlaygroundCarouselProps = {
  playgrounds: Playground[];
  onSelect: (playgroundId: string) => void;
};

function getPlaygroundInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");
}

function updateCoverFlow(carousel: HTMLElement) {
  const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
  const halfWidth = Math.max(carousel.clientWidth / 2, 1);

  Array.from(carousel.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) return;

    const slideCenter = child.offsetLeft + child.offsetWidth / 2;
    const offset = Math.max(
      -1,
      Math.min(1, (slideCenter - carouselCenter) / halfWidth),
    );
    const distance = Math.abs(offset);

    child.style.setProperty("--cover-flow-rotation", `${offset * -32}deg`);
    child.style.setProperty("--cover-flow-scale", String(1 - distance * 0.16));
    child.style.setProperty("--cover-flow-opacity", String(1 - distance * 0.28));
    child.style.zIndex = String(Math.round((1 - distance) * 10));
  });
}

export function PlaygroundCarousel({
  playgrounds,
  onSelect,
}: PlaygroundCarouselProps) {
  const carouselRef = useRef<BlossomCarouselHandle>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const carousel = carouselRef.current?.element;
    if (!carousel) return;

    const frame = requestAnimationFrame(() => updateCoverFlow(carousel));
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(() => updateCoverFlow(carousel));
    resizeObserver?.observe(carousel);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
    };
  }, [playgrounds]);

  function handleScroll(event: UIEvent<HTMLElement>) {
    updateCoverFlow(event.currentTarget);
  }

  if (playgrounds.length === 0) {
    return (
      <p
        className="rounded-3xl border border-white/60 bg-white/40 p-8 text-center font-bold text-gray-700"
        role="status"
      >
        {t(
          "No playgrounds are visible in this map area. Move or zoom out on the map to see nearby cards.",
        )}
      </p>
    );
  }

  return (
    <div
      className="playground-cover-flow-shell"
      role="region"
      aria-roledescription="carousel"
      aria-label={t("Playgrounds visible in the current map area")}
    >
      <BlossomCarousel
        as="ul"
        className="playground-cover-flow"
        id={carouselId}
        ref={carouselRef}
        onScroll={handleScroll}
        aria-label={t("Playground cards")}
      >
        {playgrounds.map((playground, index) => (
          <li
            className="playground-cover-flow-slide"
            data-blossom-slide
            key={playground.id}
            aria-label={t("{current} of {total}: {name}", {
              current: index + 1,
              total: playgrounds.length,
              name: playground.name,
            })}
          >
            <Card className="playground-cover-flow-card border border-white/70 bg-white/80 shadow-xl">
              <Card.Header className="flex-row items-start gap-4">
                <Avatar
                  className={`shrink-0 bg-linear-to-br ${playground.gradient}`}
                  size="lg"
                >
                  <Avatar.Image
                    src={playground.image}
                    alt={t("{name} illustration", { name: playground.name })}
                  />
                  <Avatar.Fallback className="font-black text-green-800">
                    {getPlaygroundInitials(playground.name)}
                  </Avatar.Fallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <Card.Title className="text-lg font-black text-gray-800">
                    {playground.name}
                  </Card.Title>
                  <Card.Description className="mt-1 font-semibold text-gray-500">
                    {playground.location}
                  </Card.Description>
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                  <StarOutlined className="text-sm" aria-hidden="true" />{" "}
                  {playground.rating}
                </span>
              </Card.Header>
              <Card.Content className="text-sm font-medium text-gray-600">
                {t(playground.description)}
              </Card.Content>
              <Card.Footer>
                <Button
                  type="button"
                  className="text-sm"
                  size="sm"
                  onClick={() => onSelect(playground.id)}
                >
                  {t("View details")}
                </Button>
              </Card.Footer>
            </Card>
          </li>
        ))}
      </BlossomCarousel>

      <div className="playground-cover-flow-controls">
        <BlossomPrev
          className="playground-cover-flow-button"
          for={carouselId}
          aria-label={t("Previous playground")}
        >
          <ArrowBackOutlined aria-hidden="true" />
        </BlossomPrev>
        <BlossomDots className="playground-cover-flow-dots" for={carouselId}>
          {({ index, active }) => (
            <BlossomDot
              className="playground-cover-flow-dot"
              data-active={active}
              aria-label={t("Go to playground {number}", {
                number: index + 1,
              })}
            >
              <span aria-hidden="true" />
            </BlossomDot>
          )}
        </BlossomDots>
        <BlossomNext
          className="playground-cover-flow-button"
          for={carouselId}
          aria-label={t("Next playground")}
        >
          <ArrowForwardOutlined aria-hidden="true" />
        </BlossomNext>
      </div>
    </div>
  );
}
