"use client";
import {useEffect,useRef,useId,useState} from "react";
import {ArrowLeft,ArrowRight,ArrowUpRight,BookOpen,CheckCircle2,ChevronDown,ExternalLink,HelpCircle,NotebookPen,Sparkles,X} from "lucide-react";
import {subjects,allTopics} from "@/lib/curriculum";
import {getLesson,lessonToMarkdown} from "@/lib/lessons";
import Message from "./Message";

type StudyTopic=(typeof allTopics)[number];
type Props={topic:StudyTopic;onClose:()=>void;onSelect:(id:string)=>void;onAsk:(prompt:string)=>void;onSave:(text:string)=>void};
export default function LessonReader({topic,onClose,onSelect,onAsk,onSave}:Props){
 const dialog=useRef<HTMLDialogElement>(null);
 const body=useRef<HTMLDivElement>(null);
 const titleId=useId();
 const lesson=getLesson(topic.id);
 const subject=subjects.find(s=>s.id===topic.subjectId)!;
 const sequence=allTopics.filter(t=>t.subjectId===topic.subjectId);
 const index=sequence.findIndex(t=>t.id===topic.id);
 useEffect(()=>{const node=dialog.current;node?.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{node?.close();document.body.style.overflow=overflow}},[]);
 useEffect(()=>{body.current?.scrollTo({top:0});},[topic.id]);
 const ask=(request:string)=>onAsk(`我正在读「${topic.title}」。${request}`);
 return <dialog ref={dialog} className="lesson-reader" aria-labelledby={titleId} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget){const box=e.currentTarget.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)onClose()}}}>
  <header className="lesson-reader-header"><div><div className="lesson-breadcrumb"><BookOpen size={14}/>{subject.short}<span>/</span>{topic.unit}</div><h2 id={titleId}>{topic.title}</h2><p>{topic.en}</p></div><button autoFocus className="icon-btn" aria-label="关闭知识卡" onClick={onClose}><X size={22}/></button></header>
  <div ref={body} className="lesson-reader-body">
   <div className="lesson-intro"><span className="lesson-label">读完后，你应该能</span><ul>{lesson.objectives.map(x=><li key={x}><CheckCircle2 size={15}/>{x}</li>)}</ul><p>内置讲解可直接阅读；例题与自测为原创练习。</p></div>
   {!!topic.prerequisites.length&&<div className="lesson-prerequisites"><span>建议先理解</span>{topic.prerequisites.map(id=>{const t=allTopics.find(n=>n.id===id);return t&&<button key={id} onClick={()=>onSelect(id)}>{t.title}<ArrowUpRight size={12}/></button>})}</div>}
   <section className="lesson-section"><div className="lesson-section-title"><span>01</span><h3>这里具体有哪些知识点？</h3></div><div className="lesson-point-grid">{lesson.keyPoints.map((point,i)=><article className="lesson-point" key={point.label}><span>{String(i+1).padStart(2,'0')}</span><h4>{point.label}</h4><Message text={point.explanation} subjectId={topic.subjectId}/></article>)}</div></section>
   <section className="lesson-section"><div className="lesson-section-title"><span>02</span><h3>把概念讲清楚</h3></div>{lesson.sections.map((section,i)=><article key={section.title} className="lesson-explanation"><h4><span>{i+1}.</span> {section.title}</h4><Message text={section.body} subjectId={topic.subjectId}/></article>)}</section>
   <section className="lesson-section"><div className="lesson-section-title"><span>03</span><h3>跟着例子走一遍</h3></div><div className="lesson-example"><div className="lesson-example-label">原创例题 / 分析示范</div><h4>{lesson.example.title}</h4><div className="lesson-example-question"><Message text={lesson.example.question} subjectId={topic.subjectId}/></div><strong className="lesson-mini-heading">推理过程</strong><Message text={lesson.example.walkthrough} subjectId={topic.subjectId}/><div className="lesson-example-answer"><strong>得到什么结论？</strong><Message text={lesson.example.answer} subjectId={topic.subjectId}/></div></div></section>
   <section className="lesson-section"><div className="lesson-section-title"><span>04</span><h3>最容易混淆的地方</h3></div><div className="lesson-misconceptions">{lesson.misconceptions.map(item=><article key={item.claim}><div><X size={15}/><span>{item.claim}</span></div><div><CheckCircle2 size={15}/><Message text={item.correction} subjectId={topic.subjectId}/></div></article>)}</div></section>
   <section className="lesson-section"><div className="lesson-section-title"><span>05</span><h3>合上讲解，你能回答吗？</h3></div><p className="lesson-section-hint">先自己回答，再展开参考要点。这里不会自动判定你是否掌握。</p><div className="lesson-checks">{lesson.checks.map((check,i)=><details key={`${topic.id}:${i}`}><summary><span>{i+1}</span><span>{check.question}</span><ChevronDown size={16}/></summary><div><strong>参考要点</strong><Message text={check.answer} subjectId={topic.subjectId}/><button className="text-action" onClick={()=>ask(`请围绕这道自测题检查我的理解：${check.question}。先等我作答，再给反馈。`)}>让教练检查我的回答 <ArrowRight size={14}/></button></div></details>)}</div></section>
   <section className="lesson-section"><div className="lesson-section-title"><span>06</span><h3>为什么它会连到其他知识？</h3></div><div className="lesson-relations">{topic.links.map((link,i)=>{const target=allTopics.find(t=>t.id===link.to);return target&&<button key={link.to+i} onClick={()=>onSelect(link.to)}><div><span>{link.label}</span><h4>{target.title}</h4><p>{getLesson(target.id).keyPoints[0].explanation.replace(/\$/g,'').slice(0,140)}</p></div><ArrowUpRight size={18}/></button>})}</div><p className="lesson-next-step"><strong>接下来怎么练</strong>{lesson.nextStep}</p></section>
   <div className="lesson-source"><a href={subject.source.url} target="_blank" rel="noopener noreferrer">课程范围参考：{subject.source.label}<ExternalLink size={12}/></a><p>知识卡是学习导航与原创讲解，并非完整教材或官方评分标准。</p></div>
  </div>
  <footer className="lesson-reader-footer"><div className="lesson-sequence"><button disabled={index===0} aria-label="上一个知识点" onClick={()=>onSelect(sequence[index-1].id)}><ArrowLeft size={16}/></button><span>{index+1} / {sequence.length}</span><button disabled={index===sequence.length-1} aria-label="下一个知识点" onClick={()=>onSelect(sequence[index+1].id)}><ArrowRight size={16}/></button></div><div className="lesson-footer-actions"><button className="btn-secondary" onClick={()=>onSave(lessonToMarkdown(topic.title,lesson))}><NotebookPen size={15}/>存入笔记</button><button className="btn-primary" onClick={()=>ask(`${topic.prompt} 请结合知识卡内容，一次只问一个诊断问题。`)}><Sparkles size={15}/>让教练追问</button></div></footer>
 </dialog>
}

