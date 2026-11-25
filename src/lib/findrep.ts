/** Поиск и замена текста по проекту (1.64): тексты и кнопки на всех устройствах, тексты формы (спасибо, согласие). */
import type {Project,Block,El} from '../store';
import {DEVS} from './dev';
import type {Dev} from './dev';
import {getLines,toPatch} from './rich';
import type {Span} from './rich';

export interface FOpt{cs:boolean;word:boolean}
export interface Row{key:string;sheetId:string;sheet:string;blockId:string;block:string;label:string;devs:Dev[];count:number;pre:string;hit:string;post:string}

const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const L='[\\p{L}\\p{N}_]';
/** регулярка по запросу; null, если запрос пустой */
export function mkRe(q:string,o:FOpt):RegExp|null{
if(!q)return null;
const body=esc(q);
return new RegExp((o.word?'(?<!'+L+')':'')+body+(o.word?'(?!'+L+')':''),'gu'+(o.cs?'':'i'))}

/** куски строки: замена внутри куска сохраняет его вид, совпадение через несколько кусков берёт вид первого */
export function replLine(line:Span[],re:RegExp,r:string):Span[]{
const str=line.map(s=>s.t).join('');
re.lastIndex=0;
const ms=[...str.matchAll(re)];
if(!ms.length)return line;
const owner:number[]=[];
line.forEach((s,i)=>{for(let k=0;k<s.t.length;k++)owner.push(i)});
const out:Span[]=line.map(s=>({...s,t:''}));
let pos=0;
for(const m of ms){const a=m.index as number,b=a+m[0].length;
for(let k=pos;k<a;k++)out[owner[k]].t+=str[k];
out[owner[a]].t+=r;pos=b}
for(let k=pos;k<str.length;k++)out[owner[k]].t+=str[k];
return out.filter(s=>s.t!=='')}

const countIn=(t:string,re:RegExp)=>{re.lastIndex=0;return [...t.matchAll(re)].length};
const snip=(t:string,re:RegExp):{pre:string;hit:string;post:string}=>{
re.lastIndex=0;const m=re.exec(t);if(!m)return{pre:'',hit:'',post:''};
const a=m.index,b=a+m[0].length;
return{pre:(a>24?'…':'')+t.slice(Math.max(0,a-24),a),hit:m[0],post:t.slice(b,b+24)+(b+24<t.length?'…':'')}};

const FM:[keyof NonNullable<Block['fm']>,string][]=[['thanks','Форма: текст «Спасибо»'],['consent','Форма: согласие']];
const elLabel=(e:El)=>e.t==='btn'?'Кнопка':'Текст';
const elKey=(b:Block,e:El)=>'e|'+b.id+'|'+e.text;
const fmKey=(b:Block,f:string,t:string)=>'f|'+b.id+'|'+f+'|'+t;

/** найденные места: одинаковые тексты одного блока на разных устройствах идут одной строкой */
export function findAll(pr:Project,q:string,o:FOpt,only?:string|null):Row[]{
const re=mkRe(q,o);if(!re)return[];
const rows:Row[]=[];
for(const s of pr.sheets){if(only&&s.id!==only)continue;for(const b of s.blocks){
const map=new Map<string,Row>();
for(const d of DEVS){if(b.dv&&!b.dv.includes(d))continue;
for(const e of b.els[d]){if(!e.text)continue;const c=countIn(e.text,re);if(!c)continue;
const k=elKey(b,e);const ex=map.get(k);
if(ex){if(!ex.devs.includes(d)){ex.devs.push(d);ex.count+=c}}
else{const r:Row={key:k,sheetId:s.id,sheet:s.name,blockId:b.id,block:b.title,label:elLabel(e),devs:[d],count:c,...snip(e.text,re)};map.set(k,r)}}}
rows.push(...map.values());
for(const [f,label] of FM){const t=b.fm?.[f];if(!t)continue;const c=countIn(t,re);if(!c)continue;
rows.push({key:fmKey(b,f,t),sheetId:s.id,sheet:s.name,blockId:b.id,block:b.title,label,devs:[],count:c,...snip(t,re)})}}}
return rows}

/** замена прямо в черновике проекта; skip: ключи строк, которые не трогать. Возвращает число замен */
export function applyAll(pr:Project,q:string,r:string,o:FOpt,skip:ReadonlySet<string>,only?:string|null):number{
const re=mkRe(q,o);if(!re)return 0;let n=0;
for(const s of pr.sheets){if(only&&s.id!==only)continue;for(const b of s.blocks){
for(const d of DEVS){if(b.dv&&!b.dv.includes(d))continue;
for(const e of b.els[d]){if(!e.text||skip.has(elKey(b,e)))continue;const c=countIn(e.text,re);if(!c)continue;
const lines=getLines(e).map(l=>replLine(l,re,r));const p=toPatch(lines);
e.text=p.text;if(p.rt)e.rt=p.rt;else delete e.rt;n+=c}}
for(const [f] of FM){const t=b.fm?.[f];if(!t||!b.fm||skip.has(fmKey(b,f,t)))continue;const c=countIn(t,re);if(!c)continue;
b.fm[f]=t.replace(re,()=>r);n+=c}}}
return n}
