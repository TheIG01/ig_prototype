import {Eye,EyeOff} from 'lucide-react';
import type {El,Dev} from '../../store';
import {Sec} from './ElPanel';
const DN:Record<Dev,string>={desktop:'компьютере',tablet:'планшете',mobile:'телефоне'};
const ST:{k:El['ts'];l:string;h:string}[]=[{k:undefined,l:'Обычный',h:'Элемент попадает в ТЗ как есть'},{k:'key',l:'Важно',h:'В ТЗ у элемента будет пометка «ВАЖНО»'},{k:'skip',l:'Не в ТЗ',h:'Элемент виден на холсте и в просмотре, но в ТЗ для нейросети его не будет'}];
/** название, видимость на устройстве, статус в ТЗ */
export function ElSettings({dev,e,set}:{dev:Dev;e:El;set:(p:Partial<El>)=>void}){
return<Sec t="Настройки элемента">
<label className="fld"><span>Название</span><input className="inp" value={e.nm??''} placeholder="Название в слоях и в ТЗ" maxLength={60} onChange={ev=>set({nm:ev.target.value.trim()?ev.target.value:undefined})}/></label>
<button className={'btn'+(e.hid?' on':'')} title="Скрытый элемент не виден в просмотре и экспорте. Остальные устройства не затрагиваются" onClick={()=>set({hid:e.hid?undefined:1})}>{e.hid?<EyeOff size={16}/>:<Eye size={16}/>}{e.hid?'Скрыт на '+DN[dev]:'Виден на '+DN[dev]}</button>
<div className="seg" role="group" aria-label="Статус в ТЗ">{ST.map(o=><button key={o.l} className={e.ts===o.k?'on':''} title={o.h} onClick={()=>set({ts:o.k})}>{o.l}</button>)}</div>
<p className="hint">Видимость задаётся для текущего устройства. Статус «Не в ТЗ» убирает элемент только из ТЗ</p></Sec>}
