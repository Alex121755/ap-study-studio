"use client";
import { useMemo, useState } from "react";
import { Minus, Plus, RotateCcw, Orbit } from "lucide-react";
import { subjects, allTopics } from "@/lib/curriculum";

export type GraphData = {nodes:{id:string;label:string;detail?:string}[];edges:{source:string;target:string;label:string}[]};
type Props = {subjectId:string;selected:string;onSelect:(id:string)=>void;cross?:boolean;data?:GraphData};
export default function KnowledgeGraph({subjectId,selected,onSelect,cross=false,data}:Props) {
  const [zoom,setZoom]=useState(1);
  const [offset,setOffset]=useState({x:0,y:0});
  const [drag,setDrag]=useState<{x:number;y:number;ox:number;oy:number}|null>(null);
  const graph=useMemo(()=>{
    if(data) return {nodes:data.nodes.slice(0,24).map(n=>({...n,color:'#439488',subjectId:'custom'})),edges:data.edges.slice(0,50)};
    const own=allTopics.filter(t=>t.subjectId===subjectId);
    const ids=new Set(own.map(t=>t.id));
    if(cross) own.forEach(t=>t.links.forEach(l=>ids.add(l.to)));
    const related=own.find(t=>t.id===selected)?.links.map(l=>l.to)??[];
    const neighbors=allTopics.filter(t=>ids.has(t.id)&&t.subjectId!==subjectId).sort((a,b)=>Number(related.includes(b.id))-Number(related.includes(a.id)));
    const ordered=[...own,...neighbors];
    const nodes=ordered.slice(0,28).map(t=>({id:t.id,label:t.title,detail:t.summary,subjectId:t.subjectId,color:subjects.find(s=>s.id===t.subjectId)?.color??'#4d9b89'}));
    const visible=new Set(nodes.map(n=>n.id));
    const edges=nodes.flatMap(n=>allTopics.find(t=>t.id===n.id)?.links.filter(l=>visible.has(l.to)).map(l=>({source:n.id,target:l.to,label:l.label}))??[]);
    return {nodes,edges};
  },[subjectId,cross,data,selected]);
  const positions=useMemo(()=>{
    const total=graph.nodes.length;
    return graph.nodes.map((node,i)=>{
      if(i===0) return {...node,x:330,y:214};
      const inner=i<=6, count=inner?Math.min(total-1,6):total-7;
      const angle=((inner?i-1:i-7)/Math.max(count,1))*Math.PI*2-Math.PI/2;
      return {...node,x:330+Math.cos(angle)*(inner?140:260),y:214+Math.sin(angle)*(inner?108:182)};
    });
  },[graph]);
  const selectedEdges=graph.edges.filter(e=>e.source===selected||e.target===selected);
  return <div className="knowledge-graph">
    <svg viewBox="0 0 660 428" aria-label="知识关系图，点击节点查看关联" role="group"
      onPointerDown={e=>{if((e.target as Element).closest('[data-node]'))return;e.currentTarget.setPointerCapture(e.pointerId);setDrag({x:e.clientX,y:e.clientY,ox:offset.x,oy:offset.y})}}
      onPointerMove={e=>{if(drag)setOffset({x:drag.ox+(e.clientX-drag.x),y:drag.oy+(e.clientY-drag.y)})}}
      onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)}>
      <defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#d4dcd7"/></pattern><marker id="arrow" markerWidth="8" markerHeight="8" refX="21" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="none" stroke="#9eada5"/></marker></defs>
      <rect width="660" height="428" fill="url(#dots)"/>
      <g transform={`translate(${330+offset.x} ${214+offset.y}) scale(${zoom}) translate(-330 -214)`}>
        {graph.edges.map((e,i)=>{const a=positions.find(n=>n.id===e.source),b=positions.find(n=>n.id===e.target);if(!a||!b)return null;const active=e.source===selected||e.target===selected;return <g key={`${e.source}-${e.target}-${i}`} opacity={selected&&selectedEdges.length&&!active?.23:1}><path d={`M${a.x},${a.y} Q${(a.x+b.x)/2+12},${(a.y+b.y)/2-12} ${b.x},${b.y}`} stroke={active?'#439488':'#c3cec5'} strokeWidth={active?2:1.15} fill="none" markerEnd="url(#arrow)"/>{active&&<text x={(a.x+b.x)/2+8} y={(a.y+b.y)/2-13} className="edge-label">{e.label.slice(0,12)}</text>}</g>})}
        {positions.map((n,i)=><g key={n.id} data-node="true" role="button" tabIndex={0} aria-label={`${n.label}，${n.detail??'查看知识点'}`} className="graph-node" onClick={()=>onSelect(n.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(n.id)}}} style={{opacity:selected&&selected!==n.id&&selectedEdges.length&&!selectedEdges.some(e=>e.source===n.id||e.target===n.id)?.55:1}}>
          {selected===n.id&&<circle cx={n.x} cy={n.y} r={i===0?40:27} fill="none" stroke={n.color} strokeWidth="1" opacity=".35"/>}
          <circle cx={n.x} cy={n.y} r={i===0?31:19} fill={selected===n.id?n.color:'#fbfcf9'} stroke={n.color} strokeWidth={selected===n.id?0:1.5}/>
          <circle cx={n.x} cy={n.y} r="5" fill={selected===n.id?'white':n.color}/>
          <text x={n.x} y={n.y+(i===0?51:38)} textAnchor="middle" className="node-label" style={{fontWeight:selected===n.id?700:500}}>{n.label.length>14?n.label.slice(0,13)+'…':n.label}</text>
        </g>)}
      </g>
    </svg>
    <div className="graph-controls"><button aria-label="放大知识图" onClick={()=>setZoom(z=>Math.min(2,z+.2))}><Plus size={15}/></button><button aria-label="缩小知识图" onClick={()=>setZoom(z=>Math.max(.5,z-.2))}><Minus size={15}/></button><button aria-label="重置知识图" onClick={()=>{setZoom(1);setOffset({x:0,y:0})}}><RotateCcw size={14}/></button></div>
    <div className="graph-caption"><Orbit size={13}/><span>点击探索 · 拖动平移 · 箭头表示有向关系</span></div>
    <div className="graph-key">{(cross?subjects:subjects.filter(s=>s.id===subjectId)).map(s=><span key={s.id}><i style={{background:s.color}}/>{s.short}</span>)}</div>
  </div>;
}
