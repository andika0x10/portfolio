import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fetchProjects } from "./fetch-projects.mjs";

const existing = [{ name: "cached", description: null, url: "https://github.com/andika0x10/cached", language: null, stars: 2 }];
const repo = (name, extra = {}) => ({
  name,
  description: null,
  html_url: `https://github.com/andika0x10/${name}`,
  language: "TypeScript",
  stargazers_count: 3,
  fork: false,
  ...extra,
});

async function fixture(t, snapshot = existing) {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-projects-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const outputPath = join(directory, "projects.json");
  if (snapshot !== null) await writeFile(outputPath, JSON.stringify(snapshot));
  const warnings = [];
  return {
    outputPath,
    token: "",
    warnings,
    logger: {
      log() {},
      warn(message) {
        warnings.push(message);
      },
    },
  };
}

test("paginates, keeps pushed order, excludes forks and profile, and writes the snapshot", async (t) => {
  const options = await fixture(t);
  const firstPage = Array.from({ length: 100 }, (_, i) => repo(`project-${i}`));
  firstPage[1] = repo("forked", { fork: true });
  firstPage[2] = repo("Andika0x10");
  const requests = [];
  const result = await fetchProjects({
    ...options,
    token: " build-only-token ",
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      return Response.json(requests.length === 1 ? firstPage : [repo("last", { description: "Last project", language: null })]);
    },
  });
  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /users\/andika0x10\/repos\?type=public&sort=pushed&per_page=100&page=1$/);
  assert.match(requests[1].url, /page=2$/);
  assert.equal(requests[0].init.headers.Authorization, "Bearer build-only-token");
  assert.ok(requests[0].init.signal instanceof AbortSignal);
  assert.equal(result.updated, true);
  assert.equal(result.projects.length, 99);
  assert.deepEqual(
    result.projects.slice(0, 2).map((p) => p.name),
    ["project-0", "project-3"]
  );
  assert.deepEqual(result.projects.at(-1), { name: "last", description: "Last project", url: "https://github.com/andika0x10/last", language: null, stars: 3 });
  assert.deepEqual(JSON.parse(await readFile(options.outputPath, "utf8")), result.projects);
});

test("supports public API access without a token and accepts an empty result", async (t) => {
  const options = await fixture(t);
  const result = await fetchProjects({
    ...options,
    fetchImpl: async (_url, { headers }) => {
      assert.equal(headers.Authorization, undefined);
      return Response.json([]);
    },
  });
  assert.deepEqual(result, { projects: [], updated: true });
});

for (const status of [403, 429, 500]) {
  test(`HTTP ${status} preserves the existing snapshot and logs the fallback`, async (t) => {
    const options = await fixture(t);
    const before = await readFile(options.outputPath, "utf8");
    const result = await fetchProjects({ ...options, fetchImpl: async () => new Response(null, { status }) });
    assert.deepEqual(result, { projects: existing, updated: false });
    assert.equal(await readFile(options.outputPath, "utf8"), before);
    assert.match(options.warnings[0], new RegExp(`HTTP ${status}.*existing snapshot`));
  });
}

test("a network timeout preserves the existing snapshot", async (t) => {
  const options = await fixture(t);
  const result = await fetchProjects({
    ...options,
    fetchImpl: async () => {
      throw new DOMException("Request timed out", "TimeoutError");
    },
  });
  assert.deepEqual(result, { projects: existing, updated: false });
});

test("failure on a later page never writes a partial snapshot", async (t) => {
  const options = await fixture(t);
  let calls = 0;
  const result = await fetchProjects({
    ...options,
    fetchImpl: async () => {
      if (++calls === 1) return Response.json(Array.from({ length: 100 }, (_, i) => repo(`project-${i}`)));
      return new Response(null, { status: 503 });
    },
  });
  assert.deepEqual(result.projects, existing);
  assert.deepEqual(JSON.parse(await readFile(options.outputPath, "utf8")), existing);
});

for (const invalid of [{ message: "Unexpected response" }, [repo("bad", { stargazers_count: "3" })], [repo("bad", { html_url: "https://github.com/another-user/bad" })]]) {
  test("invalid API data does not replace the snapshot", async (t) => {
    const options = await fixture(t);
    const result = await fetchProjects({ ...options, fetchImpl: async () => Response.json(invalid) });
    assert.deepEqual(result, { projects: existing, updated: false });
  });
}

for (const snapshot of [null, [{ ...existing[0], url: "https://github.com/andika0x01/cached" }]]) {
  test("fails the build when fetching fails and no valid snapshot is available", async (t) => {
    const options = await fixture(t, snapshot);
    await assert.rejects(fetchProjects({ ...options, fetchImpl: async () => new Response(null, { status: 403 }) }), /no valid project snapshot/);
  });
}
