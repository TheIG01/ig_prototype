// Поп-апы: 7 вариантов по разбору 17 референсов (docs/refs/popups.md). Окно по центру на затемнённой странице, крестик справа сверху.
// Размеры: ПК 1440 (окно 560–1120), планшет 768 (окно до 672), мобилка 390 (окно 350). На узких экранах колонки идут стопкой.
// Тексты по copywriting.md: на «ты», без «Вы», восклицаний, «не/нет/ни», «любой».
import {uid} from './uid';
import {ctx,r4} from './tplFirst';
import type {C,Out} from './tplFirst';
import {FW} from './dev';
import type {Dev} from './dev';
import type {El} from '../store';

const CAT='Поп-апы';
const SCR:Record<Dev,number>={desktop:800,tablet:952,mobile:780};
const CONSENT='☐ Я принимаю условия передачи данных';
const sz=(dev:Dev)=>{const m=dev==='mobile',t=dev==='tablet',d=dev==='desktop';return{m,t,d,P:m?20:32,ih:m?48:52,bh:m?52:56,hf:m?22:t?26:28,top:m?52:56}};

type Fn=(c:C,dev:Dev,w:number)=>number;
/** окно: фон страницы, белая карточка по центру, содержимое строится от (0,0) карточки, крестик в углу */
function modal(dev:Dev,wd:number,fn:Fn):Out{
 const W=FW[dev],m=dev==='mobile',cw=m?350:dev==='tablet'?Math.min(wd,672):wd;
 const c=ctx();const ch=r4(fn(c,dev,cw));
 const H=r4(Math.max(SCR[dev],ch+2*(m?16:40)));
 const x=Math.round((W-cw)/2),y=r4((H-ch)/2);
 for(const e of c.els){e.x+=x;e.y+=y}
 const els:El[]=[
  {id:uid(),t:'rect',x:0,y:0,w:W,h:H,text:'',fill:'#e6e6e6'},
  {id:uid(),t:'rect',x,y,w:cw,h:ch,text:'',fill:'#ffffff'},
  ...c.els,
  {id:uid(),t:'btn',x:x+cw-48,y:y+12,w:36,h:36,text:'✕',fs:16}];
 return{h:H,els}}

const label=(c:C,x:number,y:number,w:number,t:string)=>c.tx(t,x,y,w,14,{b:true})+4;
const inp=(c:C,dev:Dev,x:number,y:number,w:number,ph:string)=>{const h=sz(dev).ih;c.add('input',x,y,w,h,ph);return y+h};
const cta=(c:C,dev:Dev,x:number,y:number,w:number,t:string)=>{const h=sz(dev).bh;c.add('btn',x,y,w,h,t,{fs:16,acc:true});return y+h};
const note=(c:C,x:number,y:number,w:number,ctr=false)=>c.tx(CONSENT,x,y,w,13,ctr?{al:'c'}:{});
/** ряд кнопок-вариантов, per в ряд */
function chips(c:C,x:number,y:number,w:number,a:string[],sel:number,per:number){const g=8,h=44,cw=(w-(per-1)*g)/per;let r=0;
 a.forEach((s,i)=>{r=Math.floor(i/per);c.add('btn',x+(i%per)*(cw+g),y+r*(h+g),cw,h,s,{fs:14,...(i===sel?{acc:true}:{})})});return y+(r+1)*(h+g)-g}
const head=(c:C,dev:Dev,x:number,y:number,w:number,t:string,s:string,ctr:boolean)=>{const{hf}=sz(dev),a=ctr?{al:'c' as const}:{};
 y=c.tx(t,x,y,w,hf,{b:true,...a})+8;return s?c.tx(s,x,y,w,dev==='mobile'?15:16,a)+20:y+12};

// 1. лучший: лид-магнит при уходе. Обложка слева, выбор мессенджера, телефон, одна кнопка
const v1:Fn=(c,dev,w)=>{const{m,d,P,top}=sz(dev),iw=w-2*P;let y=top;
 if(!m)y=c.tx('Перед уходом забери подарок',P,y,iw,14,{al:'c'})+8;
 y=c.tx('Как не переплатить подрядчику до 200 000 ₽: чек-лист из 12 ошибок',P,y,iw,sz(dev).hf,{b:true,al:'c'})+20;
 const form=(x:number,y0:number,fw:number)=>{let q=label(c,x,y0,fw,'Куда прислать чек-лист');q=chips(c,x,q,fw,['WhatsApp','Viber','Telegram','Email'],0,m||d?2:4)+16;
  q=label(c,x,q,fw,'Введи телефон');q=inp(c,dev,x,q,fw,'+7 (___) ___-__-__')+12;q=cta(c,dev,x,q,fw,'Получить чек-лист');return note(c,x,q+8,fw)};
 if(d){const lw=400,rx=P+lw+32,e=form(rx,y,iw-lw-32);c.add('img',P,y,lw,e-y,'Обложка чек-листа');return e+P}
 const ih=m?96:160;c.add('img',P,y,iw,ih,'Обложка чек-листа');return form(P,y+ih+16,iw)+P};

