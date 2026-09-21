import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import { divIcon, type LeafletMouseEvent } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useLanguage } from "../../../providers/LanguageProvider";

type LocationPickerMapProps = {
  coordinates?: [number, number];
  onChange: (coordinates: [number, number]) => void;
};

const locationIcon = divIcon({
  className: "playground-marker",
  html: renderToStaticMarkup(<AddLocationAltOutlined aria-hidden="true" />),
  iconAnchor: [23, 46],
  iconSize: [46, 46],
});

function MapClickHandler({
  onChange,
}: Pick<LocationPickerMapProps, "onChange">) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onChange([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export function LocationPickerMap({
  coordinates,
  onChange,
}: LocationPickerMapProps) {
  const { t } = useLanguage();

  return (
    <div
      className="overflow-hidden rounded-3xl border border-white/60 shadow-lg"
      aria-label={t("Choose the playground position on the map")}
    >
      <MapContainer
        center={coordinates ?? [51.1657, 10.4515]}
        zoom={coordinates ? 14 : 6}
        scrollWheelZoom
        className="h-80 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onChange={onChange} />
        {coordinates && (
          <Marker
            position={coordinates}
            icon={locationIcon}
            title={t("Selected playground location")}
            alt={t("Selected playground pin")}
          />
        )}
      </MapContainer>
    </div>
  );
}
