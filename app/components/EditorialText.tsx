import { useScrambleHover } from "../hooks/useScrambleHover";

// Separate reveal and proximity layers so pointer motion never overrides a reveal.
export function EditorialText({ text }: { text: string }) {
  const words = text.split(/\s+/);
  return (
    <span className="editorial-text" data-reveal-words>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span className="editorial-clip" key={index}>
            <span className="editorial-word">
              <span className="editorial-proximity">
                {word}
                {index < words.length - 1 ? "\u00a0" : ""}
              </span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}

export function SectionLabel({ children, id }: { children: string; id?: string }) {
  const { ref, onMouseEnter, onMouseLeave } = useScrambleHover<HTMLHeadingElement>(children);
  return (
    <h2 ref={ref} id={id} className="section-label" data-reveal-simple onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </h2>
  );
}
