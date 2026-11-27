import {Scaling} from 'lucide-react';
import type {Dev} from '../../store';
import {scaleByIds} from '../../lib/scaleEls';
import {toast} from '../../lib/toast';
export const SCALES:[number,string][]=[[.5,'50%'],[.75,'75%'],[1.25,'125%'],[1.5,'150%'],[2,'200%']];
/** кнопки масштаба: меняют размер, текст, обводку и скругления вместе */
export function ScaleBtns({dev,ids}:{dev:Dev;ids:string[]}){
const go=(k:number)=>{const r=scaleByIds(dev,ids,k);if(r===null)toast('Выдели элементы');else if(r<k-.01)toast('Дальше не влезает в блок: применено '+Math.round(r*100)+'%')};
return<div className="scbtns">{SCALES.map(([k,l])=><button key={k} className="btn" onClick={()=>go(k)}>{l}</button>)}</div>}
export function ScaleSec({dev,ids}:{dev:Dev;ids:string[]}){
return<div className="sec"><h4><Scaling size={13}/> Масштаб с текстом</h4><ScaleBtns dev={dev} ids={ids}/><p className="hint">Клавиша K: тяни за угол, всё растёт пропорционально</p></div>}
