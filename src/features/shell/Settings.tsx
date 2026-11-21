import {useState} from 'react';
import {LogOut,Trash2,Download} from 'lucide-react';import {ACCENTS,useUi,saveUi} from '../../lib/ui';import type {Ui} from '../../lib/ui';
import {forgetDevice,rememberDevice,wipe,lock} from '../../lib/vault';
export function SettingsBody({onBackup}:{onBackup:()=>void}){
const u=useUi();const up=(p:Partial<Ui>)=>{saveUi(p)};
const tg=(k:'grid'|'rulers'|'guides'|'smart'|'snap'|'hover'|'dims'|'cols',t:string,d:string)=><div className="set-row"><div><b>{t}</b><p>{d}</p></div><input type="checkbox" className="sw" checked={u[k]} onChange={e=>up({[k]:e.target.checked} as unknown as Partial<Ui>)}/></div>;
const nm=(k:'nudge'|'gut'|'mar',v:number|'',ph:string)=><input type="number" className="inp nm" min={0} placeholder={ph} value={v} onChange={e=>up({[k]:e.target.value===''?-1:+e.target.value} as unknown as Partial<Ui>)}/>;const [rem,setRem]=useState(!!localStorage.getItem('igp.rem'));const [word,setWord]=useState('');const [del,setDel]=useState(false);
const toggle=async(v:boolean)=>{setRem(v);if(v){await rememberDevice();localStorage.setItem('igp.rem','1')}else{await forgetDevice();localStorage.removeItem('igp.rem')}};
const out=async()=>{await forgetDevice();localStorage.removeItem('igp.rem');lock();location.reload()};
const kill=async()=>{await wipe();location.reload()};
return<div>
<h4 className="set-h">Вид</h4>
<div className="set-row"><div><b>Акцентный цвет</b><p>Кнопки, выделение, направляющие</p></div><div className="swatches">{ACCENTS.map(([c,n])=><button key={c} className={'swt'+(u.accent===c?' on':'')} style={{background:c}} title={n} aria-label={n} aria-pressed={u.accent===c} onClick={()=>up({accent:c})}/>)}</div></div>
<div className="set-row"><div><b>Плотность интерфейса</b><p>Компактная вмещает больше на экран</p></div><div className="seg">{([['cozy','Обычная'],['compact','Компактная']] as const).map(([k,l])=><button key={k} className={u.density===k?'on':''} onClick={()=>up({density:k})}>{l}</button>)}</div></div>
<div className="set-row"><div><b>Подписи на холсте</b><p>Названия блоков, размеры, расстояния</p></div><div className="seg">{([[1,'M'],[1.25,'L'],[1.5,'XL']] as const).map(([k,l])=><button key={k} className={u.labels===k?'on':''} onClick={()=>up({labels:k})}>{l}</button>)}</div></div>
<div className="set-row"><div><b>Точечная сетка на холсте</b><p>Привязка к 8 px работает и без неё</p></div><input type="checkbox" className="sw" checked={u.grid} onChange={e=>up({grid:e.target.checked})}/></div>
<div className="set-row"><div><b>Анимации</b><p>Выключи, если интерфейс кажется шумным</p></div><input type="checkbox" className="sw" checked={u.motion==='on'} onChange={e=>up({motion:e.target.checked?'on':'off'})}/></div>
<h4 className="set-h">Холст</h4>
{tg('rulers','Линейки','Деления в px макета, с них тянутся направляющие. Shift+R')}
{tg('guides','Направляющие','Показывать и притягивать элементы. Ctrl+;')}
{tg('snap','Привязка к сетке','Элементы встают по шагу сетки, Alt отключает на лету')}
<div className="set-row"><div><b>Шаг сетки</b><p>Привязка и точки на холсте</p></div><div className="seg">{([4,8,16] as const).map(n=><button key={n} className={u.gs===n?'on':''} onClick={()=>up({gs:n})}>{n}</button>)}</div></div>
{tg('smart','Умные направляющие','Красные линии при совпадении с соседними элементами')}
{tg('hover','Подсветка при наведении','Рамка вокруг элемента под курсором')}
{tg('dims','Размеры у выделения','Подпись ширины и высоты под элементом и блоком')}
<div className="set-row"><div><b>Шаг стрелок с Shift</b><p>Обычная стрелка двигает на 1 px</p></div>{nm('nudge',u.nudge,'8')}</div>
<h4 className="set-h">Колонки</h4>
{tg('cols','Показывать колонки','Притягивают элементы к краям колонок. Ctrl+Shift+\'')}
<div className="set-row"><div><b>Число колонок</b><p>Авто: 12 на Desktop, 8 на Tablet, 4 на Mobile</p></div><div className="seg">{([[0,'Авто'],[4,'4'],[6,'6'],[8,'8'],[12,'12']] as const).map(([k,l])=><button key={k} className={u.colsN===k?'on':''} onClick={()=>up({colsN:k})}>{l}</button>)}</div></div>
<div className="set-row"><div><b>Промежуток между колонками</b><p>px, пусто: авто</p></div>{nm('gut',u.gut<0?'':u.gut,'авто')}</div>
<div className="set-row"><div><b>Поля по краям</b><p>px, пусто: авто</p></div>{nm('mar',u.mar<0?'':u.mar,'авто')}</div>
<h4 className="set-h">Безопасность</h4>
<div className="set-row"><div><b>Запоминать это устройство</b><p>Вход без ПИН. Любой, кто откроет этот браузер, увидит данные</p></div><input type="checkbox" className="sw" checked={rem} onChange={e=>toggle(e.target.checked)}/></div>
<div className="set-row"><div><b>Выйти</b><p>Устройство забудется, при входе потребуется ПИН</p></div><button className="btn" onClick={out}><LogOut size={16}/>Выйти</button></div>
<div className="set-row" style={{border:0,flexDirection:'column'}}><div><b>Удалить аккаунт</b><p>Все проекты на этом устройстве сотрутся, затем можно создать новый ПИН</p></div>
{!del?<button className="btn danger" onClick={()=>setDel(true)}><Trash2 size={16}/>Удалить аккаунт</button>:<>
<button className="btn" onClick={onBackup}><Download size={16}/>Скачать копию перед удалением</button>
<input className="inp" placeholder="Введите УДАЛИТЬ" value={word} onChange={e=>setWord(e.target.value)}/>
<button className="btn danger" disabled={word.trim().toUpperCase()!=='УДАЛИТЬ'} onClick={kill}><Trash2 size={16}/>Удалить безвозвратно</button></>}</div></div>}