// 2. обратный звонок с фото менеджера: сейчас или по времени
const v2:Fn=(c,dev,w)=>{const{m,d,P,top}=sz(dev),iw=w-2*P;const T='Закажи обратный звонок',S='Специалист свяжется в течение 5 минут или в удобное время',N='Анна Иванова\nслужба заботы о клиентах';
 const form=(x:number,y0:number,fw:number)=>{let q=label(c,x,y0,fw,'Введи телефон');q=inp(c,dev,x,q,fw,'+7 (___) ___-__-__')+12;q=label(c,x,q,fw,'Когда удобно');q=chips(c,x,q,fw,['Сейчас','По времени'],0,2)+12;
  q=label(c,x,q,fw,'Во сколько позвонить');q=inp(c,dev,x,q,fw,'Например, завтра в 10:00')+16;q=cta(c,dev,x,q,fw,'Заказать звонок');return note(c,x,q+8,fw)};
 if(d){const lw=456,rx=P+lw+32,rw=iw-lw-32;let y=head(c,dev,P,top,lw,T,S,false);const e=form(rx,top,rw);const ph=Math.max(e-y,240);c.add('img',P,y,lw,ph,'Фото менеджера');c.plate(P+16,y+ph-80,280,64,N,14,true,'l');return Math.max(e,y+ph)+P}
 let y=top;c.add('img',P,y,m?64:72,m?64:72,'Фото');c.tx('Анна Иванова',P+(m?80:88),y+(m?8:12),iw-88,16,{b:true});c.tx('служба заботы о клиентах',P+(m?80:88),y+(m?32:36),iw-88,14);y+=(m?64:72)+16;
 y=head(c,dev,P,y,iw,T,S,false);return form(P,y,iw)+P};

// 3. компактная заявка: один телефон
const v3:Fn=(c,dev,w)=>{const{P,top}=sz(dev),iw=w-2*P;
 let y=head(c,dev,P,top,iw,'Оставь номер, и менеджер перезвонит за 5 минут','',true)+4;
 y=inp(c,dev,P,y,iw,'+7 (___) ___-__-__')+12;y=cta(c,dev,P,y,iw,'Оставить заявку');return note(c,P,y+8,iw,true)+P};

// 4. звонок: способ связи и время
const v4:Fn=(c,dev,w)=>{const{m,P,top}=sz(dev),iw=w-2*P;
 let y=head(c,dev,P,top,iw,'Закажи обратный звонок','Перезвоним за 5 минут или в удобное время',false);
 y=label(c,P,y,iw,'Введи телефон');y=inp(c,dev,P,y,iw,'+7 (___) ___-__-__')+12;
 y=label(c,P,y,iw,'Как связаться');y=chips(c,P,y,iw,['Звонок','WhatsApp','Telegram'],0,3)+12;
 y=label(c,P,y,iw,'Когда позвонить');y=chips(c,P,y,iw,['Сейчас','По времени'],0,2)+12;
 y=label(c,P,y,iw,'Во сколько позвонить');y=inp(c,dev,P,y,iw,'Например, завтра в 12:00')+(m?12:16);
 y=cta(c,dev,P,y,iw,'Заказать звонок');return note(c,P,y+8,iw)+P};

// 5. индикатор «Почти готово»: два поля
const v5:Fn=(c,dev,w)=>{const{P,top}=sz(dev),iw=w-2*P;let y=top;
 c.add('rect',P,y,iw,28,'');c.add('btn',P,y,Math.round(iw*.7),28,'Почти готово',{fs:13,acc:true});y+=28+16;
 y=head(c,dev,P,y,iw,'Перезвони мне','Менеджер свяжется в течение 7 минут',true);
 y=inp(c,dev,P,y,iw,'Номер телефона')+12;y=inp(c,dev,P,y,iw,'name@mail.ru')+16;y=cta(c,dev,P,y,iw,'Перезвони мне');return note(c,P,y+8,iw,true)+P};

