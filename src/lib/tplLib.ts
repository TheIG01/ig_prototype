// Библиотека шаблонов: группы, порядок, избранное и слияние для синхронизации между устройствами.
// Все функции меняют черновик Data (immer) и ставят метки времени: по ним решается, чья правка новее.
import type {Data,BlockTpl,Block} from '../store';
import {fresh} from './tplCore';
import {uid} from './uid';

/** группа для шаблонов без группы */
export const NOCAT='Мои шаблоны';
/** t время последней правки порядка и групп; cats порядок своих групп; catOrd и itemOrd порядок готовых групп и макетов; fav избранное; del метки удаления (id → время) */
export interface TplMeta{t:number;cats:string[];catOrd:string[];itemOrd:Record<string,string[]>;fav?:string[];hid?:string[];del:Record<string,number>}
export interface TplPayload{v:1;tpls:BlockTpl[];meta:TplMeta}
export const emptyMeta=():TplMeta=>({t:0,cats:[],catOrd:[],itemOrd:{},del:{}});
export const metaView=(d:Data):TplMeta=>({...emptyMeta(),...(d.tplMeta??{})});
const meta=(d:Data):TplMeta=>{const m=(d.tplMeta??=emptyMeta());m.cats??=[];m.catOrd??=[];m.itemOrd??={};m.del??={};m.hid??=[];return m};
export const catOf=(t:{cat?:string})=>t.cat||NOCAT;
const now=()=>Date.now();
const bump=(d:Data)=>{meta(d).t=now()};
const stamp=(t:BlockTpl)=>{t.u=now()};

/** свои группы по порядку: сначала заданный порядок, потом новые из шаблонов */
export const userCats=(d:{blockTpls:BlockTpl[];tplMeta?:TplMeta}):string[]=>{const out=[...(d.tplMeta?.cats??[])];for(const t of d.blockTpls){const c=catOf(t);if(!out.includes(c))out.push(c)}return out};
/** порядок из сохранённого списка; всё новое встаёт в конец в исходном порядке */
export const applyOrder=(all:string[],saved?:string[])=>{if(!saved?.length)return all;const s=saved.filter(x=>all.includes(x));return[...s,...all.filter(x=>!s.includes(x))]};
/** перенос элемента списка перед другим (before=null: в конец) */
export const moveIn=(list:string[],id:string,before:string|null)=>{const a=list.filter(x=>x!==id);const i=before?a.indexOf(before):-1;if(i<0)a.push(id);else a.splice(i,0,id);return a};

export const addCat=(d:Data,name:string)=>{const n=name.trim();if(!n)return;const m=meta(d);const l=userCats(d);if(!l.includes(n))l.push(n);m.cats=l;bump(d)};
export const renameCat=(d:Data,old:string,nw:string)=>{const n=nw.trim();if(!n||n===old)return;const l=userCats(d).map(c=>c===old?n:c);for(const t of d.blockTpls)if(catOf(t)===old){t.cat=n===NOCAT?undefined:n;stamp(t)}meta(d).cats=[...new Set(l)];bump(d)};
/** удаление группы: шаблоны остаются и уходят в «Мои шаблоны» */
export const delCat=(d:Data,name:string)=>{if(name===NOCAT)return;const m=meta(d);for(const t of d.blockTpls)if(catOf(t)===name){t.cat=undefined;stamp(t)}m.cats=userCats(d).filter(c=>c!==name);if(!m.cats.includes(NOCAT)&&d.blockTpls.some(t=>!t.cat))m.cats.push(NOCAT);bump(d)};
export const reorderCats=(d:Data,list:string[])=>{meta(d).cats=list;bump(d)};
export const setLibOrder=(d:Data,p:{catOrd?:string[];itemOrd?:Record<string,string[]>})=>{const m=meta(d);if(p.catOrd)m.catOrd=p.catOrd;if(p.itemOrd)m.itemOrd={...m.itemOrd,...p.itemOrd};bump(d)};
/** скрыть или вернуть готовые группы ('c:Имя') и макеты ('b:Имя') */
export const setHidden=(d:Data,l:string[])=>{meta(d).hid=l;bump(d)};
/** удалить сразу несколько шаблонов */
export const delTpls=(d:Data,ids:string[])=>{const m=meta(d);const s=new Set(ids);d.blockTpls=d.blockTpls.filter(t=>!s.has(t.id));for(const i of ids)m.del[i]=now();bump(d)};
/** переместить несколько шаблонов в группу */
export const moveTpls=(d:Data,ids:string[],cat:string)=>{const s=new Set(ids);for(const t of d.blockTpls)if(s.has(t.id)){t.cat=cat===NOCAT?undefined:cat;stamp(t)}bump(d)};
/** удалить группу вместе с её шаблонами */
export const delCatAll=(d:Data,name:string)=>{const m=meta(d);const ids=d.blockTpls.filter(t=>catOf(t)===name).map(t=>t.id);d.blockTpls=d.blockTpls.filter(t=>catOf(t)!==name);for(const i of ids)m.del[i]=now();m.cats=userCats(d).filter(c=>c!==name);bump(d)};
export const setFav=(d:Data,l:string[])=>{meta(d).fav=l;bump(d)};

