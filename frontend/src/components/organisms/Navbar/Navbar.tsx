import { Button as HeroButton, ButtonGroup } from "@heroui/react";
import { Languages, MapPin, Menu, Moon, Plus, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ActionSwapIcon } from "../../atoms/ActionSwapIcon";
import { Brand } from "../../atoms/Brand/Brand";
import Button from "../../atoms/Button";
import { useThemeToggle } from "../../atoms/ThemeToggle/ThemeToggle";
import {
  CenterMorphModal,
  CenterMorphModalClose,
  CenterMorphModalContent,
  CenterMorphModalTrigger,
} from "../../atoms/CenterMorphModal";
import { AuthControls } from "../../molecules/AuthControls/AuthControls";
import { useLanguage } from "../../../providers/LanguageProvider";

export function Navbar() {
  const navigate = useNavigate();
  const { language, t, toggleLanguage } = useLanguage();
  const {
    isDark,
    mounted: isThemeMounted,
    toggle: toggleTheme,
  } = useThemeToggle({
    variant: "circle-blur",
    start: "bottom-up",
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { hash: "features", label: t("Features") },
    { hash: "how", label: t("How It Works") },
    { hash: "playgrounds", label: t("Playgrounds") },
    { hash: "reviews", label: t("Reviews") },
  ] as const;

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 80rem)");
    const closeDesktopMenu = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsMenuOpen(false);
      }
    };

    desktopQuery.addEventListener("change", closeDesktopMenu);
    return () => desktopQuery.removeEventListener("change", closeDesktopMenu);
  }, []);

  return (
    <nav
      className="nav-glass fixed inset-x-0 top-0 z-[9999] flex w-full items-center justify-between px-6 py-4"
      aria-label={t("Primary navigation")}
    >
      <div className="animate-fadeUp flex items-center gap-2">
        <Brand />
      </div>
      <ul className="animate-fadeUp hidden items-center gap-6 text-sm font-medium text-black xl:flex xl:gap-8">
        {links.map((link) => (
          <li key={link.hash}>
            <Link
              aria-label={link.label}
              className="nav-link-swap"
              to="/"
              hash={link.hash}
              hashScrollIntoView={{ behavior: "smooth", block: "start" }}
            >
              <span className="nav-link-swap-track">
                <span className="nav-link-swap-text">{link.label}</span>
                <span
                  className="nav-link-swap-text nav-link-swap-text-accent"
                  aria-hidden="true"
                >
                  {link.label}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <ButtonGroup
          className="animate-fadeUp hidden xl:flex"
          size="sm"
          variant="outline"
          aria-label={t("Navbar actions")}
        >
          <HeroButton
            isIconOnly
            aria-label={t(
              isDark ? "Switch to light mode" : "Switch to dark mode",
            )}
            onPress={toggleTheme}
          >
            {isThemeMounted ? (
              <ActionSwapIcon
                value={isDark ? "dark" : "light"}
                className="h-4 w-4"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </ActionSwapIcon>
            ) : (
              <span className="h-4 w-4" aria-hidden="true" />
            )}
          </HeroButton>
          <HeroButton
            aria-label={t(
              `Switch language to ${language === "en" ? "German" : "English"}`,
            )}
            onPress={toggleLanguage}
          >
            <ButtonGroup.Separator />
            <Languages className="h-4 w-4" aria-hidden="true" />
            <span aria-hidden="true">{language === "en" ? "DE" : "EN"}</span>
          </HeroButton>
          <HeroButton onPress={() => navigate({ to: "/playgrounds" })}>
            <ButtonGroup.Separator />
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {t("Find a Playground")}
          </HeroButton>
          <HeroButton onPress={() => navigate({ to: "/playgrounds/new" })}>
            <ButtonGroup.Separator />
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("Add a Playground")}
          </HeroButton>
        </ButtonGroup>
        <ButtonGroup
          className="animate-fadeUp hidden md:flex xl:hidden"
          size="sm"
          variant="outline"
          aria-label={t("Display settings")}
        >
          <HeroButton
            isIconOnly
            aria-label={t(
              isDark ? "Switch to light mode" : "Switch to dark mode",
            )}
            onPress={toggleTheme}
          >
            {isThemeMounted ? (
              <ActionSwapIcon
                value={isDark ? "dark" : "light"}
                className="h-4 w-4"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </ActionSwapIcon>
            ) : (
              <span className="h-4 w-4" aria-hidden="true" />
            )}
          </HeroButton>
          <HeroButton
            aria-label={t(
              `Switch language to ${language === "en" ? "German" : "English"}`,
            )}
            onPress={toggleLanguage}
          >
            <ButtonGroup.Separator />
            <Languages className="h-4 w-4" aria-hidden="true" />
            <span aria-hidden="true">{language === "en" ? "DE" : "EN"}</span>
          </HeroButton>
        </ButtonGroup>
        <AuthControls className="hidden xl:flex" />
        <CenterMorphModal open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <CenterMorphModalTrigger>
            <Button
              id="mobile-menu-button"
              className="gap-2 xl:!hidden"
              size="sm"
              type="button"
              aria-label={t("Open navigation menu")}
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
              {t("Menu")}
            </Button>
          </CenterMorphModalTrigger>
          <CenterMorphModalContent
            ariaLabel={t("Mobile navigation")}
            closeButtonLabel={t("Close navigation menu")}
            className="bg-white"
          >
            <div className="mobile-nav-header border-b border-green-100 bg-green-50/70 px-6 pb-5 pt-6">
              <Brand />
              <p className="mobile-nav-description mt-3 pr-12 text-sm font-medium text-gray-500">
                {t("Find your next favourite playground.")}
              </p>
            </div>
            <div className="p-3">
              <nav aria-label={t("Mobile navigation links")}>
                <ul className="space-y-1">
                  {links.map((link) => (
                    <li key={link.hash}>
                      <CenterMorphModalClose>
                        <Link
                          className="flex min-h-12 items-center rounded-2xl px-4 text-base font-bold text-gray-800 transition-colors hover:bg-green-50 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                          to="/"
                          hash={link.hash}
                          hashScrollIntoView={{
                            behavior: "smooth",
                            block: "start",
                          }}
                        >
                          {link.label}
                        </Link>
                      </CenterMorphModalClose>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-3 grid gap-2 border-t border-green-100 pt-3">
                <CenterMorphModalClose>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center text-sm"
                    onClick={() => navigate({ to: "/playgrounds" })}
                  >
                    {t("Find a Playground")}
                  </Button>
                </CenterMorphModalClose>
                <CenterMorphModalClose>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center text-sm"
                    onClick={() => navigate({ to: "/playgrounds/new" })}
                  >
                    {t("Add a Playground")}
                  </Button>
                </CenterMorphModalClose>
                <AuthControls className="mt-1 flex justify-center" />
              </div>
            </div>
          </CenterMorphModalContent>
        </CenterMorphModal>
      </div>
    </nav>
  );
}
