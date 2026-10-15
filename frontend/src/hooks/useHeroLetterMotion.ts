import { useEffect } from "react";

// Delegate from the stable heading: GSAP may recreate the individual letters.
export function useHeroLetterMotion(language: string) {
  useEffect(() => {
    const heading = document.getElementById("shake-headline");
    if (!heading) return;
    const animations = new Map<HTMLElement, Animation>();

    function bounceLetter(event: PointerEvent) {
      if (
        event.pointerType === "touch" ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) return;
      const outer = event.target instanceof Element
        ? event.target.closest(".hero-letter") : null;
      if (!outer || (event.relatedTarget instanceof Node && outer.contains(event.relatedTarget))) return;
      const letter = outer.querySelector<HTMLElement>(".shake-letter");
      if (!letter?.animate) return;

      const currentTransform = getComputedStyle(letter).transform;
      animations.get(letter)?.cancel();
      const frames: Keyframe[] = [{ transform: currentTransform }];
      for (let step = 0; step < 12; step++) {
        const strength = Math.exp(-step / 3);
        const x = (Math.random() * 2 - 1) * 9 * strength;
        const y = (Math.random() * 2 - 1) * 9 * strength;
        const rotation = (Math.random() * 2 - 1) * 4 * strength;
        frames.push({
          transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
          easing: "ease-in-out",
        });
      }
      frames.push({ transform: "translate(0, 0) rotate(0deg)" });
      const animation = letter.animate(frames, { duration: 1100, easing: "linear" });
      animations.set(letter, animation);
      animation.onfinish = () => {
        if (animations.get(letter) === animation) animations.delete(letter);
      };
    }

    heading.addEventListener("pointerover", bounceLetter);
    return () => {
      heading.removeEventListener("pointerover", bounceLetter);
      animations.forEach((animation) => animation.cancel());
    };
  }, [language]);
}
