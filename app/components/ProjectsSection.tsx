import { EditorialText, SectionLabel } from "./EditorialText";
import { useEditorialMotion } from "../hooks/useEditorialMotion";

export interface Project {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
}

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const ref = useEditorialMotion();
  return (
    <section id="projects" ref={ref} className="section-shell projects" aria-labelledby="projects-title">
      <SectionLabel id="projects-title">Projects</SectionLabel>
      {projects.length ? (
        <ul className="project-list" data-focus-group>
          {projects.map((project) => (
            <li key={project.name} data-focus-item>
              <a data-focus-content className="project-link" href={project.url} target="_blank" rel="noopener noreferrer">
                <div className="project-link__heading">
                  <h3 className="entry-title">
                    <EditorialText text={project.name} />
                  </h3>
                  <span className="external-mark" aria-hidden="true">
                    ↗
                  </span>
                </div>
                {project.description?.trim() && (
                  <p className="project-link__description">
                    <EditorialText text={project.description} />
                  </p>
                )}
                {(project.language || project.stars > 0) && (
                  <p className="section-meta project-link__meta" data-reveal-simple>
                    {project.language && <span>{project.language}</span>}
                    {project.stars > 0 && <span aria-label={`${project.stars} stars`}>☆ {project.stars}</span>}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="section-copy">
          Find my projects on{" "}
          <a className="text-link" href="https://github.com/andika0x10">
            GitHub
          </a>
          .
        </p>
      )}
    </section>
  );
}
