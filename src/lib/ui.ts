import {useSyncExternalStore} from 'react';import {TY0,cleanTy} from './typo';import type {Ty} from './typo';
/** настройки вида и холста: localStorage (igp.ui), применяются к <html>; читаются через useUi/getUi */
/** агентство для обложки отчёта: название, реквизиты, логотип (data URL, уменьшен до 320 px) */
export type Ag={n:string;r:string;l:string};
export type Ui={accent:string;density:'cozy'|'compact';size:'m'|'l'|'xl';motion:'on'|'off';labels:1|1.25|1.5;grid:boolean;
rulers:boolean;guides:boolean;smart:boolean;snap:boolean;gs:4|8|16;hover:boolean;dims:boolean;nudge:number;
cols:boolean;colsN:number;gut:number;mar:number;ty:Ty;perf:'auto'|'on'|'off';ag:Ag;dz:Record<string,[number,number]>;hp:[number,number,number,number]};
export const UI0:Ui={accent:'#2F6BFF',density:'cozy',size:'m',motion:'on',labels:1,grid:true,rulers:true,guides:true,smart:true,snap:true,gs:8,hover:true,dims:true,nudge:8,cols:false,colsN:0,gut:-1,mar:-1,ty:TY0,perf:'auto',ag:{n:'',r:'',l:''},dz:{},hp:[24,12,14,10]};
export const ACCENTS:[string,string][]=[['#2F6BFF','Синий'],['#5B4BFF','Индиго'],['#0E9F9A','Бирюзовый'],['#16A34A','Зелёный'],['#F97316','Оранжевый'],['#E11D48','Малиновый']];
const K='igp.ui';
const num=(v:unknown,d:number,a:number,b:number)=>typeof v==='number'&&isFinite(v)?Math.max(a,Math.min(b,Math.round(v))):d;
const bool=(v:unknown,d:boolean)=>typeof v==='boolean'?v:d;
const clean=(o:Partial<Ui>):Ui=>({accent:/^#[0-9a-f]{6}$/i.test(o.accent??'')?o.accent!:UI0.accent,density:o.density==='compact'?'compact':'cozy',size:o.size==='l'||o.size==='xl'?o.size:'m',motion:o.motion==='off'?'off':'on',labels:o.labels===1.25||o.labels===1.5?o.labels:1,
grid:bool(o.grid,true),rulers:bool(o.rulers,true),guides:bool(o.guides,true),smart:bool(o.smart,true),snap:bool(o.snap,true),gs:o.gs===4||o.gs===16?o.gs:8,hover:bool(o.hover,true),dims:bool(o.dims,true),nudge:num(o.nudge,8,1,100),
cols:bool(o.cols,false),colsN:num(o.colsN,0,0,24),gut:num(o.gut,-1,-1,200),mar:num(o.mar,-1,-1,400),ty:cleanTy(o.ty),perf:o.perf==='on'||o.perf==='off'?o.perf:'auto',dz:cleanDz(o.dz),hp:cleanHp(o.hp),ag:{n:String(o.ag?.n??'').slice(0,80),r:String(o.ag?.r??'').slice(0,600),l:typeof o.ag?.l==='string'&&/^data:image\/(png|jpeg|webp|svg\+xml);/.test(o.ag.l)&&o.ag.l.length<250000?o.ag.l:''}});
const cleanHp=(v:unknown):[number,number,number,number]=>{const d=UI0.hp;return Array.isArray(v)&&v.length===4?[num(v[0],d[0],0,80),num(v[1],d[1],0,80),num(v[2],d[2],0,80),num(v[3],d[3],0,80)]:[...d]};
const DZ_KEYS=['text','rect','btn','input','img'];
const cleanDz=(v:unknown):Record<string,[number,number]>=>{const o:Record<string,[number,number]>={};if(v&&typeof v==='object')for(const k of DZ_KEYS){const a=(v as Record<string,unknown>)[k];if(Array.isArray(a)&&a.length===2)o[k]=[num(a[0],200,8,2000),num(a[1],48,8,2000)]}return o};
const read=():Ui=>{try{return clean(JSON.parse(localStorage.getItem(K)||'{}'))}catch{return UI0}};
let cur:Ui=read();const subs=new Set<()=>void>();
export const getUi=()=>cur;
export const loadUi=()=>cur;
export const useUi=()=>useSyncExternalStore(f=>{subs.add(f);return()=>{subs.delete(f)}},getUi);
/** слабое устройство: мало памяти или ядер, либо включена экономия трафика (если браузер это сообщает) */
export const weakDevice=():boolean=>{try{const n=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean}};return(typeof n.deviceMemory==='number'&&n.deviceMemory<=4)||(typeof n.hardwareConcurrency==='number'&&n.hardwareConcurrency>0&&n.hardwareConcurrency<=4)||!!n.connection?.saveData}catch{return false}};
/** режим «Лёгкий»: включён вручную или автоматически на слабом устройстве */
export const liteOn=(u:Ui=cur):boolean=>u.perf==='on'||(u.perf==='auto'&&weakDevice());
export const applyUi=(u:Ui=cur)=>{const r=document.documentElement;r.style.setProperty('--acc',u.accent);r.style.setProperty('--ls',String(u.labels));r.style.setProperty('--gs',u.gs*2+'px');
r.dataset.density=u.density;r.dataset.size=u.size;r.dataset.motion=u.motion;r.dataset.grid=u.grid?'on':'off';r.dataset.hover=u.hover?'on':'off';r.dataset.dims=u.dims?'on':'off';r.dataset.lite=liteOn(u)?'on':'off';
document.querySelector('meta[name=theme-color]')?.setAttribute('content',u.accent)};
export const saveUi=(p:Partial<Ui>):Ui=>{cur=clean({...cur,...p});try{localStorage.setItem(K,JSON.stringify(cur))}catch{/* хранилище недоступно */}applyUi(cur);subs.forEach(f=>f());return cur};
