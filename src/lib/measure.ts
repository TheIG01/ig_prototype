import type {El} from '../store';
import {resolve} from './art';import type {PStyle} from './art';
let cx:CanvasRenderingContext2D|null|undefined;
const ctx=()=>{if(cx!==undefined)return cx;try{cx=typeof document==='undefined'?null:document.createElement('canvas').getContext('2d')}catch{cx=null}return cx};
const fnt=(e:El)=>`${e.t==='btn'?(e.b?700:600):(e.b?700:500)} ${e.fs??16}px Inter, system-ui, sans-serif`;
const tw=(s:string,e:El)=>{const c=ctx();if(!c)return s.length*(e.fs??16)*.56;c.font=fnt(e);return c.measureText(s).width};
/** разбиение абзацев по словам под заданную ширину, как это делает браузер при pre-wrap */
const lines=(text:string,e:El,maxW:number)=>{let n=0;for(const para of text.split('\n')){const words=para.split(' ');let cur='';n++;for(const w of words){const t=cur?cur+' '+w:w;if(cur&&tw(t,e)>maxW){n++;cur=w}else cur=t}}return n};
/** размер по содержимому: text w = авто-ширина, h = авто-высота; btn и input только ширина */
export function hugSize(e0:El,st?:PStyle):{w?:number;h?:number}|null{
const e=resolve(e0,st);const fs=e.fs??16;const lh=fs*1.3;const txt=e.text??'';
if(e.t==='text'){if(e.hug==='h'){return{h:Math.max(20,Math.ceil(lines(txt,e,Math.max(8,e.w))*lh)+2)}}
const ls=txt.split('\n');return{w:Math.max(16,Math.ceil(Math.max(...ls.map(l=>tw(l,e)))+2)),h:Math.max(20,Math.ceil(ls.length*lh)+2)}}
if(e.t==='btn')return{w:Math.max(64,Math.ceil(tw(txt,e))+48)};
if(e.t==='input')return{w:Math.max(96,Math.ceil(tw(txt,e))+28)};
return null}
