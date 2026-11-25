import type {El} from '../store';
import {resolve} from './art';import type {PStyle} from './art';import {getLines} from './rich';
let cx:CanvasRenderingContext2D|null|undefined;
const ctx=()=>{if(cx!==undefined)return cx;try{cx=typeof document==='undefined'?null:document.createElement('canvas').getContext('2d')}catch{cx=null}return cx};
const fnt=(e:El,bold?:boolean)=>`${e.t==='btn'?(e.b||bold?700:600):(e.b||bold?700:500)} ${e.fs??16}px Inter, system-ui, sans-serif`;
const tw=(s:string,e:El,bold?:boolean)=>{const c=ctx();const ls=(e.ls??0)*s.length;if(!c)return s.length*(e.fs??16)*(bold?.6:.56)+ls;c.font=fnt(e,bold);return c.measureText(s).width+ls};
/** разбиение абзацев по словам под заданную ширину, как это делает браузер при pre-wrap */
const lines=(text:string,e:El,maxW:number)=>{let n=0;for(const para of text.split('\n')){const words=para.split(' ');let cur='';n++;for(const w of words){const t=cur?cur+' '+w:w;if(cur&&tw(t,e)>maxW){n++;cur=w}else cur=t}}return n};
/** размер по содержимому: text w = авто-ширина, h = авто-высота; btn и input только ширина */
export function hugSize(e0:El,st?:PStyle):{w?:number;h?:number}|null{
const e=resolve(e0,st);const fs=e.fs??16;const lh=fs*(e.lh??1.3);const txt=e.text??'';
if(e.t==='text'){if(e.hug==='h'){return{h:Math.max(20,Math.ceil(lines(txt,e,Math.max(8,e.w-(e.lt?fs*1.5:0)))*lh)+2)}}
const ind=e.lt?fs*1.5:0;const rl=getLines(e0).map(l=>l.reduce((a,sp)=>a+tw(sp.t,e,!!sp.b),0));const ls=txt.split('\n');return{w:Math.max(16,Math.ceil(Math.max(...(rl.length?rl:ls.map(l=>tw(l,e))))+2+ind)),h:Math.max(20,Math.ceil(ls.length*lh)+2)}}
/* по высоте: ширина остаётся, текст переносится, элемент растёт до нужной высоты, но не ниже заданной */
if((e.t==='btn'||e.t==='input')&&e.hug==='b'){const ls=txt.split('\n');const pw=e.t==='btn'?48:28;const pv=e.t==='btn'?24:20;return{w:Math.max(e.t==='btn'?64:96,Math.ceil(Math.max(...ls.map(l=>tw(l,e))))+pw),h:Math.max(e.mh??44,Math.ceil(ls.length*lh)+pv)}}
if((e.t==='btn'||e.t==='input')&&e.hug==='h'){const pw=e.t==='btn'?32:28;const pv=e.t==='btn'?24:20;return{h:Math.max(e.mh??44,Math.ceil(lines(txt,e,Math.max(8,e.w-pw))*lh)+pv)}}
if(e.t==='btn')return{w:Math.max(64,Math.ceil(tw(txt,e))+48)};
if(e.t==='input')return{w:Math.max(96,Math.ceil(tw(txt,e))+28)};
return null}
/** число строк текста элемента при его ширине (для проверки «до 4 строк») */
export const textLines=(e0:El,st?:PStyle)=>{const e=resolve(e0,st);const w=e.t==='btn'?e.w-32:e.t==='input'?e.w-28:e.w;return lines(e.text??'',e,Math.max(8,w))};
