import type { CSSProperties } from "react";

const shakeColors = [
  "#FF595E",
  "#FFCA3A",
  "#8AC926",
  "#1982C4",
  "#6A4C93",
  "#FF924C",
];
const letterStances = [
  "",
  "",
  "hero-letter--tilt-left",
  "",
  "",
  "hero-letter--tilt-right",
  "",
  "hero-letter--lifted",
  "",
  "",
  "hero-letter--lean-left",
  "",
  "hero-letter--lean-right",
  "",
  "",
  "hero-letter--lowered",
] as const;

type InteractiveLetterProps = {
  character: string;
  color: string;
  stance: string;
};

function InteractiveLetter({
  character,
  color,
  stance,
}: InteractiveLetterProps) {
  const style = { "--shake-color": color } as CSSProperties;

  return (
    <span className={`hero-letter ${stance}`}>
      <span className="shake-letter" data-shake-color={color} style={style}>
        {character}
      </span>
    </span>
  );
}

type InteractiveTextProps = {
  text: string;
  colorOffset?: number;
};

export function InteractiveText({
  text,
  colorOffset = 0,
}: InteractiveTextProps) {
  let letterIndex = colorOffset;

  return text.split("").map((character, index) => {
    if (/\s/.test(character)) return character;
    const color = shakeColors[letterIndex % shakeColors.length];
    const stance = letterStances[letterIndex++ % letterStances.length];
    return (
      <InteractiveLetter
        character={character}
        color={color}
        stance={stance}
        key={`${character}-${index}`}
      />
    );
  });
}
