import {useEffect} from 'react';
import {Monitor,Tablet,Smartphone,Trash2,Layers} from 'lucide-react';
import {useStore,DEVS,onDev} from '../../store';
import type {Block,Dev} from '../../store';
import {DEVN} from '../../lib/dev';
import {toast} from '../../lib/toast';

export const DevIcon=({d,size=15}:{d:Dev;size?:number})=>d==='desktop'?<Monitor size={size}/>:d==='tablet'?<Tablet size={size}/>:<Smartphone size={size}/>;

/** удалить блок: scope dev убирает его только с одного устройства, all стирает полностью; Отменить в плашке */
export function runDel(b:Block,scope:'dev'|'all',dev:Dev){
const g=useStore.getState();g.delBlock(b.id,scope==='dev'?dev:undefined);
toast(scope==='dev'?`Блок «${b.title}» убран с устройства: ${DEVN[dev]}`:`Блок «${b.title}» удалён`,{label:'Отменить',run:()=>{const q=useStore.getState();q.undo();q.setBlock(b.id)}},6500)}

/** единая точка удаления блока: если блок на одном устройстве, удаляет сразу, иначе спрашивает */
export function requestDelBlock(b:Block,dev:Dev){
const n=DEVS.filter(d=>onDev(b,d)).length;
if(n<=1||!onDev(b,dev)){runDel(b,'all',dev);return}
useStore.getState().setDelAsk({id:b.id,dev})}

export function DelDialog(){
const s=useStore();const a=s.delAsk;
const sh=s.data?.projects.find(p=>p.id===s.projectId)?.sheets.find(x=>x.id===s.sheetId);
const b=a?sh?.blocks.find(x=>x.id===a.id):undefined;
useEffect(()=>{if(!a)return;const k=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();s.setDelAsk(null)}};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[a]);// eslint-disable-line
if(!a||!b)return null;
const on=DEVS.filter(d=>onDev(b,d));const close=()=>s.setDelAsk(null);
const go=(sc:'dev'|'all')=>{close();runDel(b,sc,a.dev)};
return<div className="modal" onMouseDown={e=>e.target===e.currentTarget&&close()}><div className="sheet dl">
<h2>Удалить блок «{b.title}»</h2>
<p className="txt">Блок есть на устройствах: {on.map(d=>DEVN[d]).join(', ')}</p>
<div className="delo-list">
<button className="delo" autoFocus onClick={()=>go('dev')}><span className="delo-ic"><DevIcon d={a.dev} size={20}/></span><span><b>Только на этом устройстве</b><small>{DEVN[a.dev]}. На остальных блок останется</small></span></button>
<button className="delo bad" onClick={()=>go('all')}><span className="delo-ic"><Layers size={20}/></span><span><b>На всех устройствах</b><small>Блок исчезнет полностью. Можно отменить</small></span></button></div>
<div className="btnrow"><button className="btn" onClick={close}>Отмена</button></div></div></div>}
export const DelIcon=Trash2;
