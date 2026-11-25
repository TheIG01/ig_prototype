import type {El,Sheet} from '../store';
import {normRot} from './elFx';

/** Привязка стрелок (1.66) и обрезка фрейма. Обе функции правят проект на месте и вызываются после любой правки (`mut` в store). */
const GAP=6,MINL=8;
const isArr=(e:El)=>e.t==='shape'&&(e.sh==='arr1'||e.sh==='arr2');
export const canBind=isArr;
type Pt={x:number;y:number};
const ctr=(e:El):Pt=>({x:e.x+e.w/2,y:e.y+e.h/2});
/** точка на краю прямоугольника e в сторону to, чуть отступив наружу */
export function edgePt(e:El,to:Pt,gap=GAP):Pt{
const c=ctr(e),dx=to.x-c.x,dy=to.y-c.y,d=Math.hypot(dx,dy);if(d<1e-6)return c;
const s=Math.min(dx?(e.w/2)/Math.abs(dx):Infinity,dy?(e.h/2)/Math.abs(dy):Infinity);
return{x:c.x+dx*s+dx/d*gap,y:c.y+dy*s+dy/d*gap}}
/** текущие концы стрелки по её положению и повороту */
export function ends(a:El):[Pt,Pt]{
const c=ctr(a),r=(a.rot??0)*Math.PI/180,hx=Math.cos(r)*a.w/2,hy=Math.sin(r)*a.w/2;
return[{x:c.x-hx,y:c.y-hy},{x:c.x+hx,y:c.y+hy}]}
/** расставляет стрелки с привязкой; потерянные цели отвязывает. true, если что-то менялось */
export function fixArrows(sh?:Sheet):boolean{
if(!sh)return false;let ch=false;
for(const b of sh.blocks)for(const d of Object.keys(b.els) as (keyof typeof b.els)[]){
const els=b.els[d];if(!els.some(e=>e.ab))continue;
for(const a of els){
if(!a.ab)continue;
if(!isArr(a)){delete a.ab;ch=true;continue}
const ta=a.ab.a?els.find(e=>e.id===a.ab!.a&&e.id!==a.id):undefined,tb=a.ab.b?els.find(e=>e.id===a.ab!.b&&e.id!==a.id):undefined;
if(a.ab.a&&!ta||a.ab.b&&!tb){const n:{a?:string;b?:string}={};if(ta)n.a=ta.id;if(tb)n.b=tb.id;if(n.a||n.b)a.ab=n;else delete a.ab;ch=true}
if(!ta&&!tb)continue;
const[p0,p1]=ends(a);
const A=ta?edgePt(ta,tb?ctr(tb):p1):p0,B=tb?edgePt(tb,ta?ctr(ta):p0):p1;
const L=Math.max(MINL,Math.hypot(B.x-A.x,B.y-A.y)),ang=normRot(Math.atan2(B.y-A.y,B.x-A.x)*180/Math.PI);
const cx=(A.x+B.x)/2,cy=(A.y+B.y)/2,w=Math.round(L),x=Math.round(cx-w/2),y=Math.round(cy-a.h/2);
if(a.w!==w||a.x!==x||a.y!==y||(a.rot??0)!==ang){a.w=w;a.x=x;a.y=y;if(ang)a.rot=ang;else delete a.rot;ch=true}}}
return ch}

/** Фрейм с `fc` обрезает всё, что в его группе и торчит за край. Вырез хранится в `El.cx` (сверху, справа, снизу, слева), его читает `fxMap`. */
export function fixClips(sh?:Sheet):void{
if(!sh)return;
for(const b of sh.blocks)for(const d of Object.keys(b.els) as (keyof typeof b.els)[]){
const els=b.els[d];const fr=new Map<string,El>();
for(const e of els)if(e.fc&&e.g&&e.t==='rect')fr.set(e.g,e);
for(const e of els){
const f=e.g&&!e.fc?fr.get(e.g):undefined;
if(!f||f===e||e.t==='line'||e.rot||f.rot){if(e.cx)delete e.cx;continue}
const t=Math.max(0,Math.round(f.y-e.y)),l=Math.max(0,Math.round(f.x-e.x)),r=Math.max(0,Math.round(e.x+e.w-(f.x+f.w))),bt=Math.max(0,Math.round(e.y+e.h-(f.y+f.h)));
if(t||l||r||bt)e.cx=[t,r,bt,l];else if(e.cx)delete e.cx}}}
