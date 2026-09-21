import { createFileRoute } from "@tanstack/react-router";
import { AddPlaygroundPage } from "../pages/AddPlaygroundPage/AddPlaygroundPage";

export const Route = createFileRoute("/playgrounds_/new")({
  component: AddPlaygroundPage,
});
