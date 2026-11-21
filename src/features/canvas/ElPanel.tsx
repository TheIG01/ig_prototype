import {useMemo,useState} from 'react';
import {X,ChevronDown,Bold,AlignLeft,AlignCenter,AlignRight,ArrowUp,ArrowDown,Copy,Trash2,Smartphone,LayoutTemplate,Search} from 'lucide-react';
import {useStore,FW} from '../../store';
import type {El,Dev,Block} from '../../store';
import {SHAPES,MOCKS,BULLETS,ROLES,FONTS,NAME_NEW,resolve} from '../../lib/art';
import type {PStyle,Role} from '../../lib/art';
import {ICON_LIST} from '../../lib/icons';
import {Prev} from './Insert';import {LayPanel} from './LayPanel';

const NM:Record<string,string>={text:'Текст',rect:'Прямоугольник',btn:'Кнопка',input:'Поле ввода',img:'Изображение',line:'Линия',...NAME_NEW};
const HEX=/^#[0-9a-f]{6}$/i;

/** сворачиваемая секция: состояние помнится между элементами и сессиями */
const SHUT=new Set<string>((()=>{try{const v=localStorage.getItem('igp.shut');return v?JSON.parse(v) as string[]:['Слой и копии']}catch{return['Слой и копии']}})());
function Sec({t,children}:{t:string;children:React.ReactNode}){
const [o,setO]=useState(!SHUT.has(t));
const tg=()=>{if(o)SHUT.add(t);else SHUT.delete(t);setO(!o);try{localStorage.setItem('igp.shut',JSON.stringify([...SHUT]))}catch{/* память недоступна */}};
return<div className={'sec fold'+(o?'':' shut')}><button className="sh" aria-expanded={o} onClick={tg}><ChevronDown size={13}/>{t}</button>{o&&<div className="sb">{children}</div>}</div>}

function Color({label,value,def,pal,none,onChange}:{label:string;value?:string;def:string;pal:string[];none?:boolean;onChange:(v:string|undefined)=>void}){
const cur=value??def;
return<div className="clr"><span>{label}</span><div className="cs-row">
{pal.map(c=><button key={c} className={'cs'+(value?.toLowerCase()===c.toLowerCase()?' on':'')} style={{background:c}} title={c} onClick={()=>onChange(c)}/>)}
{none&&<button className={'cs none'+(value==='none'?' on':'')} title="Без цвета" onClick={()=>onChange('none')}/>}
<label className="cs pick" title="Свой цвет"><input type="color" value={HEX.test(cur)?cur:'#000000'} onChange={e=>onChange(e.target.value)}/></label></div></div>}

function Range({label,value,min,max,step=1,unit='',onChange}:{label:string;value:number;min:number;max:number;step?:number;unit?:string;onChange:(v:number)=>void}){
return<label className="rng"><span>{label}</span><input type="range" min={min} max={max} step={step} value={value} onChange={ev=>onChange(+ev.target.value)}/><output>{Math.round(value*10)/10}{unit}</output></label>}

