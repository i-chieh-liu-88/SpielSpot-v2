import AccessibleOutlined from "@mui/icons-material/AccessibleOutlined";
import ChildCareOutlined from "@mui/icons-material/ChildCareOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import MapOutlined from "@mui/icons-material/MapOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import { features } from "../../../data/homeContent";
import type { Feature } from "../../../types/content";
import { SectionHeading } from "../../atoms/SectionHeading/SectionHeading";
import { useLanguage } from "../../../providers/LanguageProvider";

const featureIcons: Record<Feature["icon"], typeof LocationOnOutlined> = {
  location: LocationOnOutlined,
  filters: TuneOutlined,
  map: MapOutlined,
  safety: ShieldOutlined,
  age: ChildCareOutlined,
  accessibility: AccessibleOutlined,
};

export function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section
      id="features"
      className="grass-bg relative scroll-mt-24 overflow-hidden px-6 py-24"
      aria-labelledby="features-heading"
    >
      <div className="dot-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          id="features-heading"
          title={t("Everything parents need")}
          tone="grass"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = featureIcons[feature.icon];

            return (
              <article
                className="card-hover rounded-3xl border border-gray-100 bg-white p-7 shadow-sm"
                key={feature.title}
              >
                <span
                  className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl text-2xl ${feature.tone}`}
                  aria-hidden="true"
                >
                  <Icon fontSize="inherit" />
                </span>
                <h3 className="mb-2 text-lg font-extrabold text-gray-800">
                  {t(feature.title)}
                </h3>
                <p className="text-sm font-semibold leading-relaxed text-gray-400">
                  {t(feature.description)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
