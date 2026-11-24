import {memo} from 'react';import type {CSSProperties} from 'react';
import type {El} from '../../store';
import {artHtml,resolve,styleMap,ART,lineCss} from '../../lib/art';
import type {PStyle} from '../../lib/art';
import {isRich,richHtml} from '../../lib/rich';
const camel=(k:string)=>k.replace(/-([a-z])/g,(_,c:string)=>c.toUpperCase());
/** inline style of a wireframe element; dy = top offset of its block; st = project style */
const calc=(e0:El,dy:number,st?:PStyle):CSSProperties=>{const e=resolve(e0,st);
const base:CSSProperties={left:e.x,top:(e.t==='line'?e.y-6:e.y)+dy,width:e.w,height:e.t==='line'?12:e.h,fontSize:e.fs,fontWeight:e.b?700:undefined,textAlign:e.al==='c'?'center':e.al==='r'?'right':undefined,justifyContent:e.t==='btn'?undefined:e.al==='c'?'center':e.al==='r'?'flex-end':undefined};
const x:Record<string,string>={};for(const [k,v] of Object.entries(styleMap(e0,st)))x[camel(k)]=v;
return {...base,...(x as CSSProperties)}};
/** кэш по объекту элемента: пока элемент не менялся (immer хранит тот же объект), стиль не пересчитывается */
const SC=new WeakMap<El,{dy:number;st?:PStyle;o:CSSProperties}[]>();
export const elStyle=(e0:El,dy=0,st?:PStyle):CSSProperties=>{let a=SC.get(e0);if(!a){a=[];SC.set(e0,a)}
for(const h of a)if(h.dy===dy&&h.st===st)return h.o;const o=calc(e0,dy,st);if(a.length>=4)a.shift();a.push({dy,st,o});return o};
/** content of an element: line, drawn art (shape, icon, mock, list) or plain text */
const inner=(e:El)=>e.t==='line'?<i style={lineCss(e)}/>:ART.has(e.t)?<div className="art" dangerouslySetInnerHTML={{__html:artHtml(e)}}/>:isRich(e)?<span style={{display:'contents'}} dangerouslySetInnerHTML={{__html:richHtml(e)}}/>:e.text;
/** то же, но не перерисовывается, пока элемент не менялся: фигуры и макеты (SVG) не пересобираются зря */
export const elInner=(e:El)=><ElInner e={e}/>;
const ElInner=memo(function ElInner({e}:{e:El}){return<>{inner(e)}</>});
