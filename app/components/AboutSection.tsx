import { useScrambleHover } from "../hooks/useScrambleHover";
import { useEditorialMotion } from "../hooks/useEditorialMotion";

const PARAGRAPHS = [
  {
    text: "I'm a computer science student at the Sumatera Institute of Technology, based in Bandar Lampung.",
    highlights: ["Sumatera", "Institute", "of", "Technology,"],
    size: "clamp(20px, 2.4vw, 34px)",
    weight: 500,
    muted: false,
  },
  {
    text: "I first touched code at thirteen — HTML and CSS, a blinking cursor, a browser tab open with the quiet wonder that something I typed could appear on a screen.",
    highlights: ["HTML", "and", "CSS,"],
    size: "clamp(17px, 1.9vw, 26px)",
    weight: 400,
    muted: false,
  },
  {
    text: "That feeling has shifted shape. Today I'm more drawn to the theory underneath: algorithms, formal systems, the mathematics that computation rests on. I have a slow obsession with cybersecurity — not just breaking things, but understanding systems at a depth that makes their seams visible.",
    highlights: ["algorithms,", "formal", "systems,", "cybersecurity"],
    size: "clamp(17px, 1.9vw, 26px)",
    weight: 400,
    muted: false,
  },
  {
    text: "I'm still writing code. I'll probably keep going.",
    highlights: [],
    size: "clamp(16px, 1.7vw, 24px)",
    weight: 400,
    muted: true,
  },
];

function WordSplit({ text, highlights = [] }: { text: string; highlights?: string[] }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => {
        const highlighted = highlights.includes(word);
        return (
          <span key={index} className="word-clip-container motion-word-clip editorial-clip">
            <span className="word-inner motion-word editorial-word">
              <span
                className={`motion-proximity-word editorial-proximity ${highlighted ? "keyword-chip" : ""}`}
                data-cursor-hover={highlighted ? "true" : undefined}
                style={{
                  fontWeight: highlighted ? 600 : undefined,
                  color: highlighted ? "var(--ink)" : undefined,
                  borderBottom: highlighted ? "1.5px dashed rgba(10, 10, 10, 0.4)" : undefined,
                  paddingBottom: highlighted ? "1px" : undefined,
                }}
              >
                {word}
                {index < words.length - 1 ? "\u00A0" : ""}
              </span>
            </span>
          </span>
        );
      })}
    </>
  );
}

export function AboutSection() {
  const sectionRef = useEditorialMotion();
  const { ref: labelRef, onMouseEnter: onLabelHover, onMouseLeave: onLabelLeave } = useScrambleHover<HTMLHeadingElement>("About");

  return (
    <section id="about" ref={sectionRef} className="section-shell" aria-labelledby="about-title">
      <h2
        id="about-title"
        ref={labelRef}
        onMouseEnter={onLabelHover}
        onMouseLeave={onLabelLeave}
        data-reveal-simple
        style={{
          display: "inline-block",
          cursor: "default",
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "clamp(1.5rem, 3vw, 3rem)",
        }}
      >
        About
      </h2>
      <div data-velocity-skew data-focus-group>
        {PARAGRAPHS.map((paragraph, index) => (
          <div
            key={index}
            data-focus-item
            style={{
              marginBottom: index === PARAGRAPHS.length - 1 ? 0 : "clamp(1.5rem, 2.5vw, 2.5rem)",
            }}
          >
            <p
              data-focus-content
              style={{
                fontSize: paragraph.size,
                fontWeight: paragraph.weight,
                lineHeight: 1.62,
                color: paragraph.muted ? "var(--muted)" : "var(--ink)",
              }}
            >
              <span data-reveal-words>
                <WordSplit text={paragraph.text} highlights={paragraph.highlights} />
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
