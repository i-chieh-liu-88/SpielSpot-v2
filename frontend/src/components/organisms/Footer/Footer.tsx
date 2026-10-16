import { Brand } from "../../atoms/Brand/Brand";
import { Link } from "@tanstack/react-router";
import { useLanguage } from "../../../providers/LanguageProvider";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 px-6 py-12 text-center" aria-label={t("Footer")}>
      <div className="mb-4 flex justify-center">
        <Brand compact />
      </div>
      <p className="mb-6 text-sm font-semibold text-gray-500">
        {t("Making every neighbourhood a playground-friendly place.")}
      </p>
      <nav
        className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-400"
        aria-label={t("Footer navigation")}
      >
        <Link className="transition-colors hover:text-white" to="/playgrounds">
          {t("Find a Playground")}
        </Link>
        <a
          className="transition-colors hover:text-white"
          href="https://github.com/i-chieh-liu-88/SpielSpot-v2"
        >
          {t("Project on GitHub")}
        </a>
        <Link
          className="transition-colors hover:text-white"
          to="/playgrounds/new"
        >
          {t("Add a Playground")}
        </Link>
      </nav>
      <p className="mt-8 text-xs text-gray-600">
        {t("© 2026 SpielSpot. All rights reserved.")}
      </p>
    </footer>
  );
}
