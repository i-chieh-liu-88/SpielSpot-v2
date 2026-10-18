import { useState } from "react";
import { useLanguage } from "../../../providers/LanguageProvider";
import "./PlaygroundGallery.css";

export function PlaygroundGallery({ images, name }: { images: string[]; name: string }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const index = Math.min(selected, images.length - 1);
  if (!images.length) return null;
  return <section className="spot-gallery" aria-label={t("Playground photos")}>
    <div className="spot-gallery-main">
      {failed.includes(images[index]) ? <p role="status">{t("Photo unavailable")}</p> :
        <img src={images[index]} alt={t("{name}, photo {number}", { name, number: index + 1 })}
          onError={() => setFailed((current) => [...current, images[index]])} />}
    </div>
    {images.length > 1 && <>
      <p className="spot-gallery-count" aria-live="polite">{t("Photo {number} of {total}", { number: index + 1, total: images.length })}</p>
      <div className="spot-gallery-thumbnails" role="group" aria-label={t("Choose a photo")}>
        {images.map((url, i) => <button key={`${url}-${i}`} type="button" aria-pressed={i === index}
          aria-label={t("Show photo {number}", { number: i + 1 })} onClick={() => setSelected(i)}>
          <img src={url} alt="" loading="lazy" />
        </button>)}
      </div>
    </>}
  </section>;
}
