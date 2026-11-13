import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SkewControl = {
  element: HTMLElement;
  setSkew: ReturnType<typeof gsap.quickSetter>;
  originalWillChange: string;
  skew: number;
};

/**
 * Initializes Lenis smooth scrolling synchronized directly with GSAP ScrollTrigger ticker.
 * Also monitors scroll velocity to apply subtle kinetic physics to elements with `data-velocity-skew`.
 */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({
        anchors: true,
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
      });

      // Synchronize Lenis scroll position with ScrollTrigger
      const removeScrollListener = lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.lagSmoothing(0);

      let prevVelocity = 0;
      const skewElements = Array.from(document.querySelectorAll<HTMLElement>("[data-velocity-skew]"));
      if (skewElements.length) gsap.set(skewElements, { skewY: 0, transformOrigin: "left center" });
      const controls = new Map<HTMLElement, SkewControl>(
        skewElements.map((element) => [
          element,
          {
            element,
            setSkew: gsap.quickSetter(element, "skewY", "deg"),
            originalWillChange: element.style.willChange,
            skew: 0,
          },
        ])
      );
      const visible = new Set<SkewControl>();
      const resetControl = (control: SkewControl) => {
        if (control.skew === 0) return;
        control.setSkew(0);
        control.skew = 0;
        control.element.style.willChange = control.originalWillChange;
      };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          const control = controls.get(target as HTMLElement);
          if (!control) return;
          if (isIntersecting) visible.add(control);
          else {
            visible.delete(control);
            resetControl(control);
          }
        });
      });
      skewElements.forEach((element) => observer.observe(element));

      // Lenis and skew share a ticker. No layout reads or tween allocations here.
      const tickerCallback = (time: number, deltaTime: number) => {
        if (document.hidden) return;
        lenis.raf(time * 1000);
        if (!visible.size) {
          prevVelocity = 0;
          return;
        }
        const currentVelocity = lenis.velocity || 0;
        if (Math.abs(currentVelocity) < 0.01 && Math.abs(prevVelocity) < 0.01) {
          prevVelocity = 0;
          visible.forEach(resetControl);
          return;
        }
        // Match the existing 60 Hz damping at any display refresh rate.
        const damping = 1 - Math.pow(0.85, Math.min(deltaTime, 64) / (1000 / 60));
        prevVelocity += (currentVelocity - prevVelocity) * damping;
        const skew = Math.max(-1.5, Math.min(1.5, prevVelocity * 0.04));
        visible.forEach((control) => {
          if (control.skew === skew) return;
          control.element.style.willChange = "transform";
          control.setSkew(skew);
          control.skew = skew;
        });
      };

      const reset = () => {
        prevVelocity = 0;
        controls.forEach(resetControl);
      };
      gsap.ticker.add(tickerCallback);
      document.addEventListener("visibilitychange", reset);
      window.addEventListener("pagehide", reset);

      return () => {
        gsap.ticker.remove(tickerCallback);
        observer.disconnect();
        document.removeEventListener("visibilitychange", reset);
        window.removeEventListener("pagehide", reset);
        removeScrollListener();
        reset();
        lenis.destroy();
      };
    });
    return () => media.revert();
  }, [enabled]);
}
