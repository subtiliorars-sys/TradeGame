/**
 * Shipped-lesson prereq edges by curriculum ID (LESSON_SYSTEM_BRIEF §7.4).
 * Foundation track is linear F-01 → … → F-10. Beginner/intermediate edges
 * expand as those waves ship; hard-flip gating must not run until full chains exist.
 */

/** Parent curriculum ID, or null if none. */
export const PREREQ_BY_CURRICULUM: Readonly<Record<string, string | null>> = {
  "F-01": null,
  "F-02": "F-01",
  "F-03": "F-02",
  "F-04": "F-03",
  "F-05": "F-04",
  "F-06": "F-05",
  "F-07": "F-06",
  "F-08": "F-07",
  "F-09": "F-08",
  "F-10": "F-09",
  "C-B01": "F-03",
  "C-B02": "C-B01",
  "C-B03": "C-B02",
  "C-B04": "C-B03",
  "C-B05": "C-B04",
  // Pillar lessons (shipped wave 1 + 2) — parent is prior lesson in same pillar chain
  "C-I01": "C-B05",
  "C-I02": "C-I01",
  "C-I03": "C-I02",
  "C-I04": "C-I03",
  "S-I01": "F-02",
  "S-I02": "S-I01",
  "S-I03": "S-I02",
  "S-I04": "S-I03",
  "S-I05": "S-I04",
  "X-B03": "F-03",
  "X-B04": "X-B03",
  "X-I01": "X-B04",
  "X-I02": "X-I01",
  "X-I03": "X-I02",
  "X-I04": "X-I03",
};

export function detectPrereqCycle(
  edges: Readonly<Record<string, string | null>>,
): string[] | null {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(id: string): string[] | null {
    if (visited.has(id)) return null;
    if (visiting.has(id)) return [id];
    visiting.add(id);
    const parent = edges[id];
    if (parent !== null && parent !== undefined) {
      const cycle = dfs(parent);
      if (cycle) return [id, ...cycle];
    }
    visiting.delete(id);
    visited.add(id);
    return null;
  }

  for (const id of Object.keys(edges)) {
    const cycle = dfs(id);
    if (cycle) return cycle;
  }
  return null;
}
