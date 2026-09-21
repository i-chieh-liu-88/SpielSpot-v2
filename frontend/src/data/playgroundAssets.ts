import climbingImage from "../image/image-climbing.png";
import dinosaurImage from "../image/image-dinosour.png";
import treehouseImage from "../image/image-treehouse.png";
import waterfallImage from "../image/image-waterfall.png";

export type PlaygroundImageKey =
  "treehouse" | "waterfall" | "climbing" | "dinosaur";

const playgroundImages: Record<PlaygroundImageKey, string> = {
  treehouse: treehouseImage,
  waterfall: waterfallImage,
  climbing: climbingImage,
  dinosaur: dinosaurImage,
};

export function getPlaygroundImage(imageKey: PlaygroundImageKey) {
  return playgroundImages[imageKey];
}
