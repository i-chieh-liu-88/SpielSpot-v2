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
        aria-label={t("Legal")}
      >
        <a className="transition-colors hover:text-white" href="#top">
          {t("Privacy")}
        </a>
        <a className="transition-colors hover:text-white" href="#top">
          {t("Terms")}
        </a>
        <a
          className="transition-colors hover:text-white"
          href="mailto:hello@spielspot.example"
        >
          {t("Contact")}
        </a>
        <Link
          className="transition-colors hover:text-white"
          to="/playgrounds/new"
        >
          {t("Add a Playground")}
        </Link>
      </nav>
      <p className="mt-8 text-xs text-gray-600">
        {t("© 2026 PlaySpot. All rights reserved.")}
      </p>
    </footer>
  );
}
