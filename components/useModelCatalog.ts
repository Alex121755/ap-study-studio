"use client";

import {useCallback,useEffect,useRef,useState} from "react";

const MODEL_STORE='ap-atlas-model';
const CATALOG_STORE='ap-atlas-model-catalog-v1';
const FALLBACK=['gpt-4.1-mini','gpt-4.1','gpt-5-mini'];
type Source='loading'|'api'|'stale'|'cache'|'fallback';
const validId=(value:unknown):value is string=>typeof value==='string'&&value.length<=120&&/^gpt-(?:4\.1|5|6)(?:[.-][a-z0-9]+)*$/.test(value);
function modelIds(value:unknown):string[]|null {
 if(!Array.isArray(value)||!value.length||value.length>80||!value.every(validId))return null;
 return [...new Set(value)];
}

export default function useModelCatalog(){
 const [model,setModel]=useState(FALLBACK[0]);
 const [models,setModels]=useState<string[]>(FALLBACK);
 const [source,setSource]=useState<Source>('loading');
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const lastGood=useRef<string[]|null>(null);
 const request=useRef<AbortController|null>(null);

 const chooseModel=useCallback((value:string)=>{
  if(!validId(value))return;
  setModel(value);
  try{localStorage.setItem(MODEL_STORE,value)}catch{}
 },[]);

 const refresh=useCallback(async(forceRefresh=false)=>{
  request.current?.abort();
  const controller=new AbortController();request.current=controller;
  setLoading(true);setError('');
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await fetch(`/api/models${forceRefresh?'?refresh=1':''}`,{cache:'no-store',signal:controller.signal});
   const data=await response.json() as {models?:unknown;source?:unknown;error?:unknown};
   const ids=modelIds(data.models);
   if(!response.ok||!ids||!['api','stale','fallback'].includes(String(data.source)))throw new Error('模型列表同步失败');
   if(request.current!==controller)return;
   if(data.source==='api'||data.source==='stale'){
    lastGood.current=ids;setModels(ids);setSource(data.source);
    if(data.source==='api')try{localStorage.setItem(CATALOG_STORE,JSON.stringify({models:ids}))}catch{}
   }else if(lastGood.current){
    setModels(lastGood.current);setSource('cache');
   }else{setModels(ids);setSource('fallback')}
   const message=typeof data.error==='string'?data.error.slice(0,300):'';
   setError(lastGood.current?message.replace(/当前显示默认列表。?/g,'保留上次成功同步的列表。'):message);
  }catch{
   if(request.current!==controller)return;
   if(lastGood.current){setModels(lastGood.current);setSource('cache')}
   else setSource('fallback');
   setError(lastGood.current?'同步暂未成功，已保留上次模型列表和你的选择，请重试刷新。':'模型列表同步失败，目前仅有备用选项，请重试刷新。');
  }finally{
   clearTimeout(timeout);
   if(request.current===controller){setLoading(false);request.current=null}
  }
 },[]);

 useEffect(()=>{
  let active=true;
  // Hydrate browser-only preferences after mount; skip an abandoned Strict Mode mount.
  queueMicrotask(()=>{
   if(!active)return;
   try{
    const preferred=localStorage.getItem(MODEL_STORE);
    if(validId(preferred))setModel(preferred);
    const saved=localStorage.getItem(CATALOG_STORE);
    const cached=saved?modelIds(JSON.parse(saved)?.models):null;
    if(cached){lastGood.current=cached;setModels(cached);setSource('cache')}
   }catch{}
   void refresh();
  });
  return()=>{active=false;request.current?.abort();request.current=null};
 },[refresh]);

 return {model,models,source,error,loading,chooseModel,refresh};
}

export type ModelCatalog=ReturnType<typeof useModelCatalog>;
