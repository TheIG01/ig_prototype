import {Link2,Unlink,Crop} from 'lucide-react';
import {useStore} from '../../store';
import type {El,Dev} from '../../store';
import {canBind} from '../../lib/arrowBind';
import {toast} from '../../lib/toast';
import {Sec} from './ElPanel';

/** Панель одной стрелки: состояние привязки и как привязать */
export function BindSec({e,set}:{e:El;set:(p:Partial<El>)=>void}){
const on=!!(e.ab?.a||e.ab?.b);
return<Sec t="Привязка"><p className="hint">{on?'Стрелка идёт за элементами: двигай или меняй размер, она подстроится.':'Выдели стрелку и один-два элемента (Shift или Ctrl), потом нажми «Привязать».'}</p>
{on&&<button className="btn" onClick={()=>{set({ab:undefined});toast('Стрелка отвязана')}}><Unlink size={15}/>Отвязать</button>}</Sec>}

/** Панель нескольких: привязать выбранную стрелку к выбранным элементам (порядок выделения: начало, конец) */
export function BindRow({dev,ids,els}:{dev:Dev;ids:string[];els:El[]}){
const s=useStore();const arr=els.filter(canBind);if(arr.length!==1)return null;
const a=arr[0];const tg=ids.filter(i=>i!==a.id&&els.some(e=>e.id===i&&!canBind(e)&&e.t!=='line'));
if(!tg.length||tg.length>2)return null;
const put=(ab:{a?:string;b?:string})=>{s.patchEls(dev,[a.id],{ab:{...a.ab,...ab}});toast('Стрелка привязана')};
return<div className="sec"><h4>Стрелка</h4><div className="btnrow">
{tg.length===2?<button className="btn" title="Начало у первого выбранного, конец у второго" onClick={()=>put({a:tg[0],b:tg[1]})}><Link2 size={15}/>Привязать: первый → второй</button>
:<><button className="btn" onClick={()=>put({a:tg[0]})}><Link2 size={15}/>Начало сюда</button><button className="btn" onClick={()=>put({b:tg[0]})}><Link2 size={15}/>Конец сюда</button></>}
{(a.ab?.a||a.ab?.b)&&<button className="btn" onClick={()=>{s.patchEls(dev,[a.id],{ab:undefined});toast('Стрелка отвязана')}}><Unlink size={15}/>Отвязать</button>}</div></div>}

/** Секция фрейма: обрезать всё, что торчит за край (работает в группе с фреймом) */
export function ClipSec({e,set}:{e:El;set:(p:Partial<El>)=>void}){
if(e.t!=='rect'||!e.g)return null;
return<Sec t="Обрезка"><button className={'btn'+(e.fc?' on':'')} title="Всё из группы, что выходит за край фрейма, не показывается в просмотре и экспорте" onClick={()=>set({fc:e.fc?undefined:1})}><Crop size={15}/>{e.fc?'Обрезка включена':'Обрезать содержимое'}</button>
<p className="hint">Работает для сгруппированных элементов без поворота.</p></Sec>}
