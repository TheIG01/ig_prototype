import type {Block,Sheet} from '../store';import type {Dev} from './dev';
/** Комментарии (1.55): пин в точке блока, ветка сообщений, статус «решено». Координаты от левого верхнего угла блока на своём устройстве */
export interface CmMsg{id:string;by:string;at:number;text:string}
export interface Cm{id:string;dev:Dev;x:number;y:number;msgs:CmMsg[];done?:1}
export type CmFilter='all'|'open'|'done';
export const CM_AU='igp.author';
export const getAuthor=():string=>{try{return(localStorage.getItem(CM_AU)||'').slice(0,40)}catch{return''}};
export const setAuthor=(v:string)=>{try{localStorage.setItem(CM_AU,v.slice(0,40))}catch{/* хранилище недоступно */}};
export const cmWhen=(t:number)=>new Date(t).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
/** номера комментариев по листу: по порядку блоков и по порядку добавления, одни и те же на холсте, в ТЗ, HTML и PDF */
export const cmNums=(blocks:Block[]):Map<string,number>=>{const m=new Map<string,number>();let n=0;for(const b of blocks)for(const c of b.cmt??[])m.set(c.id,++n);return m};
export const cmCount=(blocks:Block[]):{all:number;open:number;done:number}=>{let o=0,d=0;for(const b of blocks)for(const c of b.cmt??[])c.done?d++:o++;return{all:o+d,open:o,done:d}};
export const cmShow=(c:Cm,f:CmFilter)=>f==='all'||(f==='done'?!!c.done:!c.done);
const DN:Record<Dev,string>={desktop:'Desktop',tablet:'Tablet',mobile:'Mobile'};
/** комментарии блока для ТЗ (Markdown); '' если их нет. Нумерация листа передаётся в nums */
export const cmMd=(b:Block,nums?:Map<string,number>):string=>{const a=b.cmt??[];if(!a.length)return'';
return`#### Комментарии к блоку\n`+a.map(c=>{const n=nums?.get(c.id);return`- ${n?'№'+n+' · ':''}${DN[c.dev]}, точка x${Math.round(c.x)} y${Math.round(c.y)} · ${c.done?'решено':'открыто'}\n`+c.msgs.map(m=>`  - ${m.by||'Автор'}, ${cmWhen(m.at)}: ${m.text.replace(/\n/g,' ')}`).join('\n')}).join('\n')+'\n\n'};
export const cmJson=(b:Block)=>(b.cmt??[]).map(c=>({device:c.dev,x:Math.round(c.x),y:Math.round(c.y),status:c.done?'resolved':'open',thread:c.msgs.map(m=>({author:m.by||'Автор',at:new Date(m.at).toISOString(),text:m.text}))}));
export const sheetCm=(s:Sheet)=>cmCount(s.blocks);
/** безопасная нормализация при открытии старых проектов: плохие записи убираются */
export function fixCm(b:{cmt?:unknown}):void{const a=b.cmt;if(a===undefined)return;if(!Array.isArray(a)){delete b.cmt;return}
const ok=(a as unknown[]).filter((c):c is Cm=>{const q=c as Partial<Cm>|null;return!!q&&typeof q==='object'&&typeof q.id==='string'&&(q.dev==='desktop'||q.dev==='tablet'||q.dev==='mobile')&&typeof q.x==='number'&&typeof q.y==='number'&&Array.isArray(q.msgs)}).map(c=>({...c,msgs:c.msgs.filter(m=>!!m&&typeof m.text==='string'&&typeof m.at==='number').map(m=>({id:String(m.id??''),by:typeof m.by==='string'?m.by:'',at:m.at,text:m.text})),...(c.done?{done:1 as const}:{})}));
if(ok.length)b.cmt=ok;else delete b.cmt}
