import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { attachReadingFocus } from "../lib/readingFocus";
import { attachProximity, motionSystem, revealWordsWithTrail } from "../lib/motionSystem";

// Every section waits for the same font load; refresh the page only once per frame.
const fontRefreshRequests = new Set<symbol>();
let fontRefreshFrame = 0;

function refreshAfterFonts() {
  const request = Symbol();
  fontRefreshRequests.add(request);
  void document.fonts.ready.then(() => {
    if (!fontRefreshRequests.has(request) || fontRefreshFrame) return;
    fontRefreshFrame = requestAnimationFrame(() => {
      fontRefreshFrame = 0;
      if (!fontRefreshRequests.size) return;
      fontRefreshRequests.clear();
      ScrollTrigger.refresh();
    });
  });
  return () => {
    fontRefreshRequests.delete(request);
    if (!fontRefreshRequests.size && fontRefreshFrame) {
      cancelAnimationFrame(fontRefreshFrame);
      fontRefreshFrame = 0;
    }
  };
}

export function useEditorialMotion<T extends HTMLElement = HTMLElement>(immediate = false) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      (context) => {
        let mounted = true;
        // Read positions before hiding anything, so restored scroll positions can
        // leave earlier content visible without constructing its word timelines.
        const reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-words], [data-reveal-simple]"), (block) => ({
          block,
          completed: block.getBoundingClientRect().bottom < 0,
          started: false,
          animation: null as gsap.core.Animation | null,
        }));
        const opening = immediate ? gsap.timeline() : null;

        reveals.forEach(({ block, completed }) => {
          if (!completed) block.classList.add("editorial-pending");
        });

        const prepareReveal = (reveal: (typeof reveals)[number]) => {
          if (!mounted || reveal.completed || reveal.animation) return;
          const { block } = reveal;
          // Deferred callbacks must record their tweens in the owning GSAP context.
          context.add(() => {
            block.classList.remove("editorial-pending");
            if (block.hasAttribute("data-reveal-words")) {
              const words = block.querySelectorAll<HTMLElement>(".editorial-word");
              const clips = block.querySelectorAll<HTMLElement>(".editorial-clip");
              reveal.animation = revealWordsWithTrail(words, clips).pause(0);
            } else {
              reveal.animation = gsap.fromTo(block, motionSystem.label.from, {
                ...motionSystem.label.to,
                paused: true,
              });
            }
          });
        };

        const playReveal = (reveal: (typeof reveals)[number]) => {
          if (!mounted || reveal.completed || reveal.started) return;
          prepareReveal(reveal);
          reveal.started = true;
          reveal.animation?.play();
        };

        const upcoming = new Set<(typeof reveals)[number]>();
        let idleTask = 0;
        let fallbackTask = 0;
        const prepareNext = () => {
          idleTask = fallbackTask = 0;
          if (!mounted) return;
          const next = upcoming.values().next().value;
          if (next) {
            upcoming.delete(next);
            prepareReveal(next);
          }
          if (upcoming.size) schedulePreparation();
        };
        const schedulePreparation = () => {
          if (!mounted || idleTask || fallbackTask) return;
          if (typeof window.requestIdleCallback === "function") idleTask = window.requestIdleCallback(prepareNext, { timeout: 250 });
          else fallbackTask = window.setTimeout(prepareNext, 32);
        };
        const byBlock = new Map(reveals.map((reveal) => [reveal.block, reveal]));
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(({ target, isIntersecting }) => {
              const reveal = byBlock.get(target as HTMLElement);
              if (!reveal || !isIntersecting) return;
              observer.unobserve(target);
              if (!reveal.completed && !reveal.animation) upcoming.add(reveal);
            });
            if (upcoming.size) schedulePreparation();
          },
          { rootMargin: "300px 0px" }
        );

        reveals.forEach((reveal, index) => {
          if (reveal.completed) return;
          if (opening) {
            prepareReveal(reveal);
            reveal.started = true;
            if (reveal.animation) opening.add(reveal.animation, index * 0.12);
            reveal.animation?.paused(false);
            return;
          }
          observer.observe(reveal.block);
          ScrollTrigger.create({
            trigger: reveal.block,
            start: "clamp(top 87%)",
            onEnter: () => playReveal(reveal),
            onEnterBack: () => playReveal(reveal),
            // Covers anchor navigation and scroll restoration during initialization.
            onRefresh: (trigger) => {
              if (trigger.scroll() >= trigger.start) playReveal(reveal);
            },
          });
        });

        // Keyboard navigation must not wait for a link's scroll reveal.
        const showFocusedContent = (event: FocusEvent) => {
          if (!(event.target instanceof HTMLElement)) return;
          const target = event.target;
          reveals.forEach((reveal) => {
            if (target.contains(reveal.block) || reveal.block.contains(target)) {
              playReveal(reveal);
              reveal.animation?.totalProgress(1);
            }
          });
        };
        root.addEventListener("focusin", showFocusedContent);

        const cancelFontRefresh = refreshAfterFonts();
        return () => {
          mounted = false;
          observer.disconnect();
          if (idleTask) window.cancelIdleCallback(idleTask);
          if (fallbackTask) window.clearTimeout(fallbackTask);
          upcoming.clear();
          cancelFontRefresh();
          root.removeEventListener("focusin", showFocusedContent);
          reveals.forEach(({ block }) => block.classList.remove("editorial-pending"));
        };
      },
      root
    );
    media.add(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const detachProximity = attachProximity(root, ".editorial-proximity");
        const removeGroups = Array.from(root.querySelectorAll<HTMLElement>("[data-focus-group]")).map(attachReadingFocus);
        return () => {
          detachProximity();
          removeGroups.forEach((remove) => remove());
        };
      },
      root
    );
    return () => media.revert();
  }, [immediate]);
  return ref;
}
