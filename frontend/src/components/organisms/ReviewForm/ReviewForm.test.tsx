import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createReview } from "../../../services/reviews";
import { ReviewForm } from "./ReviewForm";

vi.mock("../../../services/reviews", () => ({
  createReview: vi.fn(),
}));

async function completeReviewForm() {
  fireEvent.change(screen.getByLabelText("Playground name"), {
    target: { value: "Riverside Play Park" },
  });
  fireEvent.change(screen.getByLabelText("City or neighbourhood"), {
    target: { value: "Dresden" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Best suited age/ }));
  fireEvent.click(await screen.findByRole("option", { name: "Juniors (4–8)" }));
  fireEvent.click(screen.getByRole("button", { name: /Safety rating/ }));
  fireEvent.click(await screen.findByRole("option", { name: "5 — Excellent" }));
  fireEvent.click(screen.getByLabelText("Shade"));
  fireEvent.click(
    screen.getByRole("button", { name: /Overall parent rating/ }),
  );
  fireEvent.click(await screen.findByRole("option", { name: "5 stars" }));
  fireEvent.click(screen.getByLabelText("Yes"));
  fireEvent.change(
    screen.getByLabelText("Tell other parents about your visit"),
    {
      target: {
        value: "Clean, safe, shaded, and ideal for an afternoon visit.",
      },
    },
  );
}

describe("ReviewForm", () => {
  it("blocks submission in preview mode, including direct form submission", () => {
    const onSubmitted = vi.fn();
    render(<ReviewForm previewOnly onSubmitted={onSubmitted} />);
    expect(screen.getByRole("button", { name: "Submit review" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("will not be saved");
    fireEvent.submit(screen.getByRole("form", { name: "Playground review" }));
    expect(createReview).not.toHaveBeenCalled();
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows accessible Zod errors for an invalid review", () => {
    render(<ReviewForm />);

    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please fix the highlighted fields",
    );
    expect(screen.getByText("Enter a playground name")).toBeInTheDocument();
    expect(
      screen.getByText("Select at least one available facility"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Review must contain at least 20 characters"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Playground name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(createReview).not.toHaveBeenCalled();
  });

  it("submits a complete playground review", async () => {
    vi.mocked(createReview).mockResolvedValue();
    const onSubmitted = vi.fn();
    render(<ReviewForm onSubmitted={onSubmitted} />);

    await completeReviewForm();
    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    const submittedReview = expect.objectContaining({
      playgroundName: "Riverside Play Park",
      overallRating: "5",
      recommendation: "Yes",
    });
    expect(createReview).toHaveBeenCalledWith(submittedReview);
    await vi.waitFor(() => {
      expect(onSubmitted).toHaveBeenCalledWith(submittedReview);
    });
  });

  it("does not redirect when the service rejects the review", async () => {
    const onSubmitted = vi.fn();
    vi.mocked(createReview).mockRejectedValue({
      message: "Insert blocked by review policy",
    });
    render(<ReviewForm onSubmitted={onSubmitted} />);

    await completeReviewForm();
    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Insert blocked by review policy",
    );
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it("keeps the form visible when the service rejects the review", async () => {
    vi.mocked(createReview).mockRejectedValue({
      message: "Insert blocked by review policy",
    });
    render(<ReviewForm />);

    await completeReviewForm();
    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Insert blocked by review policy",
    );
    expect(screen.getByLabelText("Playground name")).toHaveValue(
      "Riverside Play Park",
    );
  });
});

