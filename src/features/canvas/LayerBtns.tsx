import {Eye,EyeOff,Lock,Unlock} from 'lucide-react';
import {useStore} from '../../store';
import type {Dev,El} from '../../store';
import './layers.css';
/** глаз и замок для строки слоя: работают сразу для одного элемента или для всей группы (список els) */
export function LayerBtns({dev,els}:{dev:Dev;els:El[]}){
const s=useStore();const ids=els.map(e=>e.id);
const hid=els.length>0&&els.every(e=>e.hid),lk=els.length>0&&els.every(e=>e.lk);
const tg=(k:'hid'|'lk',on:boolean)=>(ev:{stopPropagation:()=>void})=>{ev.stopPropagation();s.patchEls(dev,ids,k==='hid'?{hid:on?1 as const:undefined}:{lk:on?1 as const:undefined})};
return<span className="lyb">
<span role="button" tabIndex={-1} className={'lyb-i'+(lk?' on':'')} title={lk?'Разблокировать (Ctrl+Shift+L)':'Заблокировать (Ctrl+Shift+L)'} onClick={tg('lk',!lk)}>{lk?<Lock size={13}/>:<Unlock size={13}/>}</span>
<span role="button" tabIndex={-1} className={'lyb-i'+(hid?' on':'')} title={hid?'Показать (Ctrl+Shift+H)':'Скрыть (Ctrl+Shift+H)'} onClick={tg('hid',!hid)}>{hid?<EyeOff size={13}/>:<Eye size={13}/>}</span></span>}
