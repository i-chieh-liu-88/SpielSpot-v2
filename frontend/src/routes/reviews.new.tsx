import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ReviewPage } from "../pages/ReviewPage/ReviewPage";

export const Route = createFileRoute("/reviews/new")({
  validateSearch: (search) =>
    z.object({ playgroundId: z.string().optional() }).parse(search),
  component: ReviewPage,
});
