import test from "node:test";
import assert from "node:assert/strict";
import { parseGraph, sanitizeGraph, stripGraphBlocks } from "../lib/graph.ts";

const graph = () => ({
  nodes: [{ id: "a", label: "电场", detail: "空间各点的电场强度" }, { id: "b", label: "电通量", detail: "穿过曲面的场的积分" }],
  edges: [{ source: "a", target: "b", label: "对曲面的法向分量积分" }],
});
const fenced = (value) => `解释如下。\n\n\`\`\`ap-graph\n${JSON.stringify(value)}\n\`\`\``;

test("graph parser accepts a complete graph and preserves Chinese relationship details", () => {
  assert.deepEqual(parseGraph(fenced(graph())), graph());
  assert.equal(parseGraph(fenced(graph()).slice(0, -2)), undefined);
  assert.equal(parseGraph(fenced(graph()).replace("ap-graph", "ap-graphical")), undefined);
  assert.equal(parseGraph("```ap-graph\n{broken}\n```"), undefined);
});

test("graph sanitization rejects duplicate IDs, dangling edges, empty graphs and self-links", () => {
  for (const value of [
    { nodes: [], edges: [] },
    { ...graph(), nodes: [{ id: "a", label: "first" }, { id: " a ", label: "duplicate after trim" }] },
    { ...graph(), edges: [{ source: "a", target: "missing", label: "invalid" }] },
    { ...graph(), edges: [{ source: "a", target: "a", label: "invisible loop" }] },
    { ...graph(), nodes: [{ id: "", label: "invalid" }] },
    { ...graph(), nodes: [{ id: "bad id", label: "invalid" }] },
  ]) assert.equal(sanitizeGraph(value), undefined);
});

test("graph sanitization enforces text, node and edge bounds", () => {
  for (const value of [
    { ...graph(), nodes: [{ id: "a", label: " " }] },
    { ...graph(), nodes: [{ id: "a".repeat(49), label: "too long" }] },
    { ...graph(), nodes: [{ id: "a", label: "x".repeat(121) }] },
    { ...graph(), nodes: [{ id: "a", label: "a", detail: "x".repeat(1601) }] },
    { ...graph(), nodes: [{ id: "a", label: "a", detail: { toString: null, valueOf: null } }] },
    { ...graph(), nodes: [{ id: "a", label: "null\u0000character" }] },
    { ...graph(), edges: [{ source: "a", target: "b", label: " " }] },
    { ...graph(), edges: [{ source: "a", target: "b", label: "x".repeat(161) }] },
    { ...graph(), nodes: Array.from({ length: 11 }, (_, i) => ({ id: `n${i}`, label: "a" })) },
    { ...graph(), edges: Array.from({ length: 19 }, (_, i) => ({ source: "a", target: "b", label: `relation${i}` })) },
  ]) assert.equal(sanitizeGraph(value), undefined);
});

test("graph sanitization strips untrusted properties and deduplicates identical edges", () => {
  const value = graph();
  value.nodes[0].onClick = "run()";
  value.nodes[0].html = "<script>alert(1)</script>";
  value.edges[0].style = { display: "none" };
  value.edges.push({ ...value.edges[0] });
  value.nodes[1].detail = "  ";
  const result = sanitizeGraph(value);
  assert.deepEqual(result, { nodes: [{ id: "a", label: "电场", detail: "空间各点的电场强度" }, { id: "b", label: "电通量" }], edges: graph().edges });
  assert.notEqual(result.nodes[0], value.nodes[0]);
});

test("partial graph fences stay hidden without stripping similarly named code languages", () => {
  assert.equal(stripGraphBlocks(fenced(graph())), "解释如下。\n\n");
  assert.equal(stripGraphBlocks("说明\n```ap-graph\n{\"nodes\":"), "说明\n");
  const other = "```ap-graphical\nother code\n```";
  assert.equal(stripGraphBlocks(other), other);
  assert.equal(parseGraph("```ap-graph\n" + " ".repeat(32_001) + "```"), undefined);
});
