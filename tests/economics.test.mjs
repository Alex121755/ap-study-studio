import test from 'node:test';
import assert from 'node:assert/strict';
import {subjects,allTopics} from '../lib/curriculum.ts';
import {getLesson} from '../lib/lessons/index.ts';
import {SUBJECT_IDS} from '../lib/subject-ids.ts';
import {EMPTY,safeSaved,isStudyChatKey} from '../lib/study-storage.ts';
import {createMaterialsBackup,parseMaterialsBackup} from '../lib/materials.ts';
import {validateChatInput,InputError} from '../lib/tutor.ts';

test('economics courses cover six units each and every graph reference resolves',()=>{
 assert.deepEqual(subjects.map(s=>s.id),[...SUBJECT_IDS]);
 const ids=new Set(allTopics.map(t=>t.id));
 assert.equal(ids.size,allTopics.length,'topic IDs must be unique');
 for(const topic of allTopics){
  for(const id of [...topic.prerequisites,...topic.links.map(l=>l.to)])assert.ok(ids.has(id),`${topic.id} -> ${id}`);
 }
 for(const id of ['micro','macro']){
  const course=subjects.find(s=>s.id===id);
  assert.equal(course.units.length,6);
  const topics=allTopics.filter(t=>t.subjectId===id);
  assert.ok(topics.length>=12);
  assert.ok(topics.some(t=>t.links.some(l=>allTopics.find(x=>x.id===l.to)?.subjectId!==id)));
  for(const topic of topics){
   const lesson=getLesson(topic.id);
   assert.ok(lesson.keyPoints.length>=4);
   assert.ok(lesson.checks.length>=2);
   assert.ok(lesson.example.walkthrough.length>50);
  }
 }
});

test('economics conversations, notes and mastery survive the version-one learning backup',()=>{
 const saved={...EMPTY,chats:{'micro:tutor':[{role:'user',content:'解释税负与弹性'}],'macro:connections':[{role:'assistant',content:'说明 AD 与 SRAS 的关系'}],'physics:tutor':[{role:'user',content:'旧学科记录'}],'unknown:tutor':[{role:'user',content:'丢弃未知学科'}]},notes:{'micro-elasticity':'中点法','macro-ad-as':'衰退缺口','physics-capacitance':'原有电容笔记'},mastery:{'micro-elasticity':{level:2,due:1000,reviews:1},'macro-ad-as':{level:1,due:2000,reviews:3}},project:{...EMPTY.project}};
 const restored=safeSaved(JSON.parse(JSON.stringify(saved)));
 for(const id of ['micro:tutor','macro:connections','physics:tutor'])assert.deepEqual(restored.chats[id],saved.chats[id]);
 assert.equal(restored.chats['unknown:tutor'],undefined);
 assert.deepEqual(restored.notes,saved.notes);
 assert.deepEqual(restored.mastery,saved.mastery);
 assert.equal(isStudyChatKey('micro:tutor:extra'),false);
 assert.equal(isStudyChatKey('macro:unknown'),false);
 assert.equal(safeSaved({...saved,version:2}),null);
});

test('economics notes and links round trip through material backups',()=>{
 const materials=[{id:'micro-note',subjectId:'micro',title:'Elasticity',type:'note',content:'比较税负分担',createdAt:1},{id:'macro-link',subjectId:'macro',title:'Macro CED',type:'link',content:'自己的阅读摘录',url:'https://apcentral.collegeboard.org/courses/ap-macroeconomics',createdAt:2}];
 assert.deepEqual(parseMaterialsBackup(createMaterialsBackup(materials)),materials);
 assert.throws(()=>parseMaterialsBackup(createMaterialsBackup([{...materials[0],subjectId:'unknown'}])));
});

test('the tutor accepts economics topics and rejects a topic from the other economics course',()=>{
 const catalog={subjectIds:subjects.map(s=>s.id),topicSubject:id=>allTopics.find(t=>t.id===id)?.subjectId,context:()=>''};
 const input={subjectId:'micro',topicId:'micro-elasticity',mode:'tutor',messages:[{role:'user',content:'解释弹性与税负'}]};
 assert.equal(validateChatInput(input,catalog).subjectId,'micro');
 assert.equal(validateChatInput({...input,subjectId:'macro',topicId:'macro-ad-as'},catalog).subjectId,'macro');
 assert.throws(()=>validateChatInput({...input,subjectId:'macro'},catalog),InputError);
});
