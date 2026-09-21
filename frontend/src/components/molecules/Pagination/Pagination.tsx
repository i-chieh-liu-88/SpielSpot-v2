import { memo } from "react";
import Button from "../../atoms/Button";
import type { PaginationProps } from "./Pagination.types";
import { useLanguage } from "../../../providers/LanguageProvider";

type PaginationItem = number | "ellipsis";

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const visiblePages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  if (currentPage <= 4) {
    [2, 3, 4, 5].forEach((page) => visiblePages.add(page));
  }

  if (currentPage >= totalPages - 3) {
    [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach(
      (page) => visiblePages.add(page),
    );
  }

  const pages = Array.from(visiblePages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((first, second) => first - second);

  return pages.flatMap((page, index) => {
    const previousPage = pages[index - 1];
    return previousPage !== undefined && page - previousPage > 1
      ? ["ellipsis" as const, page]
      : [page];
  });
}

function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label={t("Playground results pages")}>
      <Button
        type="button"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {t("Previous")}
      </Button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            className="min-w-6 text-center font-bold text-gray-500"
            aria-hidden="true"
            key={`ellipsis-${index}`}
          >
            …
          </span>
        ) : (
          <Button
            type="button"
            className="min-w-10 text-sm"
            size="sm"
            aria-label={t("Page {number}", { number: item })}
            aria-current={item === currentPage ? "page" : undefined}
            key={item}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        type="button"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {t("Next")}
      </Button>
    </nav>
  );
}

export const Pagination = memo(PaginationComponent);
