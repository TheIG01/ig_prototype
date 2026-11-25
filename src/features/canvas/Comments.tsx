import {useEffect,useRef,useState} from 'react';
import {Check,MessageCircle,RotateCcw,Trash2,Upload,X} from 'lucide-react';
import {useStore} from '../../store';
import type {Block,Dev} from '../../store';
import {uid} from '../../lib/uid';
import {cmNums,cmCount,cmShow,cmWhen,getAuthor,setAuthor} from '../../lib/comments';import type {CmFilter} from '../../lib/comments';
import {toast} from '../../lib/toast';import {parseNotes,applyNotes} from '../../lib/clientNotes';
import './cm.css';
/** состояние слоя комментариев: on режим «ставить пин» (C), show слои видны, f фильтр, open ветка, draft новая точка */
export interface CmState{on:boolean;show:boolean;f:CmFilter;open:string|null;draft:{bid:string;x:number;y:number}|null}
export const CM0:CmState={on:false,show:true,f:'all',open:null,draft:null};
const inField=(t:EventTarget|null)=>{const n=t as HTMLElement|null;return!!n&&(n.tagName==='INPUT'||n.tagName==='TEXTAREA'||n.tagName==='SELECT'||n.isContentEditable)};
/** клавиша C включает режим комментариев, Esc выключает; не срабатывает в полях ввода */
export function useCmKeys(set:(f:(s:CmState)=>CmState)=>void){
useEffect(()=>{const k=(e:KeyboardEvent)=>{if(inField(e.target)||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey)return;
if(e.code==='KeyC'){e.preventDefault();e.stopImmediatePropagation();set(s=>({...s,on:!s.on,show:true,draft:null}))}
else if(e.code==='Escape'){set(s=>s.on||s.draft||s.open?{...s,on:false,draft:null,open:null}:s)}};
addEventListener('keydown',k,true);return()=>removeEventListener('keydown',k,true)},[set])}
/** слой внутри холста: ловит клик (режим C) и рисует пины; координаты холста уже масштабируются родителем */
export function CmLayer({vis,tops,dev,W,H,cm,setCm}:{vis:Block[];tops:number[];dev:Dev;W:number;H:number;cm:CmState;setCm:(f:(s:CmState)=>CmState)=>void}){
const s=useStore();const pr=s.data?.projects.find(p=>p.id===s.projectId);const nums=cmNums(pr?.sheets.flatMap(x=>x.blocks)??[]);
if(!cm.show&&!cm.on)return null;
const hit=(ev:React.PointerEvent<HTMLDivElement>)=>{ev.stopPropagation();ev.preventDefault();const r=ev.currentTarget.getBoundingClientRect();const k=r.width/W;const x=(ev.clientX-r.left)/k,y=(ev.clientY-r.top)/k;
let i=0;for(let j=0;j<vis.length;j++)if(y>=tops[j])i=j;const b=vis[i];if(!b)return;setCm(q=>({...q,open:null,draft:{bid:b.id,x:Math.max(0,Math.min(W,Math.round(x))),y:Math.max(0,Math.min(b.h[dev],Math.round(y-tops[i])))}}))};
return<>{cm.on&&<div className="cm-cap" style={{height:H}} onPointerDown={hit}/>}
{cm.show&&vis.flatMap((b,i)=>(b.cmt??[]).filter(c=>c.dev===dev&&cmShow(c,cm.f)).map(c=><button key={c.id} id={'cmpin-'+c.id} className={'cm-pin'+(c.done?' done':'')+(cm.open===c.id?' on':'')} style={{left:c.x,top:tops[i]+c.y}} title={c.msgs[0]?.text} onPointerDown={ev=>ev.stopPropagation()} onClick={ev=>{ev.stopPropagation();setCm(q=>({...q,open:c.id,draft:null}))}}>{nums.get(c.id)??''}</button>))}
{cm.draft&&(()=>{const i=vis.findIndex(b=>b.id===cm.draft!.bid);if(i<0)return null;return<span className="cm-pin draft" style={{left:cm.draft.x,top:tops[i]+cm.draft.y}}>+</span>})()}</>}
/** панель комментариев: список с фильтром, ветка, новая запись */
export function CmPanel({dev,blocks,cm,setCm}:{dev:Dev;blocks:Block[];cm:CmState;setCm:(f:(s:CmState)=>CmState)=>void}){
const s=useStore();const pr=s.data?.projects.find(p=>p.id===s.projectId);const all=pr?.sheets.flatMap(x=>x.blocks)??[];const nums=cmNums(all);const cnt=cmCount(blocks);
const [txt,setTxt]=useState('');const [by,setBy]=useState(getAuthor);const fr=useRef<HTMLInputElement>(null);
useEffect(()=>{setTxt('')},[cm.open,cm.draft?.bid,cm.draft?.x,cm.draft?.y]);
if(!cm.on&&!cm.open&&!cm.draft)return null;
const found=cm.open?blocks.flatMap(b=>(b.cmt??[]).map(c=>({b,c}))).find(x=>x.c.id===cm.open):undefined;
const au=()=>{const v=by.trim();setAuthor(v);return v};
const add=()=>{const t=txt.trim();if(!t||!cm.draft)return;const id=uid();s.cmAdd(cm.draft.bid,dev,id,cm.draft.x,cm.draft.y,t,au());setCm(q=>({...q,draft:null,open:id}));setTxt('')};
const reply=()=>{const t=txt.trim();if(!t||!found)return;s.cmReply(found.b.id,found.c.id,t,au());setTxt('')};
const key=(fn:()=>void)=>(ev:React.KeyboardEvent)=>{if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();fn()}};
const close=()=>setCm(q=>({...q,open:null,draft:null}));
const loadNotes=async(f:File|undefined)=>{if(!f||!pr)return;let r;try{r=parseNotes(await f.text())}catch{toast('Файл не читается');return}if(!r.ok){toast(r.err);return}const o=applyNotes(pr,r.notes);if(o.added)s.replaceProject(o.project);
toast(o.added?'Заметок добавлено: '+o.added+(o.dup?', уже были: '+o.dup:'')+(o.lost?', без блока: '+o.lost:''):o.dup&&!o.lost?'Все заметки уже есть в проекте':'Не нашёл блоки для заметок: '+o.lost+'. Файл от другого проекта?')};
const who=<label className="fld"><span>Подпись</span><input className="inp" value={by} maxLength={40} placeholder="Как тебя подписать" onChange={ev=>setBy(ev.target.value)} onBlur={()=>setAuthor(by.trim())}/></label>;
return<aside className="cm-p" onPointerDown={ev=>ev.stopPropagation()} aria-label="Комментарии">
{cm.draft?<><div className="ph"><b>Новый комментарий</b><button className="btn ic" aria-label="Отмена" onClick={()=>setCm(q=>({...q,draft:null}))}><X size={14}/></button></div>
<textarea className="inp" autoFocus rows={3} value={txt} placeholder="Что поправить или обсудить в этой точке" onChange={ev=>setTxt(ev.target.value)} onKeyDown={key(add)}/>{who}
<div className="btnrow"><button className="btn pri" disabled={!txt.trim()} onClick={add}>Добавить (Ctrl+Enter)</button><button className="btn" onClick={()=>setCm(q=>({...q,draft:null}))}>Отмена</button></div></>
:found?<><div className="ph"><b>Комментарий {nums.get(found.c.id)}</b><span>{found.c.done?'решено':'открыто'}</span><button className="btn ic" aria-label="Закрыть" onClick={close}><X size={14}/></button></div>
{found.c.msgs.map(m=><div key={m.id} className="cm-m"><small>{m.by||'Автор'} · {cmWhen(m.at)}</small>{m.text}</div>)}
<textarea className="inp" rows={2} value={txt} placeholder="Ответить" onChange={ev=>setTxt(ev.target.value)} onKeyDown={key(reply)}/>{who}
<div className="btnrow"><button className="btn pri" disabled={!txt.trim()} onClick={reply}>Ответить</button>
<button className="btn" onClick={()=>s.cmDone(found.b.id,found.c.id,!found.c.done)}>{found.c.done?<><RotateCcw size={14}/>Открыть снова</>:<><Check size={14}/>Решено</>}</button>
<button className="btn danger" title="Удалить ветку" onClick={()=>{const id=found.c.id,bid=found.b.id;s.cmDel(bid,id);setCm(q=>({...q,open:null}));toast('Комментарий удалён',{label:'Вернуть',run:()=>s.undo()},5000)}}><Trash2 size={14}/></button></div></>
:<><div className="ph"><b><MessageCircle size={14}/> Комментарии</b><span>{cnt.open} открытых · {cnt.done} решённых</span><button className="btn ic" aria-label="Выключить режим" onClick={()=>setCm(q=>({...q,on:false}))}><X size={14}/></button></div>
<div className="seg">{([['all','Все'],['open','Открытые'],['done','Решённые']] as const).map(([k,l])=><button key={k} className={cm.f===k?'on':''} onClick={()=>setCm(q=>({...q,f:k}))}>{l}</button>)}</div>
{(()=>{const a=blocks.flatMap(b=>(b.cmt??[]).filter(c=>cmShow(c,cm.f)).map(c=>({b,c})));return a.length?a.map(({b,c})=><button key={c.id} className={'cm-li'+(c.done?' done':'')} onClick={()=>{setCm(q=>({...q,open:c.id}));setTimeout(()=>document.getElementById('cmpin-'+c.id)?.scrollIntoView({block:'center',inline:'center',behavior:'smooth'}),30)}}><b>{nums.get(c.id)}</b><span>{b.title}: {c.msgs[0]?.text.slice(0,70)}</span></button>):<p className="hint">{cnt.all?'В этом фильтре ничего нет':'Комментариев пока нет. Кликни по холсту, чтобы поставить первый'}</p>})()}
<div className="btnrow"><button className="btn" title="Загрузить файл заметок, который вернул заказчик" onClick={()=>fr.current?.click()}><Upload size={14}/>Заметки заказчика</button><input ref={fr} type="file" accept=".json,application/json" hidden onChange={ev=>{void loadNotes(ev.target.files?.[0]);ev.target.value=''}}/></div>
<p className="hint">Режим включён: клик по холсту ставит пин. C включает и выключает режим, Esc закрывает. Комментарии видны в ТЗ, PDF и скачанном HTML</p></>}
</aside>}
