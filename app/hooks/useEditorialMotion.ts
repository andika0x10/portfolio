import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { attachReadingFocus } from "../lib/readingFocus";
import { attachProximity, motionSystem, revealWordsWithTrail } from "../lib/motionSystem";

export function useEditorialMotion<T extends HTMLElement = HTMLElement>(immediate = false) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const reveals = new Map<HTMLElement, gsap.core.Animation>();
        const opening = immediate ? gsap.timeline() : null;

        root.querySelectorAll<HTMLElement>("[data-reveal-words], [data-reveal-simple]").forEach((block, index) => {
          const trigger = immediate
            ? undefined
            : {
                trigger: block,
                start: "clamp(top 87%)",
                // Keep triggers until cleanup: restored scroll positions can complete
                // earlier reveals while later triggers are still being initialized.
                toggleActions: "play none none none",
              };
          let animation: gsap.core.Animation;
          if (block.hasAttribute("data-reveal-words")) {
            const words = block.querySelectorAll<HTMLElement>(".editorial-word");
            const clips = block.querySelectorAll<HTMLElement>(".editorial-clip");
            gsap.set(clips, { overflow: "hidden" });
            animation = revealWordsWithTrail(words, clips, trigger);
          } else {
            animation = gsap.fromTo(block, motionSystem.label.from, {
              ...motionSystem.label.to,
              scrollTrigger: trigger,
            });
          }
          reveals.set(block, animation);
          opening?.add(animation, index * 0.12);
        });

        // Keyboard navigation must not wait for a link's scroll reveal.
        const showFocusedContent = (event: FocusEvent) => {
          if (!(event.target instanceof HTMLElement)) return;
          const target = event.target;
          reveals.forEach((animation, block) => {
            if (target.contains(block) || block.contains(target)) animation.totalProgress(1);
          });
        };
        root.addEventListener("focusin", showFocusedContent);

        const pointerMedia = gsap.matchMedia();
        pointerMedia.add("(hover: hover) and (pointer: fine)", () => {
          const detachProximity = attachProximity(root, ".editorial-proximity");
          const removeGroups = Array.from(root.querySelectorAll<HTMLElement>("[data-focus-group]")).map(attachReadingFocus);
          return () => {
            detachProximity();
            removeGroups.forEach((remove) => remove());
          };
        });

        let mounted = true;
        void document.fonts.ready.then(() => {
          if (mounted) ScrollTrigger.refresh();
        });
        return () => {
          mounted = false;
          root.removeEventListener("focusin", showFocusedContent);
          pointerMedia.revert();
        };
      },
      root
    );
    return () => media.revert();
  }, [immediate]);
  return ref;
}
