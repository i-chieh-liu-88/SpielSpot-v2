import { useEffect } from "react";

// Delegate from the stable heading: GSAP may recreate the individual letters.
export function useHeroLetterMotion(language: string) {
  useEffect(() => {
    const heading = document.getElementById("shake-headline");
    if (!heading) return;
    const animations = new Map<HTMLElement, Animation>();
    let drag: { letter: HTMLElement; outer: HTMLElement; pointerId: number; x: number; y: number; dx: number; dy: number } | null = null;

    function startDrag(event: PointerEvent) {
      if (event.button !== 0 || event.pointerType !== "mouse" || drag ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const outer = event.target instanceof Element ? event.target.closest<HTMLElement>(".hero-letter") : null;
      const letter = outer?.querySelector<HTMLElement>(".shake-letter");
      if (!outer || !letter) return;
      event.preventDefault();
      animations.get(letter)?.cancel();
      animations.delete(letter);
      drag = { outer, letter, pointerId: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0 };
      outer.classList.add("hero-letter--dragging");
      letter.style.transform = "translate(0px, 0px)";
      heading?.setPointerCapture(event.pointerId);
    }

    function moveDrag(event: PointerEvent) {
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag.dx = event.clientX - drag.x;
      drag.dy = event.clientY - drag.y;
      drag.letter.style.transform = `translate(${drag.dx}px, ${drag.dy}px)`;
    }

    function finishDrag() {
      if (!drag) return;
      const { letter, outer, pointerId, dx, dy } = drag;
      drag = null;
      outer.classList.remove("hero-letter--dragging");
      letter.style.removeProperty("transform");
      if (heading?.hasPointerCapture(pointerId)) heading.releasePointerCapture(pointerId);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced && letter.animate) {
        const animation = letter.animate([
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: `translate(${-dx * 0.07}px, ${-dy * 0.07}px)`, offset: 0.7 },
          { transform: "translate(0px, 0px)" },
        ], { duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
        animations.set(letter, animation);
        animation.onfinish = () => {
          if (animations.get(letter) === animation) animations.delete(letter);
        };
      }
    }

    function bounceLetter(event: PointerEvent) {
      if (
        drag ||
        event.pointerType === "touch" ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) return;
      const outer = event.target instanceof Element
        ? event.target.closest(".hero-letter") : null;
      if (!outer || (event.relatedTarget instanceof Node && outer.contains(event.relatedTarget))) return;
      const letter = outer.querySelector<HTMLElement>(".shake-letter");
      if (!letter?.animate) return;
      // Pointer capture release can trigger hover again; let the return finish.
      if (animations.has(letter)) return;

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
    heading.addEventListener("pointerdown", startDrag);
    heading.addEventListener("lostpointercapture", finishDrag);
    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
    window.addEventListener("blur", finishDrag);
    return () => {
      finishDrag();
      heading.removeEventListener("pointerover", bounceLetter);
      heading.removeEventListener("pointerdown", startDrag);
      heading.removeEventListener("lostpointercapture", finishDrag);
      window.removeEventListener("pointermove", moveDrag);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
      window.removeEventListener("blur", finishDrag);
      animations.forEach((animation) => animation.cancel());
    };
  }, [language]);
}
