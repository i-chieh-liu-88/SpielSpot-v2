import { apiFetch } from "./apiClient";
import type { Playground, PlaygroundParentReview } from "../types/content";

export type PlaygroundFilters = {
  location?: string;
  ageRange?: string;
  tags?: string[];
}; //定義可送出的篩選條件

type BackendPlayground = {
  _id: string;
  name: string;
  description?: string;
  location: string;
  postcode?: string;
  latitude: number;
  longitude: number;
  ageRange?: string;
  safetyRating?: number;
  tags?: string[];
  ownerId: string;
};

type BackendReview = {
  _id: string;
  authorId?: string;
  parentName?: string;
  overallRating: string;
  review: string;
  createdAt: string;
};

const FALLBACK_GRADIENT = "from-green-400 to-blue-500";
const FALLBACK_IMAGE = "/images/playground-placeholder.png";

function toDisplayPlayground(raw: BackendPlayground): Playground {
  return {
    id: raw._id,
    name: raw.name,
    location: raw.location,
    postcode: raw.postcode ?? "",
    coordinates: [raw.latitude, raw.longitude],
    distance: "",
    rating: raw.safetyRating != null ? String(raw.safetyRating) : "N/A",
    safetyRating: raw.safetyRating != null ? String(raw.safetyRating) : "N/A",
    ageRange: raw.ageRange ?? "",
    description: raw.description ?? "",
    image: FALLBACK_IMAGE,
    gradient: FALLBACK_GRADIENT,
    tags: raw.tags ?? [],
    reviews: [],
    ownerId: raw.ownerId,
  };
}

function toDisplayReview(raw: BackendReview): PlaygroundParentReview {
  return {
    id: raw._id,
    authorId: raw.authorId,
    author: raw.parentName || "Anonymous",
    rating: Number(raw.overallRating) || 0,
    text: raw.review,
    visitedAt: raw.createdAt,
  };
}

export async function getPlayground(id: string): Promise<Playground | null> {
  try {
    const [raw, rawReviews]: [BackendPlayground, BackendReview[]] =
      await Promise.all([
        apiFetch(`/api/playgrounds/${id}`),
        apiFetch(`/api/playgrounds/${id}/reviews`),
      ]);

    return {
      ...toDisplayPlayground(raw),
      reviews: rawReviews.map(toDisplayReview),
    };
  } catch {
    return null;
  }
}

export async function getPlaygrounds(
  filters: PlaygroundFilters = {},
): Promise<Playground[]> {
  const params = new URLSearchParams();

  if (filters.location?.trim()) {
    params.set("location", filters.location.trim());
  }
  if (filters.ageRange) {
    params.set("ageRange", filters.ageRange);
  }
  if (filters.tags?.length) {
    params.set("tags", filters.tags.join(","));
  }

  const query = params.toString();
  const raw: BackendPlayground[] = await apiFetch(
    `/api/playgrounds${query ? `?${query}` : ""}`,
  );

  return raw.map(toDisplayPlayground);
}
