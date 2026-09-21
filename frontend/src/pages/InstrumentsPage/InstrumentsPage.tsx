import MusicNoteOutlined from "@mui/icons-material/MusicNoteOutlined";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Button from "../../components/atoms/Button";
import { LoadingSpinner } from "../../components/atoms/LoadingSpinner";
import { getInstruments, type Instrument } from "../../services/instruments";

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

  return "Unable to load instruments.";
}

export function InstrumentsPage() {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    let isActive = true;

    async function loadInstruments() {
      try {
        const data = await getInstruments();
        if (isActive) setInstruments(data);
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadInstruments();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="grass-bg relative min-h-screen overflow-hidden px-6 py-16">
      <div className="dot-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-4xl">
        <Button
          type="button"
          className="mb-8"
          onClick={() => navigate({ to: "/" })}
        >
          Back to SpielSpot
        </Button>
        <header className="mb-10 text-center">
          <MusicNoteOutlined
            className="mb-3 text-5xl text-grass"
            aria-hidden="true"
          />
          <h1 className="display text-5xl font-black text-gray-800 md:text-6xl">
            Instruments
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-gray-600">
            Sample instruments for the frontend preview.
          </p>
        </header>

        {isLoading && (
          <LoadingSpinner
            className="rounded-3xl bg-white/45 p-8"
            label="Loading instruments…"
            size="xl"
          />
        )}

        {errorMessage && (
          <div
            className="rounded-3xl border border-red-200 bg-red-50/90 p-6 text-red-700"
            role="alert"
          >
            <h2 className="font-black">Could not load instruments</h2>
            <p className="mt-2 text-sm">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && instruments.length === 0 && (
          <p
            className="rounded-3xl bg-white/45 p-8 text-center font-bold text-gray-600"
            role="status"
          >
            No instruments found.
          </p>
        )}

        {!isLoading && !errorMessage && instruments.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2" aria-label="Instruments">
            {instruments.map((instrument) => (
              <li
                className="flex items-center gap-3 rounded-3xl border border-white/60 bg-white/45 p-5 font-black text-gray-800 shadow-lg backdrop-blur-xl"
                key={instrument.id}
              >
                <MusicNoteOutlined className="text-grass" aria-hidden="true" />
                {instrument.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
