import {loadSnapsRaw,saveSnapsRaw,isQuota} from './vault';
import type {Project} from '../store';
/** снимок проекта: полная копия на момент сохранения */
export interface Snap{id:string;pid:string;name:string;at:number;sheets:number;blocks:number;p:Project}
export const SNAP_MAX=15;
let cache:Snap[]|null=null;
export async function loadSnaps():Promise<Snap[]>{const r=await loadSnapsRaw();cache=Array.isArray(r)?(r as Snap[]):[];return cache}
/** снимки одного проекта, новые сверху */
export const ofProject=(all:Snap[],pid:string)=>all.filter(x=>x.pid===pid).sort((a,b)=>b.at-a.at);
const count=(p:Project)=>({sheets:p.sheets.length,blocks:p.sheets.reduce((n,s)=>n+s.blocks.length,0)});
/** добавить снимок; старые снимки этого проекта сверх лимита удаляются. Бросает ошибку, если нет места */
export async function addSnap(p:Project,name:string):Promise<Snap[]>{
const all=cache??await loadSnaps();
const s:Snap={id:Math.random().toString(36).slice(2,10)+Date.now().toString(36),pid:p.id,name:name.trim()||'Без названия',at:Date.now(),...count(p),p:JSON.parse(JSON.stringify(p))};
let next=[s,...all];
const mine=ofProject(next,p.id);if(mine.length>SNAP_MAX){const drop=new Set(mine.slice(SNAP_MAX).map(x=>x.id));next=next.filter(x=>!drop.has(x.id))}
try{await saveSnapsRaw(next)}catch(e){throw isQuota(e)?new Error('quota'):e}
cache=next;return next}
export async function delSnap(id:string):Promise<Snap[]>{const all=cache??await loadSnaps();const next=all.filter(x=>x.id!==id);await saveSnapsRaw(next);cache=next;return next}
export const fmtAt=(t:number)=>new Date(t).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
