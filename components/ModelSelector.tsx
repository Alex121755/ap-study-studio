"use client";

import {RefreshCw} from 'lucide-react';
import type {ModelCatalog} from './useModelCatalog';

export default function ModelSelector({catalog,id,disabled=false}:{catalog:ModelCatalog;id:string;disabled?:boolean}){
 const {model,models,source,error,loading,chooseModel,refresh}=catalog;
 const aliases=models.filter(m=>!/-\d{4}-\d{2}-\d{2}$/.test(m));
 const snapshots=models.filter(m=>/-\d{4}-\d{2}-\d{2}$/.test(m));
 const missing=!models.includes(model);
 const sourceLabel=source==='api'?'已从 API 同步':source==='stale'||source==='cache'?'上次同步的列表':source==='loading'?'正在同步模型':'备用模型列表';
 return <div className="model-picker">
  <div className="coach-model">
   <label htmlFor={id}>对话模型</label>
   <select id={id} aria-label={id==='coach-model-select'?'AI 教练模型':'设置对话模型'} aria-describedby={`${id}-status`} value={model} disabled={disabled} onChange={e=>chooseModel(e.target.value)}>
    {missing&&<option value={model}>{model}（上次选择，待确认）</option>}
    {!!aliases.length&&<optgroup label="模型别名 · 新版本优先">{aliases.map(m=><option key={m} value={m}>{m}</option>)}</optgroup>}
    {!!snapshots.length&&<optgroup label="固定日期版本">{snapshots.map(m=><option key={m} value={m}>{m}</option>)}</optgroup>}
   </select>
   <button className="icon-btn" aria-label={id==='coach-model-select'?'刷新项目可用模型':'设置中刷新模型'} title="重新从 API 获取模型列表" disabled={loading||disabled} onClick={()=>void refresh(true)}><RefreshCw size={15} className={loading?'spin':''}/></button>
  </div>
  <div id={`${id}-status`} className={`model-status ${error||missing?'model-warning':''}`} role="status">
   <span>{loading?'正在从 API 同步…':`${sourceLabel} · ${models.length} 个模型`}</span>
   {!loading&&source==='api'&&aliases[0]&&<span> · 新版本在前：{aliases[0]}</span>}
   {error&&<p>{error}</p>}
   {missing&&!loading&&<p>当前列表未确认 {model}；已保留选择，可刷新列表或选择其他模型。</p>}
  </div>
 </div>;
}
