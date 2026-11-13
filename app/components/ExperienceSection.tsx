import { EditorialText, SectionLabel } from "./EditorialText";
import { useEditorialMotion } from "../hooks/useEditorialMotion";

const ITEMS = [
  {
    period: "Jun — Jul 2026",
    title: "Software Engineer Intern",
    place: "PT. Microdata Indonesia",
    body: "I built a PKL participant management information system from scratch as a full-stack developer. The system was used internally by the company and built with a fully TypeScript stack: Vite, React, Express, PostgreSQL, and MinIO.",
  },
  {
    period: "Feb — Apr 2022",
    title: "IT Support Intern",
    place: "Darmajaya Institute of Informatics and Business",
    body: "I handled hardware and software troubleshooting while supporting administrative work. It was an early introduction to how everyday systems fail, how people report problems, and how technical work often begins with listening carefully.",
  },
];

export function ExperienceSection() {
  const ref = useEditorialMotion();
  return (
    <section id="experience" ref={ref} className="section-shell experience" aria-labelledby="experience-title">
      <SectionLabel id="experience-title">Experience</SectionLabel>
      <ol className="entry-list" data-focus-group>
        {ITEMS.map((item) => (
          <li key={item.title} data-focus-item>
            <article data-focus-content>
              <p className="experience__period section-meta" data-reveal-simple>{item.period}</p>
              <h3 className="entry-title"><EditorialText text={item.title} /></h3>
              <p className="experience__place"><EditorialText text={item.place} /></p>
              <p className="experience__description section-copy"><EditorialText text={item.body} /></p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
