import {useMemo,useState,useEffect} from 'react';
import {X,Copy,ArrowRight,CheckCircle2,AlertTriangle,CircleAlert} from 'lucide-react';
import type {Project} from '../../store';
import {checkProject,KIND_NAMES} from '../../lib/precheck';import type {Issue,Kind} from '../../lib/precheck';
import {buildLetter,LETTER_Q} from '../../lib/letter';
import {toast} from '../../lib/toast';
import './check.css';
const LK='igp.letter';
const ORDER:Kind[]=['link','empty','form','goal'];
/** окно «Проверка перед экспортом»: список проблем с переходом и шаблон письма заказчику */
export function CheckDialog({pr,onGo,onClose,tab0}:{pr:Project;onGo:(i:Issue)=>void;onClose:()=>void;tab0?:'check'|'letter'}){
const [tab,setTab]=useState<'check'|'letter'>(tab0??'check');
const issues=useMemo(()=>checkProject(pr),[pr]);
const [off,setOff]=useState<Kind[]>([]);
const saved=(()=>{try{const j=JSON.parse(localStorage.getItem(LK)||'{}') as {from?:string};return typeof j.from==='string'?j.from:''}catch{return''}})();
const [title,setTitle]=useState(pr.name);const [link,setLink]=useState('');const [from,setFrom]=useState(saved);const [qs,setQs]=useState(LETTER_Q.join('\n'));
useEffect(()=>{try{localStorage.setItem(LK,JSON.stringify({from}))}catch{/* хранилище недоступно */}},[from]);
useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[onClose]);
const text=useMemo(()=>buildLetter(pr,{title,link,questions:qs.split('\n'),from}),[pr,title,link,qs,from]);
const copy=async()=>{try{await navigator.clipboard.writeText(text);toast('Письмо скопировано')}catch{toast('Браузер не дал скопировать: выдели текст и нажми Ctrl+C')}};
const shown=issues.filter(i=>!off.includes(i.kind));
const errs=issues.filter(i=>i.sev==='err').length,warns=issues.length-errs;
const flip=(k:Kind)=>setOff(a=>a.includes(k)?a.filter(x=>x!==k):[...a,k]);
return<div className="modal" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="sheet wide xl ck-sheet"><h2>Перед отправкой заказчику</h2>
<div className="seg ck-tabs"><button className={tab==='check'?'on':''} onClick={()=>setTab('check')}>Проверка{issues.length?' · '+issues.length:''}</button><button className={tab==='letter'?'on':''} onClick={()=>setTab('letter')}>Письмо</button></div>
{tab==='check'&&<div className="ck-body">
{!issues.length?<p className="ck-ok"><CheckCircle2 size={18}/>Проблем не найдено. Можно отправлять</p>:<>
<p className="txt">Ошибок: {errs}, замечаний: {warns}. Нажми на строку, чтобы перейти к месту.</p>
<div className="ck-f">{ORDER.filter(k=>issues.some(i=>i.kind===k)).map(k=><button key={k} className={'ck-chip'+(off.includes(k)?'':' on')} onClick={()=>flip(k)}>{KIND_NAMES[k]} · {issues.filter(i=>i.kind===k).length}</button>)}</div>
<div className="ck-list">{shown.map(i=><button key={i.key} className="ck-row" onClick={()=>onGo(i)}><span className={'ck-ic '+i.sev}>{i.sev==='err'?<CircleAlert size={16}/>:<AlertTriangle size={16}/>}</span><span className="ck-t"><b>{i.msg}</b><small>{i.sheetName} · {i.blockTitle}</small></span><ArrowRight size={16}/></button>)}{!shown.length&&<p className="txt">Все группы скрыты фильтром</p>}</div></>}
</div>}
{tab==='letter'&&<div className="ck-body ck-letter"><div className="ck-form">
<label className="fld"><span>Название в письме</span><input className="inp" value={title} onChange={e=>setTitle(e.target.value)}/></label>
<label className="fld"><span>Ссылка на прототип</span><input className="inp" value={link} placeholder="Адрес после загрузки HTML на хостинг; пусто: файл во вложении" onChange={e=>setLink(e.target.value)}/></label>
<label className="fld"><span>Вопросы заказчику, по одному в строке</span><textarea className="inp" rows={5} value={qs} onChange={e=>setQs(e.target.value)}/></label>
<label className="fld"><span>Подпись</span><input className="inp" value={from} placeholder="Имя и контакты" onChange={e=>setFrom(e.target.value)}/></label></div>
<textarea className="inp ck-pre" readOnly value={text} aria-label="Текст письма"/></div>}
<div className="ck-foot"><button className="btn" onClick={onClose}><X size={16}/>Закрыть</button>{tab==='letter'&&<button className="btn pri" onClick={copy}><Copy size={16}/>Скопировать</button>}</div>
</div></div>}
