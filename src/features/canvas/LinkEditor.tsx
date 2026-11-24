import {useStore} from '../../store';
import {LK_NAMES,parseLink,mkLink} from '../../lib/rich';
import type {LK} from '../../lib/rich';
/** выбор ссылки: лист, блок, внешний адрес, телефон, почта. Значение это строка «вид:значение» (`rich.ts`) */
export function LinkEditor({value,onChange}:{value?:string;onChange:(v:string|undefined)=>void}){
const sheets=useStore(s=>s.data?.projects.find(p=>p.id===s.projectId)?.sheets)??[];
const l=parseLink(value);const k=l?.k??'';const v=l?.v??'';
const setK=(n:string)=>{if(!n){onChange(undefined);return}const nk=n as LK;onChange(mkLink(nk,nk===k?v:''))};
return<div className="lke">
<select className="inp sl" value={k} aria-label="Куда ведёт ссылка" onChange={ev=>setK(ev.target.value)}><option value="">Никуда не ведёт</option>{LK_NAMES.map(([id,n])=><option key={id} value={id}>{n}</option>)}</select>
{k==='sheet'&&<select className="inp sl" value={v} aria-label="Страница" onChange={ev=>onChange(mkLink('sheet',ev.target.value))}><option value="">Выбери страницу</option>{sheets.map(x=><option key={x.id} value={x.id}>{x.kind==='popup'?'Попап: ':'Страница: '}{x.name}</option>)}</select>}
{k==='block'&&<select className="inp sl" value={v} aria-label="Блок" onChange={ev=>onChange(mkLink('block',ev.target.value))}><option value="">Выбери блок</option>{sheets.map(x=><optgroup key={x.id} label={x.name}>{x.blocks.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</optgroup>)}</select>}
{(k==='url'||k==='tel'||k==='mail')&&<input className="inp" value={v} aria-label="Адрес" placeholder={k==='url'?'example.ru':k==='tel'?'+7 900 000-00-00':'mail@example.ru'} inputMode={k==='tel'?'tel':k==='mail'?'email':'url'} onChange={ev=>onChange(mkLink(k,ev.target.value))}/>}
</div>}
