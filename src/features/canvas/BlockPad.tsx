import {useStore} from '../../store';
import type {Block,Dev} from '../../store';
const SC=[0,8,16,24,32,48,64,96];
/** отступы блока сверху и снизу и подгонка высоты под содержимое */
export function BlockPad({b,dev}:{b:Block;dev:Dev}){
const s=useStore();const pd=b.pd??[0,0];const els=b.els[dev];
const setPd=(i:0|1,v:number)=>{const n:[number,number]=i===0?[v,pd[1]]:[pd[0],v];s.editBlock(b.id,{pd:n[0]||n[1]?n:undefined})};
const fit=()=>{if(!els.length)return;const top=Math.min(...els.map(e=>e.y));const dy=pd[0]-top;
if(dy)s.dragMany(dev,els.map(e=>({id:e.id,x:e.x,y:Math.max(0,e.y+dy)})));
const bot=Math.max(...els.map(e=>e.y+dy+(e.t==='line'?0:e.h)));s.setH(dev,b.id,bot+pd[1])};
return<div className="sec"><h4>Отступы блока</h4>
{([['Сверху',0],['Снизу',1]] as const).map(([l,i])=><div key={i} className="clr"><span>{l}</span><div className="cs-row">{SC.map(n=><button key={n} className={'btn sm'+(pd[i]===n?' on':'')} onClick={()=>setPd(i,n)}>{n}</button>)}</div></div>)}
<button className="btn" disabled={!els.length} title="Сдвинет содержимое вниз до отступа сверху и подгонит высоту блока под отступ снизу" onClick={fit}>Подогнать высоту</button>
<p className="hint">Отступы попадают в ТЗ. Кнопка применяет их к текущему устройству</p></div>}
