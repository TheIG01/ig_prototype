import {useEffect,useRef,useState} from 'react';
import {MousePointer2,Type,Square,RectangleHorizontal,TextCursorInput,Image as Img,Minus,Plus,Copy,Trash2,Maximize,X,ArrowUp,ArrowDown,Smartphone,Bold,AlignLeft,AlignCenter,AlignRight,LayoutTemplate,Pencil,Settings,Shapes} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {useStore,FW,blockTops} from '../../store';
import type {El,ET,Dev,Block} from '../../store';
import {toast} from '../../lib/toast';
import {TIPS} from '../../lib/tpl';
import {elStyle,elInner} from './elStyle';import {ElPanel,StylePanel} from './ElPanel';import {InsertPanel} from './Insert';import {NAME_NEW} from '../../lib/art';
const TOOLS:[ET|'sel',string,LucideIcon][]=[['sel','Выбор',MousePointer2],['text','Текст',Type],['rect','Прямоугольник',Square],['btn','Кнопка',RectangleHorizontal],['input','Поле ввода',TextCursorInput],['img','Изображение',Img],['line','Линия',Minus]];
const NAME:Record<ET,string>={text:'Текст',rect:'Прямоугольник',btn:'Кнопка',input:'Поле ввода',img:'Изображение',line:'Линия',...NAME_NEW} as Record<ET,string>;
const KEYS:Record<string,ET|'sel'>={KeyV:'sel',KeyT:'text',KeyR:'rect',KeyB:'btn',KeyF:'input',KeyI:'img',KeyL:'line'};
const HK:Record<string,string>={sel:'V',text:'T',rect:'R',btn:'B',input:'F',img:'I',line:'L'};
const G=8;const snap=(v:number,raw:boolean)=>raw?Math.round(v):Math.round(v/G)*G;
const clampZ=(v:number)=>Math.max(.1,Math.min(4,v));
function useSheet(){const s=useStore();const pr=s.data?.projects.find(p=>p.id===s.projectId);const sh=pr?.sheets.find(x=>x.id===s.sheetId);return{s,sh,st:pr?.style}}
type Drag={id:string;m:'move'|'size'|'bh';sx:number;sy:number;x:number;y:number;w:number;h:number};
const stop=(e:React.PointerEvent)=>e.stopPropagation();

