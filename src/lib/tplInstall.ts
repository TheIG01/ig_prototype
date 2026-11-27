// Рассрочка: 7 вариантов по разбору 9 референсов (docs/refs/install.md). Заголовок с выгодой (платёж в месяц, 0%, срок), под ним условия, банки-партнёры и одна главная кнопка.
// ПК 1440 (колонка 1200, высота по содержимому, не меньше 820), планшет 768 и мобилка 390 строятся стопкой: на мобилке внизу закреплена одна кнопка.
// Все элементы обычные (текст, рамка, кнопка, поле, картинка): правится каждая деталь. Тексты по copywriting.md: без «не/нет/ни», «любой», «вы/ваш», «!».
import {ctx,th,r4} from './tplFirst';
import type {C,Out} from './tplFirst';
import {FW} from './dev';
import type {Dev} from './dev';

const LX=120,CW=1200,CAT='Рассрочка';
type Pt=
|{k:'h'|'sub'|'note';t:string;m?:string}
|{k:'ben';a:[string,string][]}
|{k:'bul';a:string[]}
|{k:'img';t:string;h:number}
|{k:'logos';a:string[];cols:number}
|{k:'stats';a:[string,string][]}
|{k:'cards';a:{tag:string;t:string;pts:string[];btn:string;img?:string}[]}
|{k:'inp';t:string}
|{k:'cta';t:string}
|{k:'msg';t:string}
|{k:'card';t:string;logos:string[];list:string[]};
interface S{name:string;h:string;hm?:string;top:Pt[];L:Pt[];R:Pt[];bot:Pt[];cta:string;tips:string[]}

const BANKS=['Сбербанк','Т-Банк','Альфа-Банк','ВТБ','Почта Банк','Газпромбанк','Совкомбанк'];
const GAP=16;
/** рисует одну часть, возвращает y под ней. al: по центру */
function part(c:C,p:Pt,x:number,y:number,w:number,dev:Dev,al?:'c'):number{
 const m=dev==='mobile',t=dev==='tablet',a=al?{al:'c' as const}:{};
 switch(p.k){
 case 'h':return c.tx(m&&p.m?p.m:p.t,x,y,w,m?24:t?30:36,{b:true,...a})+12;
 case 'sub':return c.tx(m&&p.m?p.m:p.t,x,y,w,m?15:18,a)+24;
 case 'note':return c.tx(p.t,x,y,w,13,a)+12;
 case 'ben':for(const [h,d] of p.a){c.add('img',x,y,32,32,'Иконка');const tw=w-48;const hh=c.tx(h,x+48,y,tw,16,{b:true})+4;y=Math.max(c.tx(d,x+48,hh,tw,14),y+32)+24}return y;
 case 'bul':for(const l of p.a)y=c.tx('✓ '+l,x,y,w,m?14:16)+8;return y+16;
 case 'img':c.add('img',x,y,w,p.h,p.t);return y+p.h+24;
 case 'logos':{const n=m?2:p.cols,lw=(w-(n-1)*GAP)/n,lh=m?48:64;p.a.forEach((b,i)=>c.add('img',x+(i%n)*(lw+GAP),y+Math.floor(i/n)*(lh+GAP),lw,lh,b));return y+Math.ceil(p.a.length/n)*(lh+GAP)+8}
 case 'stats':{const n=m?2:4,cw=(w-(n-1)*GAP)/n,hh=96;p.a.forEach(([v,l],i)=>{const cx=x+(i%n)*(cw+GAP),cy=y+Math.floor(i/n)*(hh+GAP);c.add('rect',cx,cy,cw,hh);c.add('text',cx+12,cy+12,cw-24,32,v,{fs:dev==='desktop'?24:18,b:true,al:'c'});c.add('text',cx+12,cy+52,cw-24,32,l,{fs:14,al:'c'})});return y+Math.ceil(p.a.length/n)*(hh+GAP)+8}
 case 'cards':{const n=p.a.length,row=dev==='desktop',cw=row?(w-(n-1)*24)/n:w,pad=m?16:24,iw=cw-2*pad;let end=y;
  p.a.forEach((q,i)=>{const cx=row?x+i*(cw+24):x;let yy=(row?y:end)+pad;const top=yy-pad;
   c.add('text',cx+pad,yy,iw,20,q.tag,{fs:13,b:true});yy+=28;
   yy=c.tx(q.t,cx+pad,yy,iw,m?20:24,{b:true})+12;
   for(const l of q.pts)yy=c.tx('✓ '+l,cx+pad,yy,iw,m?14:16)+8;
   yy+=8;if(q.img){const ih=m?120:row?160:140;c.add('img',cx+pad,yy,iw,ih,q.img);yy+=ih+16}
   c.add('btn',cx+pad,yy,iw,52,q.btn,{fs:15,...(i===0?{acc:true}:{})});yy+=52+pad;
   c.els.unshift({...c.els[0],id:c.els[0].id+'r'+i,t:'rect',x:cx,y:top,w:cw,h:yy-top,text:''} as any);
   if(row)end=Math.max(end,yy);else end=yy+GAP});
  if(row){const H=end-y;c.els.filter(e=>e.id.includes('r')&&e.t==='rect'&&e.y===y).forEach(e=>e.h=H)}
  return end+(row?24:8)}
 case 'inp':c.add('input',x,y,w,56,p.t);return y+56+12;
 case 'cta':{const bw=m?w:Math.min(w,400);c.add('btn',x+(al&&!m?(w-bw)/2:0),y,bw,56,p.t,{fs:16,acc:true});return y+56+16}
 case 'msg':c.add('img',x,y,44,44,'Мессенджер');c.tx(p.t,x+60,y+4,w-60,14);return y+44+16;
 case 'card':{const pad=m?16:24,iw=w-2*pad;let yy=y+pad;const n=m?2:3,lw=(iw-(n-1)*GAP)/n,lh=48;
  p.logos.forEach((b,i)=>c.add('img',x+pad+(i%n)*(lw+GAP),yy+Math.floor(i/n)*(lh+GAP),lw,lh,b));yy+=Math.ceil(p.logos.length/n)*(lh+GAP)+8;
  yy=c.tx('Способы оплаты:',x+pad,yy,iw,16,{b:true})+8;for(const l of p.list)yy=c.tx('• '+l,x+pad,yy,iw,14)+4;yy+=pad-4;
  c.els.unshift({...c.els[0],id:c.els[0].id+'cd',t:'rect',x,y,w,h:yy-y,text:''} as any);return yy+8}
 }}
