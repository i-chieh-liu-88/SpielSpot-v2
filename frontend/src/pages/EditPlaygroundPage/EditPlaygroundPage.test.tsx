import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { EditPlaygroundPage } from "./EditPlaygroundPage";
const state = vi.hoisted(() => ({ userId: "owner" as string | null, navigate: vi.fn() }));
vi.mock("@clerk/clerk-react", () => ({ useAuth: () => ({ isLoaded: true, userId: state.userId }), SignInButton: ({ children }: { children: React.ReactNode }) => children }));
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => state.navigate, useParams: () => ({ playgroundId: "park" }) }));
vi.mock("../../config/clerk", () => ({ isClerkConfigured: true }));
vi.mock("../../hooks/usePlaygrounds", () => ({ usePlayground: () => ({ playground: { id: "park", ownerId: "owner" }, isLoading: false }) }));
vi.mock("../../components/organisms/PlaygroundForm/PlaygroundForm", () => ({ PlaygroundForm: ({ onSaved }: { onSaved: (value: { id: string }, review: boolean) => void }) => <button onClick={() => onSaved({ id: "park" }, false)}>Simulate saved response</button> }));
afterEach(cleanup);
beforeEach(() => { state.userId = "owner"; state.navigate.mockReset(); });
it("shows a success message after saving and opens the details on request", () => {
  render(<EditPlaygroundPage />);
  fireEvent.click(screen.getByText("Simulate saved response"));
  expect(screen.getByRole("status")).toHaveTextContent("Your playground has been updated.");
  fireEvent.click(screen.getByRole("button", { name: "View details" }));
  expect(state.navigate).toHaveBeenCalledWith({ to: "/playgrounds/$playgroundId", params: { playgroundId: "park" } });
});
it("requires sign-in before rendering the editor", () => {
  state.userId = null;
  render(<EditPlaygroundPage />);
  expect(screen.getByText("Sign in to edit")).toBeInTheDocument();
  expect(screen.queryByText("Simulate saved response")).not.toBeInTheDocument();
});
it("does not render the editor for another user's listing", () => {
  state.userId = "another-owner";
  render(<EditPlaygroundPage />);
  expect(screen.getByText("This listing is read-only")).toBeInTheDocument();
  expect(screen.queryByText("Simulate saved response")).not.toBeInTheDocument();
});
