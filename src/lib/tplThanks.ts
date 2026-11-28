// Страница спасибо: 7 вариантов по разбору 10 референсов (docs/refs/thanks.md). Главная сила: фото живого человека, подпись, что будет дальше, телефон и мессенджеры.
// ПК 1440 (колонка 1200, не меньше 820), планшет 768 и мобилка 390 строятся стопкой: на мобилке внизу закреплена одна кнопка.
// Все элементы обычные (текст, рамка, кнопка, поле, картинка). Тексты по copywriting.md: без «не/нет/ни», «любой», «вы/ваш», «!».
import {ctx,r4} from './tplFirst';
import type {C,Out} from './tplFirst';
import {FW} from './dev';
import type {Dev} from './dev';

const LX=120,CW=1200,CAT='Страница спасибо',GAP=16;
type Pt=
|{k:'h'|'sub'|'note';t:string;m?:string}
|{k:'check'}
|{k:'plate';t:string;ph:string}
|{k:'phone';t:string;st?:boolean}
|{k:'phones';a:[string,string][]}
|{k:'msgs';a:string[]}
|{k:'sign';n:string;r:string}
|{k:'cases'}
|{k:'back';t:string};
interface S{name:string;photo:string;side:'l'|'r';ph:number;L:Pt[];bot:Pt[];cta:string;tips:string[]}

function part(c:C,p:Pt,x:number,y:number,w:number,dev:Dev):number{
 const m=dev==='mobile',t=dev==='tablet';
 switch(p.k){
  case 'h':return c.tx(m&&p.m?p.m:p.t,x,y,w,m?28:t?36:44,{b:true})+12;
  case 'sub':return c.tx(p.t,x,y,w,m?15:18)+16;
  case 'note':return c.tx(p.t,x,y,w,14)+12;
  case 'check':{y=c.tx('Проверь номер, который ввёл',x,y,w,14)+8;const bw=Math.min(w,360);c.add('input',x,y,bw,56,'+7 (999) 000-00-00');y+=56+12;
   const bt='Ошибся в номере? Введи верный';c.add('btn',x,y,m?w:bw,52,bt,{fs:15});return y+52+24}
  case 'plate':{const pad=m?16:24,iw=w-2*pad;let yy=y+pad;yy=c.tx(p.t,x+pad,yy,iw,15)+12;yy=c.tx('Срочный вопрос? Звони',x+pad,yy,iw,15)+8;yy=c.tx(p.ph,x+pad,yy,iw,m?22:28,{b:true})+pad;
   c.els.unshift({...c.els[0],id:c.els[0].id+'pl',t:'rect',x,y,w,h:yy-y,text:''} as any);return yy+16}
  case 'phone':{y=c.tx('Срочный вопрос? Звони',x,y,w,15)+8;y=c.tx(p.t,x,y,w,m?26:32,{b:true})+4;if(p.st)y=c.tx('● Сейчас работаем',x,y,w,14)+4;return y+16}
  case 'phones':{y=c.tx('Срочный вопрос? Звони',x,y,w,15)+8;for(const [n,ph] of p.a)y=c.tx(n+': '+ph,x,y,w,m?18:22,{b:true})+8;return y+12}
  case 'msgs':{y=c.tx('Или напиши сейчас. Отвечаем за 5 минут',x,y,w,15,{b:true})+12;const n=m||p.a.length>3?Math.min(2,p.a.length):p.a.length,bw=m?w:Math.min(180,(w-(n-1)*GAP)/n);
   p.a.forEach((b,i)=>{const col=m?0:i%n,row=m?i:Math.floor(i/n);c.add('btn',x+col*(bw+GAP),y+row*(52+GAP),m?w:bw,52,b,{fs:15})});
   const rows=m?p.a.length:Math.ceil(p.a.length/n);return y+rows*(52+GAP)+8}
  case 'sign':{y=c.tx('С уважением',x,y,w,14)+4;y=c.tx(p.n,x,y,w,m?18:22,{b:true})+4;return c.tx(p.r,x,y,w,14)+16}
  case 'cases':{y=c.tx('Пока ждёшь звонка, посмотри кейс',x,y,w,m?20:26,{b:true})+16;const row=dev==='desktop',cw=row?(w-24)/2:w,pad=m?16:24,iw=cw-2*pad;let end=y;
   [['Было','Компания тонула среди конкурентов, товар продавался с трудом'],['Стало','Через 3 недели после запуска склад распродан на 100%']].forEach(([a,b],i)=>{const cx=row?x+i*(cw+24):x,top=row?y:end;let yy=top+pad;yy=c.tx(a,cx+pad,yy,iw,18,{b:true})+8;yy=c.tx(b,cx+pad,yy,iw,15)+pad;
    c.els.unshift({...c.els[0],id:c.els[0].id+'cs'+i,t:'rect',x:cx,y:top,w:cw,h:yy-top,text:''} as any);end=row?Math.max(end,yy):yy+GAP});
   if(row){const rs=c.els.filter(e=>e.id.includes('cs')&&e.t==='rect');const H=end-y;rs.forEach(e=>e.h=H)}return end+16}
  case 'back':{const bw=m?w:Math.min(w,320);c.add('btn',x,y,bw,56,p.t,{fs:16,acc:true});return y+56+16}
 }}
