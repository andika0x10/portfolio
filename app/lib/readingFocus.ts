import gsap from "gsap";

/** Keep pointer and keyboard focus separate; neither may survive a lost interaction. */
export function attachReadingFocus(group: HTMLElement) {
  const items = Array.from(group.querySelectorAll<HTMLElement>("[data-focus-item]")).filter((item) => item.closest("[data-focus-group]") === group);
  const controls = items.map((item) => {
    const content = item.querySelector<HTMLElement>(":scope > [data-focus-content]");
    const opacity = Number.parseFloat(getComputedStyle(item).opacity) || 1;
    return {
      item,
      baseOpacity: opacity,
      opacity: gsap.quickTo(item, "opacity", { duration: 0.26, ease: "power2.out" }),
      // The hit area stays still while only its contents move.
      x: content ? gsap.quickTo(content, "x", { duration: 0.26, ease: "power2.out" }) : null,
    };
  });
  let hovered: HTMLElement | null = null;
  let focused: HTMLElement | null = null;
  let active: HTMLElement | null = null;
  let pointer: { x: number; y: number } | null = null;
  let scrollTimer = 0;

  const findItem = (target: EventTarget | null) => {
    const item = target instanceof Element ? target.closest<HTMLElement>("[data-focus-item]") : null;
    return item && items.includes(item) ? item : null;
  };
  const keyboardItem = () => {
    const element = document.activeElement;
    return element?.matches(":focus-visible") ? findItem(element) : null;
  };
  const update = (next: HTMLElement | null, immediate = false) => {
    if (next === active && !immediate) return;
    active = next;
    controls.forEach((control) => {
      const selected = control.item === next;
      control.opacity(control.baseOpacity * (!next || selected ? 1 : 0.34));
      control.x?.(selected ? 8 : 0);
      if (immediate) {
        control.opacity.tween.progress(1);
        control.x?.tween.progress(1);
      }
    });
  };
  const onOver = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    pointer = { x: event.clientX, y: event.clientY };
    hovered = findItem(event.target);
    update(focused ?? hovered);
  };
  const onLeave = () => {
    pointer = null;
    hovered = null;
    update(focused);
  };
  const onFocus = () => {
    focused = keyboardItem();
    update(focused ?? hovered);
  };
  const onFocusOut = (event: FocusEvent) => {
    focused = event.relatedTarget instanceof Element && event.relatedTarget.matches(":focus-visible") ? findItem(event.relatedTarget) : null;
    update(focused ?? hovered);
  };
  const reset = () => {
    window.clearTimeout(scrollTimer);
    pointer = null;
    hovered = focused = null;
    update(null, true);
  };
  const onScroll = () => {
    window.clearTimeout(scrollTimer);
    hovered = null;
    focused = document.hasFocus() ? keyboardItem() : null;
    if (active !== focused) update(focused, true);
    // Scrolling can move a new row under a stationary cursor without a
    // pointerover event. Resolve its current target once scrolling settles.
    if (pointer)
      scrollTimer = window.setTimeout(() => {
        if (!pointer || !document.hasFocus()) return;
        hovered = findItem(document.elementFromPoint(pointer.x, pointer.y));
        update(focused ?? hovered);
      }, 140);
  };
  const onWindowOut = (event: MouseEvent) => {
    if (!event.relatedTarget) reset();
  };

  group.addEventListener("pointerover", onOver);
  group.addEventListener("pointermove", onOver);
  group.addEventListener("pointerleave", onLeave);
  group.addEventListener("pointercancel", reset);
  group.addEventListener("focusin", onFocus);
  group.addEventListener("focusout", onFocusOut);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", reset);
  window.addEventListener("blur", reset);
  window.addEventListener("pagehide", reset);
  window.addEventListener("pageshow", reset);
  document.addEventListener("visibilitychange", reset);
  document.addEventListener("mouseout", onWindowOut);

  return () => {
    group.removeEventListener("pointerover", onOver);
    group.removeEventListener("pointermove", onOver);
    group.removeEventListener("pointerleave", onLeave);
    group.removeEventListener("pointercancel", reset);
    group.removeEventListener("focusin", onFocus);
    group.removeEventListener("focusout", onFocusOut);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", reset);
    window.removeEventListener("blur", reset);
    window.removeEventListener("pagehide", reset);
    window.removeEventListener("pageshow", reset);
    document.removeEventListener("visibilitychange", reset);
    document.removeEventListener("mouseout", onWindowOut);
    reset();
  };
}
