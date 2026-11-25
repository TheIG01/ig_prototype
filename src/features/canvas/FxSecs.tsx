import {FlipHorizontal,FlipVertical,RotateCw} from 'lucide-react';
import {useStore} from '../../store';
import type {El,Dev} from '../../store';
import {normRot} from '../../lib/elFx';
import {Color,Range,Sec} from './ElPanel';
type SetFn=(p:Partial<El>)=>void;
const BOX=new Set<string>(['btn','rect','input','img']);
const HEX6=/^#[0-9a-f]{6}/i;
/** Поворот и отражение одного элемента */
export function RotSec({e,set}:{e:El;set:SetFn}){
return<Sec t="Поворот и отражение"><div className="grid2"><label className="num"><span>Угол</span><input type="number" min={0} max={359} value={e.rot??0} onChange={ev=>{const v=normRot(+ev.target.value||0);set({rot:v||undefined})}}/></label>
<button className="btn" title="Повернуть на 90° по часовой" onClick={()=>set({rot:normRot((e.rot??0)+90)||undefined})}><RotateCw size={15}/>+90°</button></div>
<div className="btnrow"><button className={'btn'+(e.flipX?' on':'')} title="Отразить слева направо (Shift+H)" onClick={()=>set({flipX:e.flipX?undefined:1})}><FlipHorizontal size={15}/>Слева направо</button>
<button className={'btn'+(e.flipY?' on':'')} title="Отразить сверху вниз (Shift+V)" onClick={()=>set({flipY:e.flipY?undefined:1})}><FlipVertical size={15}/>Сверху вниз</button></div>
{(e.rot||e.flipX||e.flipY)&&<button className="btn" onClick={()=>set({rot:undefined,flipX:undefined,flipY:undefined})}>Сбросить поворот и отражение</button>}</Sec>}
/** Скругление: одно число или по каждому углу */
export function CornersRow({e,def,set}:{e:El;def:number;set:SetFn}){
if(!BOX.has(e.t))return null;
const r=e.r??def;const rc=e.rc;
const names=['Лев. верх','Прав. верх','Прав. низ','Лев. низ'];
return<div className="corners"><button className={'btn'+(rc?' on':'')} title="Задать радиус каждому углу отдельно" onClick={()=>set(rc?{rc:undefined,r:rc[0]}:{rc:[r,r,r,r]})}>По углам</button>
{rc&&<div className="grid2">{rc.map((v,i)=><label key={i} className="num" title={names[i]}><span>{['↖','↗','↘','↙'][i]}</span><input type="number" min={0} max={200} value={v} onChange={ev=>{const n=rc.slice() as [number,number,number,number];n[i]=Math.max(0,+ev.target.value||0);set({rc:n})}}/></label>)}</div>}</div>}
/** Обводка: цвет, толщина, вид линии, положение */
export function StrokeSec({e,pal,set}:{e:El;pal:string[];set:SetFn}){
const t=e.t;const box=BOX.has(t)||t==='line'||t==='shape';const dash=e.dash??'solid';
return<Sec t="Обводка"><Color label="Цвет" value={e.stroke} def="#0F172A" pal={pal} none onChange={v=>set({stroke:v})}/>
<Range label="Толщина" value={e.sw??(t==='mock'||t==='line'||(t==='shape'&&['arr1','arr2','elbow','arc'].includes(e.sh??''))?2:1.5)} min={t==='line'||(t==='shape'&&(e.sh??'').startsWith('arr'))?1:0} max={12} step={.5} unit=" px" onChange={v=>set({sw:v})}/>
{box&&<><div className="seg" title="Вид линии обводки">{([['solid','Сплошная'],['dashed','Пунктир'],['dotted','Точки']] as const).map(([k,l])=><button key={k} className={dash===k?'on':''} onClick={()=>set({dash:k==='solid'?undefined:k,...(k!=='solid'?{sp:undefined}:{})})}>{l}</button>)}</div>
{dash==='solid'&&BOX.has(t)&&<div className="seg" title="Где проходит обводка относительно края">{([['in','Внутри'],['mid','По центру'],['out','Снаружи']] as const).map(([k,l])=><button key={k} className={(e.sp??'in')===k?'on':''} onClick={()=>set({sp:k==='in'?undefined:k})}>{l}</button>)}</div>}</>}</Sec>}
/** Эффекты: тень и размытие */
export function FxSec({e,set}:{e:El;set:SetFn}){
const sd=e.shadow;const hex=sd&&HEX6.test(sd.c)?sd.c.slice(0,7):'#0F172A';const al=sd&&sd.c.length>=9?Math.round(parseInt(sd.c.slice(7,9),16)/2.55):sd?100:18;
const col=(h:string,a:number)=>h+Math.round(a*2.55).toString(16).padStart(2,'0');
const put=(p:Partial<NonNullable<El['shadow']>>)=>set({shadow:{x:0,y:4,b:12,c:col('#0F172A',18),...sd,...p}});
return<Sec t="Эффекты"><div className="btnrow"><button className={'btn'+(sd?' on':'')} onClick={()=>set({shadow:sd?undefined:{x:0,y:4,b:12,c:col('#0F172A',18)}})}>Тень</button>
<button className={'btn'+(e.blur?' on':'')} onClick={()=>set({blur:e.blur?undefined:4})}>Размытие</button></div>
{sd&&<><Range label="Сдвиг по X" value={sd.x} min={-40} max={40} unit=" px" onChange={v=>put({x:v})}/><Range label="Сдвиг по Y" value={sd.y} min={-40} max={40} unit=" px" onChange={v=>put({y:v})}/><Range label="Размытие тени" value={sd.b} min={0} max={60} unit=" px" onChange={v=>put({b:v})}/>
<Color label="Цвет тени" value={hex} def="#0F172A" pal={['#0F172A','#2F6BFF','#000000']} onChange={v=>put({c:col(v&&HEX6.test(v)?v:'#0F172A',al)})}/>
<Range label="Сила тени" value={al} min={5} max={100} unit="%" onChange={v=>put({c:col(hex,v)})}/></>}
{e.blur!==undefined&&e.blur>0&&<Range label="Размытие элемента" value={e.blur} min={1} max={40} unit=" px" onChange={v=>set({blur:v})}/>}</Sec>}
/** Цвета выделения: все цвета выбранных элементов, замена сразу везде */
export function SelColors({dev,ids}:{dev:Dev;ids:string[]}){
const s=useStore();const sh=s.data?.projects.find(p=>p.id===s.projectId)?.sheets.find(x=>x.id===s.sheetId);
const els=(sh?.blocks??[]).flatMap(b=>b.els[dev]).filter(e=>ids.includes(e.id));
const cs=[...new Set(els.flatMap(e=>[e.fill,e.stroke,e.c]).filter((c):c is string=>!!c&&HEX6.test(c)).map(c=>c.slice(0,7).toLowerCase()))];
if(!cs.length)return null;
return<Sec t="Цвета выделения"><div className="cs-row">{cs.map((c,i)=><label key={i} className="cs pick big" style={{background:c}} title={'Заменить '+c+' везде в выделении'}><input type="color" value={c} onChange={ev=>s.recolor(dev,ids,c,ev.target.value)}/></label>)}</div><p className="hint">Нажми на цвет, чтобы заменить его во всех выбранных элементах</p></Sec>}
/** Наведение: цвет кнопки под курсором в просмотре и HTML (пусто = стандартный подъём и подсветка) */
export function HoverSec({e,pal,set}:{e:El;pal:string[];set:SetFn}){
const h=e.hv;const put=(p:Partial<NonNullable<El['hv']>>)=>{const n={...h,...p};for(const k of Object.keys(n) as (keyof typeof n)[])if(!n[k])delete n[k];set({hv:Object.keys(n).length?n:undefined})};
return<Sec t="Наведение"><Color label="Заливка" value={h?.fill} def="#1E293B" pal={pal} onChange={v=>put({fill:v})}/>
<Color label="Цвет текста" value={h?.c} def="#FFFFFF" pal={pal} onChange={v=>put({c:v})}/>
<Color label="Обводка" value={h?.stroke} def="#2F6BFF" pal={pal} onChange={v=>put({stroke:v})}/>
{h&&<button className="btn" onClick={()=>set({hv:undefined})}>Сбросить наведение</button>}</Sec>}
