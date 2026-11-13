import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";
import { SkillsSection } from "./SkillsSection";
import { ExperienceSection } from "./ExperienceSection";
import { ActivitiesSection } from "./ActivitiesSection";
import { ProjectsSection } from "./ProjectsSection";
import { ConnectSection } from "./ConnectSection";
import { useSmoothScroll } from "../hooks/useSmoothScroll";
import type { Project } from "./ProjectsSection";

export function LandingPage({ projects }: { projects: Project[] }) {
  useSmoothScroll();
  return (
    <>
      <main>
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ActivitiesSection />
        <SkillsSection />
        <ProjectsSection projects={projects} />
      </main>
      <ConnectSection />
    </>
  );
}
