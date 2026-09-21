import { createFileRoute } from "@tanstack/react-router";
import { InstrumentsPage } from "../pages/InstrumentsPage/InstrumentsPage";

export const Route = createFileRoute("/instruments")({
  component: InstrumentsPage,
});
