import type {El} from '../store';
/** Ctrl+Alt+A: все элементы блока того же вида, что выделенные (тип, роль, акцент, размер шрифта, заливка) */
export function matchingIds(els:El[],sel:string[]):string[]{
const s=els.filter(x=>sel.includes(x.id));if(!s.length)return[];
const key=(x:El)=>[x.t,x.role??'',x.acc?1:0,x.fs??'',x.fill??'',x.sh??''].join('|');
const ks=new Set(s.map(key));return els.filter(x=>!x.lk&&ks.has(key(x))).map(x=>x.id)}
/** Ctrl+Shift+A: всё, кроме выделенного (замкнутое не берём) */
export const invertIds=(els:El[],sel:string[]):string[]=>els.filter(x=>!x.lk&&!sel.includes(x.id)).map(x=>x.id);
/** Если выделена ровно одна целая группа, вернёт её id */
export function wholeGroup(els:El[],sel:string[]):string|null{
if(sel.length<2)return null;const g=els.find(x=>x.id===sel[0])?.g;if(!g)return null;
const ms=els.filter(x=>x.g===g);return ms.length===sel.length&&ms.every(m=>sel.includes(m.id))?g:null}