export function Canvas({dev,W,onAdd}:{dev:Dev;W:number;onAdd:(after?:string)=>void}){
const {s,sh,st}=useSheet();const [ins,setIns]=useState(false);const [tool,setTool]=useState<ET|'sel'>('sel');const [z,setZ]=useState(.8);const [pan,setPan]=useState(false);
const wrap=useRef<HTMLDivElement>(null);const space=useRef(false);const drag=useRef<Drag|null>(null);
const panRef=useRef<{sx:number;sy:number;l:number;t:number}|null>(null);
const all=sh?.blocks??[];const editB=all.find(b=>b.id===s.editId);const editing=!!editB;
const vis=editB?[editB]:all;const tops=blockTops(vis,dev);
const total=vis.length?tops[tops.length-1]+vis[vis.length-1].h[dev]:0;
const flat=vis.flatMap((b,i)=>b.els[dev].map(e=>({e,b,top:tops[i]})));const els=flat.map(f=>f.e);
const sel=editing?flat.find(f=>f.e.id===s.elId):undefined;
const selBi=sel?-1:vis.findIndex(b=>b.id===s.blockId);const selB=selBi>=0?vis[selBi]:undefined;
const H=editing?Math.max(720,total+240):Math.max(900,total+280);
const stage=()=>wrap.current?.closest('.stage') as HTMLElement|null;
const fit=()=>{const w=stage()?.clientWidth??1000;setZ(clampZ(Math.min(1,(w-48)/W)))};
useEffect(fit,[W]);
useEffect(()=>{if(!editing){setTool('sel');setIns(false)}},[editing]);
const place=(t:ET,x:Partial<El>)=>{if(!editB)return;const w=x.w??240,h=x.h??120;const n=editB.els[dev].length%5*16;s.addEl(dev,t,Math.max(0,snap((W-w)/2+n,false)),Math.max(16,snap((editB.h[dev]-h)/2+n,false)),editB.id,x);setTool('sel');setIns(false)};
useEffect(()=>{const st=stage();if(!st)return;const h=(e:WheelEvent)=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();setZ(v=>clampZ(v*(e.deltaY<0?1.1:1/1.1)))};st.addEventListener('wheel',h,{passive:false});return()=>st.removeEventListener('wheel',h)},[]);
// bring the selected block into view (e.g. when picked in the sidebar)
useEffect(()=>{if(editing)return;const i=all.findIndex(b=>b.id===s.blockId);const st=stage();const w=wrap.current;if(i<0||!st||!w)return;const y=w.getBoundingClientRect().top-st.getBoundingClientRect().top+st.scrollTop+tops[i]*z;if(y<st.scrollTop||y>st.scrollTop+st.clientHeight*.7)st.scrollTo({top:Math.max(0,y-24),behavior:'smooth'})},[s.blockId]);
const delBlock=(b:Block)=>{s.delBlock(b.id);toast(`Блок «${b.title}» удалён`,{label:'Отменить',run:()=>{s.undo();s.setBlock(b.id)}},6500)};
useEffect(()=>{
const typing=(e:KeyboardEvent)=>/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName);
const kd=(e:KeyboardEvent)=>{
if(typing(e)||document.querySelector('.modal'))return;
const mod=e.ctrlKey||e.metaKey;
if(e.code==='Space'&&!mod){e.preventDefault();if(!space.current){space.current=true;setPan(true)}return}
const cur=editing?els.find(x=>x.id===s.elId):undefined;const curB=all.find(b=>b.id===s.blockId);
if(mod){
if(e.code==='Enter'&&editing){e.preventDefault();s.exitEdit(true);return}
if(e.code==='KeyD'){e.preventDefault();if(cur)s.dupEl(dev,cur.id);else if(curB&&!editing)s.dupBlock(curB.id);return}
if(e.code==='KeyB'&&cur){e.preventDefault();s.updEl(dev,cur.id,{b:!cur.b});return}
if(e.code==='KeyC'&&cur){e.preventDefault();s.clipSet(dev,cur.id);return}
if(e.code==='KeyX'&&cur){e.preventDefault();s.clipSet(dev,cur.id);s.delEl(dev,cur.id);return}
if(e.code==='KeyV'&&editing&&s.clip){e.preventDefault();s.clipPaste(dev);return}
if((e.code==='BracketRight'||e.code==='BracketLeft')&&cur){e.preventDefault();s.moveEl(dev,cur.id,(e.code==='BracketRight'?1:-1)*(e.shiftKey?1e4:1))}
return}
if(e.altKey&&!editing&&curB&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();s.moveBlock(curB.id,e.key==='ArrowUp'?-1:1);return}
if(e.altKey)return;
if(e.shiftKey&&e.code==='Digit0'){e.preventDefault();setZ(1);return}
if(e.shiftKey&&e.code==='Digit1'){e.preventDefault();fit();return}
if(e.code==='KeyA'&&!e.shiftKey){e.preventDefault();if(!editing)onAdd(s.blockId??undefined);return}
if(e.code==='KeyE'&&!e.shiftKey){e.preventDefault();if(editing)setIns(v=>!v);else if(curB){s.enterEdit(curB.id);setIns(true)}return}
const tk=e.shiftKey?undefined:KEYS[e.code];if(tk){if(editing)setTool(tk);else if(curB){s.enterEdit(curB.id);setTool(tk)}return}
if(e.code==='Equal'||e.code==='NumpadAdd'){setZ(v=>clampZ(v+.1));return}
if(e.code==='Minus'||e.code==='NumpadSubtract'){setZ(v=>clampZ(v-.1));return}
if(e.key==='Escape'){if(ins){setIns(false);return}if(tool!=='sel'){setTool('sel');return}if(cur){s.setBlock(s.editId);return}if(editing){s.exitEdit(true);return}if(s.blockId)s.setBlock(null);return}
if(e.key==='Tab'&&editing&&els.length&&(e.target as HTMLElement).tagName==='BODY'){e.preventDefault();const i=els.findIndex(x=>x.id===s.elId);const n=i<0?(e.shiftKey?els.length-1:0):(i+(e.shiftKey?-1:1)+els.length)%els.length;s.setEl(els[n].id);return}
if(e.key==='Enter'){if(!editing&&curB){e.preventDefault();s.enterEdit(curB.id)}else if(cur){e.preventDefault();document.getElementById('el-text')?.focus()}return}
if(!cur){if(!editing&&curB&&(e.key==='Delete'||e.key==='Backspace')){e.preventDefault();delBlock(curB)}return}
if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();s.delEl(dev,cur.id);return}
const st=e.shiftKey?G:1;const dd:Record<string,[number,number]>={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,-st],ArrowDown:[0,st]};const v=dd[e.key];
if(v){e.preventDefault();s.updEl(dev,cur.id,{x:Math.max(0,cur.x+v[0]),y:Math.max(0,cur.y+v[1])})}};
const ku=(e:KeyboardEvent)=>{if(e.code!=='Space')return;if(space.current){space.current=false;setPan(false)}if(!typing(e))e.preventDefault()};
const off=()=>{space.current=false;setPan(false)};
addEventListener('keydown',kd);addEventListener('keyup',ku);addEventListener('blur',off);
return()=>{removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('blur',off)}});
const down=(e:React.PointerEvent,el:El,m:'move'|'size')=>{if(!editing||tool!=='sel'||space.current||e.button!==0)return;e.stopPropagation();s.setEl(el.id);drag.current={id:el.id,m,sx:e.clientX,sy:e.clientY,x:el.x,y:el.y,w:el.w,h:el.h};wrap.current!.setPointerCapture(e.pointerId)};
const downB=(e:React.PointerEvent,b:Block)=>{if(tool!=='sel'||space.current||e.button!==0)return;e.stopPropagation();drag.current={id:b.id,m:'bh',sx:e.clientX,sy:e.clientY,x:0,y:0,w:0,h:b.h[dev]};wrap.current!.setPointerCapture(e.pointerId)};
const move=(e:React.PointerEvent)=>{const p=panRef.current;if(p){const st=stage();if(st){st.scrollLeft=p.l-(e.clientX-p.sx);st.scrollTop=p.t-(e.clientY-p.sy)}return}
const d=drag.current;if(!d)return;const dx=(e.clientX-d.sx)/z,dy=(e.clientY-d.sy)/z,raw=e.altKey;
if(d.m==='bh')s.setH(dev,d.id,snap(d.h+dy,raw));
else if(d.m==='move')s.dragEl(dev,d.id,{x:Math.max(0,Math.min(W-d.w,snap(d.x+dx,raw))),y:snap(d.y+dy,raw)});
else s.updEl(dev,d.id,{w:Math.max(16,Math.min(W-d.x,snap(d.w+dx,raw))),h:d.h?Math.max(16,snap(d.h+dy,raw)):0})};
const create=(e:React.PointerEvent)=>{const r=wrap.current!.getBoundingClientRect();const x=(e.clientX-r.left)/z,y=(e.clientY-r.top)/z;
if(!editing||tool==='sel'){if(editing){s.setBlock(s.editId);return}const i=y>=0&&y<total?vis.findIndex((_,k)=>y>=tops[k]&&y<tops[k]+vis[k].h[dev]):-1;s.setBlock(i>=0?vis[i].id:null);return}
s.addEl(dev,tool,snap(x,false),snap(y,false),s.editId??undefined);setTool('sel')};
const press=(e:React.PointerEvent)=>{if(space.current||e.button===1){e.preventDefault();const st=stage();if(!st)return;panRef.current={sx:e.clientX,sy:e.clientY,l:st.scrollLeft,t:st.scrollTop};wrap.current!.setPointerCapture(e.pointerId);return}if(e.button!==0)return;create(e)};
const up=()=>{const d=drag.current;if(d&&d.m==='move')s.dropEl(dev,d.id,editing);drag.current=null;panRef.current=null};
const dbl=()=>{if(editing)document.getElementById('el-text')?.focus();else if(s.blockId)s.enterEdit(s.blockId)};
return<><div className="cvw"><div className="cv-head">{editing&&editB?`Блок ${all.indexOf(editB)+1} · ${editB.title}`:sh?.name} · {{desktop:'Desktop',tablet:'Tablet',mobile:'Mobile'}[dev]} · {W}</div>
<div className="cv" ref={wrap} style={{width:W*z,height:H*z,cursor:pan?'grab':editing&&tool!=='sel'?'crosshair':'default'}} onPointerDown={press} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={dbl}>
<div className={'cv-in '+(editing?'ed':'pg')} style={{width:W,height:H,transform:`scale(${z})`,'--z':z} as React.CSSProperties}>
{vis.map((b,i)=><div key={b.id} className={'band'+(i===selBi?' sel':'')} style={{top:tops[i],height:b.h[dev]}}><span>{all.indexOf(b)+1}. {b.title}</span>
{!editing&&<div className="bt" onPointerDown={stop}><button title="Настройки блока" onClick={()=>s.setBlock(b.id)}><Settings size={14}/></button><button className="ed" title="Редактировать блок (Enter)" onClick={()=>s.enterEdit(b.id)}><Pencil size={14}/>Редактировать</button><i className="sep"/>
<button title="Выше (Alt+↑)" onClick={()=>s.moveBlock(b.id,-1)}><ArrowUp size={14}/></button><button title="Ниже (Alt+↓)" onClick={()=>s.moveBlock(b.id,1)}><ArrowDown size={14}/></button><button title="Дублировать (Ctrl+D)" onClick={()=>s.dupBlock(b.id)}><Copy size={14}/></button><button className="dz" title="Удалить" onClick={()=>delBlock(b)}><Trash2 size={14}/></button></div>}</div>)}
{flat.map(({e,top})=>{const on=e.id===s.elId&&editing;return<div key={e.id} className={'el '+e.t+(on?' sel':'')+(e.acc?' acc':'')+(e.go?' lnk':'')} style={elStyle(e,top,st)} onPointerDown={ev=>down(ev,e,'move')}>{elInner(e)}{on&&<u className="rz" onPointerDown={ev=>down(ev,e,'size')}/>}</div>})}
{!editing&&vis.slice(0,-1).map((b,i)=><div key={'i'+b.id} className="ins" style={{top:tops[i]+b.h[dev]}}><button className="insb" title="Добавить блок здесь" onPointerDown={stop} onClick={()=>onAdd(b.id)}><Plus size={16}/><span>Добавить блок</span></button></div>)}
{selB&&<><div className="bh" style={{left:W/2,top:tops[selBi]+selB.h[dev]}} onPointerDown={ev=>downB(ev,selB)}/><div className="dim" style={{left:W/2,top:tops[selBi]+selB.h[dev]+22}}>{W} × {selB.h[dev]}</div></>}
{sel&&<div className="dim" style={{left:sel.e.x+sel.e.w/2,top:sel.top+sel.e.y+(sel.e.t==='line'?6:sel.e.h)+8}}>{Math.round(sel.e.w)}{sel.e.t==='line'?'':` × ${Math.round(sel.e.h)}`}</div>}
{!vis.length&&<div className="cv-empty">Страница пустая. Нажми «Добавить блок»: с нуля или из библиотеки</div>}
{!editing&&<button className="addblk" style={{left:W/2,top:vis.length?total+28:180}} onPointerDown={stop} onClick={()=>onAdd(vis.length?vis[vis.length-1].id:undefined)}><Plus size={16}/>Добавить блок (A)</button>}
</div></div></div>
{editing&&ins&&<InsertPanel onPick={place} onClose={()=>setIns(false)}/>}
<div className="tools">{editing&&<>{TOOLS.map(([k,l,I])=><button key={k} className={tool===k?'on':''} title={`${l} (${HK[k]})`} onClick={()=>setTool(k)}><I size={18}/></button>)}<button className={ins?'on':''} title="Элементы: фигуры, иконки, мокапы (E)" onClick={()=>setIns(v=>!v)}><Shapes size={18}/></button><i className="vr"/></>}
<button title="Уменьшить (−)" onClick={()=>setZ(clampZ(z-.1))}><Minus size={16}/></button><button className="zv" title="100% (Shift+0)" onClick={()=>setZ(1)}>{Math.round(z*100)}%</button><button title="Увеличить (+)" onClick={()=>setZ(clampZ(z+.1))}><Plus size={16}/></button><button title="Вписать (Shift+1)" onClick={fit}><Maximize size={16}/></button></div></>}

