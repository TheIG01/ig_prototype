import {normRot} from '../../lib/elFx';
import {useEffect,useRef,useState,lazy,Suspense} from 'react';
import {pickIds,modsOf,curSel} from '../../lib/select';import {matchingIds,invertIds,wholeGroup} from '../../lib/layerKeys';import {useLayerUi} from '../../lib/layerUi';
import {MousePointer2,Type,Square,RectangleHorizontal,TextCursorInput,Image as Img,Minus,Plus,Copy,Trash2,Maximize,X,ArrowUp,ArrowDown,Smartphone,Bold,AlignLeft,AlignCenter,AlignRight,LayoutTemplate,Pencil,Settings,Shapes,Eye,Download,FlipHorizontal,FlipVertical,Link2,Frame as FrameI} from 'lucide-react';import {FRAME,wrapInFrame} from '../../lib/frame';
import type {LucideIcon} from 'lucide-react';
import {useStore,FW,blockTops,onDev,DEVS} from '../../store';
import {requestDelBlock,DevIcon} from '../blocks/DelBlock';
import {DEVN} from '../../lib/dev';
import {download,blockMd,blockFile} from '../../lib/export';
import type {El,ET,Dev,Block} from '../../store';
import {toast} from '../../lib/toast';
import {TIPS} from '../../lib/tpl';import {checkBlock} from '../../lib/textcheck';
import {VList} from './VList';import {LayerBtns} from './LayerBtns';const QuizEditor=lazy(()=>import('../quiz/QuizEditor').then(m=>({default:m.QuizEditor})));import {elStyle,elInner} from './elStyle';import {ElPanel,StylePanel,Color} from './ElPanel';import {InsertPanel} from './Insert';import {NAME_NEW} from '../../lib/art';import {MultiPanel} from './MultiPanel';import {RichEdit} from './RichEdit';import {hasAnyLink} from '../../lib/rich';import {InlineEdit,INLINE} from './InlineEdit';import {stageGroup} from '../../lib/tplSteps';import {teamN} from '../../lib/tplTeam';import {Ruler,ViewMenu} from './Rulers';import {useUi,saveUi,getUi} from '../../lib/ui';import {uid} from '../../lib/uid';import {BlockPad} from './BlockPad';import {calcResize} from '../../lib/resizeCalc';import {quickPatch} from '../../lib/quickKeys';
const TOOLS:[ET|'sel',string,LucideIcon][]=[['sel','Выбор',MousePointer2],['text','Текст',Type],['rect','Прямоугольник',Square],['btn','Кнопка',RectangleHorizontal],['input','Поле ввода',TextCursorInput],['img','Изображение',Img],['line','Линия',Minus]];
const NAME:Record<ET,string>={text:'Текст',rect:'Прямоугольник',btn:'Кнопка',input:'Поле ввода',img:'Изображение',line:'Линия',...NAME_NEW} as Record<ET,string>;
const STY=['fs','b','al','acc','fill','stroke','sw','r','op','c'] as const;let styClip:Partial<El>|null=null;
const KEYS:Record<string,ET|'sel'>={KeyV:'sel',KeyT:'text',KeyR:'rect',KeyB:'btn',KeyU:'input',KeyI:'img',KeyL:'line'};
const HK:Record<string,string>={sel:'V',text:'T',rect:'R',btn:'B',input:'U',img:'I',line:'L'};
const snap=(v:number,raw:boolean)=>{const u=getUi();return raw||!u.snap?Math.round(v):Math.round(v/u.gs)*u.gs};
const LI:Record<string,LucideIcon>={text:Type,rect:Square,btn:RectangleHorizontal,input:TextCursorInput,img:Img,line:Minus};
type Rg={x:[number,number];y:[number,number]};
const clampZ=(v:number)=>Math.max(.1,Math.min(4,v));
function useSheet(){const s=useStore();const pr=s.data?.projects.find(p=>p.id===s.projectId);const sh=pr?.sheets.find(x=>x.id===s.sheetId);return{s,sh,st:pr?.style}}
type Drag={id:string;m:'move'|'bh'|'draw'|'rs'|'box'|'rot';items?:{id:string;x:number;y:number}[];base?:string[];dir?:string;t?:ET;ex?:Partial<El>;sx:number;sy:number;x:number;y:number;w:number;h:number};
const stop=(e:React.PointerEvent)=>e.stopPropagation();

