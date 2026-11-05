"use client";
import {useState} from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import KnowledgeGraph from "./KnowledgeGraph";
import {parseGraph,stripGraphBlocks} from "@/lib/graph";
export default function Message({text,subjectId}:{text:string;subjectId:string}) {
  const graph=parseGraph(text);
  const [selected,setSelected]=useState('');
  const node=graph?.nodes.find(n=>n.id===selected);
  const clean=stripGraphBlocks(text);
  return <><div className="markdown"><ReactMarkdown skipHtml remarkPlugins={[remarkMath]} rehypePlugins={[[rehypeKatex,{throwOnError:false,strict:false}]]} components={{a:props=><a {...props} target="_blank" rel="noopener noreferrer"/>}}>{clean}</ReactMarkdown></div>{graph&&<KnowledgeGraph subjectId={subjectId} selected={selected} onSelect={setSelected} data={graph}/>} {node&&<div className="generated-node-detail"><strong>{node.label}</strong><p>{node.detail}</p>{graph?.edges.filter(e=>e.source===selected||e.target===selected).map((e,i)=><p key={i}>{graph.nodes.find(n=>n.id===e.source)?.label} → {e.label} → {graph.nodes.find(n=>n.id===e.target)?.label}</p>)}</div>}</>;
}
