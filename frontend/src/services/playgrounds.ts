import { apiFetch } from "./apiClient";
import type { Playground, PlaygroundParentReview } from "../types/content";

export type PlaygroundFilters = {
  location?: string;
  ageRange?: string;
  tags?: string[];
}; //定義可送出的篩選條件

export type CreatePlaygroundInput = {
  name: string;
  location: string;
  postcode: string;
  latitude: number;
  longitude: number;
  ageRange: string;
  safetyRating: number;
  description: string;
  tags: string[];
}; //規定建立遊樂場時要傳哪些資料

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
  imageUrl?: string;
  imageUrls?: string[];
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
    image: raw.imageUrls?.[0] || raw.imageUrl || FALLBACK_IMAGE,
    imageUrls: raw.imageUrls?.length ? raw.imageUrls : raw.imageUrl ? [raw.imageUrl] : [],
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

const pendingPlaygroundReads = new Map<string, Promise<Playground[]>>();

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
  const path = `/api/playgrounds${query ? `?${query}` : ""}`;
  // The list, filter options and StrictMode may request the same read together.
  // Share only pending reads: later retries still make a fresh request.
  let pending = pendingPlaygroundReads.get(path);
  if (!pending) {
    pending = apiFetch(path).then((raw: BackendPlayground[]) => raw.map(toDisplayPlayground));
    pendingPlaygroundReads.set(path, pending);
  }
  try {
    return structuredClone(await pending);
  } finally {
    if (pendingPlaygroundReads.get(path) === pending) pendingPlaygroundReads.delete(path);
  }
}

/* ---------------------------- 傳送資料的 createPlayground function, 帶著 Clerk token 傳送資料---------------------------- */
export async function uploadPlaygroundPhoto(id: string, photo: File, token: string): Promise<string> {
  const body = new FormData();
  body.append("photo", photo);
  const result: { imageUrl: string } = await apiFetch(`/api/playgrounds/${id}/photo`, { method: "POST", body }, token);
  return result.imageUrl;
}

export async function uploadPlaygroundPhotos(id: string, photos: File[], token: string): Promise<string[]> {
  const body = new FormData();
  photos.forEach((photo) => body.append("photos", photo));
  const result: { imageUrls: string[] } = await apiFetch(`/api/playgrounds/${id}/photos`, { method: "POST", body }, token);
  return result.imageUrls;
}

export async function createPlayground(
  input: CreatePlaygroundInput,
  token: string,
): Promise<Playground> {
  const raw: BackendPlayground = await apiFetch(
    "/api/playgrounds",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    token,
  );

  return toDisplayPlayground(raw);
}
