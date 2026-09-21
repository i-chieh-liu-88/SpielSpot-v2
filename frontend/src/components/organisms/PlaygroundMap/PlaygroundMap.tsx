import AttractionsOutlined from "@mui/icons-material/AttractionsOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import {
  divIcon,
  type LatLngBounds,
  type LatLngBoundsExpression,
  type Map as LeafletMap,
} from "leaflet";
import { memo, useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { Playground } from "../../../types/content";
import type { MapLocation } from "../../../types/map";
import { LoadingSpinner } from "../../atoms/LoadingSpinner";
import { useLanguage } from "../../../providers/LanguageProvider";
import "./PlaygroundMap.css";

type PlaygroundMapProps = {
  playgrounds: Playground[];
  onSelect: (playgroundId: string) => void;
  focusLocation?: MapLocation;
  onAreaChange?: (area: PlaygroundMapArea) => void;
};

export type PlaygroundMapArea = {
  playgroundIds: string[];
  zoom: number;
};

const playgroundIcon = divIcon({
  className: "playground-marker",
  html: renderToStaticMarkup(<AttractionsOutlined aria-hidden="true" />),
  iconAnchor: [23, 46],
  iconSize: [46, 46],
});

const focusLocationIcon = divIcon({
  className: "map-focus-marker",
  html: renderToStaticMarkup(<LocationOnOutlined aria-hidden="true" />),
  iconAnchor: [22, 44],
  iconSize: [44, 44],
});

const CLUSTER_SIZE_PX = 72;
const VIEWPORT_PADDING = 0.2;

type Viewport = {
  bounds: LatLngBounds;
  zoom: number;
};

type PlaygroundCluster = {
  id: string;
  coordinates: [number, number];
  playgrounds: Playground[];
};

function getViewport(map: LeafletMap): Viewport {
  return {
    bounds: map.getBounds().pad(VIEWPORT_PADDING),
    zoom: map.getZoom(),
  };
}

function getPlaygroundMapArea(
  map: LeafletMap,
  playgrounds: Playground[],
): PlaygroundMapArea {
  const bounds = map.getBounds();
  const center = map.getCenter();
  const playgroundIds = playgrounds
    .filter((playground) => bounds.contains(playground.coordinates))
    .sort((first, second) => {
      const firstDistance =
        (first.coordinates[0] - center.lat) ** 2 +
        (first.coordinates[1] - center.lng) ** 2;
      const secondDistance =
        (second.coordinates[0] - center.lat) ** 2 +
        (second.coordinates[1] - center.lng) ** 2;
      return firstDistance - secondDistance;
    })
    .map((playground) => playground.id);

  return { playgroundIds, zoom: map.getZoom() };
}

function clusterVisiblePlaygrounds(
  map: LeafletMap,
  playgrounds: Playground[],
  viewport: Viewport,
) {
  const buckets = new Map<string, Playground[]>();

  playgrounds.forEach((playground) => {
    if (!viewport.bounds.contains(playground.coordinates)) return;

    const point = map.project(playground.coordinates, viewport.zoom);
    const key = `${Math.floor(point.x / CLUSTER_SIZE_PX)}:${Math.floor(point.y / CLUSTER_SIZE_PX)}`;
    const bucket = buckets.get(key);

    if (bucket) bucket.push(playground);
    else buckets.set(key, [playground]);
  });

  return Array.from(buckets.entries(), ([key, clusteredPlaygrounds]) => {
    const latitude =
      clusteredPlaygrounds.reduce(
        (total, playground) => total + playground.coordinates[0],
        0,
      ) / clusteredPlaygrounds.length;
    const longitude =
      clusteredPlaygrounds.reduce(
        (total, playground) => total + playground.coordinates[1],
        0,
      ) / clusteredPlaygrounds.length;

    return {
      id: key,
      coordinates: [latitude, longitude],
      playgrounds: clusteredPlaygrounds,
    } satisfies PlaygroundCluster;
  });
}

function getClusterIcon(count: number, label: string) {
  return divIcon({
    className: "playground-cluster-marker",
    html: `<span aria-label="${label}">${count}</span>`,
    iconAnchor: [24, 24],
    iconSize: [48, 48],
  });
}

function ViewportMarkers({
  playgrounds,
  onSelect,
  onAreaChange,
}: PlaygroundMapProps) {
  const map = useMap();
  const { t } = useLanguage();
  const [viewport, setViewport] = useState<Viewport>(() => getViewport(map));
  useMapEvents({
    moveend: (event) => {
      setViewport(getViewport(event.target));
      onAreaChange?.(getPlaygroundMapArea(event.target, playgrounds));
    },
    zoomend: (event) => {
      setViewport(getViewport(event.target));
      onAreaChange?.(getPlaygroundMapArea(event.target, playgrounds));
    },
  });

  useEffect(() => {
    onAreaChange?.(getPlaygroundMapArea(map, playgrounds));
  }, [map, onAreaChange, playgrounds]);

  const clusters = useMemo(
    () =>
      clusterVisiblePlaygrounds(map, playgrounds, viewport),
    [map, playgrounds, viewport],
  );

  return clusters.map((cluster) => {
    if (cluster.playgrounds.length === 1) {
      const playground = cluster.playgrounds[0];

      return (
        <Marker
          key={playground.id}
          position={playground.coordinates}
          icon={playgroundIcon}
          title={t("Open {name}", { name: playground.name })}
          alt={t("{name} playground pin", { name: playground.name })}
          eventHandlers={{ click: () => onSelect(playground.id) }}
        />
      );
    }

    return (
      <Marker
        key={cluster.id}
        position={cluster.coordinates}
        icon={getClusterIcon(
          cluster.playgrounds.length,
          t("{count} playgrounds", { count: cluster.playgrounds.length }),
        )}
        title={t("Zoom to {count} playgrounds", {
          count: cluster.playgrounds.length,
        })}
        alt={t("{count} playgrounds grouped together", {
          count: cluster.playgrounds.length,
        })}
        eventHandlers={{
          click: () =>
            map.flyTo(
              cluster.coordinates,
              Math.min(map.getZoom() + 2, map.getMaxZoom()),
            ),
        }}
      />
    );
  });
}

function MapFocusMarker({ location }: { location?: MapLocation }) {
  const map = useMap();

  useEffect(() => {
    if (location) map.flyTo(location.coordinates, 15);
  }, [location, map]);

  if (!location) return null;

  return (
    <Marker
      position={location.coordinates}
      icon={focusLocationIcon}
      title={location.label}
      alt={`${location.label} map location`}
      zIndexOffset={1000}
    />
  );
}

function PlaygroundMapComponent({
  playgrounds,
  onSelect,
  focusLocation,
  onAreaChange,
}: PlaygroundMapProps) {
  const { t } = useLanguage();
  const bounds = useMemo<LatLngBoundsExpression>(
    () => playgrounds.map((playground) => playground.coordinates),
    [playgrounds],
  );

  return (
    <div
      className="playground-map-shell"
      aria-label={t("Map with {count} playgrounds", {
        count: playgrounds.length,
      })}
    >
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
        scrollWheelZoom
        className="playground-map"
        placeholder={
          <LoadingSpinner
            className="p-6"
            label={t("Loading playground map…")}
          />
        }
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportMarkers
          playgrounds={playgrounds}
          onSelect={onSelect}
          onAreaChange={onAreaChange}
        />
        <MapFocusMarker location={focusLocation} />
      </MapContainer>
    </div>
  );
}

export const PlaygroundMap = memo(PlaygroundMapComponent);