function BlockPanel({dev,b,idx,editing,onTpl}:{dev:Dev;b:Block;idx:number;editing:boolean;onTpl:()=>void}){
const s=useStore();const tips=TIPS[b.title]??[];const els=b.els[dev];
const del=()=>{s.delBlock(b.id);toast(`Блок «${b.title}» удалён`,{label:'Отменить',run:()=>{s.undo();s.setBlock(b.id)}},6500)};
return<aside className="panel"><div className="ph"><b>Блок {idx+1}</b><span>{editing?'Редактирование':'Настройки'}</span>{!editing&&<button className="btn ic" onClick={()=>s.setBlock(null)} aria-label="Закрыть"><X size={14}/></button>}</div>
<div className="sec"><label className="fld"><span>Название</span><input className="inp" value={b.title} placeholder="Название блока" onChange={e=>s.editBlock(b.id,{title:e.target.value})}/></label>
<div className="grid2"><label className="num"><span>В</span><input type="number" value={b.h[dev]} onChange={e=>s.setH(dev,b.id,+e.target.value||0)}/></label><label className="num"><span>Ш</span><input type="number" value={FW[dev]} disabled/></label></div>
{dev==='mobile'&&b.h.mobile>844&&<p className="warn">Блок выше экрана телефона (844 px). Правило: один блок = один экран</p>}
{!editing&&<button className="btn pri" onClick={()=>s.enterEdit(b.id)}><Pencil size={16}/>Редактировать блок</button>}</div>
<div className="sec"><h4>Тексты и заметки</h4><textarea className="inp" placeholder="Тексты блока, пожелания дизайнеру, как работает: переходы, раскрытия, кнопки" value={b.text} onChange={e=>s.editBlock(b.id,{text:e.target.value})}/></div>
{tips.length>0&&<div className="sec"><h4>Из твоих конспектов</h4><ul className="tipl">{tips.map(t=><li key={t}>{t}</li>)}</ul></div>}
{editing&&els.length>0&&<div className="sec"><h4>Слои блока · {els.length}</h4>{[...els].reverse().map(x=><button key={x.id} className="row sm" onClick={()=>s.setEl(x.id)}><span>{NAME[x.t]}{x.text?` · ${x.text.slice(0,24)}`:''}</span></button>)}</div>}
{!editing&&<div className="sec"><h4>Положение</h4><div className="btnrow"><button className="btn" title="Блок выше (Alt+↑)" onClick={()=>s.moveBlock(b.id,-1)}><ArrowUp size={16}/>Выше</button><button className="btn" title="Блок ниже (Alt+↓)" onClick={()=>s.moveBlock(b.id,1)}><ArrowDown size={16}/>Ниже</button></div></div>}
<div className="sec"><button className="btn" onClick={onTpl}><LayoutTemplate size={16}/>Сохранить как шаблон</button>
{!editing&&<div className="btnrow"><button className="btn" title="Дублировать (Ctrl+D)" onClick={()=>s.dupBlock(b.id)}><Copy size={16}/>Дублировать</button><button className="btn danger" title="Удалить (Delete)" onClick={del}><Trash2 size={16}/>Удалить</button></div>}</div></aside>}

