import { useRef, useCallback, useEffect } from "react";

const CLEAN_HEX_CHARS = "0123456789ABCDEF_";

interface UseScrambleHoverOptions {
  duration?: number;
  chars?: string;
}

export function useScrambleHover<T extends HTMLElement>(originalText?: string, options: UseScrambleHoverOptions = {}) {
  const ref = useRef<T>(null);
  const frame = useRef<number | null>(null);
  const restingText = useRef<string | null>(null);
  const duration = Math.max(0, options.duration ?? 0.28) * 1000;
  const chars = options.chars || CLEAN_HEX_CHARS;

  const cancel = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (ref.current && restingText.current !== null) ref.current.textContent = restingText.current;
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce), (hover: none)");
    window.addEventListener("blur", cancel);
    window.addEventListener("pagehide", cancel);
    document.addEventListener("visibilitychange", cancel);
    media.addEventListener("change", cancel);
    return () => {
      window.removeEventListener("blur", cancel);
      window.removeEventListener("pagehide", cancel);
      document.removeEventListener("visibilitychange", cancel);
      media.removeEventListener("change", cancel);
      cancel();
    };
  }, [cancel]);

  const trigger = useCallback(
    (customText?: string) => {
      cancel();
      const element = ref.current;
      if (!element) return;
      const target = customText ?? originalText ?? restingText.current ?? element.textContent ?? "";
      restingText.current = target;
      if (!target || !duration || window.matchMedia("(prefers-reduced-motion: reduce), (hover: none)").matches) {
        element.textContent = target;
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const resolved = Math.floor(progress * target.length);
        element.textContent = Array.from(target, (character, index) =>
          /\s/.test(character) || index < resolved ? character : chars[Math.floor(Math.random() * chars.length)]
        ).join("");
        if (progress < 1) {
          frame.current = requestAnimationFrame(tick);
        } else {
          element.textContent = target;
          frame.current = null;
        }
      };
      frame.current = requestAnimationFrame(tick);
    },
    [cancel, originalText, duration, chars]
  );

  return { ref, trigger, onMouseEnter: () => trigger(), onMouseLeave: cancel };
}
