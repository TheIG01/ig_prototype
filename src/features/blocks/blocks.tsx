import {useState} from 'react';
import {X,Plus} from 'lucide-react';
import {useStore,FW} from '../../store';
import type {El,Dev,BlockTpl} from '../../store';import type {PStyle} from '../../lib/art';
import {TPLS,CATS,buildTpl} from '../../lib/tpl';
import {elStyle,elInner} from '../canvas/elStyle';
/** miniature of a block: real wireframe scaled to tw px wide */
export function Thumb({els,h,dev='desktop',tw=200,st}:{els:El[];h:number;dev?:Dev;tw?:number;st?:PStyle}){
const w=FW[dev],k=tw/w;
return<div className="th" style={{width:tw,height:Math.max(20,h*k)}}><div className="th-in" style={{width:w,height:h,transform:`scale(${k})`}}>{els.map(e=><div key={e.id} className={'el '+e.t} style={elStyle(e,0,st)}>{elInner(e)}</div>)}</div></div>}
const cache=new Map<string,ReturnType<typeof buildTpl>>();
const built=(name:string)=>{let b=cache.get(name);if(!b){b=buildTpl(TPLS.find(t=>t.name===name)!);cache.set(name,b)}return b};
export function BlockPicker({q,tpls,onPick,onTpl,onDelTpl}:{q:string;tpls:BlockTpl[];onPick:(n:string)=>void;onTpl:(id:string)=>void;onDelTpl:(id:string)=>void}){
const f=q.trim().toLowerCase();const [g,setG]=useState('Все');
const cat=(t:BlockTpl)=>t.cat||'Мои шаблоны';
const myCats=[...new Set(tpls.map(cat))];
const lib=CATS.map(c=>[c,TPLS.filter(t=>t.cat===c&&t.name.toLowerCase().includes(f))] as const).filter(([c,i])=>i.length&&(g==='Все'||g===c));
const mine=myCats.map(c=>[c,tpls.filter(t=>cat(t)===c&&t.name.toLowerCase().includes(f))] as const).filter(([c,i])=>i.length&&(g==='Все'||g==='m:'+c));
const nav=(id:string,label:string,n:number)=><button type="button" key={id} className={g===id?'on':''} onClick={()=>setG(id)}><span>{label}</span><small>{n}</small></button>;
return<div className="lib"><nav className="libn">{nav('Все','Все блоки',TPLS.length+tpls.length)}
{myCats.length>0&&<h4>Мои группы</h4>}{myCats.map(c=>nav('m:'+c,c,tpls.filter(t=>cat(t)===c).length))}
<h4>Библиотека</h4>{CATS.map(c=>nav(c,c,TPLS.filter(t=>t.cat===c).length))}</nav>
<div className="libm">
{!f&&g==='Все'&&<div className="pg"><button type="button" className="pc empty" onClick={()=>onPick('Блок')}><div className="th" style={{width:200,height:90}}><Plus size={22}/></div><span>Пустой блок</span></button></div>}
{mine.map(([c,items])=><div key={'m'+c}><h4>{c}</h4><div className="pg">{items.map(t=><div key={t.id} className="pcw"><button type="button" className="pc" onClick={()=>onTpl(t.id)}><Thumb els={t.els.desktop} h={t.h.desktop}/><span>{t.name}</span></button><button type="button" className="pcx" title="Удалить шаблон" onClick={()=>onDelTpl(t.id)}><X size={12}/></button></div>)}</div></div>)}
{lib.map(([c,items])=><div key={c}><h4>{c}</h4><div className="pg">{items.map(t=>{const b=built(t.name);return<button type="button" key={t.name} className="pc" onClick={()=>onPick(t.name)}><Thumb els={b.els.desktop} h={b.h.desktop}/><span>{t.name}</span></button>})}</div></div>)}
{!mine.length&&!lib.length&&<h4>Нет в библиотеке. Enter создаст пустой блок с этим названием</h4>}</div></div>}
export function ContentPanel(){
const s=useStore();const sh=s.data?.projects.find(p=>p.id===s.projectId)?.sheets.find(x=>x.id===s.sheetId);
const b=sh?.blocks.find(x=>x.id===s.blockId);if(!b)return null;
return<aside className="panel"><div className="ph"><b>Контент</b><span>Блок</span><button className="btn ic" onClick={()=>s.setBlock(null)} aria-label="Закрыть"><X size={14}/></button></div><div className="sec">
<input className="inp" value={b.title} placeholder="Название блока" onChange={e=>s.editBlock(b.id,{title:e.target.value})}/>
<textarea className="inp" placeholder="Тексты блока: заголовок, подзаголовок, пункты, кнопка. Заметки для дизайнера и логика работы" value={b.text} onChange={e=>s.editBlock(b.id,{text:e.target.value})}/></div></aside>}
