import {useStore} from '../store';
import type {Dev} from './dev';
import type {El} from '../store';

/** настройки нового фрейма: белая рамка с тонкой серой обводкой, в слоях называется «Фрейм» */
export const FRAME:Partial<El>={nm:'Фрейм',fill:'#FFFFFF',stroke:'#CBD5E1',sw:1};

/** Ctrl+Alt+G: фрейм вокруг выделенного (отступ 16 px), уходит под элементы, всё вместе сгруппировано */
export function wrapInFrame(dev:Dev,ids:string[],els:El[],blockId?:string):boolean{
const sel=els.filter(q=>ids.includes(q.id));if(!sel.length)return false;
const p=16,x=Math.max(0,Math.min(...sel.map(q=>q.x))-p),y=Math.max(0,Math.min(...sel.map(q=>q.y))-p);
const r=Math.max(...sel.map(q=>q.x+q.w))+p,b=Math.max(...sel.map(q=>q.y+(q.t==='line'?0:q.h)))+p;
const s=useStore.getState();s.addEl(dev,'rect',x,y,blockId,{...FRAME,w:Math.round(r-x),h:Math.round(b-y)});
const id=useStore.getState().elId;if(!id)return false;
s.moveEl(dev,id,-9999);s.groupEls(dev,[id,...ids],true);s.setMulti([id,...ids]);return true}
