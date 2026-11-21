import type {CSSProperties} from 'react';
import type {El} from '../../store';
import {artHtml,resolve,styleMap,ART} from '../../lib/art';
import type {PStyle} from '../../lib/art';
const camel=(k:string)=>k.replace(/-([a-z])/g,(_,c:string)=>c.toUpperCase());
/** inline style of a wireframe element; dy = top offset of its block; st = project style */
export const elStyle=(e0:El,dy=0,st?:PStyle):CSSProperties=>{const e=resolve(e0,st);
const base:CSSProperties={left:e.x,top:(e.t==='line'?e.y-6:e.y)+dy,width:e.w,height:e.t==='line'?12:e.h,fontSize:e.fs,fontWeight:e.b?700:undefined,textAlign:e.al==='c'?'center':e.al==='r'?'right':undefined,justifyContent:e.t==='btn'?undefined:e.al==='c'?'center':e.al==='r'?'flex-end':undefined};
const x:Record<string,string>={};for(const [k,v] of Object.entries(styleMap(e0,st)))x[camel(k)]=v;
return {...base,...(x as CSSProperties)}};
/** content of an element: line, drawn art (shape, icon, mock, list) or plain text */
export const elInner=(e:El)=>e.t==='line'?<i/>:ART.has(e.t)?<div className="art" dangerouslySetInnerHTML={{__html:artHtml(e)}}/>:e.text;
