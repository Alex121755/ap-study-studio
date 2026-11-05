import {physicsStatsLessons} from './physics-stats.ts';
import {worldElcLessons} from './world-elc.ts';
import {psychResearchLessons} from './psych-research.ts';
import type {Lesson,LessonMap} from './types';

export const lessons:LessonMap={...physicsStatsLessons,...worldElcLessons,...psychResearchLessons};
export function getLesson(topicId:string):Lesson {
 const lesson=lessons[topicId];
 if(!lesson)throw new Error(`知识卡尚未配置：${topicId}`);
 return lesson;
}
export function lessonToMarkdown(title:string,lesson:Lesson):string {
 return [
  `## 知识卡摘录：${title}`,
  `### 学习目标\n${lesson.objectives.map(x=>`- ${x}`).join('\n')}`,
  `### 具体知识点\n${lesson.keyPoints.map(p=>`**${p.label}**\n\n${p.explanation}`).join('\n\n')}`,
  ...lesson.sections.map(s=>`### ${s.title}\n\n${s.body}`),
  `### 原创例题：${lesson.example.title}\n\n${lesson.example.question}\n\n**推理**\n\n${lesson.example.walkthrough}\n\n**结论**\n\n${lesson.example.answer}`,
  `### 易错点\n${lesson.misconceptions.map(m=>`- 易混淆：${m.claim}\n  正确理解：${m.correction}`).join('\n')}`,
  `### 自测与参考要点\n${lesson.checks.map((c,i)=>`${i+1}. ${c.question}\n\n   ${c.answer}`).join('\n\n')}`,
  `### 下一步\n${lesson.nextStep}`,
 ].join('\n\n');
}
export function lessonSearchText(topicId:string):string {
 const lesson=getLesson(topicId);
 return [...lesson.objectives,...lesson.keyPoints.flatMap(p=>[p.label,p.explanation]),...lesson.sections.flatMap(s=>[s.title,s.body]),lesson.example.title].join(' ');
}
