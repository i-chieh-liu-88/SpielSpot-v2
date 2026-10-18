import { useState } from "react";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
import { useLanguage } from "../../../providers/LanguageProvider";

// Keep a stable media area even when a saved cover is missing or cannot load.
export function PlaygroundThumbnail({ src }: { src: string }) {
  const { t } = useLanguage();
  const [failedSrc, setFailedSrc] = useState<string>();
  return (
    <div className="explore-thumbnail">
      {src && failedSrc !== src ? (
        <img src={src} alt="" loading="lazy" decoding="async" width={480} height={270} onError={() => setFailedSrc(src)} />
      ) : (
        <div className="explore-thumbnail-placeholder">
          <ImageOutlined aria-hidden="true" />
          <span>{t("Photo unavailable")}</span>
        </div>
      )}
    </div>
  );
}
