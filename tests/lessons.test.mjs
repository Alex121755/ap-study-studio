import test from 'node:test';
import assert from 'node:assert/strict';
import {allTopics} from '../lib/curriculum.ts';
import {lessons,getLesson,lessonToMarkdown,lessonSearchText} from '../lib/lessons/index.ts';

test('every curriculum node has its own complete readable lesson and no orphan lesson',()=>{
 assert.deepEqual(Object.keys(lessons).sort(),allTopics.map(t=>t.id).sort());
 for(const topic of allTopics){
  const lesson=getLesson(topic.id);
  assert.ok(lesson.objectives.length>=2,topic.id+' objectives');
  assert.ok(lesson.keyPoints.length>=3,topic.id+' concrete knowledge points');
  assert.ok(lesson.sections.length>=2,topic.id+' explanations');
  assert.ok(lesson.misconceptions.length>=2,topic.id+' misconception corrections');
  assert.ok(lesson.checks.length>=2,topic.id+' answered checks');
  for(const p of lesson.keyPoints){assert.ok(p.label.trim());assert.ok(p.explanation.trim().length>=12,topic.id+' substantive definition');}
  for(const s of lesson.sections){assert.ok(s.title.trim());assert.ok(s.body.trim().length>=30,topic.id+' substantive section');}
  for(const c of lesson.checks){assert.ok(c.question.trim());assert.ok(c.answer.trim().length>=12,topic.id+' real answer');}
  for(const name of ['title','question','walkthrough','answer'])assert.ok(lesson.example[name]?.trim(),topic.id+' worked example '+name);
  assert.ok(lesson.nextStep.trim());
 }
});

test('lessons have original examples and topic-specific content instead of a shared placeholder',()=>{
 const titles=new Set(),bodies=new Set();
 for(const topic of allTopics){const l=getLesson(topic.id);titles.add(l.example.title);bodies.add(l.sections.map(s=>s.body).join(' '));}
 assert.equal(bodies.size,allTopics.length);
 assert.ok(titles.size>allTopics.length*.9);
});

test('lesson note export contains teaching, worked reasoning and self-check answers',()=>{
 const lesson=getLesson('physics-capacitance');
 const note=lessonToMarkdown('电容、介质与边界条件',lesson);
 assert.ok(note.includes(lesson.example.walkthrough));
 assert.ok(note.includes(lesson.checks[0].answer));
 assert.ok(note.includes('知识卡摘录'));
 assert.ok(lessonSearchText('physics-capacitance').includes(lesson.keyPoints[0].label));
 assert.throws(()=>getLesson('unknown-topic'));
});

test('all built-in math expressions render without KaTeX errors',async()=>{
 const [{unified},{default:remarkParse},{default:remarkMath},{default:katex}]=await Promise.all([import('unified'),import('remark-parse'),import('remark-math'),import('katex')]);
 const parser=unified().use(remarkParse).use(remarkMath);
 function strings(value){if(typeof value==='string')return[value];if(Array.isArray(value))return value.flatMap(strings);if(value&&typeof value==='object')return Object.values(value).flatMap(strings);return[];}
 let rendered=0;
 for(const [id,lesson] of Object.entries(lessons)){
  for(const text of strings(lesson)){
   const tree=parser.parse(text);
   function visit(node){
    if(node.type==='inlineMath'||node.type==='math'){assert.doesNotThrow(()=>katex.renderToString(node.value,{throwOnError:true,strict:'ignore'}),`${id}: ${node.value}`);rendered++;}
    node.children?.forEach(visit);
   }
   visit(tree);
  }
 }
 assert.ok(rendered>=50,'math-rich subjects should expose actual renderable formulas');
});