const mk=(s:S)=>(dev:Dev):Out=>{const c=ctx(),W=FW[dev],m=dev==='mobile',d=dev==='desktop';
 const X=d?LX:m?20:48,w=d?CW:W-2*X;let y=d?72:m?24:40;
 const all=(a:Pt[],al?:'c')=>{for(const p of a)y=part(c,p,X,y,w,dev,al)};
 if(!d){all(s.top,'c'.slice(0,0) as any);all(s.L);all(s.R);all(s.bot)}
 else{all(s.top,'c');const colW=(CW-80)/2,y0=y;let yl=y0,yr=y0;
  if(s.L.length){y=y0;for(const p of s.L)y=part(c,p,LX,y,colW,dev);yl=y}
  if(s.R.length){y=y0;for(const p of s.R)y=part(c,p,LX+colW+80,y,colW,dev);yr=y}
  y=Math.max(yl,yr);all(s.bot,'c')}
 if(m){const h=r4(Math.max(780,y+12+80));c.add('rect',0,h-80,W,80);c.add('btn',20,h-80+12,w,56,s.cta,{fs:16,acc:true});return{h,els:c.els}}
 return{h:r4(Math.max(820,y+48)),els:c.els}};

const V1:S={name:'Рассрочка: график платежей и три условия',h:'',top:[{k:'h',t:'Рассрочка на строительство водоёма до 6 месяцев',m:'Рассрочка до 6 месяцев'},{k:'sub',t:'Платёж подбираем под твой бюджет, цена фиксируется в договоре'}],
L:[{k:'img',t:'Фото: график платежей',h:380}],
R:[{k:'ben',a:[['Рассрочку даёт компания','Без банков, анкет и справок о доходе'],['График платежей под тебя','Делим сумму так, как удобно твоему бюджету'],['Оплата по этапам','Крупные проекты оплачиваешь по мере готовности работ']]},{k:'cta',t:'Рассчитать платёж'}],bot:[],cta:'Рассчитать платёж',
tips:['Оценка: подходит, когда компания даёт рассрочку сама, без банка. Три условия снимают главный страх: сложное оформление','Картинка с графиком платежей слева показывает, как будет выглядеть оплата. Три условия справа читаются за 5 секунд']};
const V2:S={name:'Рассрочка: два способа оплаты',h:'',top:[{k:'h',t:'Цена из договора остаётся прежней',m:'Цена из договора остаётся прежней'},{k:'sub',t:'Выбери удобный способ оплаты'}],L:[],R:[],
bot:[{k:'cards',a:[{tag:'Рассрочка',t:'Рассрочка 0% до 36 месяцев',pts:['Платёж от 2 900 ₽ в месяц','Решение банка за 1 день'],btn:'Оформить рассрочку',img:'Фото: договор и карта'},{tag:'Этапы',t:'Оплата частями по этапам',pts:['Платишь по мере выполнения работ','Первый платёж после замера'],btn:'Выбрать этапы',img:'Фото: мастер за работой'}]}],cta:'Оформить рассрочку',
tips:['Оценка: подходит, когда у клиента два пути оплаты и надо выбрать один. Карточки рядом сравниваются без прокрутки','Главная кнопка у первой карточки: рассрочка приводит больше заявок']};
const V3:S={name:'Рассрочка: банки-партнёры',h:'',top:[{k:'h',t:'Работаем с банками и дарим рассрочку без переплаты',m:'Рассрочка без переплаты'},{k:'sub',t:'Рассрочка 0%, решение банка за 1 день'}],L:[],R:[],
bot:[{k:'logos',a:BANKS.slice(0,4),cols:4},{k:'cta',t:'Узнать подробности'}],cta:'Узнать подробности',
tips:['Оценка: подходит, когда логотипы банков важнее подробностей. Короткий блок для середины страницы','Логотипы одного размера в один ряд: знакомые бренды работают как знак доверия']};
const V4:S={name:'Рассрочка: банки и условия',h:'',top:[{k:'h',t:'Аккредитованы в 7 банках, платежи защищены эскроу-счётом',m:'Аккредитованы в 7 банках'}],
L:[{k:'logos',a:BANKS,cols:3}],R:[{k:'ben',a:[['Собираем документы','Подаём заявку в банк за тебя'],['Предодобрение за 24 часа','Заявка подаётся онлайн, поездка в банк лишняя']]}],
bot:[{k:'stats',a:[['от 6 млн ₽','сумма кредита'],['от 20%','первый взнос'],['от 6%','ставка'],['до 30 лет','срок']]},{k:'cta',t:'Узнать подробности'}],cta:'Узнать подробности',
tips:['Оценка: подходит для крупных покупок с ипотекой или кредитом: дом, ремонт, оборудование','Четыре цифры в одном ряду отвечают на главные вопросы до звонка: сумма, взнос, ставка, срок']};
const V5:S={name:'Рассрочка: платёж в месяц и форма',h:'',top:[],
L:[{k:'h',t:'Рассрочка 0% от 2 042 ₽ в месяц',m:'Рассрочка 0% от 2 042 ₽ в месяц'},{k:'bul',a:['Все проценты берём на себя','Одобряем 7 из 10 заявок','Оформление за 15 минут']},{k:'inp',t:'Введи телефон'},{k:'cta',t:'Заполнить анкету'},{k:'msg',t:'Отдел заботы отвечает в Telegram за 5 минут'}],
R:[{k:'card',t:'',logos:BANKS.slice(0,6),list:['рассрочка 0%, на 6, 10, 12, 24 месяца','оплата на сайте за 1 минуту','частичная оплата','оплата картой']}],bot:[],cta:'Заполнить анкету',
tips:['Оценка: подходит для сильного оффера «от N ₽ в месяц». Цена в заголовке, форма и кнопка видны сразу','Справа банки и способы оплаты: человек видит, что варианты есть, и оставляет телефон']};
const V6:S={name:'Рассрочка: два предложения',h:'',top:[{k:'h',t:'Позаботимся о бюджете',m:'Позаботимся о бюджете'},{k:'sub',t:'Выбери выгодное предложение месяца'}],L:[],R:[],
bot:[{k:'cards',a:[{tag:'Рассрочка',t:'Рассрочка 0% на 3 месяца',pts:['Оформление за 15 минут','Дома или в офисе','Оплата картой или наличными'],btn:'Оставить заявку',img:'Фото: 0%'},{tag:'Скидка',t:'Скидка 7% для пенсионеров и многодетных семей',pts:['Оформление за 15 минут','Оплата картой или наличными'],btn:'Оставить заявку',img:'Фото: скидка'}]}],cta:'Оставить заявку',
tips:['Оценка: подходит для акций месяца: рассрочка и скидка рядом, клиент выбирает свою выгоду','Метка в углу карточки задаёт тип предложения до чтения заголовка']};
const V7:S={name:'Рассрочка: эксперт и консультация',h:'',top:[],
L:[{k:'img',t:'Фото: менеджер с рулеткой',h:480}],
R:[{k:'h',t:'Оформи заказ в рассрочку на 12 месяцев без процентов',m:'Рассрочка на 12 месяцев без процентов'},{k:'sub',t:'Оформление занимает 5 минут после замера'},{k:'bul',a:['Первый платёж после замера','Ставка 0%, переплата 0 ₽','Кредит на срок до 3 лет']},{k:'cta',t:'Настроить рассрочку за 5 шагов'},{k:'msg',t:'Бесплатная консультация специалиста, аккредитованного банком'}],bot:[],cta:'Настроить рассрочку',
tips:['Оценка: подходит, когда решает доверие к человеку: замерщик, менеджер, консультант','Фото эксперта слева, условия справа, консультация под кнопкой снимает сомнения']};
const ALL=[V1,V2,V3,V4,V5,V6,V7];
export const INSTALL:{name:string;cat:string;spec:(d:Dev)=>Out}[]=ALL.map(s=>({name:s.name,cat:CAT,spec:mk(s)}));
const CR=['Платёж в месяц и срок пиши цифрами: «от 2 900 ₽» убеждает сильнее, чем «выгодно»','Логотипы банков замени на настоящие, условия на реальные: выдуманные цифры отпугивают'];
export const INSTALL_TIPS:Record<string,string[]>=Object.fromEntries(ALL.map(s=>[s.name,[...s.tips,...CR]]));
