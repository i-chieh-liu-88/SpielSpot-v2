import { useEffect, useState } from "react";
import { getPlayground, getPlaygrounds } from "../services/playgrounds";
import type { Playground } from "../types/content";

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
  if (error instanceof Error) return error.message;

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

export function usePlaygrounds(): PlaygroundCollectionState {
  const [state, setState] = useState<PlaygroundCollectionState>({
    playgrounds: [],
    isLoading: true,
  });

  useEffect(() => {
    let isActive = true;

    getPlaygrounds()
      .then((playgrounds) => {
        if (isActive) setState({ playgrounds, isLoading: false });
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({
            playgrounds: [],
            isLoading: false,
            error: getErrorMessage(error),
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}

export function usePlayground(playgroundId?: string): PlaygroundState {
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
  }, [playgroundId]);

  return playgroundId
    ? state
    : { playground: null, isLoading: false, error: undefined };
}