export function LessonPreview({topic,onOpen}:{topic:StudyTopic;onOpen:()=>void}){
 const lesson=getLesson(topic.id);
 return <div className="lesson-preview"><div className="lesson-preview-title"><BookOpen size={15}/><strong>打开后具体学什么</strong><span>{lesson.keyPoints.length} 个要点 · {lesson.checks.length} 道自测</span></div><ul>{lesson.keyPoints.slice(0,3).map(point=><li key={point.label}><strong>{point.label}</strong><Message text={point.explanation} subjectId={topic.subjectId}/></li>)}</ul><button className="btn-primary" onClick={onOpen}>阅读完整知识卡 <ArrowRight size={15}/></button><small>概念讲解、完整例题、易错点、自测与关联均可直接查看</small></div>
}

export function TopicOutline({subjectId,selected,onSelect,onOpen,mastered}:{subjectId:string;selected:string;onSelect:(id:string)=>void;onOpen:(id:string)=>void;mastered:(id:string)=>boolean}){
 const subject=subjects.find(s=>s.id===subjectId)!;
 const [expanded,setExpanded]=useState<string|null>(selected);
 const [openedUnits,setOpenedUnits]=useState<Record<string,boolean>>({});
 useEffect(()=>{setExpanded(selected);const unit=subject.units.find(u=>u.topics.some(t=>t.id===selected));if(unit){const key=`${subjectId}:${unit.title}`;setOpenedUnits(previous=>previous[key]===true?previous:{...previous,[key]:true})}},[selected,subjectId]);
 return <div className="lesson-outline">{subject.units.map((unit,i)=><details key={unit.title} className="outline-unit" open={openedUnits[`${subjectId}:${unit.title}`]??i===0} onToggle={event=>{const open=event.currentTarget.open;const key=`${subjectId}:${unit.title}`;setOpenedUnits(previous=>previous[key]===open?previous:{...previous,[key]:open})}}><summary><span className="unit-number">{String(i+1).padStart(2,'0')}</span><span>{unit.title}</span><ChevronDown size={15}/></summary><div className="outline-unit-topics">{unit.topics.map(topic=>{const lesson=getLesson(topic.id);const open=expanded===topic.id;return <article key={topic.id} className={`outline-topic ${open?'expanded':''}`}><button className="outline-topic-trigger" aria-label={`展开知识点：${topic.title}`} aria-expanded={open} aria-controls={`outline-${topic.id}`} onClick={()=>{setExpanded(open?null:topic.id);onSelect(topic.id)}}><span className={`topic-dot ${mastered(topic.id)?'reviewed':''}`}/><span><strong>{topic.title}</strong><small>{lesson.keyPoints.map(p=>p.label).slice(0,3).join(' · ')}</small></span>{mastered(topic.id)&&<CheckCircle2 size={14}/>}<ChevronDown size={16}/></button>{open&&<div id={`outline-${topic.id}`} className="outline-topic-content"><ul>{lesson.keyPoints.map(point=><li key={point.label}><strong>{point.label}</strong><Message text={point.explanation} subjectId={subjectId}/></li>)}</ul><button className="text-action" onClick={()=>onOpen(topic.id)}>查看讲解、例题和自测 <ArrowRight size={15}/></button></div>}</article>})}</div></details>)}</div>
}
