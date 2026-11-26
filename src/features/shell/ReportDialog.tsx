import {useState,useRef,useEffect,useMemo} from 'react';
import {Printer,X} from 'lucide-react';
import type {Project,Dev} from '../../store';
import {DEVN} from '../../lib/dev';
import {buildReport,SIZES} from '../../lib/report';import type {PageSize,ReportMode} from '../../lib/report';
import {useUi} from '../../lib/ui';import {toast} from '../../lib/toast';
const VK='igp.rver';
/** окно PDF-отчёта: настройки слева, живой предпросмотр справа, кнопка печати в PDF */
export function ReportDialog({pr,dev,onClose}:{pr:Project;dev:Dev;onClose:()=>void}){
const [size,setSize]=useState<PageSize>('a4');const [d,setD]=useState<Dev>(dev);const [notes,setNotes]=useState(false);const [mode,setMode]=useState<ReportMode>('full');const [toc,setToc]=useState(true);const [sty,setSty]=useState(true);const [par,setPar]=useState(true);const [txt,setTxt]=useState(true);const [tbl,setTbl]=useState(true);
const [ver,setVer]=useState(()=>{try{return localStorage.getItem(VK)||'1.0'}catch{return'1.0'}});
const [pick,setPick]=useState<string[]>(()=>pr.sheets.map(s=>s.id));
const ui=useUi();const fr=useRef<HTMLIFrameElement>(null);const pane=useRef<HTMLDivElement>(null);const [z,setZ]=useState(.7);const [html,setHtml]=useState('');const [err,setErr]=useState('');
useEffect(()=>{const t=setTimeout(()=>{try{setHtml(buildReport(pr,{size,dev:d,notes,sheets:pick,ver:ver.trim()||'1.0',mode,toc,style:sty,params:par,texts:txt,table:tbl}));setErr('')}catch(e){setErr(e instanceof Error?e.message:'Не получилось собрать отчёт')}},150);return()=>clearTimeout(t)},[pr,size,d,notes,pick,ver,mode,toc,sty,par,txt,tbl,ui.ag,ui.ty]);
useEffect(()=>{try{localStorage.setItem(VK,ver)}catch{/* хранилище недоступно */}},[ver]);
useEffect(()=>{const f=()=>{const w=pane.current?.clientWidth;if(w)setZ(Math.min(1,Math.max(.3,(w-24)/SIZES[size].w)))};f();addEventListener('resize',f);return()=>removeEventListener('resize',f)},[size]);
const applyZoom=()=>{const b=fr.current?.contentDocument?.body;if(b)(b.style as CSSStyleDeclaration&{zoom:string}).zoom=String(z)};
useEffect(applyZoom,[z,html]);
useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[onClose]);
const pages=useMemo(()=>(html.match(/class="pg/g)||[]).length,[html]);
const print=()=>{if(!html)return;const W=SIZES[size].w,H=SIZES[size].h;const f=document.createElement('iframe');f.setAttribute('aria-hidden','true');f.style.cssText='position:fixed;left:0;top:0;width:'+W+'px;height:'+H+'px;opacity:0;pointer-events:none;border:0;z-index:-1';
let done=false;const kill=()=>{if(done)return;done=true;setTimeout(()=>f.remove(),500)};
f.onload=async()=>{const w=f.contentWindow;const doc=f.contentDocument;if(!w||!doc)return;try{await doc.fonts.ready}catch{/* шрифты не дождались */}
toast('В окне печати: принтер «Сохранить как PDF», бумага '+SIZES[size].name+', масштаб 100%, поля «Нет», включи «Фоновая графика»',undefined,8000);
w.addEventListener('afterprint',kill);setTimeout(()=>{w.focus();w.print();setTimeout(kill,120000)},250)};
f.srcdoc=html;document.body.appendChild(f)};
const tgl=(id:string)=>setPick(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);
const none=!pick.length;
return<div className="modal" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="sheet wide xl rp-sheet"><h2>PDF-отчёт для заказчика</h2>
<div className="rp"><div className="rp-o">
<label className="rp-l">Размер страницы</label><div className="seg">{(['a4','letter'] as const).map(k=><button key={k} className={size===k?'on':''} onClick={()=>setSize(k)}>{SIZES[k].name}</button>)}</div>
<label className="rp-l">Размер экрана</label><div className="seg">{(['desktop','tablet','mobile'] as const).map(k=><button key={k} className={d===k?'on':''} onClick={()=>setD(k)}>{DEVN[k]}</button>)}</div>
<label className="rp-l">Версия отчёта</label><input className="inp" maxLength={12} value={ver} onChange={e=>setVer(e.target.value)}/>
<label className="rp-l">Что в отчёте</label><div className="seg hug">{([['full','Полный'],['pages','Макеты по страницам']] as const).map(([k,l])=><button key={k} className={mode===k?'on':''} onClick={()=>setMode(k)}>{l}</button>)}</div>
<p className="txt" style={{margin:'6px 0 0',fontSize:12}}>{mode==='pages'?'Только картинки страниц сайта, без таблиц и текстов. Длинная страница делится на части.':'Макеты блоков, параметры, тексты и таблица характеристик.'}</p>
<div className="rp-sh" style={{marginTop:10,maxHeight:"none"}}>
<label className="rp-c"><input type="checkbox" checked={toc} onChange={e=>setToc(e.target.checked)}/><span>Оглавление</span></label>
<label className="rp-c"><input type="checkbox" checked={sty} onChange={e=>setSty(e.target.checked)}/><span>Шрифты и размеры текста</span></label>
{mode==='full'&&<><label className="rp-c"><input type="checkbox" checked={par} onChange={e=>setPar(e.target.checked)}/><span>Параметры блоков</span></label>
<label className="rp-c"><input type="checkbox" checked={txt} onChange={e=>setTxt(e.target.checked)}/><span>Тексты блоков</span></label>
<label className="rp-c"><input type="checkbox" checked={tbl} onChange={e=>setTbl(e.target.checked)}/><span>Таблица характеристик</span></label>
<label className="rp-c"><input type="checkbox" checked={notes} onChange={e=>setNotes(e.target.checked)}/><span>Заметки команды</span></label></>}</div>
<label className="rp-l">Листы в отчёте</label><div className="rp-sh">{pr.sheets.map(s=><label key={s.id} className="rp-c"><input type="checkbox" checked={pick.includes(s.id)} onChange={()=>tgl(s.id)}/><span>{s.kind==='popup'?'Попап: ':''}{s.name}</span></label>)}</div>
<div className="rp-stats"><div><b>{pages||'—'}</b><span>страниц</span></div><div><b>{pick.length}</b><span>листов</span></div><div><b>{SIZES[size].name}</b><span>формат</span></div></div>
<p className="txt" style={{margin:'12px 0 0'}}>{err?err:none?'Выбери хотя бы один лист':'Логотип и реквизиты агентства вносятся в Настройках. Отчёт чёрно-белый.'}</p>
</div><div className="rp-v" ref={pane}>{html&&<iframe ref={fr} title="Предпросмотр отчёта" srcDoc={html} sandbox="allow-same-origin allow-modals" onLoad={applyZoom}/>}</div></div>
<div className="rp-f"><button className="btn" onClick={onClose}><X size={16}/>Закрыть</button><button className="btn pri" disabled={none||!html||!!err} onClick={print}><Printer size={16}/>Сохранить PDF</button></div></div></div>}