export function ElPanel({dev,e,b,st}:{dev:Dev;e:El;b:Block;st:PStyle}){
const s=useStore();const set=(p:Partial<El>)=>s.updEl(dev,e.id,p);const [q,setQ]=useState('');const t=e.t;const r=resolve(e,st);
const icons=useMemo(()=>{const f=q.trim().toLowerCase();return ICON_LIST.filter(([id,ru,c])=>!f||id.includes(f)||ru.toLowerCase().includes(f)||c.toLowerCase().includes(f))},[q]);
const num=(k:'x'|'y'|'w'|'h',l:string)=><label className="num"><span>{l}</span><input type="number" value={Math.round(e[k])} disabled={k==='h'&&t==='line'} onChange={ev=>set({[k]:+ev.target.value||0} as Partial<El>)}/></label>;
const canHug=t==='text'||t==='btn'||t==='input';
const HUGS:{k:'w'|'h'|undefined;l:string}[]=[{k:'w',l:'По ширине'},...(t==='text'?[{k:'h' as const,l:'По высоте'}]:[]),{k:undefined,l:'Фиксированный'}];
const hugRow=canHug?<div className="seg hug" title="Двойной клик по ручке размера делает то же самое">{HUGS.map(o=><button key={o.l} className={e.hug===o.k?'on':''} onClick={()=>set({hug:o.k})}>{o.l}</button>)}</div>:null;
const hasFill=t==='shape'||t==='rect'||t==='btn'||t==='input'||t==='mock'||t==='img';
const hasStroke=t==='shape'||t==='rect'||t==='btn'||t==='input'||t==='mock';
const hasR=t==='rect'||t==='btn'||t==='input'||t==='img'||(t==='shape'&&['rect','round','bubble'].includes(e.sh??'rect'));
const hasText=t!=='line'&&t!=='icon'&&t!=='mock';
const defFill=t==='btn'?'#0F172A':t==='input'?'#FFFFFF':t==='rect'?'#FFFFFF':t==='shape'?'#F1F5F9':'#FFFFFF';
const defR=t==='btn'?10:t==='input'?8:t==='shape'&&e.sh==='round'?16:t==='shape'&&e.sh==='bubble'?14:0;
const pal=st.palette;
const sizes=[...new Set([12,13,14,16,18,20,24,32,40,48,56,72,r.fs??16])].sort((a,c)=>a-c);
return<aside className="panel ep"><div className="ph"><b>{NM[t]}</b><span>Элемент</span><button className="btn ic" onClick={()=>s.setBlock(b.id)} aria-label="Снять выделение"><X size={14}/></button></div>
<div className="sec"><button className="up" title="Выбрать весь блок (Esc)" onClick={()=>s.setBlock(b.id)}><LayoutTemplate size={14}/>Блок: {b.title}</button>
<h4>Положение и размер</h4><div className="grid2">{num('x','X')}{num('y','Y')}{num('w','Ш')}{num('h','В')}</div>
<div className="btnrow">{(['Влево','Центр','Вправо'] as const).map((l,i)=><button key={l} className="btn" title="Выровнять по фрейму" onClick={()=>set({x:Math.max(0,[0,Math.round((FW[dev]-e.w)/2),FW[dev]-e.w][i])})}>{l}</button>)}</div>{hugRow}</div>

<LayPanel dev={dev} ids={[e.id]} single/>
{hasText&&<div className="sec"><h4>{t==='list'?'Пункты (каждый с новой строки)':'Текст'}</h4><textarea id="el-text" className="inp" placeholder="Текст элемента (Enter)" value={e.text} onChange={ev=>set({text:ev.target.value})} onKeyDown={ev=>{if(ev.key==='Escape')(ev.target as HTMLElement).blur()}}/>
<label className="clr"><span>Стиль текста</span><select className="inp sl" value={e.role??''} title="Размер и жирность берутся из стиля проекта" onChange={ev=>{const v=ev.target.value as Role|'';set(v?{role:v,fs:undefined,b:undefined}:{role:undefined})}}><option value="">Свой</option>{ROLES.map(([k,l])=><option key={k} value={k}>{l} · {st.roles[k].fs} px</option>)}</select></label>
<div className="btnrow fmt"><select className="inp" value={r.fs??16} onChange={ev=>set({fs:+ev.target.value})}>{sizes.map(n=><option key={n} value={n}>{n} px</option>)}</select>
<button className={'btn ic'+(r.b?' on':'')} title="Жирный (Ctrl+B)" onClick={()=>set({b:!r.b})}><Bold size={15}/></button>
{(['l','c','r'] as const).map(a=><button key={a} className={'btn ic'+((e.al??(t==='shape'?'c':'l'))===a?' on':'')} title="Выравнивание текста" onClick={()=>set({al:a})}>{a==='l'?<AlignLeft size={15}/>:a==='c'?<AlignCenter size={15}/>:<AlignRight size={15}/>}</button>)}</div>
<Color label="Цвет текста" value={e.c} def="#0F172A" pal={pal} onChange={v=>set({c:v})}/></div>}
{t==='shape'&&<Sec t="Фигура"><div className="ins-g c5 mini">{SHAPES.map(([k,l])=><button key={k} className={'cell'+((e.sh??'rect')===k?' on':'')} title={l} onClick={()=>set({sh:k})}><Prev e={{...e,sh:k,w:30,h:k==='arrow'||k==='tag'||k==='ribbon'||k==='pill'?18:26,fill:'#EAF0FF',stroke:'#2F6BFF',sw:1.5,text:''}}/></button>)}</div>
{(e.sh==='poly'||e.sh==='star')&&<Range label={e.sh==='star'?'Лучей':'Углов'} value={e.n??(e.sh==='star'?5:6)} min={3} max={12} onChange={v=>set({n:v})}/>}</Sec>}
{t==='icon'&&<Sec t="Иконка"><label className="search"><Search size={14}/><input placeholder="Найти иконку" value={q} onChange={ev=>setQ(ev.target.value)}/></label><div className="ins-g c7 sc mini">{icons.map(([id,ru])=><button key={id} className={'cell ic'+(e.ic===id?' on':'')} title={ru} onClick={()=>set({ic:id})}><Prev e={{...e,ic:id,w:22,h:22,c:'#0F172A'}}/></button>)}</div></Sec>}
{t==='mock'&&<Sec t="Устройство"><div className="btnrow">{MOCKS.map(([k,l])=><button key={k} className={'btn'+((e.mk??'phone')===k?' on':'')} onClick={()=>set({mk:k})}>{l}</button>)}</div></Sec>}
{t==='list'&&<Sec t="Маркеры"><div className="btnrow">{BULLETS.map(([k,l])=><button key={k} className={'btn'+((e.bu??'dot')===k?' on':'')} onClick={()=>set({bu:k})}>{l}</button>)}</div></Sec>}

{(hasFill||hasStroke||t==='icon'||hasR||t!=='line')&&<Sec t="Оформление">
{hasFill&&<Color label="Заливка" value={e.fill} def={defFill} pal={pal} none onChange={v=>set({fill:v})}/>}
{hasStroke&&<Color label="Обводка" value={e.stroke} def="#0F172A" pal={pal} none onChange={v=>set({stroke:v})}/>}
{hasStroke&&<Range label="Толщина" value={e.sw??(t==='mock'?2:1.5)} min={0} max={12} step={.5} unit=" px" onChange={v=>set({sw:v})}/>}
{t==='icon'&&<><Color label="Цвет" value={e.c} def="#0F172A" pal={pal} onChange={v=>set({c:v})}/><Range label="Линия" value={e.sw??2} min={1} max={4} step={.25} onChange={v=>set({sw:v})}/></>}
{hasR&&<Range label="Скругление" value={e.r??defR} min={0} max={80} unit=" px" onChange={v=>set({r:v})}/>}
<Range label="Прозрачность" value={Math.round((e.op??1)*100)} min={5} max={100} unit="%" onChange={v=>set({op:v>=100?undefined:v/100})}/></Sec>}


<Sec t="Переход по клику"><select className="inp sl" value={e.go??''} onChange={ev=>set({go:ev.target.value||undefined})}><option value="">Никуда не ведёт</option>{(s.data?.projects.find(p=>p.id===s.projectId)?.sheets??[]).map(x=><option key={x.id} value={x.id}>{x.kind==='popup'?'Попап: ':'Страница: '}{x.name}</option>)}</select></Sec>
<Sec t="Для нейросети"><button className={'btn'+(e.acc?' on':'')} title="Важный элемент: ИИ сделает на нём акцент" onClick={()=>set({acc:!e.acc})}>★ Сделать акцентом</button></Sec>
<Sec t="Слой и копии"><div className="btnrow"><button className="btn" title="Слой выше (Ctrl+])" onClick={()=>s.moveEl(dev,e.id,1)}><ArrowUp size={16}/>Выше</button><button className="btn" title="Слой ниже (Ctrl+[)" onClick={()=>s.moveEl(dev,e.id,-1)}><ArrowDown size={16}/>Ниже</button></div>
<button className="btn" title="Добавить копии в два других фрейма с пересчётом по ширине" onClick={()=>s.copyEl(dev,e.id)}><Smartphone size={16}/>На другие размеры</button>
<div className="btnrow"><button className="btn" title="Дублировать (Ctrl+D)" onClick={()=>s.dupEl(dev,e.id)}><Copy size={16}/>Дублировать</button><button className="btn danger" title="Удалить (Delete)" onClick={()=>s.delEl(dev,e.id)}><Trash2 size={16}/>Удалить</button></div></Sec>
</aside>}

