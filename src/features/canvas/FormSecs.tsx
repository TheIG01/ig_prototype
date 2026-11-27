import {useEffect,useRef,useState} from 'react';
import {useStore} from '../../store';
import type {El,Block} from '../../store';
import {FF_KINDS,ffKind,ffPatch} from '../../lib/ff';import type {FF} from '../../lib/ff';
import {CMP_KINDS,cmpKind,cmpPatch,TAB_STYLES,tabSize} from '../../lib/cmp';import type {CP} from '../../lib/cmp';
import {Sec,Range} from './ElPanel';
type SetFn=(p:Partial<El>)=>void;
/** несколько строк: правка внутри, в store уходит при выходе из поля (иначе перенос строки терялся бы) */
function Lines({value,rows=4,hint,onCommit}:{value:string[];rows?:number;hint?:string;onCommit:(a:string[])=>void}){
const [v,setV]=useState(value.join('\n'));const dirty=useRef(false);const cb=useRef(onCommit);cb.current=onCommit;const cur=useRef(v);cur.current=v;
const parse=(t:string)=>t.split('\n').map(x=>x.trimEnd()).filter(x=>x.trim()!=='');
const commit=()=>{if(dirty.current){dirty.current=false;cb.current(parse(cur.current))}};
useEffect(()=>()=>commit(),[]);// eslint-disable-line
return<><textarea className="inp" rows={rows} value={v} onChange={ev=>{dirty.current=true;setV(ev.target.value)}} onBlur={commit}/>{hint&&<p className="hint">{hint}</p>}</>}
const TXT=new Set(['name','tel','email','text','num','area','date','time']);
/** настройки поля формы: вид, название, подсказка, значение, обязательное, маска, сообщение об ошибке */
export function FieldSec({e,set}:{e:El;set:SetFn}){
const f=e.ff;const k=f?.k??'';const d=ffKind(k);
const up=(p:Partial<FF>)=>{if(!f)return;const n:Record<string,unknown>={...f,...p};for(const x of Object.keys(n))if(n[x]===undefined||n[x]==='')delete n[x];set({ff:n as unknown as FF})};
return<Sec t="Поле формы">
<label className="fld"><span>Вид поля</span><select className="inp" value={k} onChange={ev=>{const v=ev.target.value;if(!v)set({ff:undefined});else set(ffPatch(v,f))}}><option value="">Обычное поле (рисунок)</option>{FF_KINDS.map(x=><option key={x.k} value={x.k}>{x.l}</option>)}</select></label>
{f&&<>
<label className="fld"><span>Название поля</span><input className="inp" value={f.nm??''} placeholder="Как поле назовут в заявке: phone, имя" onChange={ev=>up({nm:ev.target.value})}/></label>
{k!=='hidden'&&<label className="fld"><span>Подсказка</span><input className="inp" value={f.hint??''} placeholder="Появляется под полем, когда оно активно" onChange={ev=>up({hint:ev.target.value})}/></label>}
{k==='check'?<label className="chk"><input type="checkbox" checked={f.def==='1'} onChange={ev=>up({def:ev.target.checked?'1':undefined})}/><span>Отмечена сразу</span></label>
:<label className="fld"><span>{k==='select'||k==='choice'?'Выбрано сразу (название варианта)':'Значение по умолчанию'}</span><input className="inp" value={f.def??''} onChange={ev=>up({def:ev.target.value})}/></label>}
{k!=='hidden'&&<label className="chk"><input type="checkbox" checked={!!f.req} onChange={ev=>up({req:ev.target.checked?1:undefined})}/><span>Обязательное поле</span></label>}
{TXT.has(k)&&k!=='area'&&k!=='date'&&k!=='time'&&<label className="fld"><span>Маска</span><input className="inp" value={f.mask??''} placeholder="+7 (___) ___-__-__" onChange={ev=>up({mask:ev.target.value})}/></label>}
{k!=='hidden'&&<label className="fld"><span>Сообщение об ошибке</span><input className="inp" value={f.err??''} placeholder={f.req?'Например: Введи телефон':'Если ввод неверный'} onChange={ev=>up({err:ev.target.value})}/></label>}
{d?.opts&&<div className="fld"><span>Варианты (по одному в строку)</span><Lines key={e.id} value={f.opts??[]} onCommit={a=>up({opts:a})}/></div>}
<p className="hint">Маска: подчёркивание или 9 это цифра, остальное подставляется само. В просмотре (P) поле работает: ввод, маска, проверка при нажатии кнопки блока. Всё это уходит в ТЗ</p></>}
</Sec>}
/** настройки компонента просмотра: вид, пункты, значение */
export function CmpSec({e,set}:{e:El;set:SetFn}){
const c=e.cp;const k=c?.k??'';const d=cmpKind(k);
const up=(p:Partial<CP>)=>{if(!c)return;const n:Record<string,unknown>={...c,...p};for(const x of Object.keys(n))if(n[x]===undefined)delete n[x];set({cp:n as unknown as CP})};
return<Sec t="Компонент">
<label className="fld"><span>Вид</span><select className="inp" value={k} onChange={ev=>set(cmpPatch(ev.target.value))}>{CMP_KINDS.map(x=><option key={x.k} value={x.k}>{x.l}</option>)}</select></label>
{c&&d?.items&&<div className="fld"><span>Пункты</span><Lines key={e.id+k} value={c.items??[]} rows={6} hint={d.hint} onCommit={a=>up({items:a})}/></div>}
{c&&k==='tabs'&&(()=>{const n=(c.items??[]).length;const o=c.o==='v'?'v':'h';const sg=(on:boolean,t:string,f:()=>void)=><button type="button" key={t} className={on?'on':''} aria-pressed={on} onClick={f}>{t}</button>;
const fit=(p:Partial<CP>)=>{const no=(p.o??o) as 'h'|'v';const [w,h]=tabSize(n,no);up(p);if(p.o&&p.o!==o)set({w,h})};
return<>
<div className="fld"><span>Расположение</span><div className="seg">{sg(o==='h','Сверху',()=>fit({o:'h'}))}{sg(o==='v','Сбоку',()=>fit({o:'v'}))}</div></div>
<div className="fld"><span>Вид</span><div className="seg">{TAB_STYLES.map(([v,t])=>sg((c.s??'line')===v,t,()=>up({s:v})))}</div></div>
{o==='h'?<div className="fld"><span>Выравнивание</span><div className="seg">{sg((c.a??'s')==='s','Слева',()=>up({a:undefined}))}{sg(c.a==='c','Центр',()=>up({a:'c'}))}{sg(c.a==='f','Во всю ширину',()=>up({a:'f'}))}</div></div>
:<div className="fld"><span>Сторона</span><div className="seg">{sg(c.p!=='e','Слева',()=>up({p:undefined}))}{sg(c.p==='e','Справа',()=>up({p:'e'}))}</div></div>}
<Range label="Открыта сразу" value={Math.min(n,Math.round(c.v??0)+1)} min={1} max={Math.max(1,n)} onChange={v=>up({v:v-1||undefined})}/>
<div className="btnrow"><button type="button" className="btn" disabled={n>=8} onClick={()=>{const a=[...(c.items??[]),`Вкладка ${n+1} | Текст вкладки ${n+1}`];up({items:a});if(o==='v')set({h:tabSize(a.length,'v')[1]})}}>+ Вкладка</button><button type="button" className="btn" disabled={n<=2} onClick={()=>{const a=(c.items??[]).slice(0,-1);up({items:a,v:Math.min(c.v??0,a.length-1)||undefined});if(o==='v')set({h:tabSize(a.length,'v')[1]})}}>− Вкладка</button></div></>})()}
{c&&(k==='slider'||k==='progress')&&<Range label="Значение" value={c.v??50} min={0} max={100} unit={k==='progress'?'%':''} onChange={v=>up({v})}/>}
{c&&k==='rating'&&<Range label="Звёзд" value={c.v??4} min={0} max={5} onChange={v=>up({v})}/>}
{c&&k==='switch'&&<label className="chk"><input type="checkbox" checked={!!c.on} onChange={ev=>up({on:ev.target.checked?1:undefined})}/><span>Включён сразу</span></label>}
<p className="hint">В просмотре (P) и в скачанном HTML компонент работает. Подпись правится в поле «Текст». В ТЗ он описан видом, пунктами и поведением</p>
</Sec>}
/** настройки формы блока для ТЗ и просмотра: куда отправлять, согласие, «Спасибо» */
export function FormSec({b}:{b:Block}){
const s=useStore();const has=(['desktop','tablet','mobile'] as const).some(d=>b.els[d].some(e=>e.t==='input'));if(!has&&!b.fm)return null;
const fm=b.fm??{};const up=(p:Partial<NonNullable<Block['fm']>>)=>{const n:Record<string,string>={};for(const [x,v] of Object.entries({...fm,...p}))if(typeof v==='string'&&v!=='')n[x]=v;s.editBlock(b.id,{fm:Object.keys(n).length?n:undefined})};
return<div className="sec"><h4>Форма</h4>
<label className="fld"><span>Куда отправлять</span><input className="inp" value={fm.to??''} placeholder="Для ТЗ: на почту, в CRM, в Telegram" onChange={ev=>up({to:ev.target.value})}/></label>
<label className="fld"><span>Согласие</span><input className="inp" value={fm.consent??''} placeholder="Текст согласия на обработку данных" onChange={ev=>up({consent:ev.target.value})}/></label>
<label className="fld"><span>«Спасибо» после отправки</span><input className="inp" value={fm.thanks??''} placeholder="Покажется в просмотре после нажатия кнопки" onChange={ev=>up({thanks:ev.target.value})}/></label>
<p className="hint">В просмотре кнопка блока сначала проверяет обязательные поля, потом показывает «Спасибо» и переходит по своей ссылке</p></div>}
