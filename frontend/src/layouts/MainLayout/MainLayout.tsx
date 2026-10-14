import { useLanguage } from "../../providers/LanguageProvider";
import { Outlet } from "@tanstack/react-router";
import { Footer } from "../../components/organisms/Footer/Footer";
import { Navbar } from "../../components/organisms/Navbar/Navbar";

export function MainLayout() {
  const { t } = useLanguage();
  return (
    <>
      <Navbar />
      <main>
        <p
          className="bg-amber-100 px-6 py-3 text-center text-sm font-semibold text-amber-950"
          role="status"
        >
          {t("Photos are preview only and will not be uploaded.")}
        </p>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
