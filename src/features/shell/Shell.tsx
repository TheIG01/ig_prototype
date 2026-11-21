import {useState,useRef,useEffect} from 'react';
import {Plus,FileText,AppWindow,X,Download,Upload,Monitor,Tablet,Smartphone,Menu,BookmarkPlus,Undo2,Redo2,Settings,ArrowUp,ArrowDown,Copy,Sparkles,PanelLeft,Keyboard,Search,ChevronLeft,Pencil,LayoutTemplate,Eye,Share2} from 'lucide-react';
import {useStore,PRESETS,FW} from '../../store';
import type {Kind,Dev,Project,Sheet,Block} from '../../store';
import {exportBackup,importBackup} from '../../lib/vault';
import {SettingsBody} from './Settings';
import {briefMd,download} from '../../lib/export';
import {toast,dismiss,useToast} from '../../lib/toast';
import {BlockPicker,ContentPanel,Thumb} from '../blocks/blocks';
import {Canvas,RightPanel} from '../canvas/Canvas';
import {Preview} from '../preview/Preview';
import {buildHtml,printHtml} from '../../lib/share';
type Modal=''|'proj'|'sheet'|'block'|'type'|'set'|'ren'|'keys'|'cmd'|'rst'|'tpl'|'imp'|'add'|'share';
const FORMS:Modal[]=['proj','sheet','block','type','ren','tpl'];
const TITLE:Record<string,string>={proj:'Новый проект',sheet:'Новый лист',block:'Новый блок',type:'Сохранить как тип сайта',ren:'Переименовать',tpl:'Сохранить блок как шаблон'};
const DEVS:Dev[]=['desktop','tablet','mobile'];
const HELP:[string,[string,string][]][]=[
['Инструменты',[['V','Выбор'],['T','Текст'],['R','Прямоугольник'],['B','Кнопка'],['F','Поле ввода'],['I','Изображение'],['L','Линия']]],
['Правка',[['Ctrl+Z','Отменить'],['Ctrl+Shift+Z','Повторить'],['Ctrl+C / X / V','Копировать, вырезать, вставить'],['Ctrl+D','Дублировать'],['Delete','Удалить'],['Enter','Править текст'],['Tab','Следующий элемент'],['Esc','Снять выделение']]],
['Блоки',[['A','Добавить блок: с нуля или из библиотеки'],['Enter','Войти в блок (редактировать)'],['Ctrl+Enter','Сохранить и выйти из блока'],['Alt+↑ / ↓','Блок выше / ниже'],['Ctrl+D','Дублировать блок или элемент'],['Esc','Шаг вверх: элемент → блок → ничего']]],
['Положение',[['Ctrl+B','Жирный текст'],['Стрелки','Сдвиг на 1 px'],['Shift+стрелки','Сдвиг на 8 px'],['Alt при перетаскивании','Без привязки'],['Ctrl+]','Слой выше'],['Ctrl+[','Слой ниже'],['Ctrl+Shift+]','На передний план'],['Ctrl+Shift+[','На задний план']]],
['Вид и команды',[['P','Просмотр для заказчика'],['Пробел + перетаскивание','Панорама'],['Ctrl + колесо','Масштаб'],['+ / −','Масштаб'],['Shift+0','100%'],['Shift+1','Вписать'],['Alt+1 / 2 / 3','Desktop, Tablet, Mobile'],['Ctrl+\\','Панель проектов'],['Ctrl+K','Команды'],['?','Горячие клавиши']]]];
function Ask({title,children,onClose,wide,xl}:{title:string;children:React.ReactNode;onClose:()=>void;wide?:boolean;xl?:boolean}){return<div className="modal" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className={'sheet'+(wide?' wide':'')+(xl?' wide xl':'')}><h2>{title}</h2>{children}</div></div>}

