// Масштаб выделения клавишей K: размер, шрифт, обводка, скругления, тени и отступы растут вместе.
import {useStore,FW} from '../store';
import type {El,Dev,Lay} from '../store';
import {resolve} from './art';

export interface Box{x:number;y:number;w:number;h:number}
export interface ScaleSnap{dev:Dev;base:El[];lay:Record<string,Lay>;box:Box}
const R=Math.round;
const bottom=(e:El)=>e.y+(e.t==='line'?0:e.h);

/** один элемент, увеличенный в k раз относительно точки (ax, ay) */
export function scaleOne(e:El,k:number,ax:number,ay:number):El{
const o:El={...e,x:R(ax+(e.x-ax)*k),y:R(ay+(e.y-ay)*k),w:Math.max(8,R(e.w*k))};
if(e.t!=='line')o.h=Math.max(8,R(e.h*k));
if(e.fs!==undefined)o.fs=Math.max(8,R(e.fs*k));
if(e.sw&&e.t!=='icon')o.sw=Math.max(.5,R(e.sw*k*4)/4);
if(e.r)o.r=R(e.r*k);
if(e.rc)o.rc=e.rc.map(v=>R(v*k)) as [number,number,number,number];
if(e.ls)o.ls=R(e.ls*k*10)/10;
if(e.mh)o.mh=R(e.mh*k);
if(e.blur)o.blur=R(e.blur*k);
if(e.shadow)o.shadow={...e.shadow,x:R(e.shadow.x*k),y:R(e.shadow.y*k),b:R(e.shadow.b*k)};
return o}

/** снимок выделения вместе с группами: от него считается каждый шаг перетаскивания */
export function captureScale(dev:Dev,ids:string[]):ScaleSnap|null{
const s=useStore.getState();const pr=s.data?.projects.find(p=>p.id===s.projectId);
const sh=pr?.sheets.find(x=>x.id===s.sheetId);if(!sh||!ids.length)return null;
const b=sh.blocks.find(q=>q.els[dev].some(e=>ids.includes(e.id)));if(!b)return null;
const gs=new Set(ids.map(i=>b.els[dev].find(e=>e.id===i)?.g).filter(Boolean));
const es=b.els[dev].filter(e=>!e.hid&&(ids.includes(e.id)||(e.g&&gs.has(e.g))));if(!es.length)return null;
const base=es.map(e=>{const q=resolve(e,pr?.style);const o:El={...q,role:undefined};if(o.fs===undefined&&o.text&&o.t!=='icon'&&o.t!=='mock'&&o.t!=='line')o.fs=16;return JSON.parse(JSON.stringify(o)) as El});
const lay:Record<string,Lay>={};const L=b.lay?.[dev];
if(L)for(const g of Object.keys(L))if(es.some(e=>e.g===g))lay[g]={...L[g]};
const x=Math.min(...base.map(e=>e.x)),y=Math.min(...base.map(e=>e.y));
return{dev,base,lay,box:{x,y,w:Math.max(1,Math.max(...base.map(e=>e.x+e.w))-x),h:Math.max(1,Math.max(...base.map(bottom))-y)}}}

/** k не даёт вылезти за края блока; возвращает применённый k */
export function applyK(sn:ScaleSnap,k0:number,ax:number,ay:number):number{
const W=FW[sn.dev],b=sn.box;let k=Math.max(.1,k0);
const r=b.x+b.w;
if(r>ax)k=Math.min(k,(W-ax)/(r-ax));
if(b.x<ax)k=Math.min(k,ax/(ax-b.x));
if(b.y<ay)k=Math.min(k,ay/(ay-b.y));
k=Math.max(.1,k);
const lay:Record<string,Lay>={};
for(const g of Object.keys(sn.lay)){const L=sn.lay[g];lay[g]={...L,gap:R(L.gap*k),x:R(ax+(L.x-ax)*k),y:R(ay+(L.y-ay)*k)}}
useStore.getState().applyScale(sn.dev,sn.base.map(e=>scaleOne(e,k,ax,ay)),lay);
return k}

/** кнопки панели: масштаб от верхней середины выделения */
export function scaleByIds(dev:Dev,ids:string[],k:number):number|null{
const sn=captureScale(dev,ids);if(!sn)return null;
return applyK(sn,k,sn.box.x+sn.box.w/2,sn.box.y)}
