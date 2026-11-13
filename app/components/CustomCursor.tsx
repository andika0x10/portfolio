import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Two-layer custom cursor:
 *   · A small solid dot that follows the mouse instantly
 *   · A larger ring that lags behind (lerp 0.1)
 *   · Concentric tactile shockwave wave ripple on click
 *
 * Only active on devices with a real pointer (hover: hover).
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const shockwaveContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const ring = ringRef.current;
      const dot = dotRef.current;
      const ripples = shockwaveContainerRef.current;
      if (!ring || !dot || !ripples) return;

      const setRingX = gsap.quickSetter(ring, "x", "px");
      const setRingY = gsap.quickSetter(ring, "y", "px");
      const setDotX = gsap.quickSetter(dot, "x", "px");
      const setDotY = gsap.quickSetter(dot, "y", "px");
      let mouseX = 0,
        mouseY = 0,
        ringX = 0,
        ringY = 0;
      let visible = false;
      let interactive = false;
      let shape: gsap.core.Tween | undefined;
      let scrollFrame = 0;
      const selector = "a, button, .keyword-chip, [data-cursor-hover]";

      const updateShape = () => {
        const next = !!document.elementFromPoint(mouseX, mouseY)?.closest(selector);
        if (next === interactive) return;
        interactive = next;
        shape?.kill();
        shape = gsap.to(ring, {
          scale: next ? 20 / 36 : 1,
          background: next ? "rgba(10,10,10,0.08)" : "transparent",
          borderColor: next ? "transparent" : "rgba(10,10,10,0.7)",
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
        });
      };
      const hide = () => {
        visible = false;
        interactive = false;
        shape?.kill();
        document.documentElement.removeAttribute("data-custom-cursor");
        gsap.set([ring, dot], { opacity: 0 });
        gsap.set(ring, { scale: 1, background: "transparent", borderColor: "rgba(10,10,10,0.7)" });
        cancelAnimationFrame(scrollFrame);
      };
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        mouseX = event.clientX;
        mouseY = event.clientY;
        if (!visible) {
          ringX = mouseX;
          ringY = mouseY;
          visible = true;
          gsap.set([ring, dot], { opacity: 1 });
          document.documentElement.setAttribute("data-custom-cursor", "");
        }
        setDotX(mouseX - 3);
        setDotY(mouseY - 3);
        updateShape();
      };
      const tick = () => {
        if (!visible) return;
        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;
        setRingX(ringX - 18);
        setRingY(ringY - 18);
      };
      const onScroll = () => {
        cancelAnimationFrame(scrollFrame);
        if (visible) scrollFrame = requestAnimationFrame(updateShape);
      };
      const onOut = (event: MouseEvent) => {
        if (!event.relatedTarget) hide();
      };
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Tab") hide();
      };
      const onDown = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        const ripple = document.createElement("div");
        Object.assign(ripple.style, {
          position: "fixed",
          left: `${event.clientX - 20}px`,
          top: `${event.clientY - 20}px`,
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "1px solid rgba(10,10,10,0.4)",
          pointerEvents: "none",
          zIndex: "9997",
        });
        ripples.appendChild(ripple);
        gsap.fromTo(
          ripple,
          { scale: 0.2, opacity: 0.6 },
          {
            scale: 2.2,
            opacity: 0,
            duration: 0.45,
            ease: "power2.out",
            onComplete: () => ripple.remove(),
          }
        );
      };

      gsap.ticker.add(tick);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("blur", hide);
      window.addEventListener("pagehide", hide);
      window.addEventListener("keydown", onKey);
      document.addEventListener("mouseout", onOut);
      document.addEventListener("visibilitychange", hide);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("blur", hide);
        window.removeEventListener("pagehide", hide);
        window.removeEventListener("keydown", onKey);
        document.removeEventListener("mouseout", onOut);
        document.removeEventListener("visibilitychange", hide);
        gsap.ticker.remove(tick);
        hide();
        gsap.killTweensOf([ring, dot, ...Array.from(ripples.children)]);
        ripples.replaceChildren();
      };
    });
    return () => media.revert();
  }, []);

  return (
    <>
      <div ref={shockwaveContainerRef} aria-hidden="true" />
      {/* Lagging ring */}
      <div
        ref={ringRef}
        data-cursor-ring
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          border: "1px solid rgba(10,10,10,0.7)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          opacity: 0,
          mixBlendMode: "multiply",
        }}
      />
      {/* Instant dot */}
      <div
        ref={dotRef}
        data-cursor-dot
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          background: "#0a0a0a",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0,
        }}
      />
    </>
  );
}
