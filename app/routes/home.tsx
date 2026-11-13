import type { Route } from "./+types/home";
import { LandingPage } from "../components/LandingPage";
import type { Project } from "../components/ProjectsSection";
import projects from "../data/projects.json";

export function loader(): { projects: Project[] } {
  return { projects };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <LandingPage projects={loaderData.projects} />;
}
