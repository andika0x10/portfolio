import { EditorialText } from "./EditorialText";
import { useEditorialMotion } from "../hooks/useEditorialMotion";

export function HeroSection() {
  const ref = useEditorialMotion(true);
  return (
    <section id="top" ref={ref} className="section-shell hero" aria-labelledby="hero-title">
      <p className="hero__location section-meta" data-reveal-simple>Bandar Lampung, Indonesia</p>
      <div className="hero__introduction">
        <h1 id="hero-title" className="hero__title">
          <EditorialText text="Hi, I'm Andika Dinata." />
        </h1>
        <p className="hero__roles">
          <EditorialText text="Vulnerability Researcher & Software Engineer" />
        </p>
        <p className="hero__description">
          <EditorialText text="I research how systems fail and build software with that understanding." />
        </p>
      </div>
      <nav className="hero__actions" aria-label="Explore my work" data-reveal-simple>
        <a className="text-link" href="#projects">View projects</a>
        <a className="text-link" href="#connect">Get in touch</a>
      </nav>
    </section>
  );
}
