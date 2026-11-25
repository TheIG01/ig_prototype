import type {Project,El} from '../store';
import {DEVS} from './dev';import type {Dev} from './dev';
import {parseLink,linkOf,spanLinks} from './rich';
/** проверка проекта перед экспортом: список проблем с адресом (лист, блок, элемент) */
export type Sev='err'|'warn';
export type Kind='empty'|'goal'|'link'|'form';
export interface Issue{key:string;sev:Sev;kind:Kind;msg:string;sheetId:string;sheetName:string;blockId:string;blockTitle:string;elId?:string;dev?:Dev}
export const KIND_NAMES:Record<Kind,string>={empty:'Пустые тексты',goal:'Не заполнена «Задача текста»',link:'Ссылки в никуда',form:'Формы без обязательных полей'};
const isForm=(e:El)=>e.t==='input'&&!!e.ff;
export function checkProject(p:Project):Issue[]{
const out:Issue[]=[];
const ids=new Set<string>();for(const s of p.sheets){ids.add(s.id);for(const b of s.blocks)ids.add(b.id)}
for(const s of p.sheets)for(const b of s.blocks){
const at={sheetId:s.id,sheetName:s.name,blockId:b.id,blockTitle:b.title};
if(!(b.goal??'').trim())out.push({...at,key:b.id+':goal',sev:'warn',kind:'goal',msg:'Не заполнена «Задача текста» блока'});
const seen=new Set<string>();let forms=0,req=0;
for(const dev of DEVS){
if(b.dv&&!b.dv.includes(dev))continue;
for(const e of b.els[dev]){
if(seen.has(e.id)||e.hid)continue;seen.add(e.id);
const nm=(e.nm||e.text||'').replace(/\s+/g,' ').trim().slice(0,40);
if((e.t==='text'||e.t==='btn')&&!e.text.trim())out.push({...at,key:e.id+':empty',sev:'err',kind:'empty',msg:(e.t==='btn'?'Кнопка без текста':'Пустой текст'),elId:e.id,dev});
const raw=linkOf(e);
if(raw!==undefined&&raw!==''){const l=parseLink(raw);
if(!l||!l.v.trim())out.push({...at,key:e.id+':ln',sev:'err',kind:'link',msg:'Ссылка не заполнена: «'+(nm||'элемент')+'»',elId:e.id,dev});
else if((l.k==='sheet'||l.k==='block')&&!ids.has(l.v.trim()))out.push({...at,key:e.id+':ln',sev:'err',kind:'link',msg:'Ссылка ведёт на удалённое место: «'+(nm||'элемент')+'»',elId:e.id,dev})}
let n=0;for(const sp of spanLinks(e)){const l=parseLink(sp.h);n++;if(l&&(l.k==='sheet'||l.k==='block')&&!ids.has(l.v.trim()))out.push({...at,key:e.id+':sp'+n,sev:'err',kind:'link',msg:'Ссылка в слове «'+sp.text.slice(0,30)+'» ведёт на удалённое место',elId:e.id,dev})}
if(isForm(e)){forms++;if(e.ff?.req)req++}
}}
if(forms>0&&req===0)out.push({...at,key:b.id+':form',sev:'warn',kind:'form',msg:'В форме ('+forms+' '+(forms===1?'поле':'полей')+') нет ни одного обязательного поля'});
}
return out}
