/** A deliberately small, data-only graph format. No model-supplied props reach the renderer. */
export type GraphData = {
  nodes: { id: string; label: string; detail?: string }[];
  edges: { source: string; target: string; label: string }[];
};

const MAX_GRAPH_CHARS = 32_000;
const ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!text || text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) return undefined;
  return text;
}

export function sanitizeGraph(value: unknown): GraphData | undefined {
  if (!record(value) || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) return undefined;
  if (value.nodes.length < 1 || value.nodes.length > 10 || value.edges.length > 18) return undefined;
  const nodes: GraphData["nodes"] = [];
  const ids = new Set<string>();
  for (const node of value.nodes) {
    if (!record(node)) return undefined;
    const id = boundedText(node.id, 48);
    const label = boundedText(node.label, 120);
    if (!id || !ID.test(id) || ids.has(id) || !label) return undefined;
    if (node.detail !== undefined && typeof node.detail !== "string") return undefined;
    const detail = typeof node.detail === "string" ? node.detail.trim() : undefined;
    if (detail && !boundedText(detail, 1_600)) return undefined;
    ids.add(id);
    nodes.push({ id, label, ...(detail ? { detail } : {}) });
  }
  const edges: GraphData["edges"] = [];
  const edgeKeys = new Set<string>();
  for (const edge of value.edges) {
    if (!record(edge)) return undefined;
    const source = boundedText(edge.source, 48);
    const target = boundedText(edge.target, 48);
    const label = boundedText(edge.label, 160);
    if (!source || !target || !label || !ids.has(source) || !ids.has(target) || source === target) return undefined;
    const key = JSON.stringify([source, target, label]);
    if (edgeKeys.has(key)) continue;
    edgeKeys.add(key);
    edges.push({ source, target, label });
  }
  return { nodes, edges };
}

export function parseGraph(text: string): GraphData | undefined {
  // Require a complete, correctly labelled fence. Partial streaming JSON stays hidden until ready.
  const block = text.match(/```ap-graph(?:[ \t]*\r?\n|[ \t]+)([\s\S]*?)```/);
  if (!block || block[1].length > MAX_GRAPH_CHARS) return undefined;
  try { return sanitizeGraph(JSON.parse(block[1])); } catch { return undefined; }
}

export function stripGraphBlocks(text: string): string {
  return text
    .replace(/```ap-graph(?=[\s]|$)[\s\S]*?```/g, "")
    .replace(/```ap-graph(?=[\s]|$)[\s\S]*$/, "");
}
