import {AlignStartVertical,AlignCenterVertical,AlignEndVertical,AlignStartHorizontal,AlignCenterHorizontal,AlignEndHorizontal,AlignHorizontalSpaceBetween,AlignVerticalSpaceBetween,Group,Ungroup,Copy,Trash2,X,ArrowLeftRight,ArrowUpDown,FlipHorizontal,FlipVertical,Replace,Bold,AlignLeft,AlignCenter,AlignRight} from 'lucide-react';
import {useStore} from '../../store';import {useLive} from '../../lib/live';import {VList} from './VList';
import type {Dev,El} from '../../store';import {Color} from './ElPanel';
import {uid} from '../../lib/uid';
import {NAME_NEW} from '../../lib/art';import {LayPanel} from './LayPanel';
const NM:Record<string,string>={text:'Текст',rect:'Прямоугольник',btn:'Кнопка',input:'Поле ввода',img:'Изображение',line:'Линия',...NAME_NEW};
type M='l'|'c'|'r'|'t'|'m'|'b'|'dh'|'dv';
const AL:[M,string,typeof AlignStartVertical][]=[['l','Влево (Alt+A)',AlignStartVertical],['c','По центру горизонтально (Alt+H)',AlignCenterVertical],['r','Вправо (Alt+D)',AlignEndVertical],['t','Вверх (Alt+W)',AlignStartHorizontal],['m','По центру вертикально (Alt+V)',AlignCenterHorizontal],['b','Вниз (Alt+S)',AlignEndHorizontal]];
/** ползунок для общих свойств */
function Rng({label,value,min,max,unit,onChange}:{label:string;value:number;min:number;max:number;unit:string;onChange:(v:number)=>void}){
const [v,setV]=useLive(value,onChange);
return<label className="rng"><span>{label}</span><input type="range" min={min} max={max} value={v} onChange={ev=>setV(+ev.target.value)}/><output>{v}{unit}</output></label>}
const TX=new Set(['text','btn','input']),BX=new Set(['rect','btn','input','img','shape']),SZ=[12,13,14,16,18,20,24,32,40,48,56,72];
/** right panel for several selected elements: shared properties, align, distribute, group, copy, delete */
export function MultiPanel({dev,ids}:{dev:Dev;ids:string[]}){
const s=useStore();const sh=s.data?.projects.find(p=>p.id===s.projectId)?.sheets.find(x=>x.id===s.sheetId);
const els=(sh?.blocks??[]).flatMap(b=>b.els[dev]).filter(e=>ids.includes(e.id));const grouped=els.some(e=>e.g);const pal=s.data?.projects.find(p=>p.id===s.projectId)?.style.palette??[];const tx=els.filter(e=>TX.has(e.t)).map(e=>e.id),bx=els.filter(e=>BX.has(e.t)).map(e=>e.id),al=els.map(e=>e.id);
const same=<K extends keyof El>(k:K,ids:string[]):El[K]|undefined=>{const v=els.filter(e=>ids.includes(e.id)).map(e=>e[k]);return v.every(x=>x===v[0])?v[0]:undefined};const allB=tx.length>0&&tx.every(i=>els.find(e=>e.id===i)?.b);
const units=new Set(els.map(e=>e.g??e.id));const pair=units.size===2?[...units].map(u=>els.filter(e=>(e.g??e.id)===u).map(e=>e.id)):null;
return<aside className="panel"><div className="ph"><b>Выбрано {ids.length}</b><span>Несколько элементов</span><button className="btn ic" onClick={()=>s.setMulti([])} aria-label="Снять выделение"><X size={14}/></button></div>
<div className="sec"><h4>Общие свойства</h4>
{tx.length>0&&<><div className="btnrow fmt"><select className="inp" value={same('fs',tx)??''} onChange={ev=>ev.target.value&&s.patchEls(dev,tx,{fs:+ev.target.value})}><option value="" disabled>Размер: разный</option>{SZ.map(n=><option key={n} value={n}>{n} px</option>)}</select><button className={'btn ic'+(allB?' on':'')} title="Жирный" onClick={()=>s.patchEls(dev,tx,{b:allB?undefined:true})}><Bold size={16}/></button>{([['l',AlignLeft],['c',AlignCenter],['r',AlignRight]] as const).map(([k,I])=><button key={k} className={'btn ic'+(same('al',tx)===k?' on':'')} title={{l:'По левому краю',c:'По центру',r:'По правому краю'}[k]} onClick={()=>s.patchEls(dev,tx,{al:k})}><I size={16}/></button>)}</div>
<Color label="Цвет текста" value={same('c',tx)} def="#0F172A" pal={pal} onChange={v=>s.patchEls(dev,tx,{c:v})}/></>}
{bx.length>0&&<><Color label="Заливка" value={same('fill',bx)} def="#FFFFFF" pal={pal} none onChange={v=>s.patchEls(dev,bx,{fill:v})}/><Rng label="Скругление" value={same('r',bx)??0} min={0} max={80} unit=" px" onChange={v=>s.patchEls(dev,bx,{r:v})}/></>}
<Rng label="Прозрачность" value={Math.round((same('op',al)??1)*100)} min={5} max={100} unit="%" onChange={v=>s.patchEls(dev,al,{op:v>=100?undefined:v/100})}/>
<p className="hint">Изменения применяются ко всем выбранным элементам. Если значения разные, поле показывает «разный»</p></div>
<div className="sec"><h4>Выравнивание</h4><div className="algrid">{AL.map(([m,t,I])=><button key={m} className="btn ic" title={t} onClick={()=>s.alignEls(dev,ids,m)}><I size={16}/></button>)}</div>
<div className="btnrow"><button className="btn" disabled={ids.length<3} title="Равные промежутки по горизонтали (Ctrl+Alt+Shift+H)" onClick={()=>s.alignEls(dev,ids,'dh')}><AlignHorizontalSpaceBetween size={16}/>По горизонтали</button><button className="btn" disabled={ids.length<3} title="Равные промежутки по вертикали (Ctrl+Alt+Shift+V)" onClick={()=>s.alignEls(dev,ids,'dv')}><AlignVerticalSpaceBetween size={16}/>По вертикали</button></div></div>
<div className="sec"><h4>Размер и отступ</h4><div className="btnrow"><button className="btn" title="Все выбранные получают ширину самого широкого" onClick={()=>s.alignEls(dev,ids,'ew')}><ArrowLeftRight size={16}/>Равная ширина</button><button className="btn" title="Все выбранные получают высоту самого высокого" onClick={()=>s.alignEls(dev,ids,'eh')}><ArrowUpDown size={16}/>Равная высота</button></div>
<div className="btnrow">{[4,8,12,16,24,32,48,64].map(n=><button key={n} className="btn" title={'Одинаковый отступ '+n+' px между выбранными'} onClick={()=>s.gapEls(dev,ids,n)}>{n}</button>)}</div>
<p className="hint">Цифры это отступ между элементами по шкале 4, 8, 12, 16, 24, 32, 48, 64</p></div>
<div className="sec"><h4>Группа</h4><div className="btnrow"><button className="btn" title="Сгруппировать (Ctrl+G)" onClick={()=>s.groupEls(dev,ids,true)}><Group size={16}/>Сгруппировать</button><button className="btn" disabled={!grouped} title="Разгруппировать (Ctrl+Shift+G)" onClick={()=>s.groupEls(dev,ids,false)}><Ungroup size={16}/>Разгруппировать</button></div>
<p className="hint">Группа двигается и выделяется целиком. Двойной клик входит в группу, Esc выходит. Ctrl+клик добавляет или убирает один элемент</p></div>
<div className="sec"><h4>Отражение и порядок</h4><div className="btnrow"><button className="btn" title="Отразить выбранное слева направо (Shift+H)" onClick={()=>s.flipEls(dev,ids,'x')}><FlipHorizontal size={16}/>Слева направо</button><button className="btn" title="Отразить выбранное сверху вниз (Shift+V)" onClick={()=>s.flipEls(dev,ids,'y')}><FlipVertical size={16}/>Сверху вниз</button></div>
<div className="btnrow"><button className="btn" title="Перенести выбранное на противоположную сторону блока (Ctrl+Shift+←/→)" onClick={()=>s.flipEls(dev,ids,'x',true)}><ArrowLeftRight size={16}/>Другая сторона</button><button className="btn" disabled={!pair} title="Две группы или два элемента меняются местами" onClick={()=>pair&&s.swapEls(dev,pair[0],pair[1])}><Replace size={16}/>Поменять местами</button></div>
<p className="hint">Группа отражается целиком, текст меняет выравнивание. «Поменять местами» работает для двух выбранных групп или элементов</p></div>
<LayPanel dev={dev} ids={ids}/>
<div className="sec"><div className="btnrow"><button className="btn" title="Дублировать (Ctrl+D)" onClick={()=>s.dupEls(dev,ids,16,ids.map(()=>uid()))}><Copy size={16}/>Дублировать</button><button className="btn danger" title="Удалить (Delete)" onClick={()=>s.delEls(dev,ids)}><Trash2 size={16}/>Удалить</button></div></div>
<div className="sec"><h4>Слои выделения</h4><VList items={[...els].reverse()} row={x=><button className="row sm" title="Ctrl: убрать из выделения" onClick={e=>s.setMulti(e.ctrlKey||e.metaKey?ids.filter(i=>i!==x.id):[x.id])}><span>{NM[x.t]}{x.text?` · ${x.text.slice(0,24)}`:''}{x.g?' · группа':''}</span></button>}/></div></aside>}
