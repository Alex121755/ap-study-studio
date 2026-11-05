"use client";

import {useState} from 'react';
import {CheckCircle2,Eye,EyeOff,KeyRound,LoaderCircle} from 'lucide-react';
import './api-key-settings.css';

export default function ApiKeySettings({configured,onConfigured}:{configured:boolean;onConfigured:()=>Promise<void>}){
 const [value,setValue]=useState('');
 const [visible,setVisible]=useState(false);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState(false);

 async function save(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(saving||!value.trim())return;
  setSaving(true);setMessage('');setError(false);
  try{
   const response=await fetch('/api/settings/credentials',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:value.trim()})});
   const result=await response.json() as {configured?:boolean;error?:string};
   if(!response.ok||result.configured!==true)throw new Error(result.error??'保存未成功，请重试。');
   setValue('');setVisible(false);setMessage('已保存到本机，接下来的 AI 对话会使用你的 key。');
   try{await onConfigured()}catch{setMessage('密钥已保存到本机，请刷新页面以同步连接状态。')}
  }catch(cause){setError(true);setMessage(cause instanceof Error?cause.message:'无法连接本机服务，请重试。')}
  finally{setSaving(false)}
 }

 return <section className="api-key-settings" aria-labelledby="api-key-title">
  <h4 id="api-key-title"><KeyRound size={17}/> 使用你自己的 API key</h4>
  <p>{configured?'本机已配置 key。填写新 key 后保存即可更换。':'填写你的 OpenAI API key，连接 AI 教练。知识卡和本机笔记无需 key。'}</p>
  <form onSubmit={event=>void save(event)}>
   <label htmlFor="openai-key-input">OpenAI API key</label>
   <div className="api-key-input">
    <input id="openai-key-input" type={visible?'text':'password'} autoComplete="off" spellCheck={false} autoCapitalize="none" value={value} onChange={event=>{setValue(event.target.value);setMessage('')}} maxLength={512} placeholder="sk-…" disabled={saving} aria-describedby="api-key-privacy"/>
    <button className="icon-btn" type="button" aria-label={visible?'隐藏 API key':'显示 API key'} aria-pressed={visible} onClick={()=>setVisible(current=>!current)} disabled={saving}>{visible?<EyeOff size={17}/>:<Eye size={17}/>}</button>
   </div>
   <p id="api-key-privacy" className="api-key-privacy">只保存到本机的 .env.local，不写入浏览器备份或 Git 仓库。AI 请求按你的 OpenAI 账户计费。</p>
   <button className="btn-primary" type="submit" disabled={saving||!value.trim()}>{saving?<LoaderCircle className="spin" size={15}/>:<CheckCircle2 size={15}/>} {saving?'正在保存…':configured?'保存并更换 key':'保存到本机'}</button>
  </form>
  {message&&<p className={`api-key-message ${error?'failed':''}`} role={error?'alert':'status'}>{message}</p>}
 </section>;
}
