import { createFileRoute } from "@tanstack/react-router";
import { EditPlaygroundPage } from "../pages/EditPlaygroundPage/EditPlaygroundPage";

export const Route = createFileRoute("/playgrounds_/$playgroundId_/edit")({
  component: EditPlaygroundPage,
});
