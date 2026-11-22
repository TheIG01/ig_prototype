import {useState} from 'react';
import {createPortal} from 'react-dom';
import {X,Plus,ArrowUp,ArrowDown,Trash2} from 'lucide-react';
import {useStore} from '../../store';
import type {Block,Dev} from '../../store';
import {Thumb} from '../blocks/blocks';
import {DEVN} from '../../lib/dev';
import {quizCheck,BONUS_TXT,BONUS_NAME,TOKENS,UNKNOWN} from '../../lib/quiz';
import type {QuizCfg,QStep} from '../../lib/quiz';
import {toast} from '../../lib/toast';
const TABS=[['view','Вид'],['steps','Вопросы'],['bonus','Шкала и подарки'],['cons','Консультант'],['final','Телефон и финал'],['chk','Проверка']] as const;
type Tab=typeof TABS[number][0];
function Txt({l,v,on,ph,area}:{l:string;v:string;on:(v:string)=>void;ph?:string;area?:boolean}){return<label className="fld"><span>{l}</span>{area?<textarea className="inp" rows={2} value={v} placeholder={ph} onChange={e=>on(e.target.value)}/>:<input className="inp" value={v} placeholder={ph} onChange={e=>on(e.target.value)}/>}</label>}
function Num({l,v,on,min=0,max=99999}:{l:string;v:number;on:(v:number)=>void;min?:number;max?:number}){return<label className="fld"><span>{l}</span><input className="inp" type="number" min={min} max={max} value={v} onChange={e=>on(Math.max(min,Math.min(max,+e.target.value||0)))}/></label>}
function Tg({l,v,on,hint}:{l:string;v:boolean;on:(v:boolean)=>void;hint?:string}){return<button type="button" className={'qtg'+(v?' on':'')} aria-pressed={v} onClick={()=>on(!v)} title={hint}><i/><span>{l}</span></button>}
function Seg<T extends string|number>({v,o,on}:{v:T;o:[T,string][];on:(v:T)=>void}){return<div className="seg">{o.map(([k,l])=><button type="button" key={String(k)} className={v===k?'on':''} onClick={()=>on(k)}>{l}</button>)}</div>}
function Strs({l,v,on,min,max,ph}:{l:string;v:string[];on:(v:string[])=>void;min:number;max:number;ph:string}){
return<div className="qlist"><h4>{l}</h4>{v.map((t,i)=><div className="qrow" key={i}><input className="inp" value={t} placeholder={ph} onChange={e=>on(v.map((x,k)=>k===i?e.target.value:x))}/>
<button type="button" className="btn ic" title="Выше" disabled={i===0} onClick={()=>{const a=[...v];[a[i-1],a[i]]=[a[i],a[i-1]];on(a)}}><ArrowUp size={14}/></button>
<button type="button" className="btn ic" title="Удалить" disabled={v.length<=min} onClick={()=>on(v.filter((_,k)=>k!==i))}><X size={14}/></button></div>)}
{v.length<max&&<button type="button" className="btn" onClick={()=>on([...v,''])}><Plus size={14}/>Добавить</button>}</div>}
export function QuizEditor({b,onClose}:{b:Block;onClose:()=>void}){
const s=useStore();const c=b.quiz!;const [tab,setTab]=useState<Tab>('view');const [dv,setDv]=useState<Dev>('desktop');const [open,setOpen]=useState(0);
const u=(f:(c:QuizCfg)=>void)=>s.setQuiz(b.id,f);
const flow=[...c.steps.map((_,i)=>'Вопрос '+(i+1)),...(c.bridge.on?['Куда отправить']:[]),'Телефон',...(c.load.on?['Загрузка']:[]),'Спасибо'];
const chk=quizCheck(c,{desktop:b.h.desktop,tablet:b.h.tablet,mobile:b.h.mobile});const bad=chk.filter(x=>!x.ok).length;
const undo=(t:string)=>toast(t,{label:'Отменить',run:()=>s.undo()},5000);
const stepSet=(i:number,f:(x:QStep)=>void)=>u(q=>f(q.steps[i]));
const move=(i:number,d:number)=>u(q=>{const j=i+d;if(j<0||j>=q.steps.length)return;[q.steps[i],q.steps[j]]=[q.steps[j],q.steps[i]];q.view=j});
const body=()=>{
if(tab==='view')return<>
<Txt l="Заголовок. {qw} подставит «4 вопроса» по числу вопросов" v={c.title} on={v=>u(q=>{q.title=v})} area/>
<Txt l="Подзаголовок" v={c.sub} on={v=>u(q=>{q.sub=v})}/>
<Txt l="Стикер с подарком над квизом (пусто: нет)" v={c.sticker} on={v=>u(q=>{q.sticker=v})}/>
<h4>Шкала сверху</h4><Seg v={c.progress} o={[['bar','Полоса'],['tabs','Вкладки'],['none','Нет']]} on={v=>u(q=>{q.progress=v})}/>
<h4>Что показывать</h4><div className="qtgs">
<Tg l="Консультант с сообщениями" v={c.cons.on} on={v=>u(q=>{q.cons.on=v})}/>
<Tg l="Счётчик «осталось N решений»" v={c.counter} on={v=>u(q=>{q.counter=v})}/>
<Tg l="Карточка подобранного решения" v={c.card} on={v=>u(q=>{q.card=v})}/>
<Tg l="Плашки выбранных ответов" v={c.chips} on={v=>u(q=>{q.chips=v})}/>
<Tg l="Подарки плашками над квизом" v={c.giftsTop} on={v=>u(q=>{q.giftsTop=v})}/>
<Tg l="Список подарков справа" v={c.giftsSide} on={v=>u(q=>{q.giftsSide=v})}/>
<Tg l="Кнопка «Назад»" v={c.back} on={v=>u(q=>{q.back=v})}/>
<Tg l="Ответ сразу ведёт дальше" v={c.auto} on={v=>u(q=>{q.auto=v})} hint="Без кнопки «Далее». Для вопросов с одним ответом"/></div>
<div className="grid2"><Txt l="Кнопка «Далее»" v={c.txt.next} on={v=>u(q=>{q.txt.next=v})}/><Txt l="Кнопка «Назад»" v={c.txt.back} on={v=>u(q=>{q.txt.back=v})}/></div>
<Txt l="Ссылка «Пропустить»" v={c.txt.skip} on={v=>u(q=>{q.txt.skip=v})}/>
<p className="hint">Боковая колонка (консультант, счётчик, подарки) показывается на ПК. На планшете и мобилке она сжимается: консультант в одну строку, счётчик плашкой, подарки на шаге телефона</p></>;
if(tab==='steps')return<>{c.steps.map((st,i)=><details className="qstep" key={i} open={open===i} onToggle={e=>{if((e.target as HTMLDetailsElement).open&&open!==i){setOpen(i);u(q=>{q.view=i})}}}>
<summary><b>{i+1}</b><span>{st.q||'Без названия'}</span><em>{st.opts.length} вар.</em></summary>
<Txt l="Вопрос" v={st.q} on={v=>stepSet(i,x=>{x.q=v})}/>
<Txt l="Сообщение консультанта на этом шаге" v={st.msg} on={v=>stepSet(i,x=>{x.msg=v})} area/>
<div className="qline"><Seg v={st.lay} o={[['cards','Карточки с фото'],['list','Список']]} on={v=>stepSet(i,x=>{x.lay=v})}/>{st.lay==='cards'&&<Seg v={st.cols} o={[[2,'2'],[3,'3'],[4,'4']]} on={v=>stepSet(i,x=>{x.cols=v})}/>}</div>
<div className="qtgs"><Tg l="Можно выбрать несколько" v={!!st.multi} on={v=>stepSet(i,x=>{x.multi=v})}/><Tg l="Есть «Пропустить»" v={!!st.skip} on={v=>stepSet(i,x=>{x.skip=v})}/></div>
<Num l={`Сколько ${c.noun[2]} останется после ответа`} v={st.left} on={v=>stepSet(i,x=>{x.left=v})}/>
<h4>Варианты ответа</h4>
{st.opts.map((o,k)=><div className="qopt" key={k}><div className="qrow"><input className="inp" value={o.t} placeholder="Текст варианта" onChange={e=>stepSet(i,x=>{x.opts[k].t=e.target.value})}/>
<button type="button" className="btn ic" title="Выше" disabled={k===0} onClick={()=>stepSet(i,x=>{[x.opts[k-1],x.opts[k]]=[x.opts[k],x.opts[k-1]]})}><ArrowUp size={14}/></button>
<button type="button" className="btn ic" title="Удалить вариант" disabled={st.opts.length<=2} onClick={()=>stepSet(i,x=>{x.opts.splice(k,1)})}><X size={14}/></button></div>
<div className="grid2"><input className="inp" value={o.img??''} placeholder="Подпись к фото" onChange={e=>stepSet(i,x=>{x.opts[k].img=e.target.value})}/><input className="inp" value={o.res??''} placeholder="Решение: Название | цена и срок" onChange={e=>stepSet(i,x=>{x.opts[k].res=e.target.value})}/></div></div>)}
<div className="btnrow">{st.opts.length<8&&<button type="button" className="btn" onClick={()=>stepSet(i,x=>{x.opts.push({t:'Вариант '+(x.opts.length+1)})})}><Plus size={14}/>Вариант</button>}
{!st.opts.some(o=>UNKNOWN.test(o.t))&&st.opts.length<8&&<button type="button" className="btn on" onClick={()=>stepSet(i,x=>{x.opts.push({t:'Не знаю / нужна консультация'})})}>+ «Не знаю / нужна консультация»</button>}</div>
<div className="btnrow"><button type="button" className="btn" disabled={i===0} onClick={()=>move(i,-1)}><ArrowUp size={14}/>Вопрос выше</button><button type="button" className="btn" disabled={i===c.steps.length-1} onClick={()=>move(i,1)}><ArrowDown size={14}/>Ниже</button>
<button type="button" className="btn danger" disabled={c.steps.length<=1} onClick={()=>{u(q=>{q.steps.splice(i,1);q.view=Math.max(0,i-1)});setOpen(Math.max(0,i-1));undo('Вопрос удалён')}}><Trash2 size={14}/>Удалить вопрос</button></div></details>)}
{c.steps.length<8&&<button type="button" className="btn pri" onClick={()=>{u(q=>{const l=q.steps[q.steps.length-1];q.steps.push({q:'Новый простой вопрос',msg:'',lay:'list',cols:2,left:Math.max(1,Math.floor(l.left/2)),opts:[{t:'Вариант 1'},{t:'Вариант 2'},{t:'Не знаю / нужна консультация'}]});q.view=q.steps.length-1});setOpen(c.steps.length)}}><Plus size={14}/>Добавить вопрос</button>}
<p className="hint">Правило: 4–6 вопросов, от простого к сложному. «Решение» это то, что покажется справа в карточке после выбора варианта: «Название | цена и срок»</p></>;
if(tab==='bonus')return<>
<h4>Что растёт с каждым ответом</h4><div className="qkinds">{(Object.keys(BONUS_TXT) as QuizCfg['bonus']['kind'][]).map(k=><button type="button" key={k} className={'btn'+(c.bonus.kind===k?' on':'')} onClick={()=>u(q=>{q.bonus.kind=k;q.bonus.text=BONUS_TXT[k]})}>{BONUS_NAME[k]}</button>)}</div>
<Txt l="Подпись шкалы" v={c.bonus.text} on={v=>u(q=>{q.bonus.text=v})}/>
<div className="qtok">{TOKENS.map(([t,l])=><button type="button" key={t} title={l} onClick={()=>u(q=>{q.bonus.text+=t})}>{t}</button>)}</div>
<div className="grid2"><Num l="Прибавка за ответ" v={c.bonus.per} on={v=>u(q=>{q.bonus.per=v})}/><Txt l="Единица: ₽ или %" v={c.bonus.unit} on={v=>u(q=>{q.bonus.unit=v.slice(0,3)})}/></div>
<Txt l="Подпись, когда подарок открыт" v={c.bonus.done} on={v=>u(q=>{q.bonus.done=v})}/>
<Strs l="Подарки в конце теста (от 3)" v={c.gifts} min={1} max={6} ph="Что получит человек" on={v=>u(q=>{q.gifts=v})}/>
<Txt l="Заголовок списка подарков" v={c.giftsTitle} on={v=>u(q=>{q.giftsTitle=v})}/>
<h4>Подбор решений</h4>
<Num l="Сколько решений в начале" v={c.total} min={1} on={v=>u(q=>{q.total=v})}/>
<div className="grid3">{[0,1,2].map(i=><Txt key={i} l={['1 (септик)','2–4 (септика)','5+ (септиков)'][i]} v={c.noun[i]} on={v=>u(q=>{q.noun[i]=v})}/>)}</div>
<Txt l="Счётчик на первом шаге" v={c.counterStart} on={v=>u(q=>{q.counterStart=v})}/><Txt l="Счётчик дальше" v={c.counterAfter} on={v=>u(q=>{q.counterAfter=v})}/>
<Txt l="Заголовок карточки решения" v={c.cardTitle} on={v=>u(q=>{q.cardTitle=v})}/><Txt l="Решение, пока ничего не выбрано" v={c.cardDef} on={v=>u(q=>{q.cardDef=v})} ph="Название | цена и срок"/></>;
if(tab==='cons')return<><Tg l="Показывать консультанта" v={c.cons.on} on={v=>u(q=>{q.cons.on=v})}/>
<Txt l="Имя" v={c.cons.name} on={v=>u(q=>{q.cons.name=v})}/><Txt l="Должность" v={c.cons.role} on={v=>u(q=>{q.cons.role=v})}/><Txt l="Телефон (пусто: не показывать)" v={c.cons.phone} on={v=>u(q=>{q.cons.phone=v})}/>
<Tg l="Точка «на связи»" v={c.cons.online} on={v=>u(q=>{q.cons.online=v})}/><p className="hint">Сообщение консультанта для каждого вопроса пишется на вкладке «Вопросы». Сообщения для прокладки, телефона и финала на вкладке «Телефон и финал»</p></>;
if(tab==='final')return<>
<h4>Вопрос-прокладка</h4><Tg l="Спросить, куда отправить результат" v={c.bridge.on} on={v=>u(q=>{q.bridge.on=v})}/>
{c.bridge.on&&<><Txt l="Вопрос" v={c.bridge.q} on={v=>u(q=>{q.bridge.q=v})}/><Txt l="Сообщение консультанта" v={c.bridge.msg} on={v=>u(q=>{q.bridge.msg=v})}/><Strs l="Варианты" v={c.bridge.opts} min={2} max={5} ph="Вариант" on={v=>u(q=>{q.bridge.opts=v})}/></>}
<h4>Шаг с телефоном</h4>
<Txt l="Заголовок" v={c.phone.title} on={v=>u(q=>{q.phone.title=v})} area/><Txt l="Подзаголовок" v={c.phone.sub} on={v=>u(q=>{q.phone.sub=v})}/>
<Txt l="Подсказка над полем" v={c.phone.hint} on={v=>u(q=>{q.phone.hint=v})}/><Txt l="Текст в поле (без маски)" v={c.phone.ph} on={v=>u(q=>{q.phone.ph=v})}/>
<Txt l="Напоминание: скидка и подарок закреплены за номером" v={c.phone.remind} on={v=>u(q=>{q.phone.remind=v})}/><Txt l="Текст кнопки (совпадает с заголовком формы)" v={c.phone.cta} on={v=>u(q=>{q.phone.cta=v})}/>
<Txt l="Согласие" v={c.phone.consent} on={v=>u(q=>{q.phone.consent=v})}/><Txt l="Сообщение консультанта" v={c.phone.msg} on={v=>u(q=>{q.phone.msg=v})}/><Txt l="Заголовок карточек «подобрано для тебя»" v={c.phone.matchTitle} on={v=>u(q=>{q.phone.matchTitle=v})}/>
<h4>Фишки для заявки</h4><div className="qtgs"><Tg l="Таймер подарка" v={c.phone.timer} on={v=>u(q=>{q.phone.timer=v})}/><Tg l="Кнопки WhatsApp и Telegram в конце" v={c.phone.msgr} on={v=>u(q=>{q.phone.msgr=v})}/></div>
{c.phone.timer&&<div className="grid2"><Num l="Минут" v={c.phone.mins} min={1} max={99} on={v=>u(q=>{q.phone.mins=v})}/><Txt l="Текст таймера, {t} время" v={c.phone.timerText} on={v=>u(q=>{q.phone.timerText=v})}/></div>}
<Txt l="Дефицит: «Осталось 3 места…» (пусто: нет)" v={c.phone.stock} on={v=>u(q=>{q.phone.stock=v})}/><Txt l="Соцдоказательство (пусто: нет)" v={c.phone.proof} on={v=>u(q=>{q.phone.proof=v})}/>
<h4>Загрузка результата</h4><Tg l="Показывать «Собираем результат»" v={c.load.on} on={v=>u(q=>{q.load.on=v})}/>
{c.load.on&&<><Txt l="Заголовок" v={c.load.title} on={v=>u(q=>{q.load.title=v})}/><Strs l="Строки по очереди" v={c.load.lines} min={1} max={4} ph="Что происходит" on={v=>u(q=>{q.load.lines=v})}/></>}
<h4>Страница «Спасибо»</h4><Txt l="Заголовок" v={c.thanks.title} on={v=>u(q=>{q.thanks.title=v})} area/><Txt l="Текст" v={c.thanks.text} on={v=>u(q=>{q.thanks.text=v})} area/>
<Strs l="Что будет дальше" v={c.thanks.steps} min={1} max={4} ph="Шаг" on={v=>u(q=>{q.thanks.steps=v})}/><Txt l="Сообщение консультанта" v={c.thanks.msg} on={v=>u(q=>{q.thanks.msg=v})}/><Txt l="Кнопка «заново» (в просмотре)" v={c.thanks.cta} on={v=>u(q=>{q.thanks.cta=v})}/></>;
return<><p className="hint">Блок сверяется с твоими правилами квизов. Красное нужно поправить, зелёное в порядке</p>{chk.map((x,i)=><div key={i} className={'qchk'+(x.ok?' ok':' bad')}><b>{x.ok?'✓':'!'}</b><span>{x.t}{!x.ok&&x.fix?'. '+x.fix:''}</span></div>)}</>};
return createPortal(<div className="modal qzm" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="qz">
<div className="qzh"><h2>Настройка квиза</h2><span className="tag">{b.title}</span><div className="sp"/><button className="btn pri" onClick={onClose}>Готово</button></div>
<div className="qzt">{TABS.map(([k,l])=><button type="button" key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}{k==='chk'&&bad>0&&<em>{bad}</em>}</button>)}</div>
<div className="qzb"><div className="qzf">{body()}</div>
<div className="qzp"><div className="seg">{(['desktop','tablet','mobile'] as Dev[]).map(d=><button type="button" key={d} className={dv===d?'on':''} onClick={()=>setDv(d)}>{DEVN[d]}</button>)}</div>
<div className="qzs">{flow.map((l,i)=><button type="button" key={i} className={c.view===i?'on':''} onClick={()=>{u(q=>{q.view=i});if(i<c.steps.length)setOpen(i)}}>{l}</button>)}</div>
<div className="qzv"><Thumb els={b.els[dv]} h={b.h[dv]} dev={dv} tw={dv==='mobile'?260:dv==='tablet'?380:600}/></div>
<p className="hint">Макет собирается из настроек. Правки элементов руками в этом блоке пропадут при следующем изменении настроек. В просмотре (P) квиз проходится по-настоящему</p></div></div></div></div>,document.body)}
