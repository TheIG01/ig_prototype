import {useEffect,useRef,useState} from 'react';
/** быстрый ввод: экран обновляется сразу, store раз в кадр (ms=0) или после паузы (ms>0). Хвост всегда сохраняется: flush и размонтирование */
export function useLive<T>(value:T,commit:(v:T)=>void,ms=0):[T,(v:T)=>void,()=>void]{
const [v,setV]=useState(value);const cb=useRef(commit);cb.current=commit;
const last=useRef(value);const tm=useRef<number|null>(null);const dirty=useRef(false);
const run=()=>{tm.current=null;if(dirty.current){dirty.current=false;cb.current(last.current)}};
const flush=()=>{if(tm.current!==null){if(ms)clearTimeout(tm.current);else cancelAnimationFrame(tm.current)}run()};
const set=(x:T)=>{setV(x);last.current=x;dirty.current=true;if(tm.current===null)tm.current=ms?window.setTimeout(run,ms):requestAnimationFrame(run)};
useEffect(()=>{if(!dirty.current)setV(value)},[value]);
useEffect(()=>()=>flush(),[]);// eslint-disable-line
return[v,set,flush]}
