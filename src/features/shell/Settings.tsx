import {useState,useRef} from 'react';
import {useStore} from '../../store';import {tplsFile,parseTpls,download} from '../../lib/export';import {toast} from '../../lib/toast';
import {LogOut,Trash2,Download,Upload} from 'lucide-react';import {ACCENTS,useUi,saveUi,liteOn,weakDevice} from '../../lib/ui';import type {Ui} from '../../lib/ui';
import {forgetDevice,rememberDevice,wipe,lock} from '../../lib/vault';import {typo,TY_RULES,TY_DEMO,TY0} from '../../lib/typo';import type {TyKey} from '../../lib/typo';
export function SettingsBody({onBackup}:{onBackup:()=>void}){
const tpls=useStore(x=>x.data?.blockTpls);const importTpls=useStore(x=>x.importTpls);const tf=useRef<HTMLInputElement>(null);const nTpl=tpls?.length??0;
const dlTpls=()=>{download('ig_templates.json',tplsFile(tpls??[]),'application/json');toast('Шаблоны скачаны')};
const ulTpls=async(fl:FileList|null)=>{if(!fl)return;let n=0;const bad:string[]=[];for(const f of Array.from(fl)){try{const l=parseTpls(await f.text());importTpls(l);n+=l.length}catch(e){bad.push(f.name+': '+(e instanceof Error?e.message:'ошибка'))}}if(tf.current)tf.current.value='';toast(n?`Загружено шаблонов: ${n}`+(bad.length?`. Не подошли: ${bad.length}`:''):bad.join('; ')||'Нечего загружать',undefined,5000)};
const u=useUi();const up=(p:Partial<Ui>)=>{saveUi(p)};
const tg=(k:'grid'|'rulers'|'guides'|'smart'|'snap'|'hover'|'dims'|'cols',t:string,d:string)=><div className="set-row"><div><b>{t}</b><p>{d}</p></div><input type="checkbox" className="sw" checked={u[k]} onChange={e=>up({[k]:e.target.checked} as unknown as Partial<Ui>)}/></div>;
const nm=(k:'nudge'|'gut'|'mar',v:number|'',ph:string)=><input type="number" className="inp nm" min={0} placeholder={ph} value={v} onChange={e=>up({[k]:e.target.value===''?-1:+e.target.value} as unknown as Partial<Ui>)}/>;const [rem,setRem]=useState(!!localStorage.getItem('igp.rem'));const [word,setWord]=useState('');const [del,setDel]=useState(false);
const toggle=async(v:boolean)=>{setRem(v);if(v){await rememberDevice();localStorage.setItem('igp.rem','1')}else{await forgetDevice();localStorage.removeItem('igp.rem')}};
const out=async()=>{await forgetDevice();localStorage.removeItem('igp.rem');lock();location.reload()};
const [demo,setDemo]=useState(TY_DEMO);const upTy=(k:TyKey|'on',v:boolean)=>up({ty:{...u.ty,[k]:v}});
const tyOut=typo(demo,u.ty).split('\u00A0').flatMap((x,i)=>i?[<span key={i} className="nb">{'\u00A0'}</span>,x]:[x]);
const lf=useRef<HTMLInputElement>(null);const setAg=(k:'n'|'r'|'l',v:string)=>up({ag:{...u.ag,[k]:v}});
const pickLogo=(fl:FileList|null)=>{const f=fl?.[0];if(!f)return;if(lf.current)lf.current.value='';const fr=new FileReader();fr.onerror=()=>toast('Файл не прочитался');fr.onload=()=>{const src=String(fr.result);if(f.type==='image/svg+xml'){if(src.length>240000){toast('SVG больше 240 КБ. Возьми файл меньше');return}setAg('l',src);return}
const im=new Image();im.onerror=()=>toast('Не получилось открыть картинку');im.onload=()=>{const k=Math.min(1,320/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));c.getContext('2d')!.drawImage(im,0,0,c.width,c.height);setAg('l',c.toDataURL('image/png'));toast('Логотип сохранён')};im.src=src};fr.readAsDataURL(f)};
const kill=async()=>{await wipe();location.reload()};
return<div>
<h4 className="set-h">Вид</h4>
<div className="set-row"><div><b>Акцентный цвет</b><p>Кнопки, выделение, направляющие</p></div><div className="swatches">{ACCENTS.map(([c,n])=><button key={c} className={'swt'+(u.accent===c?' on':'')} style={{background:c}} title={n} aria-label={n} aria-pressed={u.accent===c} onClick={()=>up({accent:c})}/>)}</div></div>
<div className="set-row"><div><b>Размер интерфейса</b><p>Крупнее подписи, кнопки и иконки в панелях, дереве и тулбаре</p></div><div className="seg">{([['m','Обычный'],['l','Крупный'],['xl','Очень крупный']] as const).map(([k,l])=><button key={k} className={u.size===k?'on':''} onClick={()=>up({size:k})}>{l}</button>)}</div></div>
<div className="set-row"><div><b>Плотность интерфейса</b><p>Компактная вмещает больше на экран</p></div><div className="seg">{([['cozy','Обычная'],['compact','Компактная']] as const).map(([k,l])=><button key={k} className={u.density===k?'on':''} onClick={()=>up({density:k})}>{l}</button>)}</div></div>
<div className="set-row"><div><b>Подписи на холсте</b><p>Названия блоков, размеры, расстояния</p></div><div className="seg">{([[1,'M'],[1.25,'L'],[1.5,'XL']] as const).map(([k,l])=><button key={k} className={u.labels===k?'on':''} onClick={()=>up({labels:k})}>{l}</button>)}</div></div>
<div className="set-row"><div><b>Точечная сетка на холсте</b><p>Привязка к 8 px работает и без неё</p></div><input type="checkbox" className="sw" checked={u.grid} onChange={e=>up({grid:e.target.checked})}/></div>
<div className="set-row"><div><b>Режим «Лёгкий»</b><p>Без теней, размытия и анимаций интерфейса: быстрее на слабых ноутбуках и телефонах. Авто включает его на устройстве с малым числом ядер или памяти. Сейчас: {liteOn(u)?'включён':'выключен'}{u.perf==='auto'&&weakDevice()?' (слабое устройство)':''}</p></div><div className="seg">{([['auto','Авто'],['on','Вкл'],['off','Выкл']] as const).map(([k,l])=><button key={k} className={u.perf===k?'on':''} onClick={()=>up({perf:k})}>{l}</button>)}</div></div>
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
<h4 className="set-h">Типограф</h4>
<div className="set-row"><div><b>Типограф RU / EN</b><p>Кавычки, неразрывные пробелы, тире. Работает в просмотре, HTML и PDF, текст в проекте не меняется. Теги, ссылки, email и телефоны не трогает</p></div><input type="checkbox" className="sw" checked={u.ty.on} onChange={e=>upTy('on',e.target.checked)}/></div>
{u.ty.on&&<details className="fold2" open><summary>Правила по отдельности</summary><div>{TY_RULES.map(r=><div className="set-row" key={r.k}><div><b>{r.l}</b><p>{r.d}</p></div><input type="checkbox" className="sw" checked={u.ty[r.k]} onChange={e=>upTy(r.k,e.target.checked)}/></div>)}<button className="btn" style={{marginTop:10}} onClick={()=>up({ty:TY0})}>Включить все правила</button></div></details>}
<div className="set-row" style={{flexDirection:'column'}}><div><b>Живой предпросмотр</b><p>Напиши свой текст слева. Неразрывные пробелы подсвечены</p></div><textarea className="inp" rows={4} value={demo} onChange={e=>setDemo(e.target.value)}/><div className="ty-out">{u.ty.on?tyOut:demo}</div></div>
<h4 className="set-h">Агентство для отчёта</h4>
<div className="set-row"><div><b>Название</b><p>Показывается на обложке и в подвале PDF</p></div><input className="inp" maxLength={80} value={u.ag.n} onChange={e=>setAg('n',e.target.value)} placeholder="Название агентства"/></div>
<div className="set-row"><div><b>Реквизиты</b><p>Адрес, сайт, телефон, ИНН. Выводятся внизу обложки</p></div><textarea className="inp" rows={3} maxLength={600} value={u.ag.r} onChange={e=>setAg('r',e.target.value)} placeholder={'ООО «Агентство»\nИНН 0000000000\nsite.ru · +7 000 000-00-00'}/></div>
<div className="set-row"><div><b>Логотип</b><p>PNG, JPG, WebP или SVG. Сохраняется в браузере, на сервер не уходит</p></div><div className="seg">{u.ag.l&&<img src={u.ag.l} alt="" style={{height:32,maxWidth:120,objectFit:'contain',marginRight:8}}/>}<button type="button" onClick={()=>lf.current?.click()}>{u.ag.l?'Заменить':'Загрузить'}</button>{u.ag.l&&<button type="button" onClick={()=>setAg('l','')}>Убрать</button>}<input ref={lf} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={e=>pickLogo(e.target.files)}/></div></div>
<h4 className="set-h">Шаблоны блоков</h4>
<div className="set-row"><div><b>Мои шаблоны</b><p>{nTpl} шт. Скачай файл, чтобы передать блоки нейросети или перенести на другое устройство. Подходит и файл одного блока</p></div><div className="stack"><button className="btn" disabled={!nTpl} onClick={dlTpls}><Download size={16}/>Скачать</button><button className="btn" onClick={()=>tf.current?.click()}><Upload size={16}/>Загрузить</button></div><input ref={tf} type="file" accept=".json,application/json" multiple hidden onChange={e=>ulTpls(e.target.files)}/></div>
<h4 className="set-h">Безопасность</h4>
<div className="set-row"><div><b>Запоминать это устройство</b><p>Вход без ПИН. Любой, кто откроет этот браузер, увидит данные</p></div><input type="checkbox" className="sw" checked={rem} onChange={e=>toggle(e.target.checked)}/></div>
<div className="set-row"><div><b>Выйти</b><p>Устройство забудется, при входе потребуется ПИН</p></div><button className="btn" onClick={out}><LogOut size={16}/>Выйти</button></div>
<div className="set-row" style={{border:0,flexDirection:'column'}}><div><b>Удалить аккаунт</b><p>Все проекты на этом устройстве сотрутся, затем можно создать новый ПИН</p></div>
{!del?<button className="btn danger" onClick={()=>setDel(true)}><Trash2 size={16}/>Удалить аккаунт</button>:<>
<button className="btn" onClick={onBackup}><Download size={16}/>Скачать копию перед удалением</button>
<input className="inp" placeholder="Введите УДАЛИТЬ" value={word} onChange={e=>setWord(e.target.value)}/>
<button className="btn danger" disabled={word.trim().toUpperCase()!=='УДАЛИТЬ'} onClick={kill}><Trash2 size={16}/>Удалить безвозвратно</button></>}</div></div>}
