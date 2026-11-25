import {lazy,Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {Search,X} from 'lucide-react';
import type {El} from '../../store';
import {SHAPES,MOCKS,BULLETS,artHtml} from '../../lib/art';
import {ICON_LIST} from '../../lib/icons';import {FF_KINDS,ffPatch} from '../../lib/ff';import {CMP_KINDS,cmpPatch} from '../../lib/cmp';import type {PStyle} from '../../lib/art';
const ElLib=lazy(()=>import('./ElLib'));

type Pick=(t:El['t'],x:Partial<El>)=>void;
const TABS=['Фигуры','Иконки','Мокапы','Списки','Формы','Библиотека'] as const;
/** default size of a new element by kind: circle stays round, arrow stays wide */
export const SIZE:Record<string,[number,number]>={circle:[160,160],star:[160,160],poly:[160,160],cross:[120,120],ellipse:[200,120],capsule:[200,64],arr1:[200,40],arr2:[200,40],elbow:[200,120],arc:[200,120],tri:[160,140],diamond:[160,160],arrow:[220,100],tag:[220,64],ribbon:[240,64],pill:[220,64],para:[220,100],fold:[200,160],bubble:[240,140],
phone:[220,440],browser:[480,320],laptop:[460,300],tablet:[340,440]};
const sz=(k:string):[number,number]=>SIZE[k]??[200,140];
const mk=(p:Partial<El>):El=>({id:'p',t:'shape',x:0,y:0,w:44,h:34,text:'',...p});
export const Prev=({e}:{e:El})=><span className="prev" style={{width:e.w,height:e.h}} dangerouslySetInnerHTML={{__html:artHtml(e)}}/>;

/** lib: вкладка «Библиотека»: n растёт при каждом запросе (Alt+2, Shift+I, Ctrl+Alt+K), save растёт при Ctrl+Alt+K */
export interface LibProps{n:number;save:number;st?:PStyle;sel:El[];onPut:(es:El[],w:number,name:string)=>void}
export function InsertPanel({onPick,onClose,lib}:{onPick:Pick;onClose:()=>void;lib:LibProps}){
const [tab,setTab]=useState<typeof TABS[number]>(lib.n>0?'Библиотека':'Фигуры');useEffect(()=>{if(lib.n>0)setTab('Библиотека')},[lib.n]);const [q,setQ]=useState('');const ref=useRef<HTMLInputElement>(null);
useEffect(()=>{if(tab==='Иконки')ref.current?.focus()},[tab]);
const icons=useMemo(()=>{const f=q.trim().toLowerCase();return ICON_LIST.filter(([id,ru,cat])=>!f||id.includes(f)||ru.toLowerCase().includes(f)||cat.toLowerCase().includes(f))},[q]);
const pickShape=(k:string)=>{const [w,h]=sz(k);onPick('shape',{sh:k,w,h})};
return<div className={'ins-p'+(tab==='Библиотека'?' wide':'')} role="dialog" aria-label="Элементы" onPointerDown={e=>e.stopPropagation()}>
<div className="ins-h"><div className="seg">{TABS.map(t=><button key={t} className={tab===t?'on':''} onClick={()=>setTab(t)}>{t}</button>)}</div><button className="btn ic" onClick={onClose} aria-label="Закрыть"><X size={14}/></button></div>
{tab==='Фигуры'&&<div className="ins-g c5">{SHAPES.map(([k,l])=><button key={k} className="cell" title={l} onClick={()=>pickShape(k)}><Prev e={mk({sh:k,w:44,h:k==='arrow'||k==='tag'||k==='ribbon'||k==='pill'?24:38,fill:'#EAF0FF',stroke:'#2F6BFF',sw:1.5})}/><small>{l}</small></button>)}</div>}
{tab==='Иконки'&&<><label className="search"><Search size={14}/><input ref={ref} placeholder="Найти иконку: телефон, доставка, награда" value={q} onChange={e=>setQ(e.target.value)}/></label>
<div className="ins-g c7 sc">{icons.map(([id,ru])=><button key={id} className="cell ic" title={ru} onClick={()=>onPick('icon',{ic:id,w:48,h:48})}><Prev e={mk({t:'icon',ic:id,w:26,h:26})}/></button>)}{!icons.length&&<p className="mut">Ничего не нашлось</p>}</div></>}
{tab==='Мокапы'&&<div className="ins-g c4">{MOCKS.map(([k,l])=>{const [w,h]=sz(k);const r=Math.min(46/w,52/h);return<button key={k} className="cell tall" title={l} onClick={()=>onPick('mock',{mk:k,w,h})}><Prev e={mk({t:'mock',mk:k,w:w*r,h:h*r})}/><small>{l}</small></button>})}</div>}
{tab==='Списки'&&<div className="ins-g c2">{BULLETS.map(([k,l])=><button key={k} className="cell list" title={l} onClick={()=>onPick('list',{bu:k,w:320,h:120,text:'Первый пункт\nВторой пункт\nТретий пункт'})}><span className="prev lst" dangerouslySetInnerHTML={{__html:artHtml(mk({t:'list',bu:k,text:'Выгода один\nВыгода два\nВыгода три',w:120,h:50}))}}/><small>{l}</small></button>)}</div>}
{tab==='Формы'&&<div className="sc"><p className="ins-t">Поля формы</p><div className="ins-g c2">{FF_KINDS.map(x=><button key={x.k} className="cell list" title={x.l} onClick={()=>onPick('input',{...ffPatch(x.k),w:x.k==='choice'?300:280})}><b>{x.l}</b><small>{x.ph}</small></button>)}</div>
<p className="ins-t">Компоненты для просмотра</p><div className="ins-g c2">{CMP_KINDS.map(x=><button key={x.k} className="cell list" title={x.l} onClick={()=>onPick('cmp',cmpPatch(x.k))}><b>{x.l}</b><small>{x.items?x.items[0].replace(/^\+/,'').split('|')[0].trim():x.text||'работает в просмотре'}</small></button>)}</div></div>}
{tab==='Библиотека'&&<Suspense fallback={<p className="mut">Загружаю библиотеку</p>}><ElLib st={lib.st} sel={lib.sel} saveReq={lib.save} onPut={lib.onPut}/></Suspense>}
{tab!=='Библиотека'&&tab!=='Формы'&&<p className="ins-f">Выбери элемент и потяни на холсте, чтобы нарисовать · E открывает и закрывает</p>}</div>}
