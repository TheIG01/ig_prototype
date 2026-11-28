import {useState,useRef,useEffect,useMemo} from 'react';
import {Printer,X,Download,Upload,Trash2,RotateCcw} from 'lucide-react';
import type {Project,Dev} from '../../store';
import {DEVN} from '../../lib/dev';
import {buildReport,SIZES,RC0,FONTS} from '../../lib/report';import type {PageSize,ReportMode,RepCfg} from '../../lib/report';
import {useUi} from '../../lib/ui';import {toast} from '../../lib/toast';
const VK='igp.rver',CK='igp.rcfg',PK='igp.rpre';
const fix=(c:RepCfg):RepCfg=>({...c,cols:Array.isArray(c.cols)?c.cols:RC0.cols});
const loadC=():RepCfg=>{try{return fix({...RC0,...JSON.parse(localStorage.getItem(CK)||'{}')})}catch{return{...RC0}}};
const loadP=():Record<string,RepCfg>=>{try{return JSON.parse(localStorage.getItem(PK)||'{}')}catch{return{}}};
type Tab='content'|'cover'|'brand'|'look';
const TABS:[Tab,string][]=[['content','Содержимое'],['cover','Обложка'],['brand','Бренд'],['look','Вид']];
/** окно PDF-отчёта: настройки слева (4 вкладки), живой предпросмотр справа, печать в PDF */
export function ReportDialog({pr,dev,onClose}:{pr:Project;dev:Dev;onClose:()=>void}){
const [size,setSize]=useState<PageSize>('a4');const [d,setD]=useState<Dev>(dev);const [notes,setNotes]=useState(false);const [mode,setMode]=useState<ReportMode>('full');const [toc,setToc]=useState(true);const [sty,setSty]=useState(true);const [par,setPar]=useState(true);const [txt,setTxt]=useState(true);const [tbl,setTbl]=useState(true);
const [tab,setTab]=useState<Tab>('content');const [C,setC]=useState<RepCfg>(loadC);const [pre,setPre]=useState(loadP);
const [ver,setVer]=useState(()=>{try{return localStorage.getItem(VK)||'1.0'}catch{return'1.0'}});
const [pick,setPick]=useState<string[]>(()=>pr.sheets.map(s=>s.id));
const ui=useUi();const fr=useRef<HTMLIFrameElement>(null);const pane=useRef<HTMLDivElement>(null);const lf=useRef<HTMLInputElement>(null);const jf=useRef<HTMLInputElement>(null);const jf2=useRef<HTMLInputElement>(null);const [z,setZ]=useState(.7);const [html,setHtml]=useState('');const [err,setErr]=useState('');
const set=(k:keyof RepCfg,v:unknown)=>setC(c=>({...c,[k]:v}));
useEffect(()=>{const t=setTimeout(()=>{try{setHtml(buildReport(pr,{size,dev:d,notes,sheets:pick,ver:ver.trim()||'1.0',mode,toc,style:sty,params:par,texts:txt,table:tbl,cfg:C}));setErr('')}catch(e){setErr(e instanceof Error?e.message:'Не получилось собрать отчёт')}},150);return()=>clearTimeout(t)},[pr,size,d,notes,pick,ver,mode,toc,sty,par,txt,tbl,C,ui.ag,ui.ty]);
useEffect(()=>{try{localStorage.setItem(VK,ver)}catch{/* хранилище недоступно */}},[ver]);
useEffect(()=>{try{localStorage.setItem(CK,JSON.stringify(C))}catch{/* логотип мог не влезть */}},[C]);
useEffect(()=>{const f=()=>{const w=pane.current?.clientWidth;if(w)setZ(Math.min(1,Math.max(.3,(w-24)/SIZES[size].w)))};f();addEventListener('resize',f);return()=>removeEventListener('resize',f)},[size]);
const applyZoom=()=>{const b=fr.current?.contentDocument?.body;if(b)(b.style as CSSStyleDeclaration&{zoom:string}).zoom=String(z)};
useEffect(applyZoom,[z,html]);
useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[onClose]);
const pages=useMemo(()=>(html.match(/class="pg/g)||[]).length,[html]);
const print=()=>{if(!html)return;const W=SIZES[size].w,H=SIZES[size].h;const f=document.createElement('iframe');f.setAttribute('aria-hidden','true');f.style.cssText='position:fixed;left:0;top:0;width:'+W+'px;height:'+H+'px;opacity:0;pointer-events:none;border:0;z-index:-1';
const oldT=document.title;document.title=pr.name+' — отчёт v'+(ver.trim()||'1.0');
let done=false;const kill=()=>{if(done)return;done=true;document.title=oldT;setTimeout(()=>f.remove(),500)};
f.onload=async()=>{const w=f.contentWindow;const doc=f.contentDocument;if(!w||!doc)return;try{await doc.fonts.ready}catch{/* шрифты не дождались */}
try{await Promise.all(Array.from(doc.images).map(i=>i.decode().catch(()=>0)))}catch{/* картинки не дождались */}
toast('В окне печати: принтер «Сохранить как PDF», бумага '+SIZES[size].name+', масштаб 100%, поля «Нет», включи «Фоновая графика»',undefined,8000);
w.addEventListener('afterprint',kill);setTimeout(()=>{w.focus();w.print();setTimeout(kill,120000)},250)};
f.srcdoc=html;document.body.appendChild(f)};
const tgl=(id:string)=>setPick(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);
const none=!pick.length;
/* --- маленькие конструкторы полей (функции, а не компоненты, чтобы не терять фокус) --- */
const tx=(l:string,k:keyof RepCfg,ph='',area=false)=><><label className="rp-l">{l}</label>{area?<textarea className="inp" rows={3} value={String(C[k])} placeholder={ph} onChange={e=>set(k,e.target.value)}/>:<input className="inp" value={String(C[k])} placeholder={ph} onChange={e=>set(k,e.target.value)}/>}</>;
const sg=(l:string,k:keyof RepCfg,o:[string,string][])=><><label className="rp-l">{l}</label><div className="seg hug">{o.map(([v,n])=><button key={v} className={C[k]===v?'on':''} onClick={()=>set(k,v)}>{n}</button>)}</div></>;
const ck=(l:string,k:keyof RepCfg)=><label className="rp-c"><input type="checkbox" checked={!!C[k]} onChange={e=>set(k,e.target.checked)}/><span>{l}</span></label>;
const rg=(l:string,k:keyof RepCfg,min:number,max:number,u:string)=><><label className="rp-l">{l}: {String(C[k])}{u}</label><input type="range" min={min} max={max} value={Number(C[k])} onChange={e=>set(k,+e.target.value)} style={{width:'100%'}}/></>;
const cl=(l:string,k:keyof RepCfg)=>{const v=String(C[k]);return<><label className="rp-l">{l}</label><div style={{display:'flex',gap:8}}><input type="color" value={/^#[0-9a-f]{6}$/i.test(v)?v:'#111827'} onChange={e=>set(k,e.target.value)} style={{width:44,height:36,padding:2,border:0,background:'none'}}/><input className="inp" value={v} maxLength={9} onChange={e=>set(k,e.target.value)}/></div></>};
const fs=(l:string,k:'font'|'headFont')=><><label className="rp-l">{l}</label><select className="inp" value={C[k]} onChange={e=>set(k,e.target.value)}>{Object.keys(FONTS).map(n=><option key={n}>{n}</option>)}</select></>;
const COLS:[string,string][]=[['n','№'],['type','Тип'],['xy','X · Y'],['sz','Ширина × высота'],['f','Шрифт, цвет'],['go','Переход']];
const cc=(k:string,l:string)=><label key={k} className="rp-c"><input type="checkbox" checked={C.cols.includes(k)} onChange={e=>set('cols',e.target.checked?[...C.cols,k]:C.cols.filter(x=>x!==k))}/><span>{l}</span></label>;
const pickImg=(fl:FileList|null)=>{const f=fl?.[0];if(!f)return;if(jf2.current)jf2.current.value='';if(f.size>1500000){toast('Картинка больше 1,5 МБ. Возьми файл поменьше');return}const r=new FileReader();r.onerror=()=>toast('Файл не прочитался');r.onload=()=>set('coverImg',String(r.result));r.readAsDataURL(f)};
const pickLogo=(fl:FileList|null)=>{const f=fl?.[0];if(!f)return;if(lf.current)lf.current.value='';if(f.size>600000){toast('Логотип больше 600 КБ. Возьми файл поменьше');return}const r=new FileReader();r.onerror=()=>toast('Файл не прочитался');r.onload=()=>set('logo',String(r.result));r.readAsDataURL(f)};
const savePre=()=>{const n=prompt('Название пресета (бренд / клиент)');if(!n?.trim())return;const nx={...pre,[n.trim()]:C};setPre(nx);try{localStorage.setItem(PK,JSON.stringify(nx))}catch{toast('Не влезло в хранилище браузера. Убери логотип или экспортируй JSON')}};
const delPre=(n:string)=>{const nx={...pre};delete nx[n];setPre(nx);try{localStorage.setItem(PK,JSON.stringify(nx))}catch{/* ok */}};
const expC=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(C,null,1)],{type:'application/json'}));a.download='report-style.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
const impC=(fl:FileList|null)=>{const f=fl?.[0];if(!f)return;if(jf.current)jf.current.value='';f.text().then(t=>{setC(fix({...RC0,...JSON.parse(t)}));toast('Стиль загружен')}).catch(()=>toast('Не получилось прочитать JSON'))};
return<div className="modal" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="sheet wide xl rp-sheet"><h2>PDF-отчёт для заказчика</h2>
<div className="rp"><div className="rp-o">
<div className="seg hug" style={{marginBottom:6}}>{TABS.map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}</button>)}</div>
{tab==='content'&&<>
<label className="rp-l">Размер страницы</label><div className="seg">{(['a4','letter'] as const).map(k=><button key={k} className={size===k?'on':''} onClick={()=>setSize(k)}>{SIZES[k].name}</button>)}</div>
<label className="rp-l">Размер экрана</label><div className="seg">{(['desktop','tablet','mobile'] as const).map(k=><button key={k} className={d===k?'on':''} onClick={()=>setD(k)}>{DEVN[k]}</button>)}</div>
<label className="rp-l">Версия отчёта</label><input className="inp" maxLength={12} value={ver} onChange={e=>setVer(e.target.value)}/>
<label className="rp-l">Что в отчёте</label><div className="seg hug">{([['full','Полный'],['pages','Макеты по страницам']] as const).map(([k,l])=><button key={k} className={mode===k?'on':''} onClick={()=>setMode(k)}>{l}</button>)}</div>
<p className="txt" style={{margin:'6px 0 0',fontSize:12}}>{mode==='pages'?'Только картинки страниц сайта, без таблиц и текстов. Длинная страница делится на части.':'Макеты блоков, параметры, тексты и таблица характеристик.'}</p>
<div className="rp-sh" style={{marginTop:10,maxHeight:'none'}}>
<label className="rp-c"><input type="checkbox" checked={toc} onChange={e=>setToc(e.target.checked)}/><span>Оглавление</span></label>
<label className="rp-c"><input type="checkbox" checked={sty} onChange={e=>setSty(e.target.checked)}/><span>Шрифты и размеры текста</span></label>
{mode==='full'&&<>{ck('Обзор экрана (карта блоков)','ov')}
<label className="rp-c"><input type="checkbox" checked={par} onChange={e=>setPar(e.target.checked)}/><span>Параметры блоков</span></label>
{ck('Поведение на устройствах','behav')}
<label className="rp-c"><input type="checkbox" checked={txt} onChange={e=>setTxt(e.target.checked)}/><span>Тексты блоков</span></label>
<label className="rp-c"><input type="checkbox" checked={tbl} onChange={e=>setTbl(e.target.checked)}/><span>Таблица характеристик</span></label>
{tbl&&<div style={{paddingLeft:22}}>{COLS.map(([k,l])=>cc(k,l))}</div>}
{ck('Комментарии','cmts')}
<label className="rp-c"><input type="checkbox" checked={notes} onChange={e=>setNotes(e.target.checked)}/><span>Заметки команды</span></label></>}
{ck('Страница согласования (подписи)','sign')}</div>
{rg('Высота макета блока','shot',25,85,'% страницы')}
<label className="rp-l">Листы в отчёте</label><div className="rp-sh">{pr.sheets.map(s=><label key={s.id} className="rp-c"><input type="checkbox" checked={pick.includes(s.id)} onChange={()=>tgl(s.id)}/><span>{s.kind==='popup'?'Попап: ':''}{s.name}</span></label>)}</div>
</>}
{tab==='cover'&&<>
{sg('Стиль обложки','cover',[['classic','Классика'],['band','Плашка'],['dark','Тёмная'],['center','По центру']])}
<label className="rp-l">Фоновая картинка обложки</label><div className="seg">{C.coverImg&&<img src={C.coverImg} alt="" style={{height:32,maxWidth:90,objectFit:'cover',marginRight:8}}/>}<button type="button" onClick={()=>jf2.current?.click()}>{C.coverImg?'Заменить':'Загрузить'}</button>{C.coverImg&&<button type="button" onClick={()=>set('coverImg','')}>Убрать</button>}<input ref={jf2} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e=>pickImg(e.target.files)}/></div>
{C.coverImg&&rg('Плотность заливки поверх картинки','coverOv',0,100,'%')}
{tx('Название (пусто = имя проекта)','title',pr.name)}{tx('Подзаголовок','sub','Например: редизайн интернет-магазина')}{tx('Надпись над названием','kick')}
{tx('Метка («Конфиденциально», «Черновик»)','conf')}
{tx('Заказчик','client','Компания, контактное лицо',true)}
{tx('Кто подготовил (ФИО)','author')}{tx('Должность / роль','role')}{tx('Контакты','contacts','email, телефон, сайт',true)}
{tx('Реквизиты (пусто = из Настроек)','reqs','',true)}
<div className="rp-sh" style={{marginTop:10,maxHeight:'none'}}>{ck('Плитки со статистикой на обложке','stats')}</div>
{tx('Страница «О проекте»: текст','intro','Цели, аудитория, как читать отчёт. Пусто = страницы не будет',true)}{tx('Заголовок этой страницы','introT')}
{tx('Страница согласования: заголовок','signT')}{tx('Страница согласования: текст','signTx','',true)}
</>}
{tab==='brand'&&<>
{cl('Фирменный цвет','accent')}{cl('Цвет заголовков и текста','ink')}
{fs('Шрифт текста','font')}{fs('Шрифт заголовков','headFont')}
<label className="rp-l">Логотип (пусто = из Настроек)</label>
<div className="seg">{C.logo&&<img src={C.logo} alt="" style={{height:32,maxWidth:120,objectFit:'contain',marginRight:8}}/>}<button type="button" onClick={()=>lf.current?.click()}>{C.logo?'Заменить':'Загрузить'}</button>{C.logo&&<button type="button" onClick={()=>set('logo','')}>Убрать</button>}<input ref={lf} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={e=>pickLogo(e.target.files)}/></div>
{sg('Позиция логотипа','logoPos',[['left','Слева'],['center','Центр'],['right','Справа']])}{rg('Высота логотипа','logoH',20,120,' px')}
<div className="rp-sh" style={{marginTop:10,maxHeight:'none'}}>{ck('Маленький логотип в шапке страниц','logoHdr')}</div>
{tx('Название агентства (пусто = из Настроек)','agency')}
<label className="rp-l">Пресеты бренда</label>
<div className="seg hug"><button onClick={savePre}>Сохранить текущий</button><button onClick={()=>setC({...RC0})}><RotateCcw size={14}/>Сброс</button><button onClick={expC}><Download size={14}/>JSON</button><button onClick={()=>jf.current?.click()}><Upload size={14}/>JSON</button><input ref={jf} type="file" accept="application/json" hidden onChange={e=>impC(e.target.files)}/></div>
{Object.keys(pre).length>0&&<div className="rp-sh" style={{marginTop:8,maxHeight:'none'}}>{Object.keys(pre).map(n=><div key={n} className="rp-c" style={{justifyContent:'space-between'}}><button className="btn" onClick={()=>setC(fix({...RC0,...pre[n]}))}>{n}</button><button className="btn" title="Удалить" onClick={()=>delPre(n)}><Trash2 size={14}/></button></div>)}</div>}
</>}
{tab==='look'&&<>
{sg('Поля страницы','dens',[['compact','Узкие'],['normal','Обычные'],['roomy','Широкие']])}
{rg('Скругление рамок','rad',0,20,' px')}
<div className="rp-sh" style={{marginTop:10,maxHeight:'none'}}>{ck('Тени у макетов','shadow')}{ck('Шапка страниц','hdr')}{ck('Подвал страниц','ftr')}</div>
{tx('Шапка слева','hdrL')}{tx('Шапка справа','hdrR')}{tx('Подвал слева','ftrL')}{tx('Подвал справа','ftrR')}
<p className="txt" style={{margin:'6px 0 0',fontSize:12}}>Подстановки: {'{name} {ver} {date} {author} {client} {agency} {page} {total}'}</p>
{tx('Водяной знак на страницах','wm','Например: ЧЕРНОВИК')}
</>}
<div className="rp-stats"><div><b>{pages||'—'}</b><span>страниц</span></div><div><b>{pick.length}</b><span>листов</span></div><div><b>{SIZES[size].name}</b><span>формат</span></div></div>
<p className="txt" style={{margin:'12px 0 0'}}>{err?err:none?'Выбери хотя бы один лист':'Настройки запоминаются в браузере. Предпросмотр справа = то, что попадёт в PDF.'}</p>
</div><div className="rp-v" ref={pane}>{html&&<iframe ref={fr} title="Предпросмотр отчёта" srcDoc={html} sandbox="allow-same-origin allow-modals" onLoad={applyZoom}/>}</div></div>
<div className="rp-f"><button className="btn" onClick={onClose}><X size={16}/>Закрыть</button><button className="btn pri" disabled={none||!html||!!err} onClick={print}><Printer size={16}/>Сохранить PDF</button></div></div></div>}
