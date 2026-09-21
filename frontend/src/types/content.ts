export type Feature = {
  icon: "location" | "filters" | "map" | "safety" | "age" | "accessibility";
  title: string;
  description: string;
  tone: string;
};

export type Playground = {
  id: string;
  name: string;
  location: string;
  postcode: string;
  coordinates: [number, number];
  distance: string;
  rating: string;
  safetyRating: string;
  ageRange: string;
  description: string;
  image: string;
  gradient: string;
  tags: string[];
  reviews: PlaygroundParentReview[];
  ownerId?: string;
};

export type PlaygroundParentReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  visitedAt: string;
};

export type Review = {
  quote: string;
  name: string;
  detail: string;
  initials: string;
  tone: string;
};