export function RightPanel({dev,onTpl}:{dev:Dev;onTpl:()=>void}){
const {s,sh,st}=useSheet();const blocks=sh?.blocks??[];const editing=!!s.editId;
const f=editing?blocks.flatMap(b=>b.els[dev].map(e=>({e,b}))).find(x=>x.e.id===s.elId):undefined;
if(f&&st)return<ElPanel dev={dev} e={f.e} b={f.b} st={st}/>;
const bi=blocks.findIndex(x=>x.id===s.blockId);
if(bi>=0)return<BlockPanel dev={dev} b={blocks[bi]} idx={bi} editing={editing} onTpl={onTpl}/>;
return<aside className="panel idle"><div className="ph"><b>Страница</b><span>{blocks.length} блоков</span></div>{blocks.map((b,i)=><button key={b.id} className="row sm" onClick={()=>s.setBlock(b.id)}><b className="no">{i+1}</b><span>{b.title}</span></button>)}
<p className="hint">Наведи на блок: появится панель (редактировать, порядок, копия, удаление). Клик выбирает блок и открывает его настройки. «Редактировать» или Enter открывает блок для рисования. Между блоками появляется «+». A добавляет блок. Все клавиши открывает «?»</p>{st&&<StylePanel st={st}/>}</aside>}
