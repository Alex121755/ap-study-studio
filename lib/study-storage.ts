import {allTopics} from './curriculum.ts';
import {isSubjectId} from './subject-ids.ts';
const chatModes=new Set(['tutor','practice','review','research','connections']);
export function isStudyChatKey(value:string):boolean {
 const [subject,mode,...extra]=value.split(':');
 return extra.length===0&&isSubjectId(subject)&&chatModes.has(mode);
}
export type Chat={role:'user'|'assistant';content:string};
export type Mastery={level:number;due:number;reviews:number};
export type Saved={version:1;chats:Record<string,Chat[]>;notes:Record<string,string>;mastery:Record<string,Mastery>;project:{question:string;method:string;population:string;stage:string};exam:string;attempts:number;correct:number};
export const EMPTY:Saved={version:1,chats:{},notes:{},mastery:{},project:{question:'',method:'',population:'',stage:'选题与文献'},exam:'',attempts:0,correct:0};

export function safeSaved(v:unknown):Saved|null {
 if(!v||typeof v!=='object')return null;
 const x=v as Partial<Saved>;
 if(x.version!==1||!x.chats||!x.notes||!x.mastery||!x.project)return null;
 const clean:Saved={...EMPTY,chats:{},notes:{},mastery:{},project:{...EMPTY.project},exam:typeof x.exam==='string'?x.exam.slice(0,10):'',attempts:Math.max(0,Number(x.attempts)||0),correct:Math.max(0,Number(x.correct)||0)};
 for(const [k,chat] of Object.entries(x.chats)){if(isStudyChatKey(k)&&Array.isArray(chat))clean.chats[k]=chat.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').slice(-60).map(m=>({role:m.role,content:m.content.slice(0,30000)}));}
 for(const t of allTopics){if(typeof x.notes[t.id]==='string')clean.notes[t.id]=x.notes[t.id].slice(0,20000);const m=x.mastery[t.id];if(m&&Number.isFinite(m.due)&&Number.isInteger(m.level)&&m.level>=0&&m.level<=3)clean.mastery[t.id]={level:m.level,due:m.due,reviews:Math.max(0,Number(m.reviews)||0)};}
 for(const k of ['question','method','population','stage'] as const)if(typeof x.project[k]==='string')clean.project[k]=x.project[k].slice(0,6000);
 return clean;
}