export function Shell(){
const s=useStore();const d=s.data!;const pr=d.projects.find(p=>p.id===s.projectId);const sh=pr?.sheets.find(x=>x.id===s.sheetId);const tt=useToast(x=>x.t);
const [fr,setFr]=useState<Dev>('desktop');const [view,setView]=useState<'struct'|'canvas'>('canvas');const [open,setOpen]=useState(false);const [hide,setHide]=useState(false);
const [modal,setModal]=useState<Modal>('');const [name,setName]=useState('');const [typeId,setTypeId]=useState('landing');const [kind,setKind]=useState<Kind>('page');
const [ren,setRen]=useState<{k:'proj'|'sheet';id:string}|null>(null);const [q,setQ]=useState('');const [ci,setCi]=useState(0);const [pend,setPend]=useState<File|null>(null);const [outline,setOutline]=useState('');const [after,setAfter]=useState<string|undefined>(undefined);const [pv,setPv]=useState('');const [group,setGroup]=useState('');
const file=useRef<HTMLInputElement>(null);
const types=[...PRESETS,...d.siteTypes];
const close=()=>{setModal('');setName('');setRen(null);setQ('');setCi(0);setPend(null);setOutline('');setGroup('')};
const openForm=(m:Modal)=>{setName('');setModal(m)};
const openAdd=(a?:string)=>{setAfter(a);setName('');setModal('add')};
const eb=sh?.blocks.find(b=>b.id===s.editId);const ed=!!eb;
const addAndEdit=(title:string,tpl?:string)=>{s.addBlock(title,{after,tpl});const g=useStore.getState();const b=g.data?.projects.find(p=>p.id===g.projectId)?.sheets.find(x=>x.id===g.sheetId)?.blocks.find(x=>x.id===g.blockId);if(b&&!b.els.desktop.length&&!b.els.tablet.length&&!b.els.mobile.length)g.enterEdit(b.id)};
const slug=(n:string)=>n.trim().replace(/[^\p{L}\p{N}]+/gu,'_')||'prototype';
const openPreview=()=>{if(pr)setPv(buildHtml(pr,'proto',{dev:fr}))};
const saveHtml=()=>{if(!pr)return;download(slug(pr.name)+'.html',buildHtml(pr,'proto',{dev:fr}),'text/html');toast('HTML-файл скачан. Открой его в браузере или залей на любой хостинг')};
const savePdf=(notes:boolean)=>{if(!pr)return;toast('Откроется печать: выбери «Сохранить как PDF»');printHtml(buildHtml(pr,'report',{dev:fr,notes}))};
const cancelEdit=()=>{s.exitEdit(false);toast('Изменения блока отменены')};
useEffect(()=>{if(s.editId&&view!=='canvas')setView('canvas')},[s.editId]);
const startRen=(k:'proj'|'sheet',id:string,cur:string)=>{setRen({k,id});setName(cur);setModal('ren')};
const undoable=(text:string,after:()=>void)=>toast(text,{label:'Отменить',run:()=>{s.undo();after()}},6500);
const dropProject=(p:Project)=>{s.delProject(p.id);undoable(`Проект «${p.name}» удалён`,()=>s.openProject(p.id))};
const dropSheet=(x:Sheet)=>{s.delSheet(x.id);undoable(`Лист «${x.name}» удалён`,()=>s.setSheet(x.id))};
const dropBlock=(b:Block)=>{s.delBlock(b.id);undoable(`Блок «${b.title}» удалён`,()=>s.setBlock(b.id))};
const aiPack=(p:Project)=>{download('brief.md',briefMd(p,types.find(t=>t.id===p.typeId)?.name??'Сайт'),'text/markdown');setTimeout(()=>download('project.json',JSON.stringify(p,null,2),'application/json'),300)};
const backup=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([exportBackup()],{type:'application/json'}));a.download='ig_prototype_backup.json';a.click()};
const restore=async()=>{const f=pend;close();if(!f)return;try{importBackup(await f.text());toast('Копия загружена. Введи ПИН из этой копии');setTimeout(()=>location.reload(),1500)}catch{toast('Это не файл копии IG prototype')}};
const submit=(e:React.FormEvent)=>{e.preventDefault();const n=name.trim();if(!n)return;
if(modal==='proj')s.addProject(n,typeId);if(modal==='sheet')s.addSheet(n,kind);if(modal==='block')addAndEdit(n);if(modal==='type')s.saveType(n);if(modal==='tpl'&&s.blockId){s.saveBlockTpl(s.blockId,n,group.trim());toast(`Шаблон «${n}» в библиотеке блоков`)}
if(modal==='ren'&&ren){if(ren.k==='proj')s.renameProject(ren.id,n);else s.renameSheet(ren.id,n)}close()};
type Cmd={l:string;k?:string;run:()=>void};
const cmds:Cmd[]=[{l:'Новый проект',run:()=>openForm('proj')},{l:'Импорт структуры из текста (майнд-карта)',run:()=>openForm('imp')},...(pr?[{l:'Просмотр для заказчика',k:'P',run:openPreview},{l:'Экспорт: интерактив, PDF, для ИИ',run:()=>setModal('share')},{l:'Скачать интерактив (HTML)',run:saveHtml},{l:'PDF для заказчика (без заметок)',run:()=>savePdf(false)},{l:'PDF с заметками',run:()=>savePdf(true)}]:[]),
...(pr?[{l:'Новый лист',run:()=>openForm('sheet')},{l:'Добавить блок',k:'A',run:()=>openAdd(s.blockId??undefined)},...(s.blockId?[{l:'Сохранить блок как шаблон',run:()=>openForm('tpl')}]:[]),{l:'Переименовать проект',run:()=>startRen('proj',pr.id,pr.name)},{l:'Для ИИ: скачать brief.md и project.json',run:()=>aiPack(pr)},{l:'Сохранить структуру как тип сайта',run:()=>openForm('type')}]:[]),
...(sh?[{l:'Переименовать лист',run:()=>startRen('sheet',sh.id,sh.name)}]:[]),
{l:'Вид: холст',run:()=>setView('canvas')},{l:'Вид: структура',run:()=>setView('struct')},
{l:'Размер: Desktop 1440',k:'Alt+1',run:()=>setFr('desktop')},{l:'Размер: Tablet 768',k:'Alt+2',run:()=>setFr('tablet')},{l:'Размер: Mobile 390',k:'Alt+3',run:()=>setFr('mobile')},
{l:'Отменить',k:'Ctrl+Z',run:()=>s.undo()},{l:'Повторить',k:'Ctrl+Shift+Z',run:()=>s.redo()},
{l:'Скачать копию',run:backup},{l:'Загрузить копию',run:()=>file.current?.click()},
{l:'Показать или скрыть панель проектов',k:'Ctrl+\\',run:()=>setHide(v=>!v)},{l:'Горячие клавиши',k:'?',run:()=>setModal('keys')},{l:'Настройки',run:()=>setModal('set')},
...d.projects.map(p=>({l:`Проект: ${p.name}`,run:()=>s.openProject(p.id)})),
...(pr?pr.sheets.map(x=>({l:`Лист: ${x.name}`,run:()=>s.setSheet(x.id)})):[])];
const list=cmds.filter(c=>c.l.toLowerCase().includes(q.trim().toLowerCase()));const cur=Math.max(0,Math.min(ci,list.length-1));
const exec=(c?:Cmd)=>{if(!c)return;close();c.run()};
useEffect(()=>{const h=(e:KeyboardEvent)=>{
const typing=/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName);const mod=e.ctrlKey||e.metaKey;
if(e.key==='Escape'&&modal){close();return}
if(mod&&(e.code==='KeyK'||e.code==='Slash')){e.preventDefault();if(modal==='cmd')close();else{setQ('');setCi(0);setModal('cmd')}return}
if(mod&&e.code==='KeyS'){e.preventDefault();toast('Сохраняется автоматически');return}
if(mod&&e.code==='Backslash'){e.preventDefault();setHide(v=>!v);return}
if(pv)return;
if(typing||modal)return;
if(e.code==='KeyP'&&!mod&&!e.altKey&&!e.shiftKey){e.preventDefault();openPreview();return}
if(mod&&e.code==='KeyZ'){e.preventDefault();e.shiftKey?s.redo():s.undo();return}
if(mod&&e.code==='KeyY'){e.preventDefault();s.redo();return}
if(e.altKey&&!mod){const i=['Digit1','Digit2','Digit3'].indexOf(e.code);if(i>=0){e.preventDefault();setFr(DEVS[i]);return}}
if(e.key==='?'&&!mod)setModal('keys')};
addEventListener('keydown',h);return()=>removeEventListener('keydown',h)});
const form=FORMS.includes(modal);
return<div className={'app'+(hide?' nosb':'')}>
<nav className="rail"><div className="logo">IG</div>
<button className={'rb'+(hide?'':' on')} title="Проекты (Ctrl+\)" onClick={()=>setHide(v=>!v)}><PanelLeft size={18}/></button>
<button className="rb" title="Команды (Ctrl+K)" onClick={()=>{setQ('');setCi(0);setModal('cmd')}}><Search size={18}/></button>
<div className="sp"/>
<button className="rb" title="Горячие клавиши (?)" onClick={()=>setModal('keys')}><Keyboard size={18}/></button>
<button className="rb" title="Настройки" onClick={()=>setModal('set')}><Settings size={18}/></button></nav>
<aside className={'side'+(open?' open':'')} onClick={()=>setOpen(false)}>
<button className="btn pri" onClick={e=>{e.stopPropagation();openForm('proj')}}><Plus size={16}/>Новый проект</button>
<button className="btn" onClick={e=>{e.stopPropagation();openForm('imp')}} title="Вставить структуру из майнд-карты"><FileText size={16}/>Из майнд-карты</button>
<h3>Структура <small>проект › лист › блок</small></h3>
{d.projects.map(p=>{const curP=p.id===s.projectId;return<div key={p.id}>
<button className={'row'+(curP?' on':'')} title="Двойной клик: переименовать" onClick={()=>s.openProject(p.id)} onDoubleClick={e=>{e.stopPropagation();startRen('proj',p.id,p.name)}}><i className="av">{p.name.trim().slice(0,1)||'·'}</i><span>{p.name}</span><small>{p.sheets.length}</small><i className="x" title="Удалить проект" onClick={e=>{e.stopPropagation();dropProject(p)}}><X size={14}/></i></button>
{curP&&<div className="tc">{p.sheets.map(x=>{const act=x.id===s.sheetId;return<div key={x.id}>
<button className={'row'+(act?' on':'')} title="Двойной клик: переименовать" onClick={()=>s.setSheet(x.id)} onDoubleClick={e=>{e.stopPropagation();startRen('sheet',x.id,x.name)}}>{x.kind==='popup'?<AppWindow size={16}/>:<FileText size={16}/>}<span>{x.name}</span><em className="tag">{x.kind==='popup'?'попап':'страница'}</em><i className="x" title="Удалить лист" onClick={e=>{e.stopPropagation();dropSheet(x)}}><X size={14}/></i></button>
{act&&<div className="tc">{x.blocks.map((b,i)=><div key={b.id}><button className={'row sm'+(b.id===s.blockId?' on':'')} onClick={()=>s.setBlock(b.id)}><b className="no">{i+1}</b><span>{b.title}</span><span className="ra"><i title="Редактировать блок" onClick={e=>{e.stopPropagation();s.enterEdit(b.id)}}><Pencil size={13}/></i><i title="Выше" onClick={e=>{e.stopPropagation();s.moveBlock(b.id,-1)}}><ArrowUp size={13}/></i><i title="Ниже" onClick={e=>{e.stopPropagation();s.moveBlock(b.id,1)}}><ArrowDown size={13}/></i><i title="Удалить блок" onClick={e=>{e.stopPropagation();dropBlock(b)}}><X size={13}/></i></span></button>{s.editId===b.id&&b.els[fr].length>0&&<div className="tc layers">{[...b.els[fr]].reverse().map(el=><button key={el.id} className={'row sm'+(el.id===s.elId?' on':'')} onClick={()=>s.setEl(el.id)}><span>{({text:'Текст',rect:'Рамка',btn:'Кнопка',input:'Поле',img:'Картинка',line:'Линия',shape:'Фигура',icon:'Иконка',mock:'Мокап',list:'Список'} as Record<string,string>)[el.t]}{el.text?' · '+el.text.slice(0,18):''}</span></button>)}</div>}</div>)}
<button className="row sm mute" onClick={e=>{e.stopPropagation();openAdd(x.blocks[x.blocks.length-1]?.id)}}><Plus size={14}/><span>Добавить блок</span></button></div>}</div>})}
<button className="row mute" onClick={e=>{e.stopPropagation();openForm('sheet')}}><Plus size={16}/><span>Добавить лист</span></button></div>}</div>})}
</aside>
<main className="main"><div className="top">
<button className="btn ic menu" onClick={()=>setOpen(true)} aria-label="Меню"><Menu size={18}/></button>
{ed&&eb?<><button className="btn" onClick={()=>s.exitEdit(true)} title="Сохранить и вернуться к странице (Esc)"><ChevronLeft size={16}/>К странице</button><span className="crumb" style={{maxWidth:360}}>{sh?.name} / Блок {(sh?.blocks.indexOf(eb)??0)+1}: {eb.title}</span></>:<><button className="ttl" disabled={!pr} title="Переименовать" onClick={()=>pr&&startRen('proj',pr.id,pr.name)}>{pr?.name??'IG prototype'}</button>{sh&&<span className="crumb">/ {sh.name}</span>}<div className="sp"/></>}<div className="sp"/>
{!ed&&<div className="seg">{([['canvas','Холст'],['struct','Структура']] as const).map(([k,l])=><button key={k} className={view===k?'on':''} onClick={()=>setView(k)}>{l}</button>)}</div>}
<div className="seg">{([['desktop',Monitor],['tablet',Tablet],['mobile',Smartphone]] as const).map(([k,I],i)=><button key={k} className={fr===k?'on':''} onClick={()=>setFr(k)} title={`${FW[k]} px (Alt+${i+1})`}><I size={15}/></button>)}</div>
<i className="vr"/>
<button className="btn ic" onClick={()=>s.undo()} title="Отменить (Ctrl+Z)"><Undo2 size={16}/></button><button className="btn ic" onClick={()=>s.redo()} title="Повторить (Ctrl+Shift+Z)"><Redo2 size={16}/></button>
<i className="vr"/>
{!ed&&pr&&<button className="btn ic" onClick={()=>openForm('type')} title="Сохранить структуру как тип сайта"><BookmarkPlus size={16}/></button>}
{!ed&&<><button className="btn ic" onClick={backup} title="Скачать копию"><Download size={16}/></button></>}
{!ed&&<><button className="btn ic" onClick={()=>file.current?.click()} title="Загрузить копию"><Upload size={16}/></button><input ref={file} type="file" accept=".json" hidden onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(f){setPend(f);setModal('rst')}}}/></>}
{!ed&&pr&&<button className="btn" onClick={openPreview} title="Просмотр для заказчика (P)"><Eye size={16}/>Просмотр</button>}{!ed&&pr&&<button className="btn" onClick={()=>setModal('share')} title="Отдать заказчику"><Share2 size={16}/>Экспорт</button>}{!ed&&pr&&<button className="btn" onClick={()=>aiPack(pr)} title="Скачать brief.md и project.json"><Sparkles size={16}/>Для ИИ</button>}
<button className="btn ic mobonly" onClick={()=>setModal('set')} title="Настройки"><Settings size={16}/></button>
{ed&&<><i className="vr"/><button className="btn" onClick={cancelEdit} title="Откатить все правки в этом блоке">Не сохранять</button><button className="btn pri" onClick={()=>s.exitEdit(true)} title="Ctrl+Enter">Сохранить</button></>}
<span className={'status'+(s.status==='saving'?' s':'')}><i/>{s.status==='saving'?'Сохраняю':'Сохранено'}</span></div>
<div className="work"><div className="stage">{!sh?<div className="empty"><h2>{pr?'Добавь лист':'Создай проект'}</h2><p>{pr?'В проекте нет листов':'Выбери тип сайта, и структура листов появится сама'}</p><button className="btn pri" onClick={()=>openForm(pr?'sheet':'proj')}><Plus size={16}/>{pr?'Добавить лист':'Новый проект'}</button><p style={{marginTop:14}}>Ctrl+K открывает команды, «?» горячие клавиши</p></div>:
view==='canvas'?<Canvas dev={fr} W={FW[fr]} onAdd={openAdd}/>:<div className="frame" style={{maxWidth:FW[fr]*.6+120}}>{sh.blocks.map(b=><div className={'blk'+(b.id===s.blockId?' sel':'')} key={b.id} onClick={()=>s.setBlock(b.id)}><Thumb els={b.els[fr]} h={b.h[fr]} dev={fr} tw={120}/><b>{b.title}</b>{b.text&&<small>{b.text}</small>}<span className="acts" onClick={e=>e.stopPropagation()}><button className="btn ic" title="Выше" onClick={()=>s.moveBlock(b.id,-1)}><ArrowUp size={14}/></button><button className="btn ic" title="Ниже" onClick={()=>s.moveBlock(b.id,1)}><ArrowDown size={14}/></button><button className="btn ic" title="Дублировать" onClick={()=>s.dupBlock(b.id)}><Copy size={14}/></button><button className="btn ic" title="Удалить" onClick={()=>dropBlock(b)}><X size={14}/></button></span></div>)}
<button className="blk" style={{width:'100%',border:0}} onClick={()=>openAdd(sh.blocks[sh.blocks.length-1]?.id)}><Plus size={16}/>Добавить блок</button></div>}</div>{sh&&(view==='canvas'?<RightPanel dev={fr} onTpl={()=>openForm('tpl')}/>:<ContentPanel/>)}</div></main>
{modal==='set'&&<Ask title="Настройки" onClose={close}><SettingsBody onBackup={backup}/></Ask>}
{modal==='keys'&&<Ask title="Горячие клавиши" wide onClose={close}><div className="keys-g">{HELP.map(([g,rows])=><div key={g}><h4>{g}</h4>{rows.map(([k,l])=><div className="krow" key={k}><span>{l}</span><kbd>{k}</kbd></div>)}</div>)}</div></Ask>}
{modal==='rst'&&<Ask title="Загрузить копию" onClose={close}><p className="txt">Данные на этом устройстве заменятся данными из файла «{pend?.name}». Перед этим скачай текущую копию, если она нужна</p><div className="btnrow"><button className="btn" onClick={close}>Отмена</button><button className="btn pri" onClick={restore}>Заменить данные</button></div></Ask>}
{modal==='cmd'&&<div className="modal top" onMouseDown={e=>e.target===e.currentTarget&&close()}><div className="pal"><div className="pal-in"><Search size={16}/><input autoFocus placeholder="Команда, проект или лист" value={q} onChange={e=>{setQ(e.target.value);setCi(0)}} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setCi(Math.min(cur+1,list.length-1))}else if(e.key==='ArrowUp'){e.preventDefault();setCi(Math.max(cur-1,0))}else if(e.key==='Enter'){e.preventDefault();exec(list[cur])}}}/></div>
<div className="pal-list">{list.map((c,i)=><button key={c.l} className={i===cur?'on':''} onMouseEnter={()=>setCi(i)} onClick={()=>exec(c)}><span>{c.l}</span>{c.k&&<kbd>{c.k}</kbd>}</button>)}{!list.length&&<p className="hint">Ничего не найдено</p>}</div></div></div>}
{modal==='add'&&<Ask title="Новый блок" onClose={close}><div className="addm"><button type="button" className="am dash" onClick={()=>{addAndEdit('Блок');close()}}><span className="amic"><Plus size={20}/></span><b>Создать с нуля</b><small>Пустой блок. Откроется редактор: рисуй элементы сам</small></button><button type="button" className="am" onClick={()=>setModal('block')}><span className="amic"><LayoutTemplate size={20}/></span><b>Из библиотеки</b><small>Готовые макеты и твои шаблоны по группам</small></button></div></Ask>}
{modal==='share'&&pr&&<Ask title="Экспорт" wide onClose={close}><p className="txt">Размер для файла и PDF: {FW[fr]} px (переключается сверху)</p><div className="addm">
<button type="button" className="am" onClick={()=>{saveHtml();close()}}><span className="amic"><Eye size={20}/></span><b>Интерактив (HTML)</b><small>Один файл: кликабельные переходы, попапы, переключение размеров. Открывается без интернета, ссылкой делится как любой файл на хостинге. Заметок внутри нет</small></button>
<button type="button" className="am" onClick={()=>{savePdf(false);close()}}><span className="amic"><Share2 size={20}/></span><b>PDF для заказчика</b><small>Все листы и блоки по порядку, без внутренних заметок</small></button>
<button type="button" className="am" onClick={()=>{savePdf(true);close()}}><span className="amic"><Pencil size={20}/></span><b>PDF с заметками</b><small>Для команды: под каждым блоком его тексты и пожелания</small></button>
<button type="button" className="am" onClick={()=>{aiPack(pr);close()}}><span className="amic"><Sparkles size={20}/></span><b>Для нейросети</b><small>brief.md и project.json: структура, координаты, акценты, переходы</small></button></div></Ask>}
{modal==='imp'&&<Ask title="Импорт структуры из майнд-карты" wide onClose={close}><form onSubmit={e=>{e.preventDefault();const n=name.trim()||'Новый проект';if(!outline.trim())return;s.importOutline(n,outline);toast('Проект собран из текста');close()}}>
<input className="inp" autoFocus placeholder="Название проекта" value={name} onChange={e=>setName(e.target.value)}/>
<textarea className="inp outl" placeholder={'Вставь текстовую структуру. Например:\n# Главная\n## Оффер\nЗаголовок и подзаголовок\n## Преимущества\n# Спасибо\n## Подтверждение'} value={outline} onChange={e=>setOutline(e.target.value)}/>
<p className="txt">Уровень 1 это страница, уровень 2 блок, глубже это текст блока. Подходят заголовки markdown (#, ##) или список с отступами из экспорта майнд-карты. Знакомые блоки (Оффер, Тарифы, FAQ…) сразу получают макет, остальные пустые. Попап: добавь слово «попап» к названию страницы</p>
<button className="btn pri" style={{width:'100%',justifyContent:'center'}}>Собрать проект</button></form></Ask>}
{form&&<Ask title={TITLE[modal]} xl={modal==='block'} onClose={close}><form onSubmit={submit}>
<input className="inp" autoFocus placeholder={modal==='block'?'Поиск или название нового блока':'Название'} value={name} onChange={e=>setName(e.target.value)}/>
{modal==='block'&&<BlockPicker q={name} tpls={d.blockTpls} onPick={n=>{addAndEdit(n);close()}} onTpl={id=>{addAndEdit('',id);close()}} onDelTpl={id=>{s.delBlockTpl(id);toast('Шаблон удалён')}}/>}
{modal==='tpl'&&<><input className="inp" list="grp" placeholder="Группа шаблона, например: Мои первые экраны" value={group} onChange={e=>setGroup(e.target.value)}/><datalist id="grp">{[...new Set(d.blockTpls.map(t=>t.cat).filter(Boolean))].map(c=><option key={c} value={c}/>)}</datalist></>}
{modal==='proj'&&<div className="types">{types.map(t=><button type="button" key={t.id} className={typeId===t.id?'on':''} onClick={()=>setTypeId(t.id)}>{t.name}</button>)}</div>}
{modal==='sheet'&&<div className="seg" style={{marginBottom:14}}>{(['page','popup'] as Kind[]).map(k=><button type="button" key={k} className={kind===k?'on':''} onClick={()=>setKind(k)}>{k==='page'?'Страница':'Попап'}</button>)}</div>}
<button className="btn pri" style={{width:'100%',justifyContent:'center'}}>{modal==='ren'||modal==='type'||modal==='tpl'?'Сохранить':modal==='block'?'Создать пустой блок':'Создать'}</button></form></Ask>}
{pv&&<Preview html={pv} onClose={()=>setPv('')}/>}
{tt&&<div className="toast" key={tt.id}><span>{tt.text}</span>{tt.act&&<button onClick={()=>{tt.act!.run();dismiss()}}>{tt.act.label}</button>}</div>}</div>}
