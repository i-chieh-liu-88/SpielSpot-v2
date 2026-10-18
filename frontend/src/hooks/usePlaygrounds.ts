import { useEffect, useState } from "react";
import { getPlayground, getPlaygrounds } from "../services/playgrounds";
import type { Playground } from "../types/content";
import type { PlaygroundFilters } from "../services/playgrounds";

type PlaygroundCollectionState = {
  playgrounds: Playground[];
  isLoading: boolean;
  error?: string;
};

type PlaygroundState = {
  playground: Playground | null;
  isLoading: boolean;
  error?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "Too many requests, please try again later.") {
      return "Too many requests. Please wait for the request limit to reset (up to 15 minutes). Applying or resetting filters will not clear this limit.";
    }
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Unable to load playground data.";
}

export function usePlaygrounds(
  filters: PlaygroundFilters = {},
  refreshKey = 0,
): PlaygroundCollectionState {
  const location = filters.location?.trim() ?? "";
  const ageRange = filters.ageRange ?? "";
  const tags = filters.tags?.join(",") ?? "";
  const requestKey = JSON.stringify([location, ageRange, tags, refreshKey]);
  const [state, setState] = useState<
    PlaygroundCollectionState & { requestKey: string }
  >({
    playgrounds: [],
    isLoading: true,
    requestKey: "",
  });

  useEffect(() => {
    let isActive = true;

    getPlaygrounds({
      location,
      ageRange,
      tags: tags ? tags.split(",") : [],
    })
      .then((playgrounds) => {
        //成功回應
        if (isActive) setState({ playgrounds, isLoading: false, requestKey });
      })
      .catch((error: unknown) => {
        //失敗回應
        if (isActive) {
          setState({
            playgrounds: [],
            isLoading: false,
            error: getErrorMessage(error),
            requestKey,
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [location, ageRange, tags, requestKey]);

  return {
    playgrounds: state.requestKey === requestKey ? state.playgrounds : [],
    isLoading: state.requestKey !== requestKey || state.isLoading,
    error: state.requestKey === requestKey ? state.error : undefined,
  };
}

/* -------------------------- 先讓儲存成功後更新評論並顯示成功訊息 -------------------------- */
export function usePlayground(
  playgroundId?: string,
  refreshKey = 0,
): PlaygroundState {
  const [state, setState] = useState<PlaygroundState>({
    playground: null,
    isLoading: true,
  });
  useEffect(() => {
    let isActive = true;

    if (!playgroundId) {
      return () => {
        isActive = false;
      };
    }

    getPlayground(playgroundId)
      .then((playground) => {
        if (isActive) setState({ playground, isLoading: false });
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({
            playground: null,
            isLoading: false,
            error: getErrorMessage(error),
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [playgroundId, refreshKey]);

  return playgroundId
    ? state
    : { playground: null, isLoading: false, error: undefined };
}
