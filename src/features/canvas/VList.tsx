import {Fragment,useState} from 'react';
import type {ReactNode} from 'react';
/** Виртуальный список слоёв: от `min` строк рисует только видимые (остальное пустое место нужной высоты).
 * Меньше строк: обычный список без обёрток. Высота строки фиксирована: rh px × масштаб интерфейса (--u). */
const U=()=>{const v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u'));return isFinite(v)&&v>0?v:1};
export function VList<T extends {id:string}>({items,row,rh=32,min=50,max=360}:{items:T[];row:(x:T)=>ReactNode;rh?:number;min?:number;max?:number}){
const [first,setFirst]=useState(0);
if(items.length<min)return<>{items.map(x=><Fragment key={x.id}>{row(x)}</Fragment>)}</>;
const u=U(),h=Math.round(rh*u),vh=Math.round(max*u),n=items.length;
const a=Math.max(0,Math.min(first,n)-6),b=Math.min(n,first+Math.ceil(vh/h)+6);
return<div className="vl" style={{height:vh}} onScroll={e=>setFirst(Math.floor(e.currentTarget.scrollTop/h))}>
<div style={{height:n*h,position:'relative'}}>{items.slice(a,b).map((x,i)=><div key={x.id} className="vr" style={{top:(a+i)*h,height:h}}>{row(x)}</div>)}</div></div>}
