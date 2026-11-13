import { EditorialText, SectionLabel } from "./EditorialText";
import { useEditorialMotion } from "../hooks/useEditorialMotion";

const SKILLS = ["Python", "JavaScript / TypeScript", "Rust", "C / C++", "PyTorch", "JAX"];

export function SkillsSection() {
  const ref = useEditorialMotion();
  return (
    <section id="skills" ref={ref} className="section-shell skills" aria-labelledby="skills-title">
      <SectionLabel id="skills-title">Languages & Tools</SectionLabel>
      <ul className="skills__list" data-focus-group>
        {SKILLS.map((skill) => (
          <li key={skill} data-focus-item>
            <EditorialText text={skill} />
          </li>
        ))}
      </ul>
    </section>
  );
}
