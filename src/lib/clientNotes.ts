import type {Project} from '../store';import type {Dev} from './dev';import type {Cm} from './comments';
/** Заметки заказчика (1.67): заказчик ставит точки в скачанном HTML, скачивает файл, а здесь файл превращается в комментарии-пины */
export interface CNote{id:string;sheet:string;block:string;dev:Dev;x:number;y:number;text:string;by:string;at:number}
export const NOTES_KIND='igp-notes';
const DV=['desktop','tablet','mobile'];
const num=(v:unknown,d:number)=>typeof v==='number'&&isFinite(v)?v:d;
/** безопасный разбор файла: плохие записи пропускаются, чужой файл даёт понятную ошибку */
export function parseNotes(src:string):{ok:true;project:string;notes:CNote[]}|{ok:false;err:string}{
let j:unknown;try{j=JSON.parse(src)}catch{return{ok:false,err:'Файл не читается. Нужен файл заметок из прототипа'}}
const o=j as {kind?:unknown;project?:unknown;notes?:unknown}|null;
if(!o||typeof o!=='object'||o.kind!==NOTES_KIND||!Array.isArray(o.notes))return{ok:false,err:'Это не файл заметок заказчика'};
const notes:CNote[]=[];
for(const r of o.notes as unknown[]){const q=r as Partial<Record<keyof CNote,unknown>>|null;if(!q||typeof q!=='object')continue;
const text=typeof q.text==='string'?q.text.trim().slice(0,2000):'';
if(!text||typeof q.id!=='string'||typeof q.block!=='string'||!DV.includes(q.dev as string))continue;
notes.push({id:q.id.slice(0,40),sheet:typeof q.sheet==='string'?q.sheet:'',block:q.block,dev:q.dev as Dev,x:num(q.x,0),y:num(q.y,0),text,by:typeof q.by==='string'?q.by.trim().slice(0,40):'',at:num(q.at,Date.now())})}
return{ok:true,project:typeof o.project==='string'?o.project:'',notes}}
/** ставит заметки пинами в нужные блоки; повторная загрузка того же файла ничего не дублирует (id пина = cn + id заметки) */
export function applyNotes(p:Project,notes:CNote[]):{project:Project;added:number;dup:number;lost:number}{
const np=JSON.parse(JSON.stringify(p)) as Project;let added=0,dup=0,lost=0;
for(const n of notes){const id='cn'+n.id;let hit=false;
for(const s of np.sheets){const b=s.blocks.find(x=>x.id===n.block);if(!b)continue;hit=true;
if((b.cmt??[]).some(c=>c.id===id)){dup++;break}
const c:Cm={id,dev:n.dev,x:Math.round(Math.max(0,n.x)),y:Math.round(Math.max(0,Math.min(b.h[n.dev]??n.y,n.y))),msgs:[{id:id+'m',by:n.by||'Заказчик',at:n.at,text:n.text}]};
(b.cmt??=[]).push(c);added++;break}
if(!hit)lost++}
return{project:np,added,dup,lost}}