export function Canvas({dev,W,onAdd}:{dev:Dev;W:number;onAdd:(after?:string)=>void}){
const {s,sh,st}=useSheet();const ui=useUi();const [vm,setVm]=useState(false);const [ins,setIns]=useState(false);const [tool,setTool]=useState<ET|'sel'>('sel');const [z,setZ]=useState(.8);const [pan,setPan]=useState(false);const [arm,setArm]=useState<Partial<El>>({});const [mq,setMq]=useState<{x:number;y:number;w:number;h:number}|null>(null);const [gd,setGd]=useState<{v:number[];h:number[]}|null>(null);
const pick=(t:ET|'sel',ex:Partial<El>={})=>{setTool(t);setArm(ex)};
const wrap=useRef<HTMLDivElement>(null);const space=useRef(false);const drag=useRef<Drag|null>(null);
const panRef=useRef<{sx:number;sy:number;l:number;t:number}|null>(null);
const raw=sh?.blocks??[];const all=raw.filter(b=>onDev(b,dev));const editB=raw.find(b=>b.id===s.editId);const editing=!!editB;
const vis=editB?[editB]:all;const tops=blockTops(vis,dev);
const total=vis.length?tops[tops.length-1]+vis[vis.length-1].h[dev]:0;
const flat=vis.flatMap((b,i)=>(b.els?.[dev]??[]).filter(e=>!e.hid).map(e=>({e,b,top:tops[i]})));const els=flat.map(f=>f.e);
const selIds=editing?(s.multi.includes(s.elId??'')?s.multi:s.elId?[s.elId]:[]).filter(id=>els.some(x=>x.id===id)):[];const selSet=new Set(selIds);
const sel=selIds.length===1?flat.find(f=>f.e.id===selIds[0]):undefined;
const sb=selIds.length>1?(()=>{const a=flat.filter(f=>selSet.has(f.e.id));const x=Math.min(...a.map(f=>f.e.x)),y=Math.min(...a.map(f=>f.e.y));return{x,y,w:Math.max(...a.map(f=>f.e.x+f.e.w))-x,h:Math.max(...a.map(f=>f.e.y+(f.e.t==='line'?0:f.e.h)))-y,top:a[0].top}})():undefined;
const selBi=selIds.length?-1:vis.findIndex(b=>b.id===s.blockId);const selB=selBi>=0?vis[selBi]:undefined;
const H=editing?Math.max(720,total+240):vis.length?total+112:300;
const rr:Rg|undefined=(():Rg|undefined=>{if(sel)return{x:[sel.e.x,sel.e.x+sel.e.w],y:[sel.top+sel.e.y,sel.top+sel.e.y+(sel.e.t==='line'?0:sel.e.h)]};if(sb)return{x:[sb.x,sb.x+sb.w],y:[sb.top+sb.y,sb.top+sb.y+sb.h]};if(selB)return{x:[0,W],y:[tops[selBi],tops[selBi]+selB.h[dev]]};return undefined})();
const stage=()=>wrap.current?.closest('.stage') as HTMLElement|null;
const [alt,setAlt]=useState(false);const [ied,setIed]=useState<string|null>(null);
const startIed=(e:El)=>{s.setMulti([e.id]);s.setEl(e.id);setIed(e.id)};
const [gdr,setGdr]=useState<{ax:'x'|'y';pos:number;skip?:number}|null>(null);
/** вход в группу: двойной клик, внутри клик выбирает один элемент, Esc выходит */
const [inG,setInG]=useState<string|null>(null);const gOk=!!inG&&selIds.length>0&&selIds.every(i=>els.find(x=>x.id===i)?.g===inG);const ing=gOk?inG:null;useEffect(()=>{if(inG&&!gOk)setInG(null)});
const gl=editB?.guides?.[dev]??{x:[] as number[],y:[] as number[]};
const colInfo=()=>{const n=ui.colsN||({desktop:12,tablet:8,mobile:4} as Record<Dev,number>)[dev];const gut=ui.gut>=0?ui.gut:({desktop:24,tablet:16,mobile:16} as Record<Dev,number>)[dev];const mar=ui.mar>=0?ui.mar:({desktop:80,tablet:32,mobile:16} as Record<Dev,number>)[dev];const cw=Math.max(1,(W-2*mar-(n-1)*gut)/n);return{n,gut,mar,cw}};
const colEdges=()=>{const c=colInfo();const o:number[]=[];for(let i=0;i<c.n;i++){const x=c.mar+i*(c.cw+c.gut);o.push(Math.round(x),Math.round(x+c.cw))}return o};
/** привязка по X: к краю колонки (если колонки включены и рядом), иначе к шагу сетки */
const snapX=(v:number,raw:boolean)=>{if(!raw&&ui.cols){const T=6/z;let b=T,r=snap(v,raw);for(const t of colEdges())if(Math.abs(t-v)<b){b=Math.abs(t-v);r=t}return r}return snap(v,raw)};
/** направляющая: потянуть с линейки (новая) или за саму линию (двигать). Увести на линейку или за край: удалить */
const startGuide=(e:React.PointerEvent,ax:'x'|'y',idx?:number)=>{if(!editing||!editB||e.button!==0)return;e.preventDefault();e.stopPropagation();if(!ui.guides)saveUi({guides:true});
const b=editB,lim=ax==='x'?W:b.h[dev];const base={x:[...(b.guides?.[dev]?.x??[])],y:[...(b.guides?.[dev]?.y??[])]};if(idx!==undefined)base[ax].splice(idx,1);
const calc=(ev:PointerEvent)=>{const r=wrap.current!.getBoundingClientRect();return Math.max(0,Math.min(lim,Math.round(ax==='x'?(ev.clientX-r.left)/z:(ev.clientY-r.top)/z)))};
const mv=(ev:PointerEvent)=>setGdr({ax,pos:calc(ev),skip:idx});
const upf=(ev:PointerEvent)=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',upf);setGdr(null);const r=wrap.current?.getBoundingClientRect();if(!r)return;const out=ax==='x'?(ev.clientX<r.left||ev.clientX>r.right):(ev.clientY<r.top||ev.clientY>r.bottom);if(out&&idx===undefined)return;if(!out)base[ax].push(calc(ev));s.setGuides(b.id,dev,base)};
mv(e.nativeEvent);addEventListener('pointermove',mv);addEventListener('pointerup',upf)};
const delGuide=(ax:'x'|'y',i:number)=>{if(!editB)return;const g={x:[...gl.x],y:[...gl.y]};g[ax].splice(i,1);s.setGuides(editB.id,dev,g)};
const endIed=(id:string,t:string)=>{setIed(null);const q=els.find(x=>x.id===id);if(q&&q.t==='text'&&!t.trim())s.delEl(dev,id)};
type LB={g:string;c:{d:'h'|'v';gap:number};x:number;y:number;w:number;h:number;gp:{x:number;y:number;w:number;h:number}[]};
const lbs:LB[]=(()=>{if(!editing||!editB||!selIds.length)return[];const L=editB.lay?.[dev];if(!L)return[];const gs=[...new Set(els.filter(q=>selSet.has(q.id)&&q.g&&L[q.g]).map(q=>q.g as string))];
return gs.map(g=>{const c=L[g];const m=els.filter(q=>q.g===g);const hh=(q:El)=>q.t==='line'?0:q.h;const x=Math.min(...m.map(q=>q.x)),y=Math.min(...m.map(q=>q.y)),w=Math.max(...m.map(q=>q.x+q.w))-x,h=Math.max(...m.map(q=>q.y+hh(q)))-y;const v=c.d==='v';const o=[...m].sort((a,q)=>v?a.y-q.y:a.x-q.x);const gp=o.slice(0,-1).map((q,i)=>v?{x,y:q.y+hh(q),w,h:o[i+1].y-q.y-hh(q)}:{x:q.x+q.w,y,w:o[i+1].x-q.x-q.w,h});return{g,c,x,y,w,h,gp:gp.filter(r=>r.w>0&&r.h>0)}})})();

useEffect(()=>{const d=(e:KeyboardEvent)=>{if(e.key==='Alt'){if(editing)e.preventDefault();setAlt(true)}};const u=(e:KeyboardEvent)=>{if(e.key==='Alt'){if(editing)e.preventDefault();setAlt(false)}};const b=()=>setAlt(false);window.addEventListener('keydown',d);window.addEventListener('keyup',u);window.addEventListener('blur',b);return()=>{window.removeEventListener('keydown',d);window.removeEventListener('keyup',u);window.removeEventListener('blur',b)}},[editing]);
type Ms={x:number;y:number;w:number;h:number;v:number;vt:boolean};
const meas:Ms[]=(()=>{if(!alt||!editing||!editB||!selIds.length)return[];const sl=els.filter(q=>selSet.has(q.id));if(!sl.length)return[];const x0=Math.min(...sl.map(q=>q.x)),y0=Math.min(...sl.map(q=>q.y)),x1=Math.max(...sl.map(q=>q.x+q.w)),y1=Math.max(...sl.map(q=>q.y+(q.t==='line'?0:q.h)));const ot=els.filter(q=>!selSet.has(q.id));const bh=editB.h[dev];const cx=(x0+x1)/2,cy=(y0+y1)/2;const hv=(q:El)=>q.y<y1&&q.y+(q.t==='line'?0:q.h)>y0;const vv=(q:El)=>q.x<x1&&q.x+q.w>x0;
let L=0,R=W,T=0,B=bh;for(const q of ot){const qb=q.y+(q.t==='line'?0:q.h);if(hv(q)||(q.t==='line'&&q.y>=y0&&q.y<=y1)){if(q.x+q.w<=x0)L=Math.max(L,q.x+q.w);if(q.x>=x1)R=Math.min(R,q.x)}if(vv(q)){if(qb<=y0)T=Math.max(T,qb);if(q.y>=y1)B=Math.min(B,q.y)}}
const o:Ms[]=[];if(x0-L>0)o.push({x:L,y:cy,w:x0-L,h:0,v:x0-L,vt:false});if(R-x1>0)o.push({x:x1,y:cy,w:R-x1,h:0,v:R-x1,vt:false});if(y0-T>0)o.push({x:cx,y:T,w:0,h:y0-T,v:y0-T,vt:true});if(B-y1>0)o.push({x:cx,y:y1,w:0,h:B-y1,v:B-y1,vt:true});return o})();

const fit=()=>{const w=stage()?.clientWidth??1000;setZ(clampZ(Math.min(1,(w-48-(getUi().rulers?22:0))/W)))};
useEffect(fit,[W]);
useEffect(()=>{if(!editing){setTool('sel');setArm({});setIns(false);setIed(null)}},[editing]);
const place=(t:ET,x:Partial<El>)=>{if(!editB)return;pick(t,x);setIns(false)};
useEffect(()=>{const st=stage();if(!st)return;const h=(e:WheelEvent)=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();setZ(v=>clampZ(v*(e.deltaY<0?1.1:1/1.1)))};st.addEventListener('wheel',h,{passive:false});return()=>st.removeEventListener('wheel',h)},[]);
// bring the selected block into view (e.g. when picked in the sidebar)
useEffect(()=>{if(editing)return;const i=all.findIndex(b=>b.id===s.blockId);const st=stage();const w=wrap.current;if(i<0||!st||!w)return;const y=w.getBoundingClientRect().top-st.getBoundingClientRect().top+st.scrollTop+tops[i]*z;if(y<st.scrollTop||y>st.scrollTop+st.clientHeight*.7)st.scrollTo({top:Math.max(0,y-24),behavior:'smooth'})},[s.blockId]);
const delBlock=(b:Block)=>requestDelBlock(b,dev);
useEffect(()=>{
const typing=(e:KeyboardEvent)=>/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)||!!(e.target as HTMLElement).isContentEditable;
const kd=(e:KeyboardEvent)=>{
if(typing(e)||document.querySelector('.modal'))return;
const mod=e.ctrlKey||e.metaKey;
if(e.code==='Space'&&!mod){e.preventDefault();if(!space.current){space.current=true;setPan(true)}return}
const cur=editing?els.find(x=>x.id===s.elId):undefined;const curB=all.find(b=>b.id===s.blockId);
if(mod){
if(e.code==='Quote'&&!e.altKey){e.preventDefault();saveUi(e.shiftKey?{cols:!ui.cols}:{grid:!ui.grid});return}if(e.code==='Semicolon'){e.preventDefault();saveUi({guides:!ui.guides});return}
if(e.shiftKey&&!e.altKey&&editing&&(e.code==='KeyH'||e.code==='KeyL')){e.preventDefault();if(!selIds.length){toast('Выдели элемент, чтобы '+(e.code==='KeyH'?'скрыть':'заблокировать')+' его');return}const k=e.code==='KeyH'?'hid':'lk';const sel=els.filter(x=>selIds.includes(x.id));const on=sel.some(x=>!x[k]);s.patchEls(dev,selIds,k==='hid'?{hid:on?1 as const:undefined}:{lk:on?1 as const:undefined});toast(e.code==='KeyH'?(on?'Скрыто. Вернуть можно глазом в слоях':'Показано'):(on?'Заблокировано. Разблокируй замком в слоях':'Разблокировано'));return}
if(e.code==='KeyA'&&editing&&e.altKey&&!e.shiftKey){e.preventDefault();if(!selIds.length){toast('Выдели элемент, чтобы найти такие же');return}const ids=matchingIds(els,selIds);s.setMulti(ids);toast('Выделено таких же: '+ids.length);return}
if(e.code==='KeyA'&&editing&&e.shiftKey&&!e.altKey){e.preventDefault();if(!selIds.length){toast('Выдели элемент, чтобы выделить остальные');return}s.setMulti(invertIds(els,selIds));return}
if(e.code==='KeyR'&&editing&&!e.shiftKey&&!e.altKey){e.preventDefault();if(!cur){toast('Выдели элемент, чтобы переименовать слой');return}useLayerUi.getState().setRen(cur.id);return}
if(e.code==='KeyA'&&editing){e.preventDefault();s.setMulti(els.filter(x=>!x.lk).map(x=>x.id));return}
if(e.code==='KeyG'&&editing&&e.altKey&&!e.shiftKey){e.preventDefault();if(!selIds.length){toast('Выдели элементы, чтобы собрать их во фрейм');return}if(wrapInFrame(dev,selIds,els,s.editId??undefined))toast('Фрейм создан, элементы сгруппированы');return}
if(e.code==='KeyG'&&editing&&e.shiftKey&&selIds.length){e.preventDefault();s.groupEls(dev,selIds,false);return}
if(e.code==='KeyG'&&editing&&selIds.length>1){e.preventDefault();s.groupEls(dev,selIds,true);return}
if(e.altKey&&e.shiftKey&&editing&&selIds.length>2&&(e.code==='KeyH'||e.code==='KeyV')){e.preventDefault();s.alignEls(dev,selIds,e.code==='KeyH'?'dh':'dv');return}
if(e.altKey&&editing&&!e.shiftKey&&e.code==='KeyC'&&cur){e.preventDefault();const o:Record<string,unknown>={};for(const k of STY)if(cur[k]!==undefined)o[k]=cur[k];styClip=o as Partial<El>;toast('Стиль скопирован');return}
if(e.altKey&&editing&&!e.shiftKey&&e.code==='KeyV'&&selIds.length&&styClip){e.preventDefault();const o:Record<string,unknown>={};for(const k of STY)o[k]=styClip[k];for(const i of selIds)s.updEl(dev,i,o as Partial<El>);toast('Стиль применён');return}
if(e.code==='KeyD'&&editing&&selIds.length>1){e.preventDefault();s.dupEls(dev,selIds,16,selIds.map(()=>uid()));return}
if((e.code==='KeyC'||e.code==='KeyX')&&editing&&selIds.length>1){e.preventDefault();s.clipSetMany(dev,selIds);if(e.code==='KeyX')s.delEls(dev,selIds);return}
if(e.code==='KeyV'&&editing&&s.clipM){e.preventDefault();s.clipPasteMany(dev);return}
if(e.code==='Enter'&&editing){e.preventDefault();s.exitEdit(true);return}
if(e.code==='KeyD'){e.preventDefault();if(cur)s.dupEl(dev,cur.id);else if(curB&&!editing)s.dupBlock(curB.id);return}
if(e.code==='KeyB'&&cur){e.preventDefault();s.updEl(dev,cur.id,{b:!cur.b});return}
if(e.code==='KeyC'&&cur){e.preventDefault();s.clipSet(dev,cur.id);return}
if(e.code==='KeyX'&&cur){e.preventDefault();s.clipSet(dev,cur.id);s.delEl(dev,cur.id);return}
if(e.code==='KeyV'&&editing&&s.clip){e.preventDefault();s.clipPaste(dev);return}
if((e.code==='BracketRight'||e.code==='BracketLeft')&&cur){e.preventDefault();s.moveEl(dev,cur.id,(e.code==='BracketRight'?1:-1)*(e.shiftKey?1e4:1))}
return}
if(e.altKey&&!editing&&curB&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();s.moveBlock(curB.id,e.key==='ArrowUp'?-1:1,dev);return}
if(e.shiftKey&&!e.altKey&&e.code==='KeyR'){e.preventDefault();saveUi({rulers:!ui.rulers});return}
if(e.shiftKey&&!e.altKey&&e.code==='KeyA'&&editing){e.preventDefault();if(selIds.length<2){toast('Выдели два элемента и больше');return}const bb=editB?.lay?.[dev];const g0=cur?.g??els.find(q=>q.id===selIds[0])?.g;if(g0&&bb?.[g0]&&selIds.every(i=>els.find(q=>q.id===i)?.g===g0))s.delLay(dev,g0);else s.autoLay(dev,selIds);return}
if(editing&&selIds.length&&!mod&&!(e.altKey&&e.shiftKey)){const qs=els.filter(q=>selSet.has(q.id)&&!q.lk);const one=qs.length===1?qs[0]:undefined;
if((e.code==='Slash'&&(e.altKey||e.shiftKey))||(e.code==='KeyX'&&e.shiftKey&&!e.altKey)||(/^Digit\d$/.test(e.code)&&!e.shiftKey&&!e.altKey)){
if(e.code==='KeyX'&&!one){e.preventDefault();toast('Поменять заливку и обводку можно у одного элемента');return}
e.preventDefault();let n=0;for(const q of qs){const qp=quickPatch(e.code,e.shiftKey,e.altKey,q);if(qp){s.updEl(dev,q.id,qp);n++}}
if(e.code==='KeyX'&&!n)toast('У элемента нет заливки и обводки');return}}
if(e.altKey&&e.shiftKey&&!mod&&editing&&selIds.length>2&&(e.code==='KeyH'||e.code==='KeyV')){e.preventDefault();s.alignEls(dev,selIds,e.code==='KeyH'?'dh':'dv');return}
if(e.altKey&&editing&&!e.shiftKey&&selIds.length){const m=({KeyA:'l',KeyD:'r',KeyH:'c',KeyW:'t',KeyS:'b',KeyV:'m'} as Record<string,'l'|'r'|'c'|'t'|'b'|'m'>)[e.code];if(m){e.preventDefault();if(selIds.length>1)s.alignEls(dev,selIds,m);else if(cur&&editB){const bh=editB.h[dev];s.updEl(dev,cur.id,m==='l'?{x:0}:m==='r'?{x:Math.max(0,W-cur.w)}:m==='c'?{x:Math.max(0,Math.round((W-cur.w)/2))}:m==='t'?{y:0}:m==='b'?{y:Math.max(0,bh-cur.h)}:{y:Math.max(0,Math.round((bh-cur.h)/2))})}return}}
if(e.altKey)return;
if(e.shiftKey&&e.code==='Digit0'){e.preventDefault();setZ(1);return}
if(e.shiftKey&&e.code==='Digit1'){e.preventDefault();fit();return}
if(e.code==='KeyA'&&!e.shiftKey){e.preventDefault();if(!editing)onAdd(s.blockId??undefined);return}
if(e.code==='KeyE'&&!e.shiftKey){e.preventDefault();if(editing)setIns(v=>!v);else if(curB){s.enterEdit(curB.id);setIns(true)}return}
if(e.code==='KeyO'&&!e.shiftKey){e.preventDefault();if(editing)pick('shape',{sh:'circle',w:120,h:120});else if(curB){s.enterEdit(curB.id);pick('shape',{sh:'circle',w:120,h:120})}return}
if(e.shiftKey&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&(e.code==='KeyH'||e.code==='KeyV')&&editing&&selIds.length){e.preventDefault();const one=selIds.length===1?els.find(x=>x.id===selIds[0]):undefined;if(one&&!one.g){const k=e.code==='KeyH'?'flipX':'flipY';s.updEl(dev,one.id,{[k]:one[k]?undefined:1} as Partial<El>);return}s.flipEls(dev,selIds,e.code==='KeyH'?'x':'y');return}
if((e.ctrlKey||e.metaKey)&&e.shiftKey&&!e.altKey&&editing&&selIds.length&&e.key.startsWith('Arrow')){e.preventDefault();s.flipEls(dev,selIds,e.key==='ArrowLeft'||e.key==='ArrowRight'?'x':'y',true);toast('Выбранное перенесено на другую сторону блока');return}
if(e.code==='KeyF'&&!e.shiftKey&&!e.altKey){if(editing)pick('rect',FRAME);else if(curB){s.enterEdit(curB.id);pick('rect',FRAME)}return}
const tk=e.shiftKey?undefined:KEYS[e.code];if(tk){if(editing)pick(tk);else if(curB){s.enterEdit(curB.id);pick(tk)}return}
if(e.code==='Equal'||e.code==='NumpadAdd'){setZ(v=>clampZ(v+.1));return}
if(e.code==='Minus'||e.code==='NumpadSubtract'){setZ(v=>clampZ(v-.1));return}
if(e.key==='Escape'){if(ing){const gm=els.filter(q=>q.g===ing).map(q=>q.id);setInG(null);s.setMulti(gm);return}if(ins){setIns(false);return}if(tool!=='sel'){pick('sel');return}if(cur){s.setBlock(s.editId);return}if(editing){s.exitEdit(true);return}if(s.blockId)s.setBlock(null);return}
if(e.key==='Tab'&&editing&&els.length&&(e.target as HTMLElement).tagName==='BODY'){e.preventDefault();const i=els.findIndex(x=>x.id===s.elId);const n=i<0?(e.shiftKey?els.length-1:0):(i+(e.shiftKey?-1:1)+els.length)%els.length;s.setEl(els[n].id);return}
if(e.key==='Enter'&&e.shiftKey&&editing){e.preventDefault();if(ing){const gm=els.filter(q=>q.g===ing).map(q=>q.id);setInG(null);s.setMulti(gm)}else{const g0=cur?.g;if(g0)s.setMulti(els.filter(q=>q.g===g0).map(q=>q.id));else toast('У элемента нет группы-родителя')}return}
if(e.key==='Enter'&&!e.shiftKey&&editing){const wg=wholeGroup(els,selIds);if(wg){e.preventDefault();const top=[...els].reverse().find(q=>q.g===wg);setInG(wg);if(top)s.setMulti([top.id]);return}}
if(e.key==='Enter'){if(!editing&&curB){e.preventDefault();s.enterEdit(curB.id)}else if(cur){e.preventDefault();if(INLINE.has(cur.t))setIed(cur.id);else document.getElementById('el-text')?.focus()}return}
if(editing&&selIds.length>1&&(e.key==='Delete'||e.key==='Backspace')){e.preventDefault();s.delEls(dev,selIds);return}
if(!cur){if(!editing&&curB&&(e.key==='Delete'||e.key==='Backspace')){e.preventDefault();delBlock(curB)}return}
if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();s.delEl(dev,cur.id);return}
const st=e.shiftKey?getUi().nudge:1;const dd:Record<string,[number,number]>={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,-st],ArrowDown:[0,st]};const v=dd[e.key];
if(v){e.preventDefault();if(selIds.length>1){const a=els.filter(x=>selSet.has(x.id));const mx=Math.max(-Math.min(...a.map(x=>x.x)),Math.min(W-Math.max(...a.map(x=>x.x+x.w)),v[0])),my=Math.max(-Math.min(...a.map(x=>x.y)),v[1]);s.dragMany(dev,a.map(x=>({id:x.id,x:x.x+mx,y:x.y+my})))}else s.updEl(dev,cur.id,{x:Math.max(0,cur.x+v[0]),y:Math.max(0,cur.y+v[1])})}};
const ku=(e:KeyboardEvent)=>{if(e.code!=='Space')return;if(space.current){space.current=false;setPan(false)}if(!typing(e))e.preventDefault()};
const off=()=>{space.current=false;setPan(false)};
addEventListener('keydown',kd);addEventListener('keyup',ku);addEventListener('blur',off);
return()=>{removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('blur',off)}});
const pt=(e:{clientX:number;clientY:number})=>{const r=wrap.current!.getBoundingClientRect();return{x:(e.clientX-r.left)/z,y:(e.clientY-r.top)/z}};
const grp=(id:string,mod:boolean)=>{const x=els.find(q=>q.id===id);return!mod&&x?.g?els.filter(q=>q.g===x.g).map(q=>q.id):[id]};
const down=(e:React.PointerEvent,el:El)=>{if(!editing||tool!=='sel'||space.current||e.button!==0||el.lk)return;e.stopPropagation();if(ied===el.id)return;const mod=e.ctrlKey||e.metaKey;let ids=selIds;
if(e.shiftKey||mod){s.setMulti(pickIds(els,selIds,s.elId,el.id,modsOf(e)));return}
if(!ids.includes(el.id)){ids=ing&&el.g===ing?[el.id]:grp(el.id,mod);s.setMulti(ids)}
const src=ids.map(i=>els.find(q=>q.id===i)).filter(Boolean) as El[];let tid=src.map(q=>q.id);
if(e.altKey){tid=src.map(()=>uid());s.dupEls(dev,src.map(q=>q.id),0,tid,'um'+tid[0])}
const bx=Math.min(...src.map(q=>q.x)),by=Math.min(...src.map(q=>q.y));
drag.current={id:tid[tid.length-1],m:'move',t:el.t,sx:e.clientX,sy:e.clientY,x:bx,y:by,w:Math.max(...src.map(q=>q.x+q.w))-bx,h:Math.max(...src.map(q=>q.y+q.h))-by,items:src.map((q,i)=>({id:tid[i],x:q.x,y:q.y}))};
wrap.current!.setPointerCapture(e.pointerId)};
const downR=(e:React.PointerEvent,el:El,dir:string)=>{if(!editing||tool!=='sel'||space.current||e.button!==0)return;e.stopPropagation();drag.current={id:el.id,m:'rs',dir,t:el.t,sx:e.clientX,sy:e.clientY,x:el.x,y:el.y,w:el.w,h:el.h};wrap.current!.setPointerCapture(e.pointerId)};
const downB=(e:React.PointerEvent,b:Block)=>{if(tool!=='sel'||space.current||e.button!==0)return;e.stopPropagation();drag.current={id:b.id,m:'bh',sx:e.clientX,sy:e.clientY,x:0,y:0,w:0,h:b.h[dev]};wrap.current!.setPointerCapture(e.pointerId)};
/** draw a new element by dragging a rectangle (Shift = proportions, Alt = no grid) */
const drawTo=(e:React.PointerEvent,d:Drag)=>{const p=pt(e),raw=e.altKey,ln=d.t==='line';let w=snapX(p.x,raw)-d.x,h=snap(p.y,raw)-d.y;
if(e.shiftKey&&!ln){const m=Math.max(Math.abs(w),Math.abs(h));w=(w<0?-1:1)*m;h=(h<0?-1:1)*m}
const L=Math.max(0,Math.min(d.x,d.x+w)),R=Math.min(W,Math.max(d.x,d.x+w)),T=ln?d.y:Math.max(0,Math.min(d.y,d.y+h)),B=ln?d.y:Math.max(d.y,d.y+h);
d.w=Math.max(1,R-L);d.h=ln?0:Math.max(1,B-T);s.dragEl(dev,d.id,{x:L,y:T,w:d.w,h:d.h})};
const move=(e:React.PointerEvent)=>{const p=panRef.current;if(p){const st=stage();if(st){st.scrollLeft=p.l-(e.clientX-p.sx);st.scrollTop=p.t-(e.clientY-p.sy)}return}
const d=drag.current;if(!d)return;const dx=(e.clientX-d.sx)/z,dy=(e.clientY-d.sy)/z,raw=e.altKey;
if(d.m==='bh')s.setH(dev,d.id,snap(d.h+dy,raw));
else if(d.m==='draw'){if(!d.id){if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<4)return;s.addEl(dev,d.t!,d.x,d.y,s.editId??undefined,{...d.ex,w:1,h:d.t==='line'?0:1});d.id=useStore.getState().elId??''}
if(d.id)drawTo(e,d)}
else if(d.m==='rot'){const q=pt(e);let a=Math.atan2(q.y-d.y,q.x-d.x)*180/Math.PI+90;if(e.shiftKey)a=Math.round(a/15)*15;s.updEl(dev,d.id,{rot:normRot(a)||undefined})}
else if(d.m==='rs'){const r=calcResize(d,d.dir??'',dx,dy,{shift:e.shiftKey,alt:e.altKey,line:d.t==='line',W,sx:v=>snapX(v,false),sy:v=>snap(v,false)});s.updEl(dev,d.id,r)}
else if(d.m==='box'){if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<3&&!d.w)return;d.w=1;const q=pt(e);const L=Math.min(d.x,q.x),T=Math.min(d.y,q.y),R=Math.max(d.x,q.x),B=Math.max(d.y,q.y);setMq({x:L,y:T,w:R-L,h:B-T});
const all=new Set<string>(d.base);for(const o of els){if(o.lk)continue;const oy=o.t==='line'?o.y-6:o.y,oh=o.t==='line'?12:o.h;if(o.x<R&&o.x+o.w>L&&oy<B&&oy+oh>T)grp(o.id,false).forEach(i=>all.add(i))}
const arr=[...all];if(arr.join()!==selIds.join())s.setMulti(arr)}
else if(d.m==='move'){let nx=snap(d.x+dx,raw),ny=snap(d.y+dy,raw);const g={v:[] as number[],h:[] as number[]};
if(!raw&&editB){const T=6/z,bh=editB.h[dev],o=editB.els[dev].filter(q=>!d.items?.some(i=>i.id===q.id));
const xs=[0,W/2,W,...gl.x,...(ui.cols?colEdges():[]),...(ui.smart?o.flatMap(q=>[q.x,q.x+q.w/2,q.x+q.w]):[])],ys=[0,bh/2,bh,...gl.y,...(ui.smart?o.flatMap(q=>[q.y,q.y+q.h/2,q.y+q.h]):[])];
const mx=[0,d.w/2,d.w],my=[0,d.h/2,d.h];const px=d.x+dx,py=d.y+dy;let bx=T,by=T;
for(const m of mx)for(const t of xs){const df=Math.abs(t-(px+m));if(df<bx){bx=df;nx=Math.round(t-m)}}
for(const m of my)for(const t of ys){const df=Math.abs(t-(py+m));if(df<by){by=df;ny=Math.round(t-m)}}
nx=Math.max(0,Math.min(W-d.w,nx));ny=Math.max(0,ny);
for(const m of mx)for(const t of xs)if(Math.abs(t-(nx+m))<.5&&!g.v.includes(t))g.v.push(t);
for(const m of my)for(const t of ys)if(Math.abs(t-(ny+m))<.5&&!g.h.includes(t))g.h.push(t)}
else{nx=Math.max(0,Math.min(W-d.w,nx));ny=Math.max(0,ny)}
setGd(g.v.length||g.h.length?g:null);const ddx=nx-d.x,ddy=ny-d.y;s.dragMany(dev,(d.items??[]).map(i=>({id:i.id,x:i.x+ddx,y:i.y+ddy})))}};
const create=(e:React.PointerEvent)=>{const p=pt(e),x=p.x,y=p.y;
if(editing&&tool!=='sel'){drag.current={id:'',m:'draw',t:tool,ex:arm,sx:e.clientX,sy:e.clientY,x:Math.max(0,snapX(x,e.altKey)),y:Math.max(0,snap(y,e.altKey)),w:0,h:0};wrap.current!.setPointerCapture(e.pointerId);return}
if(editing){drag.current={id:'',m:'box',sx:e.clientX,sy:e.clientY,x,y,w:0,h:0,base:e.shiftKey?selIds:[]};wrap.current!.setPointerCapture(e.pointerId);return}const i=y>=0&&y<total?vis.findIndex((_,k)=>y>=tops[k]&&y<tops[k]+vis[k].h[dev]):-1;s.setBlock(i>=0?vis[i].id:null)};
const press=(e:React.PointerEvent)=>{if(space.current||e.button===1){e.preventDefault();const st=stage();if(!st)return;panRef.current={sx:e.clientX,sy:e.clientY,l:st.scrollLeft,t:st.scrollTop};wrap.current!.setPointerCapture(e.pointerId);return}if(e.button!==0)return;create(e)};
const up=()=>{const d=drag.current;drag.current=null;panRef.current=null;setGd(null);setMq(null);if(!d)return;
if(d.m==='box'){if(!d.w&&!d.base?.length)s.setBlock(s.editId)}
else if(d.m==='move'){if((d.items?.length??0)<2)s.dropEl(dev,d.id,editing)}
else if(d.m==='draw'){const ln=d.t==='line';
if(!d.id)s.addEl(dev,d.t!,d.x,d.y,s.editId??undefined,d.t==='text'?{...d.ex,hug:'w'}:d.ex);
else s.updEl(dev,d.id,{w:Math.max(16,d.w),h:ln?0:Math.max(d.t==='text'?24:16,d.h),...(d.t==='text'?{hug:'h' as const}:{})});
pick('sel');if(d.t==='text'){const nid=d.id||useStore.getState().elId;if(nid)setTimeout(()=>setIed(nid),60)}}};
const downRot=(e:React.PointerEvent,el:El,top:number)=>{if(!editing||e.button!==0)return;e.stopPropagation();drag.current={id:el.id,m:'rot',sx:e.clientX,sy:e.clientY,x:el.x+el.w/2,y:top+(el.t==='line'?el.y:el.y+el.h/2),w:0,h:0};wrap.current!.setPointerCapture(e.pointerId)};
const hugEl=(e:El,k:string)=>{if(!(e.t==='text'||e.t==='btn'||e.t==='input')){toast('Размер по содержимому: текст, кнопка и поле');return}s.updEl(dev,e.id,{hug:e.t==='text'&&(k==='n'||k==='s')?'h':'w'})};
const dbl=()=>{if(!editing&&s.blockId)s.enterEdit(s.blockId)};
return<><div className="cvw"><div className="cv-head">{editing&&editB?`Блок ${all.indexOf(editB)+1} · ${editB.title}`:sh?.name} · {{desktop:'Desktop',tablet:'Tablet',mobile:'Mobile'}[dev]} · {W}{ing&&' · внутри группы, Esc: выйти'}</div>
{ui.rulers&&<div className="rl-top"><i className="rl-corner"/><Ruler z={z} len={W} range={rr?.x} onGuide={editing?e=>startGuide(e,'y'):undefined}/></div>}<div className="rl-body">{ui.rulers&&<Ruler vertical z={z} len={H} range={rr?.y} onGuide={editing?e=>startGuide(e,'x'):undefined}/>}<div className="cv" ref={wrap} style={{width:W*z,height:H*z,cursor:pan?'grab':editing&&tool!=='sel'?'crosshair':'default'}} onPointerDown={press} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={dbl}>
<div className={'cv-in '+(editing?'ed':'pg')} style={{width:W,height:H,transform:`scale(${z})`,'--z':z} as React.CSSProperties}>
{vis.map((b,i)=><div key={b.id} className={'band'+(i===selBi?' sel':'')} style={{top:tops[i],height:b.h[dev],...(b.bg?{background:b.bg}:{})}}><span>{all.indexOf(b)+1}. {b.title}{b.sv?.tab&&` · этап ${b.sv.i+1} из ${b.sv.n}`}</span>
{!editing&&<div className="bt" onPointerDown={stop}><button title="Настройки блока" onClick={()=>s.setBlock(b.id)}><Settings size={14}/></button><button className="ed" title="Редактировать блок (Enter)" onClick={()=>s.enterEdit(b.id)}><Pencil size={14}/><span>Редактировать</span></button><i className="sep"/>
<button title="Выше (Alt+↑)" onClick={()=>s.moveBlock(b.id,-1,dev)}><ArrowUp size={14}/></button><button title="Ниже (Alt+↓)" onClick={()=>s.moveBlock(b.id,1,dev)}><ArrowDown size={14}/></button><button title="Дублировать (Ctrl+D)" onClick={()=>s.dupBlock(b.id)}><Copy size={14}/></button><button className="dz" title="Удалить" onClick={()=>delBlock(b)}><Trash2 size={14}/></button></div>}</div>)}
{editing&&editB&&ui.cols&&(()=>{const c=colInfo();return<div className="cols" style={{height:editB.h[dev],padding:`0 ${c.mar}px`,gap:c.gut,gridTemplateColumns:`repeat(${c.n},1fr)`}}>{Array.from({length:c.n},(_,i)=><i key={i}/>)}</div>})()}
{flat.map(({e,top})=>{const on=selSet.has(e.id);return<div key={e.id} className={'el '+e.t+(on?' sel':'')+(e.acc?' acc':'')+((e.go||e.ln)?' lnk':'')+(ied===e.id?' ied-on':'')} style={elStyle(e,top,st)} onPointerDown={ev=>down(ev,e)} onDoubleClick={ev=>{if(!editing){const ob=vis.find(q=>q.els[dev].some(z=>z.id===e.id));if(ob&&INLINE.has(e.t)){ev.stopPropagation();s.enterEdit(ob.id);setTimeout(()=>startIed(e),30)}return}if(tool!=='sel')return;ev.stopPropagation();if(e.g&&ing!==e.g){setInG(e.g);s.setMulti([e.id]);return}if(INLINE.has(e.t))startIed(e);else document.getElementById('el-text')?.focus()}}>{ied===e.id?(e.t==='text'?<RichEdit e={e} st={st} onPatch={p=>s.updEl(dev,e.id,p)} onDone={t=>endIed(e.id,t)}/>:<InlineEdit text={e.text} single={e.t==='btn'||e.t==='input'} onText={t=>s.updEl(dev,e.id,{text:t,rt:undefined})} onDone={t=>endIed(e.id,t)}/>):elInner(e)}</div>})}
{!editing&&vis.slice(0,-1).map((b,i)=><div key={'i'+b.id} className="ins" style={{top:tops[i]+b.h[dev]}}><button className="insb" title="Добавить блок здесь" onPointerDown={stop} onClick={()=>onAdd(b.id)}><Plus size={16}/><span>Добавить блок</span></button></div>)}
{gd&&editB&&<>{gd.v.map(x=><i key={'v'+x} className="gd" style={{left:x,top:0,height:editB.h[dev],width:'calc(1px/var(--z,1))'}}/>)}{gd.h.map(y=><i key={'h'+y} className="gd" style={{top:y,left:0,width:W,height:'calc(1px/var(--z,1))'}}/>)}</>}
{editing&&editB&&ui.guides&&<>{(['x','y'] as const).flatMap(ax=>gl[ax].map((v,i)=>gdr&&gdr.ax===ax&&gdr.skip===i?null:<div key={ax+i} className={'guide '+(ax==='x'?'v':'h')} style={ax==='x'?{left:v,top:0,height:editB.h[dev]}:{top:v,left:0,width:W}} onPointerDown={ev=>startGuide(ev,ax,i)} onDoubleClick={ev=>{ev.stopPropagation();delGuide(ax,i)}} title="Потяни, чтобы двигать. Двойной клик или на линейку: удалить"><b>{v}</b></div>))}{gdr&&<div className={'guide live '+(gdr.ax==='x'?'v':'h')} style={gdr.ax==='x'?{left:gdr.pos,top:0,height:editB.h[dev]}:{top:gdr.pos,left:0,width:W}}><b>{gdr.pos}</b></div>}</>}
{sb&&<><div className="msel" style={{left:sb.x,top:sb.top+sb.y,width:sb.w,height:sb.h}}/><div className="dim" style={{left:sb.x+sb.w/2,top:sb.top+sb.y+sb.h+8}}>{selIds.length} эл. · {Math.round(sb.w)} × {Math.round(sb.h)}</div></>}
{mq&&<div className="mq" style={{left:mq.x,top:mq.y,width:mq.w,height:mq.h}}/>}
{meas.map((m,i)=><div key={'ms'+i}><i className={'ds '+(m.vt?'v':'h')} style={{left:m.x,top:(sel?.top??sb?.top??0)+m.y,width:m.vt?undefined:m.w,height:m.vt?m.h:undefined}}/><span className="dsl" style={{left:m.vt?m.x:m.x+m.w/2,top:(sel?.top??sb?.top??0)+(m.vt?m.y+m.h/2:m.y)}}>{Math.round(m.v)}</span></div>)}
{lbs.map(l=>{const tp=sel?.top??sb?.top??0;return<div key={'lb'+l.g}><div className="lbox" style={{left:l.x-6,top:tp+l.y-6,width:l.w+12,height:l.h+12}}><span>{l.c.d==='v'?'↓':'→'} {l.c.gap}</span></div>{l.gp.map((r,i)=><div key={i} className="lgap" style={{left:r.x,top:tp+r.y,width:r.w,height:r.h}}/>)}</div>})}
{ing&&(()=>{const a=flat.filter(f=>f.e.g===ing);if(!a.length)return null;const x=Math.min(...a.map(f=>f.e.x)),y=Math.min(...a.map(f=>f.top+f.e.y)),r=Math.max(...a.map(f=>f.e.x+f.e.w)),bt=Math.max(...a.map(f=>f.top+f.e.y+(f.e.t==='line'?0:f.e.h)));return<div className="gbox" style={{left:x-6,top:y-6,width:r-x+12,height:bt-y+12}}/>})()}
{sel&&tool==='sel'&&ied!==sel.e.id&&<div className="selbox" style={{left:sel.e.x,top:sel.top+(sel.e.t==='line'?sel.e.y-6:sel.e.y),width:sel.e.w,height:sel.e.t==='line'?12:sel.e.h,transform:sel.e.rot?`rotate(${sel.e.rot}deg)`:undefined}}><u className="rot-h" title="Потяни, чтобы повернуть. Shift: шаг 15°" onPointerDown={ev=>downRot(ev,sel.e,sel.top)}/>{(sel.e.t==='line'?['w','e']:['nw','n','ne','e','se','s','sw','w']).map(k=><u key={k} className={'rz '+k} onPointerDown={ev=>downR(ev,sel.e,k)} onDoubleClick={ev=>{ev.stopPropagation();hugEl(sel.e,k)}}/>)}</div>}
{selB&&<><div className="bhs" style={{top:tops[selBi]+selB.h[dev]}} onPointerDown={ev=>downB(ev,selB)} onDoubleClick={ev=>{ev.stopPropagation();s.setH(dev,selB.id,Math.max(96,Math.ceil(Math.max(0,...selB.els[dev].map(q=>q.y+q.h))/8)*8+48))}} title="Потяни, чтобы изменить высоту. Двойной клик: по содержимому"/><div className="bh" style={{left:W/2,top:tops[selBi]+selB.h[dev]}} onPointerDown={ev=>downB(ev,selB)} onDoubleClick={ev=>{ev.stopPropagation();s.setH(dev,selB.id,Math.max(96,Math.ceil(Math.max(0,...selB.els[dev].map(q=>q.y+q.h))/8)*8+48))}} title="Потяни, чтобы изменить высоту. Двойной клик: по содержимому"/><div className="dim" style={{left:W/2,top:tops[selBi]+selB.h[dev]+22}}>{W} × {selB.h[dev]}</div></>}
{sel&&<div className="dim" style={{left:sel.e.x+sel.e.w/2,top:sel.top+sel.e.y+(sel.e.t==='line'?6:sel.e.h)+8}}>{Math.round(sel.e.w)}{sel.e.t==='line'?'':` × ${Math.round(sel.e.h)}`}</div>}
{!vis.length&&<div className="cv-empty">{raw.length?`На устройстве «${DEVN[dev]}» пока нет блоков. Добавь новый или скопируй с другого устройства`:'Страница пустая. Нажми «Добавить блок»: с нуля или из библиотеки'}</div>}
{!vis.length&&!editing&&raw.length>0&&(()=>{const from=DEVS.find(d=>d!==dev&&raw.some(b=>onDev(b,d)));return from?<button className="addblk adapt" style={{left:W/2,top:230}} onPointerDown={stop} onClick={()=>{s.adaptSheet(dev,from);toast(`Блоки скопированы с ${DEVN[from]}. Подгони их под ${DEVN[dev]}`,{label:'Отменить',run:()=>s.undo()},6000)}}><DevIcon d={from} size={16}/>Скопировать все блоки: {DEVN[from]}</button>:null})()}
{!editing&&<button className="addblk" style={{left:W/2,top:vis.length?total+(selB&&selBi===vis.length-1?64:28):180}} onPointerDown={stop} onClick={()=>onAdd(vis.length?vis[vis.length-1].id:undefined)}><Plus size={16}/>Добавить блок (A)</button>}
</div></div></div></div>
{vm&&<ViewMenu onClose={()=>setVm(false)}/>}
{editing&&ins&&<InsertPanel onPick={place} onClose={()=>setIns(false)}/>}
{editing&&tool!=='sel'&&<div className="armhint">{tool==='line'?'Потяни, чтобы провести линию':'Потяни на холсте, чтобы нарисовать'} · клик — размер по умолчанию · Shift — пропорции · Alt — без сетки · Esc — отмена</div>}
<div className="tools">{editing&&<>{TOOLS.map(([k,l,I])=><button key={k} data-k={HK[k]} className={tool===k?'on':''} title={`${l} (${HK[k]})`} onClick={()=>pick(k)}><I size={18}/></button>)}<button data-k="F" className={tool==='rect'&&arm.nm==='Фрейм'?'on':''} title="Фрейм (F). Выдели элементы и нажми Ctrl+Alt+G, чтобы собрать их во фрейм" onClick={()=>pick('rect',FRAME)}><FrameI size={18}/></button><button data-k="E" className={ins||['shape','icon','mock','list'].includes(tool)?'on':''} title="Элементы: фигуры, иконки, мокапы (E)" onClick={()=>setIns(v=>!v)}><Shapes size={18}/></button><i className="vr"/></>}
<button title="Уменьшить (−)" onClick={()=>setZ(clampZ(z-.1))}><Minus size={16}/></button><button className="zv" title="100% (Shift+0)" onClick={()=>setZ(1)}>{Math.round(z*100)}%</button><button title="Увеличить (+)" onClick={()=>setZ(clampZ(z+.1))}><Plus size={16}/></button><button title="Вписать (Shift+1)" onClick={fit}><Maximize size={16}/></button><i className="vr"/><button className={vm?'on':''} title="Вид: линейки, сетка, направляющие, колонки" onClick={()=>setVm(v=>!v)}><Eye size={18}/></button></div></>}

