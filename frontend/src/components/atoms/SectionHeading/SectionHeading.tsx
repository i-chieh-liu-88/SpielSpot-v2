import type { ReactNode } from "react";

type SectionHeadingProps = {
  title: string;
  description?: ReactNode;
  id: string;
};

export function SectionHeading({
  title,
  description,
  id,
}: SectionHeadingProps) {
  return (
    <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
      <h2
        id={id}
        className="spot-section-title display text-4xl font-semibold leading-tight tracking-tight text-balance text-gray-800 sm:text-5xl lg:text-6xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-pretty text-gray-600 sm:text-lg">
          {description}
        </p>
      )}
    </header>
  );
}