/** project style: palette, fonts and base text sizes shared by every element of the project */
export function StylePanel({st}:{st:PStyle}){
const s=useStore();
return<div className="sec sty"><h4>Стиль проекта</h4>
<div className="clr"><span>Палитра</span><div className="cs-row">{st.palette.map((c,i)=><label key={i} className="cs pick big" style={{background:c}} title={c}><input type="color" value={HEX.test(c)?c:'#000000'} onChange={ev=>s.setStyle({palette:st.palette.map((x,k)=>k===i?ev.target.value:x)})}/></label>)}</div></div>
<label className="clr"><span>Шрифт заголовков</span><select className="inp sl" value={st.head} onChange={ev=>s.setStyle({head:ev.target.value})}>{FONTS.map(f=><option key={f}>{f}</option>)}</select></label>
<label className="clr"><span>Шрифт текста</span><select className="inp sl" value={st.body} onChange={ev=>s.setStyle({body:ev.target.value})}>{FONTS.map(f=><option key={f}>{f}</option>)}</select></label>
<div className="roles">{ROLES.map(([k,l])=><div key={k} className="role"><span>{l}</span><input type="number" min={8} max={160} value={st.roles[k].fs} onChange={ev=>s.setRole(k,{fs:Math.max(8,Math.min(160,+ev.target.value||16))})}/><button className={'btn ic'+(st.roles[k].b?' on':'')} title="Жирный" onClick={()=>s.setRole(k,{b:!st.roles[k].b})}><Bold size={14}/></button></div>)}</div>
<p className="hint">Назначь элементу стиль текста: размер и жирность возьмутся отсюда и поменяются у всех сразу</p></div>}
