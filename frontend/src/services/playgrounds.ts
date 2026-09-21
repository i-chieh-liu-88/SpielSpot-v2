import { playgrounds } from "../data/homeContent";
import type { Playground } from "../types/content";

export type PlaygroundMutationInput = {
  name: string;
  location: string;
  postcode: string;
  latitude: number;
  longitude: number;
  ageRange: string;
  safetyRating: number;
  description: string;
  tags: string[];
};

export async function getPlaygrounds(): Promise<Playground[]> {
  return structuredClone(playgrounds);
}

export async function getPlayground(id: string): Promise<Playground | null> {
  const playground = playgrounds.find((item) => item.id === id);
  return playground ? structuredClone(playground) : null;
}
