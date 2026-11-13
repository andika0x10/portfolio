import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const username = "andika0x10";
const snapshotPath = fileURLToPath(new URL("../app/data/projects.json", import.meta.url));

function isProject(project) {
  return (
    project !== null &&
    typeof project === "object" &&
    typeof project.name === "string" &&
    (project.description === null || typeof project.description === "string") &&
    typeof project.url === "string" &&
    project.url.startsWith(`https://github.com/${username}/`) &&
    (project.language === null || typeof project.language === "string") &&
    Number.isInteger(project.stars) &&
    project.stars >= 0
  );
}

export async function fetchProjects({
  fetchImpl = globalThis.fetch,
  outputPath = snapshotPath,
  token = process.env.PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN,
  logger = console,
} = {}) {
  try {
    const headers = {
      "User-Agent": `${username}-portfolio-build`,
      Accept: "application/vnd.github+json",
    };
    if (token?.trim()) headers.Authorization = `Bearer ${token.trim()}`;

    const projects = [];
    for (let page = 1; ; page++) {
      const response = await fetchImpl(`https://api.github.com/users/${username}/repos?type=public&sort=pushed&per_page=100&page=${page}`, {
        headers,
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status}`);

      const repos = await response.json();
      if (!Array.isArray(repos)) throw new Error("GitHub API returned an invalid repository list");
      for (const repo of repos) {
        if (!repo || typeof repo.name !== "string" || typeof repo.fork !== "boolean") {
          throw new Error("GitHub API returned an invalid repository");
        }
        if (repo.fork || repo.name.toLowerCase() === username) continue;
        const project = {
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
        };
        if (!isProject(project)) throw new Error("GitHub API returned invalid project data");
        projects.push(project);
      }
      if (repos.length < 100) break;
    }

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
    logger.log(`[projects] Fetched ${projects.length} public projects from ${username}.`);
    return { projects, updated: true };
  } catch (error) {
    // A clean Workers Build can fall back to the snapshot committed with the source.
    const snapshot = await readFile(outputPath, "utf8")
      .then(JSON.parse)
      .catch(() => null);
    if (!Array.isArray(snapshot) || !snapshot.every(isProject)) {
      throw new Error("GitHub fetch failed and no valid project snapshot is available", { cause: error });
    }
    logger.warn(`[projects] ${error instanceof Error ? error.message : "GitHub fetch failed"}; keeping ${snapshot.length} projects from the existing snapshot.`);
    return { projects: snapshot, updated: false };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await fetchProjects();
}
