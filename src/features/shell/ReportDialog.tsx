import {useState,useRef,useEffect,useMemo} from 'react';
import {Printer,X} from 'lucide-react';
import type {Project,Dev} from '../../store';
import {DEVN} from '../../lib/dev';
import {buildReport,SIZES} from '../../lib/report';import type {PageSize} from '../../lib/report';
import {useUi} from '../../lib/ui';import {toast} from '../../lib/toast';
const VK='igp.rver';
/** окно PDF-отчёта: настройки слева, живой предпросмотр справа, кнопка печати в PDF */
export function ReportDialog({pr,dev,onClose}:{pr:Project;dev:Dev;onClose:()=>void}){
const [size,setSize]=useState<PageSize>('a4');const [d,setD]=useState<Dev>(dev);const [notes,setNotes]=useState(false);
const [ver,setVer]=useState(()=>{try{return localStorage.getItem(VK)||'1.0'}catch{return'1.0'}});
const [pick,setPick]=useState<string[]>(()=>pr.sheets.map(s=>s.id));
const ui=useUi();const fr=useRef<HTMLIFrameElement>(null);const pane=useRef<HTMLDivElement>(null);const [z,setZ]=useState(.7);const [html,setHtml]=useState('');const [err,setErr]=useState('');
useEffect(()=>{const t=setTimeout(()=>{try{setHtml(buildReport(pr,{size,dev:d,notes,sheets:pick,ver:ver.trim()||'1.0'}));setErr('')}catch(e){setErr(e instanceof Error?e.message:'Не получилось собрать отчёт')}},150);return()=>clearTimeout(t)},[pr,size,d,notes,pick,ver,ui.ag,ui.ty]);
useEffect(()=>{try{localStorage.setItem(VK,ver)}catch{/* хранилище недоступно */}},[ver]);
useEffect(()=>{const f=()=>{const w=pane.current?.clientWidth;if(w)setZ(Math.min(1,Math.max(.3,(w-24)/SIZES[size].w)))};f();addEventListener('resize',f);return()=>removeEventListener('resize',f)},[size]);
const applyZoom=()=>{const b=fr.current?.contentDocument?.body;if(b)(b.style as CSSStyleDeclaration&{zoom:string}).zoom=String(z)};
useEffect(applyZoom,[z,html]);
useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[onClose]);
const pages=useMemo(()=>(html.match(/class="pg/g)||[]).length,[html]);
const print=async()=>{const w=fr.current?.contentWindow;const doc=fr.current?.contentDocument;if(!w||!doc||!html)return;try{await doc.fonts.ready}catch{/* шрифты не дождались */}
const b=doc.body;const old=(b.style as CSSStyleDeclaration&{zoom:string}).zoom;(b.style as CSSStyleDeclaration&{zoom:string}).zoom='';toast('Откроется печать: выбери «Сохранить как PDF», поля «Нет», фон включён',undefined,6000);setTimeout(()=>{w.focus();w.print();(b.style as CSSStyleDeclaration&{zoom:string}).zoom=old},300)};
const tgl=(id:string)=>setPick(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);
const none=!pick.length;
return<div className="modal" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="sheet wide xl rp-sheet"><h2>PDF-отчёт для заказчика</h2>
<div className="rp"><div className="rp-o">
<label className="rp-l">Размер страницы</label><div className="seg">{(['a4','letter'] as const).map(k=><button key={k} className={size===k?'on':''} onClick={()=>setSize(k)}>{SIZES[k].name}</button>)}</div>
<label className="rp-l">Размер экрана</label><div className="seg">{(['desktop','tablet','mobile'] as const).map(k=><button key={k} className={d===k?'on':''} onClick={()=>setD(k)}>{DEVN[k]}</button>)}</div>
<label className="rp-l">Версия отчёта</label><input className="inp" maxLength={12} value={ver} onChange={e=>setVer(e.target.value)}/>
<div className="set-row" style={{padding:'8px 0'}}><div><b>Заметки команды</b><p>Тексты и пожелания под каждым блоком</p></div><input type="checkbox" className="sw" checked={notes} onChange={e=>setNotes(e.target.checked)}/></div>
<label className="rp-l">Листы в отчёте</label><div className="rp-sh">{pr.sheets.map(s=><label key={s.id} className="rp-c"><input type="checkbox" checked={pick.includes(s.id)} onChange={()=>tgl(s.id)}/><span>{s.kind==='popup'?'Попап: ':''}{s.name}</span></label>)}</div>
<p className="txt" style={{margin:'8px 0 0'}}>{err?err:none?'Выбери хотя бы один лист':'Страниц в отчёте: '+pages+'. Логотип и реквизиты агентства вносятся в Настройках.'}</p>
</div><div className="rp-v" ref={pane}>{html&&<iframe ref={fr} title="Предпросмотр отчёта" srcDoc={html} sandbox="allow-same-origin allow-modals" onLoad={applyZoom}/>}</div></div>
<div className="rp-f"><button className="btn" onClick={onClose}><X size={16}/>Закрыть</button><button className="btn pri" disabled={none||!html||!!err} onClick={print}><Printer size={16}/>Сохранить PDF</button></div></div></div>}
