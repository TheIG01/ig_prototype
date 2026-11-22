import type {El} from '../store';
/** Выделение как в Figma. Без клавиш: элемент или вся его группа. Shift: диапазон от последнего выбранного до кликнутого. Ctrl/Cmd: добавить или убрать один элемент. Ctrl+Shift: добавить один элемент, ничего не снимая. */
export interface Mods{shift:boolean;mod:boolean}
export const modsOf=(e:{shiftKey:boolean;ctrlKey:boolean;metaKey:boolean}):Mods=>({shift:e.shiftKey,mod:e.ctrlKey||e.metaKey});
/** текущее выделение: выбранные элементы или один текущий */
export const curSel=(multi:string[],elId:string|null):string[]=>elId&&multi.includes(elId)?multi:elId?[elId]:[];
export function pickIds(els:El[],cur:string[],anchor:string|null,id:string,m:Mods):string[]{
const grp=()=>{const x=els.find(q=>q.id===id);return x?.g?els.filter(q=>q.g===x.g).map(q=>q.id):[id]};
if(m.mod&&m.shift)return cur.includes(id)?cur:[...cur,id];
if(m.mod)return cur.includes(id)?cur.filter(i=>i!==id):[...cur,id];
if(m.shift){const a=anchor?els.findIndex(q=>q.id===anchor):-1;const b=els.findIndex(q=>q.id===id);if(a<0||b<0)return grp();
const r=els.slice(Math.min(a,b),Math.max(a,b)+1).map(q=>q.id);return a<=b?r:r.reverse()}
return grp()}