// 6. разбор эксперта: три шага слева, форма справа
const STEPS=['Созвон 1 на 1 с экспертом в Zoom','Эксперт находит, что тормозит рост дохода','Ты получаешь план роста на 30 дней'];
const v6:Fn=(c,dev,w)=>{const{m,d,P,top}=sz(dev),iw=w-2*P;
 const steps=(x:number,y:number,sw:number)=>{y=label(c,x,y,sw,'Что будет на созвоне')+4;STEPS.forEach((s,i)=>{const th=c.tx(s,x+56,y+(m?4:8),sw-56,m?15:16);c.add('rect',x,y,40,40,String(i+1),{fs:16,b:true,al:'c'});y=Math.max(th,y+40)+(m?8:12)});return y};
 const form=(x:number,y0:number,fw:number)=>{let q=c.tx('Сотрудник согласует время Zoom-созвона',x,y0,fw,14,{b:true})+12;q=label(c,x,q,fw,'Введи имя');q=inp(c,dev,x,q,fw,'Имя')+12;
  q=label(c,x,q,fw,'Введи телефон');q=inp(c,dev,x,q,fw,'+7 (___) ___-__-__')+12;q=label(c,x,q,fw,'Какой запрос на встречу?');q=inp(c,dev,x,q,fw,'Коротко опиши задачу')+16;q=cta(c,dev,x,q,fw,'Получить разбор');return note(c,x,q+8,fw)};
 if(d){const lw=500,rx=P+lw+48,rw=iw-lw-48;let y=head(c,dev,P,top,lw,'Получи бесплатный разбор от эксперта','Разберём твой запрос за 30 минут',false);y=steps(P,y,lw);return Math.max(y,form(rx,top,rw))+P}
 let y=head(c,dev,P,top,iw,'Получи бесплатный разбор от эксперта','',false);y=steps(P,y,iw)+4;return form(P,y,iw)+P};

// 7. презентация в мессенджер: телефон и два значка
const v7:Fn=(c,dev,w)=>{const{P,top,ih}=sz(dev),iw=w-2*P;
 let y=head(c,dev,P,top,iw,'Куда прислать полную презентацию?','Укажи номер и выбери мессенджер',true);
 const bw=ih,iy=y;inp(c,dev,P,iy,iw-2*(bw+8),'+7 (___) ___-__-__');c.add('btn',P+iw-2*bw-8,iy,bw,ih,'TG',{fs:13,acc:true});c.add('btn',P+iw-bw,iy,bw,ih,'WA',{fs:13});
 y=iy+ih+16;y=cta(c,dev,P,y,iw,'Получить цену и презентацию');return note(c,P,y+8,iw,true)+P};

interface S{name:string;wd:number;fn:Fn;tips:string[]}
const ALL:S[]=[
{name:'Поп-апы: лид-магнит при уходе',wd:1120,fn:v1,tips:['Оценка: подходит почти всегда на выходе со страницы. Заголовок с цифрой выгоды, обложка подарка слева, один шаг справа','Выбор мессенджера до телефона снимает страх спама и поднимает долю заявок']},
{name:'Поп-апы: звонок с фото менеджера',wd:1040,fn:v2,tips:['Оценка: подходит для услуг, где важно доверие. Живой менеджер с именем и должностью обещает звонок за 5 минут','Кнопки «Сейчас» и «По времени» экономят клиенту звонок не вовремя']},
{name:'Поп-апы: компактная заявка',wd:560,fn:v3,tips:['Оценка: подходит, когда клиент уже готов и нужен только номер. Одно поле, одна кнопка','Срок звонка в заголовке (5 минут) работает лучше слов «в ближайшее время»']},
{name:'Поп-апы: звонок со способом и временем',wd:640,fn:v4,tips:['Оценка: подходит, когда клиенты любят разные каналы: звонок, WhatsApp, Telegram. Поле времени открывается при выборе «По времени»','Три шага в одном окне: телефон, канал, время. Кнопка повторяет слова заголовка']},
{name:'Поп-апы: индикатор «Почти готово»',wd:600,fn:v5,tips:['Оценка: подходит после долгого пути по сайту или квиза. Индикатор 70% подталкивает дойти до конца','Два поля: телефон и e-mail, чтобы отправить расчёт на почту']},
{name:'Поп-апы: разбор эксперта',wd:1120,fn:v6,tips:['Оценка: подходит для дорогих услуг и консалтинга. Слева три шага созвона, справа короткая форма с вопросом о запросе','Вопрос про запрос заранее квалифицирует заявку']},
{name:'Поп-апы: презентация в мессенджер',wd:640,fn:v7,tips:['Оценка: подходит для B2B и дорогих заказов. Клиент оставляет номер и сразу выбирает, куда прислать презентацию и цену','Значки мессенджеров стоят рядом с полем, форма остаётся в один ряд']}];
export const POPUP:{name:string;cat:string;spec:(d:Dev)=>Out}[]=ALL.map(s=>({name:s.name,cat:CAT,spec:(d:Dev)=>modal(d,s.wd,s.fn)}));
const CR=['Окно открывай по клику на кнопку или при движении мыши к закрытию вкладки; на мобилке по таймеру 30 секунд','Крестик всегда виден и нажимается: окно, которое нельзя закрыть, раздражает и портит доверие'];
export const POPUP_TIPS:Record<string,string[]>=Object.fromEntries(ALL.map(s=>[s.name,[...s.tips,...CR]]));