const mk=(s:S)=>(dev:Dev):Out=>{const c=ctx(),W=FW[dev],m=dev==='mobile',d=dev==='desktop';
 const X=d?LX:m?20:48,w=d?CW:W-2*X;let y=d?72:m?24:40;
 const run=(a:Pt[],x:number,ww:number,y0:number)=>{let yy=y0;for(const p of a)yy=part(c,p,x,yy,ww,dev);return yy};
 if(d){const pw=440,tw=CW-pw-80,px=s.side==='r'?LX+tw+80:LX,tx=s.side==='r'?LX:LX+pw+80;
  c.add('img',px,y,pw,s.ph,s.photo);const ey=run(s.L,tx,tw,y);y=Math.max(ey,y+s.ph)+16}
 else{const ph=m?200:320;c.add('img',X,y,w,ph,s.photo);y+=ph+20;y=run(s.L,X,w,y)}
 y=run(s.bot,X,w,y);
 if(m){const h=r4(Math.max(780,y+12+80));c.add('rect',0,h-80,W,80);c.add('btn',20,h-80+12,w,56,s.cta,{fs:16,acc:true});return{h,els:c.els}}
 return{h:r4(Math.max(820,y+48)),els:c.els}};

const HRS='Звонок придёт в рабочие часы: с понедельника по пятницу с 9:00 до 20:00 по Москве';
const V1:S={name:'Страница спасибо: основатель и проверка номера',photo:'Фото: основатель',side:'r',ph:600,
L:[{k:'h',t:'Спасибо за доверие. Заявка у менеджера',m:'Спасибо. Заявка принята'},{k:'sub',t:HRS},{k:'check'},{k:'sign',n:'Имя Фамилия',r:'Основатель компании'}],
bot:[{k:'msgs',a:['Telegram','WhatsApp']},{k:'phone',t:'+7 (000) 000-00-00',st:true}],cta:'Ошибся в номере',
tips:['Оценка: берём всегда. Фото основателя, подпись и проверка номера в одном экране: теряется меньше заявок','Подпись с должностью рядом с фото работает как личное обещание перезвонить']};
const V2:S={name:'Страница спасибо: фото и плашка с телефоном',photo:'Фото: директор за столом',side:'l',ph:620,
L:[{k:'h',t:'Спасибо за доверие',m:'Спасибо за доверие'},{k:'sub',t:'Свяжемся в ближайшее время'},{k:'plate',t:HRS,ph:'+7 (000) 000-00-00'},{k:'sign',n:'Имя Фамилия',r:'Директор компании'}],
bot:[],cta:'Позвонить',
tips:['Оценка: подходит, когда заявку обрабатывает небольшая команда и директор виден лично','Плашка с часами и телефоном отвечает на два вопроса сразу: когда позвонят и что делать срочно']};
const V3:S={name:'Страница спасибо: проверка номера',photo:'Фото: менеджер',side:'r',ph:560,
L:[{k:'h',t:'Всё прошло успешно',m:'Всё прошло успешно'},{k:'sub',t:'Для точной цены менеджер задаст несколько вопросов'},{k:'check'}],
bot:[{k:'msgs',a:['Написать в WhatsApp','Написать в Telegram']}],cta:'Ошибся в номере',
tips:['Оценка: подходит для заявок с цифрой в расчёте: окна, ремонт, юристы. Менеджеру нужен верный номер','Поле с номером крупно: ошибку видно сразу, исправление в один клик']};
const V4:S={name:'Страница спасибо: выбор мессенджера',photo:'Фото: основатель с поднятым пальцем',side:'r',ph:560,
L:[{k:'h',t:'Спасибо за доверие',m:'Спасибо за доверие'},{k:'sub',t:'Расчёт готов. Выбери мессенджер и забери его вместе с бонусом'},{k:'msgs',a:['Telegram','Viber','ВКонтакте']},{k:'phone',t:'+7 (000) 000-00-00'}],
bot:[],cta:'Забрать расчёт',
tips:['Оценка: подходит, когда расчёт или подарок можно отдать сразу в чате. Человек выбирает свой канал','Три кнопки одного размера: выбор занимает секунду']};
const V5:S={name:'Страница спасибо: два человека и мессенджеры',photo:'Фото: дуэт',side:'l',ph:560,
L:[{k:'h',t:'Спасибо за доверие',m:'Спасибо за доверие'},{k:'sub',t:'Свяжемся и уточним дату и детали'},{k:'phones',a:[['Анна','+7 (000) 000-00-01'],['Евгений','+7 (000) 000-00-02']]},{k:'msgs',a:['WhatsApp','ВКонтакте']},{k:'note',t:'Среднее время ответа 4 минуты в рабочее время'}],
bot:[],cta:'Написать',
tips:['Оценка: подходит для личных брендов и дуэтов: свадьбы, студии, мастера','Два телефона с именами: человек выбирает, с кем говорить']};
const V6:S={name:'Страница спасибо: руководитель и кейс',photo:'Фото: руководитель',side:'l',ph:520,
L:[{k:'h',t:'Отлично. Заявка уже у нас',m:'Заявка принята'},{k:'sub',t:'Лично или менеджер позвонит в течение рабочего дня с 10:00 до 18:00 по Москве'},{k:'msgs',a:['Написать в WhatsApp']},{k:'sign',n:'Имя Фамилия',r:'Руководитель агентства'}],
bot:[{k:'cases'}],cta:'Написать в WhatsApp',
tips:['Оценка: подходит, когда ожидание звонка можно прогреть. Кейс продаёт, пока человек ждёт','Кейс из двух карточек «было» и «стало»: читается за 10 секунд']};
const V7:S={name:'Страница спасибо: вернуться на сайт',photo:'Фото: основатель в белой футболке',side:'r',ph:560,
L:[{k:'h',t:'Спасибо за оказанное доверие',m:'Спасибо за доверие'},{k:'sub',t:HRS},{k:'phone',t:'8 800 000-00-00'},{k:'back',t:'Вернуться на сайт'},{k:'sign',n:'Имя',r:'Основатель компании'}],
bot:[],cta:'Вернуться на сайт',
tips:['Оценка: подходит для интернет-магазинов и сервисов: после заявки человек идёт смотреть сайт дальше','Одна яркая кнопка «Вернуться на сайт» не даёт закрыть вкладку']};
const ALL=[V1,V2,V3,V4,V5,V6,V7];
export const THANKS:{name:string;cat:string;spec:(d:Dev)=>Out}[]=ALL.map(s=>({name:s.name,cat:CAT,spec:mk(s)}));
const CR=['Фото замени на реальное: живой человек из компании сильнее любой стоковой картинки','Часы работы и телефон поставь настоящие: человек проверит и будет ждать звонок'];
export const THANKS_TIPS:Record<string,string[]>=Object.fromEntries(ALL.map(s=>[s.name,[...s.tips,...CR]]));
