import { useSyncExternalStore } from "react";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeToHoverCapability(onStoreChange: () => void) {
  const query = window.matchMedia(HOVER_QUERY);
  query.addEventListener("change", onStoreChange);

  return () => query.removeEventListener("change", onStoreChange);
}

function getHoverCapability() {
  return window.matchMedia(HOVER_QUERY).matches;
}

function getServerHoverCapability() {
  return false;
}

export function useHoverCapable() {
  return useSyncExternalStore(
    subscribeToHoverCapability,
    getHoverCapability,
    getServerHoverCapability,
  );
}
