import gsap from "gsap";

const nativeEases = new Map<string, string>();

function getNativeEase(name: string) {
  const cached = nativeEases.get(name);
  if (cached) return cached;
  const ease = gsap.parseEase(name);
  const value = CSS.supports("animation-timing-function", "linear(0, 1)")
    ? `linear(${Array.from({ length: 61 }, (_, index) => ease(index / 60).toFixed(6)).join(",")})`
    : name === "sine.inOut"
      ? "cubic-bezier(0.37, 0, 0.63, 1)"
      : "cubic-bezier(0.165, 0.84, 0.44, 1)";
  nativeEases.set(name, value);
  return value;
}

export const motionSystem = {
  trigger: {
    labelStart: "top 90%",
    blockStart: "top 82%",
    paragraphStart: "top 87%",
  },
  label: {
    from: { y: 12, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
  },
  meta: {
    from: { y: 14, opacity: 0 },
    to: { y: 0, opacity: 1, stagger: 0.04, duration: 0.45, ease: "power2.out" },
  },
  title: {
    from: { y: 34, opacity: 0, letterSpacing: "-0.09em" },
    to: { y: 0, opacity: 1, letterSpacing: "-0.06em", duration: 0.7, ease: "power4.out" },
  },
  paragraph: {
    from: { yPercent: 115 },
    // Avoid allocating a separate 3D layer for every word and its highlight.
    to: { yPercent: 0, stagger: { each: 0.018, from: "start" }, duration: 0.5, ease: "power3.out", force3D: false },
  },
  trail: {
    from: { opacity: 0 },
    to: {
      opacity: 0.72,
      stagger: { each: 0.016, from: "start" },
      duration: 0.12,
      ease: "sine.inOut",
    },
  },
  divider: {
    from: { scaleX: 0 },
    to: { scaleX: 1, duration: 0.72, ease: "power2.inOut", transformOrigin: "left center" },
  },
  listItem: {
    from: { y: 24, opacity: 0 },
    to: { y: 0, opacity: 1, stagger: { each: 0.08, from: "start" }, duration: 0.55, ease: "power3.out" },
  },
  link: {
    from: { y: 10, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.36, ease: "power2.out" },
  },
  hoverFocus: {
    active: { opacity: 1, x: 8, duration: 0.26, ease: "power2.out", overwrite: "auto" },
    inactive: { opacity: 0.34, x: 0, duration: 0.26, ease: "power2.out", overwrite: "auto" },
    reset: { opacity: 1, x: 0, duration: 0.34, ease: "power2.out", overwrite: "auto" },
  },
} as const;

export function revealList(targets: gsap.TweenTarget, trigger: gsap.DOMTarget, start: string = motionSystem.trigger.blockStart) {
  return gsap.fromTo(targets, motionSystem.listItem.from, {
    ...motionSystem.listItem.to,
    scrollTrigger: { trigger, start, toggleActions: "play none none none" },
  });
}

export function revealLabel(target: gsap.TweenTarget, trigger: gsap.DOMTarget) {
  return gsap.fromTo(target, motionSystem.label.from, {
    ...motionSystem.label.to,
    scrollTrigger: { trigger, start: motionSystem.trigger.labelStart, toggleActions: "play none none none" },
  });
}

export function drawDivider(target: gsap.TweenTarget) {
  return gsap.fromTo(target, motionSystem.divider.from, motionSystem.divider.to);
}

export function revealMeta(targets: gsap.TweenTarget) {
  return gsap.fromTo(targets, motionSystem.meta.from, motionSystem.meta.to);
}

export function revealTitle(target: gsap.TweenTarget) {
  return gsap.fromTo(target, motionSystem.title.from, motionSystem.title.to);
}

export function revealWordsWithTrail(words: gsap.TweenTarget, clips?: NodeListOf<HTMLElement> | HTMLElement[], scrollTrigger?: gsap.TweenVars["scrollTrigger"]) {
  const wordElements = gsap.utils.toArray<HTMLElement>(words);
  const trails = wordElements.flatMap((word) => Array.from(word.querySelectorAll<HTMLElement>(".editorial-trail")));
  const clipStyles = Array.from(clips ?? [], (clip) => ({ clip, overflow: clip.style.overflow }));
  const wordStyles = wordElements.map((word) => ({ word, transform: word.style.transform }));
  const nativeWords: Animation[] = [];
  const nativeTrails: Animation[] = [];
  const cancelTrails = () => {
    nativeTrails.forEach((animation) => animation.cancel());
    nativeTrails.length = 0;
  };
  const finishWords = () => {
    wordStyles.forEach(({ word, transform }) => (word.style.transform = transform));
    nativeWords.forEach((animation) => animation.cancel());
    nativeWords.length = 0;
  };

  clipStyles.forEach(({ clip }) => (clip.style.overflow = "hidden"));
  // These batched style writes also need restoring when motion is interrupted.
  gsap.context(() => () => {
    cancelTrails();
    finishWords();
    clipStyles.forEach(({ clip, overflow }) => (clip.style.overflow = overflow));
  });
  const timeline = gsap.timeline({ scrollTrigger });
  if (wordElements.length && typeof wordElements[0].animate === "function") {
    wordElements.forEach((word) => (word.style.transform = "translateY(115%)"));
    const { duration, stagger, ease } = motionSystem.paragraph.to;
    const nativeEase = getNativeEase(ease);
    timeline.to(
      {},
      {
        duration: duration + (wordElements.length - 1) * stagger.each,
        onStart: () => {
          wordElements.forEach((word, index) => {
            nativeWords.push(
              word.animate([{ transform: "translateY(115%)" }, { transform: "translateY(0%)" }], {
                duration: duration * 1000,
                delay: index * stagger.each * 1000,
                easing: nativeEase,
                fill: "forwards",
              })
            );
          });
        },
        onComplete: () => {
          finishWords();
          clips?.forEach((clip) => (clip.style.overflow = "visible"));
        },
      },
      0
    );
  } else {
    // Keep a functional reveal on browsers without Element.animate().
    wordElements.forEach((word) => gsap.getProperty(word, "y"));
    timeline.fromTo(
      words,
      motionSystem.paragraph.from,
      {
        ...motionSystem.paragraph.to,
        onComplete: () => clips?.forEach((clip) => (clip.style.overflow = "visible")),
      },
      0
    );
  }
  if (trails.length && typeof trails[0].animate === "function") {
    const stagger = motionSystem.trail.to.stagger.each;
    const rise = motionSystem.trail.to.duration;
    const riseEnd = 0.1 + rise + (trails.length - 1) * stagger;
    const duration = riseEnd + 0.18;
    const ease = getNativeEase(motionSystem.trail.to.ease);
    // A lightweight GSAP clock keeps focus completion in the GSAP sequence,
    // while the browser runs each opacity animation without per-frame JS writes.
    timeline.to(
      {},
      {
        duration: riseEnd + 0.28 + (trails.length - 1) * stagger,
        onStart: () => {
          trails.forEach((trail, index) => {
            nativeTrails.push(
              trail.animate(
                [
                  { opacity: 0, offset: 0, easing: ease },
                  { opacity: 0.72, offset: rise / duration },
                  { opacity: 0.72, offset: (duration - 0.2) / duration, easing: ease },
                  { opacity: 0, offset: 1 },
                ],
                { duration: duration * 1000, delay: (0.1 + index * stagger) * 1000 }
              )
            );
          });
        },
        onComplete: cancelTrails,
      },
      0
    );
  } else {
    timeline.fromTo(trails, motionSystem.trail.from, motionSystem.trail.to, 0.1);
    timeline.to(
      trails,
      {
        ...motionSystem.trail.from,
        stagger: { each: 0.016, from: "start" },
        duration: 0.2,
        ease: "sine.inOut",
      },
      ">0.08"
    );
  }
  return timeline;
}

export function revealLink(target: gsap.TweenTarget) {
  return gsap.fromTo(target, motionSystem.link.from, motionSystem.link.to);
}

export function revealEditorialBlock({
  trigger,
  line,
  meta,
  title,
  words,
  clips,
  link,
}: {
  trigger: gsap.DOMTarget;
  line?: gsap.TweenTarget | null;
  meta?: gsap.TweenTarget | null;
  title?: gsap.TweenTarget | null;
  words?: gsap.TweenTarget | null;
  clips?: NodeListOf<HTMLElement> | HTMLElement[];
  link?: gsap.TweenTarget | null;
}) {
  const tl = gsap.timeline({
    scrollTrigger: { trigger, start: motionSystem.trigger.blockStart, toggleActions: "play none none none" },
  });

  if (line) tl.add(drawDivider(line));
  if (meta) tl.add(revealMeta(meta), "-=0.42");
  if (title) tl.add(revealTitle(title), "-=0.22");
  if (words) tl.add(revealWordsWithTrail(words, clips), "-=0.25");
  if (link) tl.add(revealLink(link), "-=0.18");

  return tl;
}

export function applyHoverFocus(elements: NodeListOf<HTMLElement> | HTMLElement[], activeIndex: number) {
  elements.forEach((el, index) => {
    gsap.to(el, index === activeIndex ? motionSystem.hoverFocus.active : motionSystem.hoverFocus.inactive);
  });
}

export function resetHoverFocus(elements: NodeListOf<HTMLElement> | HTMLElement[]) {
  elements.forEach((el) => gsap.to(el, motionSystem.hoverFocus.reset));
}

export function attachProximity(container: HTMLElement, selector = ".editorial-proximity") {
  const words = Array.from(container.querySelectorAll<HTMLElement>(selector));
  let frame = 0;
  const changed = new Set<HTMLElement>();

  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    changed.forEach((word) => word.style.removeProperty("transform"));
    changed.clear();
  };
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      // Measure the stable reveal layer, not the word that we are moving.
      const positions = words.map((word) => {
        const clip = word.closest<HTMLElement>(".editorial-clip");
        const rect = word.parentElement!.getBoundingClientRect();
        const distance =
          clip?.style.overflow === "hidden" || word.closest(".editorial-pending") || rect.bottom < 0 || rect.top > window.innerHeight
            ? Infinity
            : Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2));
        return { word, distance };
      });
      positions.forEach(({ word, distance }) => {
        if (distance < 145) {
          const strength = Math.pow(1 - distance / 145, 1.7);
          // Optical expansion without changing line breaks or hover hit areas.
          word.style.transform = `translateY(${(-strength * 4.5).toFixed(2)}px) scaleX(${(1 + strength * 0.035).toFixed(4)})`;
          changed.add(word);
        } else if (changed.delete(word)) {
          word.style.removeProperty("transform");
        }
      });
    });
  };
  const onWindowOut = (event: MouseEvent) => {
    if (!event.relatedTarget) reset();
  };

  container.addEventListener("pointermove", onMove);
  container.addEventListener("pointerleave", reset);
  container.addEventListener("pointercancel", reset);
  window.addEventListener("scroll", reset, { passive: true });
  window.addEventListener("resize", reset);
  window.addEventListener("blur", reset);
  window.addEventListener("pagehide", reset);
  document.addEventListener("visibilitychange", reset);
  document.addEventListener("mouseout", onWindowOut);
  return () => {
    container.removeEventListener("pointermove", onMove);
    container.removeEventListener("pointerleave", reset);
    container.removeEventListener("pointercancel", reset);
    window.removeEventListener("scroll", reset);
    window.removeEventListener("resize", reset);
    window.removeEventListener("blur", reset);
    window.removeEventListener("pagehide", reset);
    document.removeEventListener("visibilitychange", reset);
    document.removeEventListener("mouseout", onWindowOut);
    reset();
  };
}
