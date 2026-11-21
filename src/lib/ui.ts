import {useSyncExternalStore} from 'react';
/** настройки вида и холста: localStorage (igp.ui), применяются к <html>; читаются через useUi/getUi */
export type Ui={accent:string;density:'cozy'|'compact';motion:'on'|'off';labels:1|1.25|1.5;grid:boolean;
rulers:boolean;guides:boolean;smart:boolean;snap:boolean;gs:4|8|16;hover:boolean;dims:boolean;nudge:number;
cols:boolean;colsN:number;gut:number;mar:number};
export const UI0:Ui={accent:'#2F6BFF',density:'cozy',motion:'on',labels:1,grid:true,rulers:true,guides:true,smart:true,snap:true,gs:8,hover:true,dims:true,nudge:8,cols:false,colsN:0,gut:-1,mar:-1};
export const ACCENTS:[string,string][]=[['#2F6BFF','Синий'],['#5B4BFF','Индиго'],['#0E9F9A','Бирюзовый'],['#16A34A','Зелёный'],['#F97316','Оранжевый'],['#E11D48','Малиновый']];
const K='igp.ui';
const num=(v:unknown,d:number,a:number,b:number)=>typeof v==='number'&&isFinite(v)?Math.max(a,Math.min(b,Math.round(v))):d;
const bool=(v:unknown,d:boolean)=>typeof v==='boolean'?v:d;
const clean=(o:Partial<Ui>):Ui=>({accent:/^#[0-9a-f]{6}$/i.test(o.accent??'')?o.accent!:UI0.accent,density:o.density==='compact'?'compact':'cozy',motion:o.motion==='off'?'off':'on',labels:o.labels===1.25||o.labels===1.5?o.labels:1,
grid:bool(o.grid,true),rulers:bool(o.rulers,true),guides:bool(o.guides,true),smart:bool(o.smart,true),snap:bool(o.snap,true),gs:o.gs===4||o.gs===16?o.gs:8,hover:bool(o.hover,true),dims:bool(o.dims,true),nudge:num(o.nudge,8,1,100),
cols:bool(o.cols,false),colsN:num(o.colsN,0,0,24),gut:num(o.gut,-1,-1,200),mar:num(o.mar,-1,-1,400)});
const read=():Ui=>{try{return clean(JSON.parse(localStorage.getItem(K)||'{}'))}catch{return UI0}};
let cur:Ui=read();const subs=new Set<()=>void>();
export const getUi=()=>cur;
export const loadUi=()=>cur;
export const useUi=()=>useSyncExternalStore(f=>{subs.add(f);return()=>{subs.delete(f)}},getUi);
export const applyUi=(u:Ui=cur)=>{const r=document.documentElement;r.style.setProperty('--acc',u.accent);r.style.setProperty('--ls',String(u.labels));r.style.setProperty('--gs',u.gs*2+'px');
r.dataset.density=u.density;r.dataset.motion=u.motion;r.dataset.grid=u.grid?'on':'off';r.dataset.hover=u.hover?'on':'off';r.dataset.dims=u.dims?'on':'off';
document.querySelector('meta[name=theme-color]')?.setAttribute('content',u.accent)};
export const saveUi=(p:Partial<Ui>):Ui=>{cur=clean({...cur,...p});try{localStorage.setItem(K,JSON.stringify(cur))}catch{/* хранилище недоступно */}applyUi(cur);subs.forEach(f=>f());return cur};