/** шаблон в группу cat (если задана) и перед другим шаблоном (null: в конец) */
export const moveTpl=(d:Data,id:string,to:{cat?:string;before?:string|null}):boolean=>{const a=d.blockTpls;const i=a.findIndex(t=>t.id===id);if(i<0||to.before===id)return false;const [t]=a.splice(i,1);if(to.cat!==undefined){t.cat=to.cat===NOCAT?undefined:to.cat}
const j=to.before?a.findIndex(x=>x.id===to.before):-1;if(j<0)a.push(t);else a.splice(j,0,t);stamp(t);bump(d);return true};
/** шаг вверх или вниз внутри своей группы */
export const stepTpl=(d:Data,id:string,dir:-1|1)=>{const a=d.blockTpls;const t=a.find(x=>x.id===id);if(!t)return;const sib=a.filter(x=>catOf(x)===catOf(t));const k=sib.indexOf(t)+dir;if(k<0||k>=sib.length)return;const o=sib[k];const i=a.indexOf(t),j=a.indexOf(o);[a[i],a[j]]=[a[j],a[i]];stamp(t);bump(d)};
export const dupTpl=(d:Data,id:string):string|null=>{const a=d.blockTpls;const i=a.findIndex(t=>t.id===id);if(i<0)return null;const c=JSON.parse(JSON.stringify(a[i])) as BlockTpl;c.id=uid();c.name=a[i].name+' (копия)';c.els=fresh(c.els);stamp(c);a.splice(i+1,0,c);bump(d);return c.id};
/** обновить шаблон содержимым блока: имя, группа и теги остаются */
export const refreshTpl=(d:Data,id:string,b:Block):boolean=>{const t=d.blockTpls.find(x=>x.id===id);if(!t||t.set)return false;const c=JSON.parse(JSON.stringify(b)) as Block;t.text=c.text;t.h=c.h;t.els=fresh(c.els);if(c.quiz)t.quiz=c.quiz;else delete t.quiz;if(c.sv)t.st={v:c.sv.v,i:c.sv.i};else delete t.st;stamp(t);return true};
export const delTpl=(d:Data,id:string)=>{d.blockTpls=d.blockTpls.filter(t=>t.id!==id);meta(d).del[id]=now();bump(d)};
export const restoreTpl=(d:Data,t:BlockTpl,at:number)=>{if(d.blockTpls.some(x=>x.id===t.id))return;const m=meta(d);delete m.del[t.id];const c=JSON.parse(JSON.stringify(t)) as BlockTpl;stamp(c);d.blockTpls.splice(Math.max(0,Math.min(at,d.blockTpls.length)),0,c);bump(d)};

/** подпись состояния: одинаковая у двух устройств, когда у них одно и то же */
export const sig=(tpls:BlockTpl[],m:TplMeta)=>tpls.map(t=>t.id+':'+(t.u??0)).join('|')+'#'+m.t+'#'+Object.keys(m.del).length+'#'+m.cats.join(',')+'#'+(m.hid??[]).join(',');
export const sigD=(d:Data)=>sig(d.blockTpls,metaView(d));
export const sigP=(p:TplPayload)=>sig(p.tpls,{...emptyMeta(),...p.meta});
export const payloadOf=(d:Data):TplPayload=>({v:1,tpls:d.blockTpls,meta:metaView(d)});

/** слияние с копией с другого устройства: шаблон берётся там, где правка новее; удаление побеждает более старую правку; порядок и группы берутся у того, кто менял их позже */
export function mergeRemote(d:Data,r:TplPayload){const m=meta(d);const rm={...emptyMeta(),...r.meta};
const del:Record<string,number>={...rm.del};for(const k of Object.keys(m.del))del[k]=Math.max(del[k]??0,m.del[k]);
const old=now()-120*864e5;for(const k of Object.keys(del))if(del[k]<old)delete del[k];
const by=new Map<string,BlockTpl>();for(const t of d.blockTpls)by.set(t.id,t);
for(const t of r.tpls){const l=by.get(t.id);if(!l||(t.u??0)>(l.u??0))by.set(t.id,t)}
const rw=rm.t>m.t;const base=rw?r.tpls:d.blockTpls,other=rw?d.blockTpls:r.tpls;const out:BlockTpl[]=[];const seen=new Set<string>();
for(const t of [...base,...other]){if(seen.has(t.id))continue;seen.add(t.id);const x=by.get(t.id);if(x&&(!(t.id in del)||del[t.id]<(x.u??0)))out.push(x)}
d.blockTpls=out;const w=rw?rm:m;m.cats=[...w.cats];m.catOrd=[...w.catOrd];m.itemOrd=JSON.parse(JSON.stringify(w.itemOrd)) as Record<string,string[]>;if(w.fav)m.fav=[...w.fav];else delete m.fav;m.hid=[...(w.hid??[])];m.t=Math.max(m.t,rm.t);m.del=del}