/** этапы: число 3–7 и доп. блок в этап */
function StepsSec({b}:{b:Block}){const s=useStore();const sv=b.sv!;
return<div className="sec dvsec"><h4>Этапов: {sv.n}</h4><div className="dvs">{[3,4,5,6,7].map(k=><button key={k} className={'dvc'+(sv.n===k?' on':'')} aria-pressed={sv.n===k} onClick={()=>s.setSteps(b.id,k)}>{k}</button>)}</div>
{sv.tab&&<button className="btn" onClick={()=>s.addStepBlock(b.id)}><Plus size={16}/>Добавить блок в этот этап</button>}
{sv.tab&&<div className="dvs"><button className="btn" disabled={sv.n>=7} onClick={()=>s.dupBlock(b.id)}><Copy size={16}/>Копия этапа</button><button className="btn" disabled={sv.n<=3} onClick={()=>s.delStage(b.id)}><Trash2 size={16}/>Удалить этап</button></div>}
<p className="hint">{sv.tab?'Названия вкладок правь в любом этапе, остальные подтянутся. Вкладка растёт по тексту. Лишние вкладки удаляются вместе с содержимым (Ctrl+Z вернёт)':'Блок пересоберётся: тексты сохранятся, положение элементов вернётся к шаблону (Ctrl+Z вернёт)'}</p></div>}
/** привязка любого блока к вкладке: виден только когда выбран этап */
function StageSec({b}:{b:Block}){const s=useStore();const sh=s.data?.projects.find(p=>p.id===s.projectId)?.sheets.find(x=>x.id===s.sheetId);
const g=sh?stageGroup(sh.blocks,b):null;if(!g)return null;const cur=b.sv?b.sv.i:-1;
return<div className="sec dvsec"><h4>Показывать в этапе</h4><div className="dvs"><button className={'dvc'+(cur<0?' on':'')} onClick={()=>s.setStage(b.id,null)}>Всегда</button>{Array.from({length:g.n},(_,k)=><button key={k} className={'dvc'+(cur===k?' on':'')} aria-pressed={cur===k} onClick={()=>s.setStage(b.id,k)}>{k+1}</button>)}</div>
<p className="hint">Блок виден только когда в просмотре выбран этот этап</p></div>}
/** счётчик сотрудников 3–8 в блоках «Команда» */
function TeamSec({b}:{b:Block}){const s=useStore();const n=b.tm??teamN(b.title)??5;
return<div className="sec dvsec"><h4>Сотрудников: {n}</h4><div className="dvs">{[3,4,5,6,7,8].map(k=><button key={k} className={'dvc'+(n===k?' on':'')} aria-pressed={n===k} onClick={()=>s.setTeam(b.id,k)}>{k}</button>)}</div>
<p className="hint">Блок пересоберётся под нужное число, цифра в заголовке изменится вместе с ним. Правки внутри блока сбросятся (Ctrl+Z вернёт)</p></div>}
/** оформление блока: фон, отступы сверху и снизу, выравнивание содержимого (для выбранного устройства) */
function BlockLook({b,dev,st}:{b:Block;dev:Dev;st?:{palette:string[]}}){const s=useStore();const es=b.els[dev];if(!es.length)return null;
const top=Math.round(Math.min(...es.map(e=>e.y))),bot=Math.round(b.h[dev]-Math.max(...es.map(e=>e.y+(e.t==='line'?0:e.h))));
const pad=(v:number)=>s.padBlock(b.id,dev,v,v);
const AL=[['l','Слева',AlignLeft],['c','Центр',AlignCenter],['r','Справа',AlignRight]] as const;
return<div className="sec"><h4>Оформление блока · {DEVN[dev]}</h4>
<Color label="Фон блока" value={b.bg} def="#FFFFFF" pal={['#F8FAFC','#F1F5F9','#E2E8F0','#EAF0FF',...(st?.palette??[]).filter(c=>/^#[0-9a-f]{6}$/i.test(c)).slice(0,2)]} none onChange={v=>s.editBlock(b.id,{bg:!v||v==='none'?undefined:v})}/>
<div className="grid2"><label className="num"><span>Сверху</span><input type="number" min={0} value={top} onChange={ev=>s.padBlock(b.id,dev,+ev.target.value||0,undefined)}/></label><label className="num"><span>Снизу</span><input type="number" min={24} value={bot} onChange={ev=>s.padBlock(b.id,dev,undefined,+ev.target.value||0)}/></label></div>
<div className="btnrow">{[24,48,64].map(v=><button key={v} className="btn" title={`Отступ ${v} px сверху и снизу`} onClick={()=>pad(v)}>{v} px</button>)}</div>
<div className="btnrow">{AL.map(([k,l,I])=><button key={k} className="btn" title={`Сдвинуть всё содержимое: ${l.toLowerCase()}, с полем по сетке`} onClick={()=>s.alignBlock(b.id,dev,k)}><I size={15}/>{l}</button>)}</div>
<p className="hint">Отступы и выравнивание двигают всё содержимое блока целиком, расстояния между элементами не меняются. Фон виден в просмотре и в брифе для нейросети</p></div>}
function BlockPanel({dev,b,idx,editing,onTpl}:{dev:Dev;b:Block;idx:number;editing:boolean;onTpl:()=>void}){
const s=useStore();const [qz,setQz]=useState(false);const tips=TIPS[b.title]??[];const els=b.els[dev];const lsel=curSel(s.multi,s.elId);
const del=()=>requestDelBlock(b,dev);
const pr=s.data?.projects.find(p=>p.id===s.projectId);const tchk=checkBlock(b,dev,pr?.style);
const copyAi=async()=>{if(!pr)return;const txt=blockMd(pr,b);try{await navigator.clipboard.writeText(txt);toast('Описание блока скопировано. Вставь его в чат с нейросетью')}catch{download('block.md',txt,'text/markdown');toast('Буфер недоступен, описание скачано файлом')}};
const dlBlock=()=>{download('block_'+(b.title.trim().replace(/[^\p{L}\p{N}]+/gu,'_')||'blok')+'.json',blockFile(b),'application/json');toast('Блок скачан. Загрузить его можно в Настройках, раздел «Шаблоны блоков»')};
const devs=DEVS.filter(d=>onDev(b,d));
const toggleDev=(d:Dev)=>{if(onDev(b,d)){if(devs.length<2){toast('Блок должен остаться хотя бы на одном устройстве');return}s.setDevs(b.id,devs.filter(x=>x!==d));toast(`Блок скрыт на устройстве: ${DEVN[d]}`,{label:'Отменить',run:()=>s.undo()},5000);return}
const copy=!b.els[d].length&&b.els[dev].length>0;s.setDevs(b.id,[...devs,d],dev);toast(copy?`Блок добавлен на устройство: ${DEVN[d]}. Элементы скопированы с ${DEVN[dev]}, подгони их`:`Блок добавлен на устройство: ${DEVN[d]}`,{label:'Отменить',run:()=>s.undo()},5000)};
return<aside className="panel"><div className="stk"><div className="ph"><b>Блок {idx+1}</b><span>{editing?'Редактирование':'Настройки'}</span>{!editing&&<button className="btn ic" onClick={()=>s.setBlock(null)} aria-label="Закрыть"><X size={14}/></button>}</div><div className="sec dvsec"><h4>Показывать на</h4><div className="dvs">{DEVS.map(d=><button key={d} className={'dvc'+(onDev(b,d)?' on':'')+(d===dev?' cur':'')} aria-pressed={onDev(b,d)} title={onDev(b,d)?`Скрыть на устройстве: ${DEVN[d]}`:`Добавить на устройство: ${DEVN[d]}`} onClick={()=>toggleDev(d)}><DevIcon d={d} size={15}/>{DEVN[d]}</button>)}</div></div></div>
<div className="sec"><label className="fld"><span>Название</span><input className="inp" value={b.title} placeholder="Название блока" onChange={e=>s.editBlock(b.id,{title:e.target.value})}/></label>
<div className="grid2"><label className="num"><span>В</span><input type="number" value={b.h[dev]} onChange={e=>s.setH(dev,b.id,+e.target.value||0)}/></label><label className="num"><span>Ш</span><input type="number" value={FW[dev]} disabled/></label></div>
<BlockPad b={b} dev={dev}/>{b.sv&&!b.sv.x&&<StepsSec b={b}/>}{teamN(b.title)!==null&&!b.sv&&<TeamSec b={b}/>}{(!b.sv||b.sv.x)&&<StageSec b={b}/>}
{dev==='mobile'&&b.h.mobile>844&&<p className="warn">Блок выше экрана телефона (844 px). Правило: один блок = один экран</p>}
{!editing&&<button className="btn pri" onClick={()=>s.enterEdit(b.id)}><Pencil size={16}/>Редактировать блок</button>}</div>
<BlockLook b={b} dev={dev} st={pr?.style}/>

{b.quiz&&<div className="sec"><button className="btn pri" onClick={()=>setQz(true)}><Settings size={16}/>Настроить квиз</button><p className="hint">Вопросы, ответы, шкала, консультант, подарки, телефон и финал. Макет пересобирается сам. В просмотре (P) квиз проходится по кнопкам</p><button className="btn" title="Блок станет обычным: элементы правятся руками, настройки квиза пропадут" onClick={()=>{s.unlinkQuiz(b.id);toast('Блок отвязан от настроек квиза',{label:'Отменить',run:()=>s.undo()},5000)}}>Отвязать от настроек</button></div>}
{qz&&b.quiz&&<Suspense fallback={null}><QuizEditor b={b} onClose={()=>setQz(false)}/></Suspense>}
<label className="fld"><span>Задача текста</span><input className="inp" value={b.goal??''} placeholder="Зачем блок: что читатель должен сделать или понять" onChange={e=>s.editBlock(b.id,{goal:e.target.value})}/></label><label className="fld"><span>Статус в ТЗ</span><select className="inp" value={b.req??'must'} onChange={e=>s.editBlock(b.id,{req:e.target.value==='opt'?'opt':undefined})}><option value="must">Обязательно</option><option value="opt">Опционально: можно убрать</option></select></label>
{tchk.length>0&&<details className="fold2" open><summary>Проверка текста: {tchk.length}</summary><div className="stack">{tchk.map(({e,m})=><p key={e.id} className="warn"><b>«{e.text.replace(/\n/g,' ').slice(0,28)}»</b>: {m.join('; ')}</p>)}</div></details>}
<details className="fold2" open={!!b.text}><summary>Тексты и заметки</summary><textarea className="inp" placeholder="Тексты блока, пожелания дизайнеру, как работает: переходы, раскрытия, кнопки" value={b.text} onChange={e=>s.editBlock(b.id,{text:e.target.value})}/></details>
<details className="fold2"><summary>Передать нейросети</summary><div className="stack"><button className="btn" onClick={copyAi}><Copy size={15}/>Скопировать описание</button><button className="btn" onClick={dlBlock}><Download size={15}/>Скачать блок (JSON)</button></div><p className="hint">Описание: тексты, заметки и элементы с координатами для каждого устройства. JSON загружается в Настройках как шаблон</p></details>
{tips.length>0&&<details className="fold2"><summary>Из твоих конспектов</summary><ul className="tipl">{tips.map(t=><li key={t}>{t}</li>)}</ul></details>}
{editing&&els.length>0&&<div className="sec"><h4>Слои блока · {els.length}</h4><VList items={[...els].reverse()} row={x=><button className={'lyr'+(lsel.includes(x.id)?' on':'')+(x.hid?' off':'')} title={NAME[x.t]+(x.text?' · '+x.text:'')+' (Shift: диапазон, Ctrl: добавить или убрать)'} onClick={e=>s.setMulti(pickIds(els,lsel,s.elId,x.id,modsOf(e)))}>{(()=>{const I=LI[x.t]??Shapes;return<I size={14}/>})()}<b>{NAME[x.t]}</b>{x.text&&<em>{x.text}</em>}{hasAnyLink(x)&&<Link2 size={12} aria-label="Есть ссылка"/>}<LayerBtns dev={dev} els={[x]}/></button>}/></div>}
{editing&&((b.guides?.[dev]?.x.length??0)+(b.guides?.[dev]?.y.length??0))>0&&<div className="sec"><h4>Направляющие · {(b.guides?.[dev]?.x.length??0)+(b.guides?.[dev]?.y.length??0)}</h4><button className="btn" onClick={()=>s.setGuides(b.id,dev,{x:[],y:[]})}><X size={14}/>Очистить направляющие</button></div>}
{!editing&&<div className="sec"><h4>Положение</h4><div className="btnrow"><button className="btn" title="Блок выше (Alt+↑)" onClick={()=>s.moveBlock(b.id,-1,dev)}><ArrowUp size={16}/>Выше</button><button className="btn" title="Блок ниже (Alt+↓)" onClick={()=>s.moveBlock(b.id,1,dev)}><ArrowDown size={16}/>Ниже</button></div></div>}
{!editing&&els.length>0&&<div className="sec"><h4>Отразить блок</h4><div className="btnrow"><button className="btn" title="Левая часть уезжает вправо, правая влево, на всех устройствах" onClick={()=>{s.flipBlock(b.id,'x');toast('Блок отражён по горизонтали',{label:'Отменить',run:()=>s.undo()},5000)}}><FlipHorizontal size={16}/>Слева направо</button><button className="btn" title="Верх и низ блока меняются местами, на всех устройствах" onClick={()=>{s.flipBlock(b.id,'y');toast('Блок отражён по вертикали',{label:'Отменить',run:()=>s.undo()},5000)}}><FlipVertical size={16}/>Сверху вниз</button></div><p className="hint">Тексты и сетка подстраиваются. Для части блока выдели элементы и нажми Shift+H или Shift+V</p></div>}
<div className="sec"><button className="btn" onClick={onTpl}><LayoutTemplate size={16}/>Сохранить как шаблон</button>
{!editing&&<div className="btnrow"><button className="btn" title="Дублировать (Ctrl+D)" onClick={()=>s.dupBlock(b.id)}><Copy size={16}/>Дублировать</button><button className="btn danger" title="Удалить (Delete)" onClick={del}><Trash2 size={16}/>Удалить</button></div>}</div></aside>}

export function RightPanel({dev,onTpl}:{dev:Dev;onTpl:()=>void}){
const {s,sh,st}=useSheet();const blocks=(sh?.blocks??[]).filter(b=>onDev(b,dev)||b.id===s.editId);const editing=!!s.editId;
const ms=editing&&s.multi.includes(s.elId??'')?s.multi.filter(id=>blocks.some(b=>(b.els?.[dev]??[]).some(e=>e.id===id))):[];
if(ms.length>1)return<MultiPanel dev={dev} ids={ms}/>;
const f=editing?blocks.flatMap(b=>(b.els?.[dev]??[]).map(e=>({e,b}))).find(x=>x.e.id===s.elId):undefined;
if(f&&st)return<ElPanel key={f.e.id} dev={dev} e={f.e} b={f.b} st={st}/>;
const bi=blocks.findIndex(x=>x.id===s.blockId);
if(bi>=0)return<BlockPanel dev={dev} b={blocks[bi]} idx={bi} editing={editing} onTpl={onTpl}/>;
return<aside className="panel idle"><div className="ph"><b>Страница</b><span>{blocks.length} блоков</span></div>{blocks.map((b,i)=><button key={b.id} className="row sm" onClick={()=>s.setBlock(b.id)}><b className="no">{i+1}</b><span>{b.title}</span></button>)}
<p className="hint">Наведи на блок: появится панель (редактировать, порядок, копия, удаление). Клик выбирает блок и открывает его настройки. «Редактировать» или Enter открывает блок для рисования. Между блоками появляется «+». A добавляет блок. Все клавиши открывает «?»</p>{st&&<StylePanel st={st}/>}</aside>}
