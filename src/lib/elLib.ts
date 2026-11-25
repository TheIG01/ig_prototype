// Библиотека элементов (1.54): свои наборы элементов хранятся на устройстве (localStorage), не в проекте.
import {useSyncExternalStore} from 'react';
import type {El} from '../store';
import {uid} from './uid';

export interface LibItem{id:string;name:string;cat:string;tags:string[];w:number;h:number;els:El[];ts:number}
const KEY='ig.elib.v1',RKEY='ig.elib.recent',VER=1;
const num=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const okEl=(e:unknown):e is El=>!!e&&typeof e==='object'&&typeof (e as El).t==='string'&&['x','y','w','h'].every(k=>num((e as unknown as Record<string,unknown>)[k]));
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v)) as T;
const lh=(e:El)=>e.t==='line'?0:e.h;

/** выделение в набор: координаты от левого верхнего угла, без связи с библиотекой */
export function pack(es:El[]):{els:El[];w:number;h:number}|null{
if(!es.length)return null;
const x0=Math.min(...es.map(e=>e.x)),y0=Math.min(...es.map(e=>e.y));
const els=es.map(e=>{const c=clone(e);c.x=Math.round(e.x-x0);c.y=Math.round(e.y-y0);delete c.cm;delete c.ci;return c});
return{els,w:Math.max(...els.map(e=>e.x+e.w)),h:Math.max(...els.map(e=>e.y+lh(e)))}}

/** новые id; набор из нескольких элементов собирается в группу; cm помечает происхождение */
export const parseCi=(v?:string):{item:string;inst:string;idx:number}|null=>{if(!v)return null;const a=v.split('|');const i=Number(a[2]);return a.length===3&&Number.isInteger(i)?{item:a[0],inst:a[1],idx:i}:null};
export function instantiate(it:{els:El[];name:string;id?:string}):El[]{const inst=uid();
const gm:Record<string,string>={};const hasG=it.els.some(e=>e.g);const all=uid();
return it.els.map((q,n)=>{const e={...clone(q),id:uid()};if(e.g)e.g=gm[e.g]??=uid();else if(!hasG&&it.els.length>1)e.g=all;e.cm=it.name;if(it.id)e.ci=it.id+'|'+inst+'|'+n;return e})}

const tags=(v:unknown):string[]=>Array.isArray(v)?[...new Set(v.filter((x):x is string=>typeof x==='string').map(x=>x.trim().toLowerCase()).filter(Boolean))].slice(0,12):[];
export const parseTags=(s:string)=>tags(s.split(/[,;]+/));
const norm=(r:unknown):LibItem|null=>{
const o=r as Partial<LibItem>|null;if(!o||typeof o!=='object'||typeof o.name!=='string'||!Array.isArray(o.els))return null;
const els=o.els.filter(okEl);if(!els.length)return null;const p=pack(els.map(e=>({...e})));if(!p)return null;
return{id:typeof o.id==='string'&&o.id?o.id:uid(),name:o.name.trim().slice(0,60)||'Без названия',cat:typeof o.cat==='string'&&o.cat.trim()?o.cat.trim().slice(0,40):'Мои',tags:tags(o.tags),w:p.w,h:p.h,els:p.els,ts:num(o.ts)?o.ts:Date.now()}};

const load=():LibItem[]=>{try{const o=JSON.parse(localStorage.getItem(KEY)??'null') as {list?:unknown[]}|null;return Array.isArray(o?.list)?o!.list!.map(norm).filter((x):x is LibItem=>!!x):[]}catch{return[]}};
let cache:LibItem[]|null=null;const subs=new Set<()=>void>();
const read=()=>cache??(cache=load());
/** false, если браузер не дал записать (нет места или закрытый режим) */
const write=(l:LibItem[]):boolean=>{cache=l;subs.forEach(f=>f());try{localStorage.setItem(KEY,JSON.stringify({v:VER,list:l}));return true}catch{return false}};
export const useLib=():LibItem[]=>useSyncExternalStore(cb=>{subs.add(cb);return()=>{subs.delete(cb)}},read,read);

export const addItem=(p:{name:string;cat:string;tags:string[];els:El[]}):{item:LibItem|null;saved:boolean}=>{
const it=norm({...p,id:uid(),ts:Date.now()});if(!it)return{item:null,saved:false};return{item:it,saved:write([...read(),it])}};
export const updateItem=(id:string,els:El[]):boolean|null=>{const k=pack(els);if(!k)return null;return write(read().map(x=>x.id===id?{...x,...k,ts:Date.now()}:x))};
export const editItem=(id:string,p:{name:string;cat:string;tags:string[]}):boolean=>write(read().map(x=>x.id===id?{...x,name:p.name.trim().slice(0,60)||x.name,cat:p.cat.trim().slice(0,40)||'Мои',tags:tags(p.tags),ts:Date.now()}:x));
export const removeItem=(id:string):LibItem|null=>{const l=read();const it=l.find(x=>x.id===id)??null;if(it)write(l.filter(x=>x.id!==id));return it};
export const restoreItem=(it:LibItem)=>{if(!read().some(x=>x.id===it.id))write([...read(),it])};

export const libFile=(l:LibItem[])=>JSON.stringify({kind:'ig-elems',v:VER,list:l.map(({name,cat,tags,els})=>({name,cat,tags,els}))},null,1);
/** разбор файла: бросает ошибку с понятным текстом */
export const importFile=(txt:string):number=>{
let o:unknown;try{o=JSON.parse(txt)}catch{throw new Error('файл не похож на JSON')}
const f=o as {kind?:unknown;v?:unknown;list?:unknown};
if(!f||f.kind!=='ig-elems')throw new Error('это не файл библиотеки элементов');
if(num(f.v)&&f.v>VER)throw new Error('файл из более новой версии, обнови приложение');
if(!Array.isArray(f.list))throw new Error('в файле нет списка элементов');
const add=f.list.map(r=>norm({...(r as object),id:undefined,ts:Date.now()})).filter((x):x is LibItem=>!!x);
if(!add.length)throw new Error('в файле нет подходящих элементов');write([...read(),...add]);return add.length};

export const getRecent=():string[]=>{try{const a=JSON.parse(localStorage.getItem(RKEY)??'[]') as unknown;return Array.isArray(a)?a.filter((x):x is string=>typeof x==='string').slice(0,8):[]}catch{return[]}};
export const pushRecent=(id:string):string[]=>{const a=[id,...getRecent().filter(x=>x!==id)].slice(0,8);try{localStorage.setItem(RKEY,JSON.stringify(a))}catch{/* хранилище недоступно */}return a};
