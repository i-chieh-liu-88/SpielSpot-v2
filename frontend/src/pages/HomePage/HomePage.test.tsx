import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../App";
import { router } from "../../router";

vi.mock("../../config/clerk", () => ({
  clerkPublishableKey: undefined,
  isClerkConfigured: false,
}));

vi.mock("../../hooks/usePlaygrounds", async () => {
  const { playgrounds } = await vi.importActual<
    typeof import("../../data/homeContent")
  >("../../data/homeContent");

  return {
    usePlaygrounds: () => ({
      playgrounds,
      isLoading: false,
    }),
  };
});

describe("SpielSpot home page", () => {
  afterEach(cleanup);

  beforeEach(async () => {
    await router.navigate({ to: "/" });
    localStorage.clear();
    document.documentElement.className = "light";
    document.documentElement.dataset.theme = "light";
  });

  it("renders the main sections and navigation", async () => {
    render(<App />);
    const headline = await screen.findByRole(
      "heading",
      { level: 1 },
      { timeout: 30000 },
    );
    expect(headline).toHaveTextContent(/find the.*super spiel.*spot.*nearby/i);
    expect(
      screen.getByRole("heading", { name: /everything parents need/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Popular playgrounds" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Log In" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Sign Up" })).toHaveLength(1);
    expect(document.querySelector(".animate-floatY")).toBeInTheDocument();
  });

  it("restores the interactive headline letter effect", async () => {
    render(<App />);
    await screen.findByRole("heading", { level: 1 });
    const letter = document.querySelector<HTMLElement>(".shake-letter");
    expect(letter).not.toBeNull();
    expect(
      document.querySelectorAll('.hero-letter[class*="hero-letter--"]').length,
    ).toBeGreaterThan(5);
    expect(letter).toHaveAttribute("data-shake-color", "#FF595E");
    expect(letter?.style.getPropertyValue("--shake-color")).toBe("#FF595E");
  });

  it("prepares the hero title for the SplitText entrance animation", async () => {
    render(<App />);
    const headline = await screen.findByRole("heading", { level: 1 });

    expect(headline).toHaveClass("split-parent");
    expect(headline.querySelectorAll("br")).toHaveLength(2);
    expect(headline).toHaveClass("w-full", "leading-[0.95]");
  });

  it("toggles and persists the theme from the Navbar button", async () => {
    render(<App />);
    await screen.findByRole("heading", { level: 1 });
    const navbarActions = screen.getByRole("group", {
      name: "Navbar actions",
    });
    fireEvent.click(
      within(navbarActions).getByRole("button", {
        name: /switch to dark mode/i,
      }),
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("spielspot-theme")).toBe("dark");
  });

  it("opens the mobile navigation", async () => {
    render(<App />);
    await screen.findByRole("heading", { level: 1 });
    const toggle = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const mobileNavigation = screen.getByRole("dialog", {
      name: "Mobile navigation",
    });
    expect(screen.getAllByRole("link", { name: "Features" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Playgrounds" })).toHaveLength(
      2,
    );
    expect(
      within(mobileNavigation).getByRole("button", {
        name: "Find a Playground",
      }),
    ).toHaveClass("beui-button-outline");
    expect(
      within(mobileNavigation).getByRole("button", {
        name: "Add a Playground",
      }),
    ).toHaveClass("beui-button-outline");
  });

  it("links home-page navigation to absolute section URLs", async () => {
    render(<App />);
    await screen.findByRole("heading", { level: 1 });

    expect(
      screen.getAllByRole("link", { name: "Features" })[0],
    ).toHaveAttribute("href", "/#features");
    expect(
      screen.getAllByRole("link", { name: "How It Works" })[0],
    ).toHaveAttribute("href", "/#how");
    expect(
      screen.getAllByRole("link", { name: "Playgrounds" })[0],
    ).toHaveAttribute("href", "/#playgrounds");
    expect(screen.getAllByRole("link", { name: "Reviews" })[0]).toHaveAttribute(
      "href",
      "/#reviews",
    );
  });

  it("opens the playgrounds page from the review CTA", async () => {
    render(<App />);
    await screen.findByRole("heading", { level: 1 });

    fireEvent.click(
      screen.getByRole("button", { name: "Share your playground review" }),
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/playgrounds");
    });
  });

  it("uses the shared button component for the map CTA", async () => {
    render(<App />);
    await screen.findByRole("heading", { level: 1 });

    const cta = screen.getByRole("button", { name: "View All Playgrounds" });
    expect(cta).toHaveClass("beui-button", "beui-button-primary");
    expect(
      screen.queryByRole("link", { name: "View All Playgrounds" }),
    ).not.toBeInTheDocument();
  });

  it("replaces the hero search controls with a playground CTA", async () => {
    render(<App />);
    await screen.findByRole("heading", { level: 1 });

    expect(
      screen.getByRole("button", { name: "Go to playgrounds" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("searchbox", {
        name: "City, postcode, or neighbourhood",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Search benefits" }),
    ).not.toBeInTheDocument();
  });

  it("shows ten linked playground cards in a beUI marquee", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "Popular playgrounds" });

    const popularPlaygrounds = screen.getByRole("region", {
      name: "Popular playgrounds",
    });
    expect(within(popularPlaygrounds).getAllByRole("article")).toHaveLength(10);
    expect(
      within(popularPlaygrounds).getAllByRole("link", {
        name: /View details for/i,
      }),
    ).toHaveLength(10);
    expect(
      within(popularPlaygrounds).queryByRole("button", {
        name: /popular playground/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      popularPlaygrounds.querySelectorAll(".animate-marquee"),
    ).toHaveLength(2);
  });
});
