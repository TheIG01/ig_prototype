// Первые экраны: 4 варианта, собранных из 20 лучших референсов по правилам первого экрана автора. Блок идёт ПОСЛЕ шапки (шапка до 10% экрана).
// ПК: ручная раскладка 1440x820. Планшет 768 и мобилка 390 собираются стопкой из одних и тех же частей.
// Мобилка: один блок = один экран телефона, внизу закреплена ОДНА главная кнопка (остальные кнопки блока живут в самом блоке).
import {uid} from './uid';
import {FW} from './dev';
import type {Dev} from './dev';
import type {El,ET} from '../store';
export interface Out{h:number;els:El[]}
/** .el в CSS: Inter 500, line-height 1.3, overflow hidden, текст по центру по вертикали. Высота текста считается по этому правилу */
export const r4=(v:number)=>Math.ceil(v/4)*4;
export const th=(t:string,fs:number,w:number,b=false)=>{const cw=fs*(b?.66:.6);const n=t.split('\n').reduce((a,l)=>{let k=1,cur=0;for(const wd of l.split(' ')){const len=wd.length*cw;if(cur&&cur+cw+len>w){k++;cur=len}else cur+=(cur?cw:0)+len}return a+k},0);return r4(n*fs*1.3)};
export function ctx(){const els:El[]=[];
const add=(t:ET,x:number,y:number,w:number,h:number,text='',more:Partial<El>={})=>{els.push({id:uid(),t,x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h),text,...more})};
const tx=(text:string,x:number,y:number,w:number,fs:number,more:Partial<El>={})=>{fs=Math.max(13,fs);const h=th(text,fs,w,!!more.b);add('text',x,y,w,h,text,{fs,...more});return y+h};
/** плашка: рамка и текст по центру по вертикали (текст внутри рамки, а не в углу) */
const plate=(x:number,y:number,w:number,h:number,text:string,fs=14,b=false,al?:'l'|'c')=>{add('rect',x,y,w,h);add('text',x+16,y+8,w-32,h-16,text,{fs,...(b?{b:true}:{}),...(al?{al}:{})})};
return{els,add,tx,plate}}
export type C=ReturnType<typeof ctx>;

export type Part=
|{k:'h1'|'sub'|'lead'|'note';t:string;mt?:string|null}
|{k:'bul';a:string[];ma?:string[]}
|{k:'cta';t:string;n?:string}
|{k:'cta2';t:string}
|{k:'rate';t:string}
|{k:'logos';t:string}
|{k:'gifts';a:string[]}
|{k:'card';title:string;lines?:string[];inp?:string;btn:string;note?:string}
|{k:'img';t:string}
|{k:'plate';t:string}
|{k:'chips';a:string[]}
|{k:'ben';a:[string,string][]}
|{k:'stats';a:[string,string][]}
|{k:'steps';a:string[]}
|{k:'vid';t:string}
|{k:'two';a:string[]}
|{k:'inps';a:string[]};

const SCR:Record<Dev,number>={desktop:820,tablet:952,mobile:780};
/** стопка для планшета и мобилки: один блок = один экран, на мобилке кнопка закреплена внизу */
function stackS(parts:Part[],dev:Dev,sc:number):Out{const c=ctx();const m=dev==='mobile';const W=FW[dev];const X=m?20:48;const w=W-2*X;let y=m?20:40;let sticky='',stickyN='';
const bw=m?w:Math.min(w,440);
for(const p of parts){
switch(p.k){
case 'h1':y=c.tx(m&&p.mt?p.mt:p.t,X,y,w,m?24:34,{b:true})+12;break;
case 'sub':case 'lead':case 'note':{if(m&&p.mt===null)break;const fs=p.k==='note'?13:m?14:p.k==='sub'?18:16;y=c.tx(m&&p.mt?p.mt:p.t,X,y,w,fs)+(m?10:14);break}
case 'bul':{const a=m&&p.ma?p.ma:p.a;for(const l of a)y=c.tx('✓ '+l,X,y,w,m?14:16)+(m?6:8);y+=m?4:6;break}
case 'cta':if(m){sticky=p.t;stickyN=p.n??''}else{c.add('btn',X,y,bw,56,p.t,{fs:16,acc:true});y+=56+(p.n?8:14);if(p.n)y=c.tx(p.n,X,y,bw,13)+12}break;
case 'cta2':{const bh=m?48:52;c.add('btn',X,y,bw,bh,p.t,{fs:15});y+=bh+12;break}
case 'rate':y=c.tx(p.t,X,y,w,m?14:15,{b:true})+(m?8:10);break;
case 'logos':{const n=m?3:4,g=10,lw=(w-(n-1)*g)/n,lh=m?36:44;y=c.tx(p.t,X,y,w,13,{b:true})+6;for(let i=0;i<n;i++)c.add('img',X+i*(lw+g),y,lw,lh,'Лого '+(i+1));y+=lh+12;break}
case 'gifts':{if(m){y=c.tx('Подарки: '+p.a.join(' · '),X,y,w,13,{b:true})+8;break}const n=p.a.length,g=12,gw=(w-(n-1)*g)/n;p.a.forEach((a,i)=>{const x0=X+i*(gw+g);c.add('rect',x0,y,gw,64);c.add('img',x0+12,y+16,32,32,'Иконка');c.add('text',x0+56,y+8,gw-68,48,a,{fs:14,b:true})});y+=64+12;break}
case 'img':{const ih=m?Math.round(176*sc):152;c.add('img',X,y,w,ih,p.t);y+=ih+12;break}
case 'plate':{const ph=m?48:56;c.plate(X,y,m?w:Math.min(w,400),ph,p.t,14,true);y+=ph+12;break}
case 'chips':{if(m){y=c.tx(p.a.join(' · '),X,y,w,14,{b:true})+10}else{const g=12,cw=(w-2*g)/3;p.a.forEach((a,i)=>c.plate(X+i*(cw+g),y,cw,64,a,14,true,'c'));y+=64+12}break}
case 'card':{const pad=m?16:24,iw=w-2*pad;const top=y;let yy=y+pad;
yy=c.tx(p.title,X+pad,yy,iw,m?18:22,{b:true})+6;
for(const l of p.lines??[])yy=c.tx(l,X+pad,yy,iw,m?14:16)+4;
yy+=8;
if(p.inp){c.add('input',X+pad,yy,iw,m?48:56,p.inp);yy+=(m?48:56)+10}
if(m)sticky=p.btn;else{c.add('btn',X+pad,yy,Math.min(iw,400),56,p.btn,{fs:16,acc:true});yy+=56+10}
if(p.note)yy=c.tx(p.note,X+pad,yy,iw,12)+2;
const ch=r4(yy-top+pad-8);c.els.unshift({id:uid(),t:'rect',x:X,y:top,w,h:ch,text:''});y=top+ch+12;break}
case 'stats':{const per=m?2:p.a.length,g=m?10:12,tw=(w-(per-1)*g)/per;for(let i=0;i<p.a.length;i+=per){const row=p.a.slice(i,i+per);const hh=r4(Math.max(...row.map(([b,t])=>8+th(b,18,tw-16,true)+2+th(t,13,tw-16)+8)));row.forEach(([b,t],j)=>{const x0=X+j*(tw+g);c.add('rect',x0,y,tw,hh);const yy=c.tx(b,x0+8,y+8,tw-16,18,{b:true});c.tx(t,x0+8,yy+2,tw-16,13)});y+=hh+g}y+=2;break}
case 'steps':{if(m){y=c.tx(p.a.map((a,i)=>(i+1)+'. '+a).join('   '),X,y,w,14,{b:true})+10;break}const n=p.a.length,g=12,tw=(w-(n-1)*g)/n;p.a.forEach((a,i)=>c.plate(X+i*(tw+g),y,tw,72,(i+1)+'. '+a,14,true,'c'));y+=72+12;break}
case 'vid':{const vh=m?Math.round(200*sc):320;c.add('img',X,y,w,vh,p.t);c.add('rect',X+(w-56)/2,y+(vh-56)/2,56,56,'▶',{fs:20,al:'c'});y+=vh+12;break}
case 'two':{const g=12,tw=(w-g)/2,ih=m?Math.round(200*sc):320;p.a.forEach((a,i)=>c.add('img',X+i*(tw+g),y,tw,ih,a));y+=ih+12;break}
case 'inps':{const per=m?1:2,g=10,tw=(w-(per-1)*g)/per,ih=m?48:52;p.a.forEach((a,i)=>c.add('input',X+(i%per)*(tw+g),y+Math.floor(i/per)*(ih+g),tw,ih,a));y+=Math.ceil(p.a.length/per)*(ih+g)+2;break}
case 'ben':{if(m){y=c.tx(p.a.map(a=>a[0]).join(' · '),X,y,w,13,{b:true})+8;break}
for(const [t,d] of p.a){const ic=40,tw=w-(ic+44);const ty=th(t,16,tw,true),dy=th(d,14,tw);const hh=r4(Math.max(72,16+ty+4+dy+16));
c.add('rect',X,y,w,hh);c.add('img',X+16,y+(hh-ic)/2,ic,ic,'Иконка');
let y0=y+(hh-(ty+4+dy))/2;y0=c.tx(t,X+16+ic+12,y0,tw,16,{b:true})+4;c.tx(d,X+16+ic+12,y0,tw,14);y+=hh+10}break}
}}
let h=0;
if(m){const bh=88;h=Math.max(SCR.mobile,r4(y+8+bh));const by=h-bh;
c.add('rect',0,by,W,bh);c.add('text',X,by+6,w,20,stickyN?'Закреплено внизу · '+stickyN:'Закреплено внизу экрана',{fs:13});
c.add('btn',X,by+28,w,52,sticky,{fs:15,acc:true})}
else h=Math.max(SCR[dev],r4(y+40));
return{h,els:c.els}}

/** мобилка: если стопка выше экрана телефона, фото и видео уменьшаются, пока первый экран не влезет в 100svh */
export function stack(parts:Part[],dev:Dev):Out{if(dev!=='mobile')return stackS(parts,dev,1);let o=stackS(parts,dev,1);for(const sc of [.8,.62,.48]){if(o.h<=SCR.mobile)break;o=stackS(parts,dev,sc)}return o}

/** ---- тексты: формула «ключевое слово + выгода 1 + выгода 2 + скидка в рублях», одно предложение без запятых, 10–20 слов ---- */
const H1='Композитные бассейны «под ключ» напрямую от производителя со скидкой 64 000 руб.';
const SUB='Фиксируем цену в договоре и сдаём объект в срок или платим неустойку';
const BUL=['Гарантия 25 лет и постгарантийное обслуживание','Подбор оборудования от 10 производителей под бюджет проекта','Сервис после сдачи и обучение правильной эксплуатации','Более 420 построенных объектов за 12 лет работы'];
const BULM=['Гарантия 25 лет и сервис','Оборудование под бюджет проекта','Обучение эксплуатации после сдачи','420+ объектов за 12 лет'];
const LEAD='Пройдите тест за 1 минуту: узнайте стоимость бассейна под параметры бассейна и получите чек-лист «Как сэкономить до 40%»';
const LEADM='Тест 1 минута: узнайте полную стоимость + получите чек-лист «Как сэкономить до 40%»';
const CTAT='Рассчитать стоимость + получить чек-лист';
const NOTE='Тест занимает 1 минуту. Телефон нужен только в конце';
const BEN:[string,string][]=[
['Рассрочка 0% на 12 месяцев','Одобрение за 2 минуты, без скрытых комиссий'],
['Цена фиксируется в договоре','Смета остаётся прежней: разницу доплачиваем мы'],
['Бесплатный выезд замерщика','Приедем за 2 дня и рассчитаем точную смету']];
const PHOTO='Фото: готовый бассейн во дворе дома, рядом счастливая семья';
const LX=120,LW=740;
/** три плашки доп. выгод внизу ПК-экрана: иконка, заголовок, текст */
function bens(c:C,y:number,a:[string,string][]){const g=24,cw=(1200-2*g)/3;a.forEach(([t,d],i)=>{const x=LX+i*(cw+g);c.add('rect',x,y,cw,148);c.add('img',x+24,y+30,56,56,'Иконка');const ty=c.tx(t,x+96,y+30,cw-120,16,{b:true})+6;c.tx(d,x+96,ty,cw-120,14)})}
const bullets=(c:C,y:number,a:string[],w=LW)=>{for(const l of a)y=c.tx('✓ '+l,LX,y,w,18)+10;return y+6};

const quizD=():Out=>{const c=ctx();let y=48;
y=c.tx(H1,LX,y,LW,40,{b:true})+14;
y=c.tx(SUB,LX,y,LW,18)+18;
y=bullets(c,y,BUL);
y=c.tx(LEAD,LX,y,LW,16)+16;
c.add('btn',LX,y,520,64,CTAT,{fs:18,acc:true});y+=64+8;
c.tx(NOTE,LX,y,690,14);
c.add('img',880,32,440,560,PHOTO);
c.plate(884,480,260,80,'Рассрочка 0% на 12 месяцев',14,true);
bens(c,628,BEN);
return{h:SCR.desktop,els:c.els}};
const quizM:Part[]=[{k:'h1',t:H1},{k:'bul',a:BUL,ma:BULM},{k:'lead',t:LEAD,mt:LEADM},{k:'img',t:PHOTO},{k:'ben',a:BEN},{k:'cta',t:CTAT}];

const FT='Получите расчёт стоимости бассейна + чек-лист';
const formD=():Out=>{const c=ctx();let y=48;
y=c.tx(H1,LX,y,LW,40,{b:true})+14;
y=c.tx(SUB,LX,y,LW,18)+18;
y=bullets(c,y,BUL.slice(0,3));
const top=y,cw=760;c.add('rect',LX,top,cw,216);
let yy=c.tx(FT,LX+24,top+24,cw-48,22,{b:true})+8;
yy=c.tx('Чек-лист «Как сэкономить до 40% на установке бассейна» в подарок',LX+24,yy,cw-48,16,{b:true})+14;
c.add('input',LX+24,yy,380,56,'Введите телефон');
c.add('btn',LX+420,yy,316,56,'Получить расчёт стоимости + чек-лист',{fs:14,acc:true});yy+=56+10;
c.tx('☐ Я принимаю условия передачи данных',LX+24,yy,cw-48,12);
c.add('img',920,32,400,560,PHOTO);
c.plate(884,top+16,220,80,'Подарок действует до конца дня',14,true);
bens(c,628,BEN);
return{h:SCR.desktop,els:c.els}};
const formM:Part[]=[{k:'h1',t:H1},{k:'card',title:FT,lines:['+ чек-лист «Как сэкономить до 40%» в подарок'],inp:'Введите телефон',btn:'Получить расчёт стоимости + чек-лист',note:'☐ Я принимаю условия передачи данных'},{k:'plate',t:'Подарок действует до конца дня'},{k:'ben',a:BEN}];

const segH='Офисные перегородки «под ключ» напрямую от производителя со скидкой 85 000 руб.';
const segD=():Out=>{const c=ctx();let y=48;
y=c.tx(segH,170,y,1100,40,{b:true,al:'c'})+14;
y=c.tx('Фиксируем цену в договоре и монтируем за 7 дней или платим неустойку',270,y,900,18,{al:'c'})+20;
['Для офисов и бизнес-центров','Для банков, клиник и салонов','Для частных заказчиков'].forEach((s,i)=>c.plate(LX+i*408,y,384,72,s,16,true,'c'));y+=72+20;
y=c.tx('Пройдите тест за 1 минуту и узнайте полную стоимость по параметрам бассейна + получите каталог решений с ценами',220,y,1000,16,{al:'c'})+16;
c.add('btn',290,y,420,64,'Рассчитать стоимость + получить каталог',{fs:16,acc:true});
c.add('btn',730,y,420,64,'Бесплатная консультация специалиста',{fs:16});y+=64+10;
y=c.tx('Бесплатно и без обязательств',LX,y,1200,14,{al:'c'})+16;
c.plate(348,y,360,64,'Работаем с 2014 года, более 6000 объектов',14,true,'c');c.plate(732,y,360,64,'Сертификаты и гарантия 5 лет',14,true,'c');
bens(c,628,BEN);
return{h:SCR.desktop,els:c.els}};
const segM:Part[]=[{k:'h1',t:segH},{k:'chips',a:['Для офисов','Для клиник и банков','Для частных заказчиков']},{k:'sub',t:'Фиксируем цену в договоре и монтируем за 7 дней',mt:'Цена в договоре, монтаж за 7 дней'},{k:'plate',t:'Работаем с 2014 года, 6000+ объектов'},{k:'ben',a:BEN},{k:'cta',t:'Рассчитать стоимость + каталог'}];

const listH='Бурение скважин «под ключ» за 1 день с гарантией 5 лет и экономией до 45 000 руб.';
const LB=['Бурение за 1 день по ГОСТ и СНиП','Гарантия на работы 5 лет и оплата за результат','Скважина служит более 50 лет','Собственная техника без посредников'];
const listD=():Out=>{const c=ctx();let y=48;
y=c.tx(listH,LX,y,LW,40,{b:true})+14;
y=c.tx('Анализ воды и обустройство включены в цену',LX,y,LW,18)+18;
y=bullets(c,y,LB);
c.add('btn',LX,y,420,64,'Рассчитать стоимость + получить смету',{fs:16,acc:true});
c.add('img',LX+444,y+4,56,56,'Фото');c.tx('Получите консультацию инженера за 10 минут',LX+516,y+8,230,14,{b:true});
c.add('img',880,32,440,500,'Фото: техника на объекте или чистая вода из крана');
const cw=(1200-48)/3;[['Полный комплекс работ в одной компании','✓ все виды бурения\n✓ обустройство и анализ воды'],['Без переплат и посредников','✓ собственный парк техники\n✓ штатные специалисты'],['Долгий срок службы скважины','✓ стабильный напор\n✓ вода без песка и примесей']].forEach(([t,d],i)=>{const x=LX+i*(cw+24);c.add('rect',x,560,cw,236);c.add('img',x+16,576,cw-32,88,'Фото');const ty=c.tx(t,x+16,676,cw-32,16,{b:true})+6;c.tx(d,x+16,ty,cw-32,14)});
return{h:SCR.desktop,els:c.els}};
const listM:Part[]=[{k:'h1',t:listH},{k:'bul',a:LB,ma:['За 1 день по ГОСТ и СНиП','Гарантия 5 лет','Служит более 50 лет']},{k:'img',t:'Фото: техника на объекте'},{k:'ben',a:[['Полный комплекс работ',''],['Без переплат и посредников',''],['Долгий срок службы','']]},{k:'cta',t:'Рассчитать стоимость + смету'}];

const mk=(d:()=>Out,m:Part[])=>(dev:Dev):Out=>dev==='desktop'?d():stack(m,dev);
export const FIRST:{name:string;cat:string;spec:(d:Dev)=>Out}[]=[
{name:'1 экран',cat:'Первый экран',spec:mk(quizD,quizM)},
{name:'1 экран: форма',cat:'Первый экран',spec:mk(formD,formM)},
{name:'1 экран: сегменты',cat:'Первый экран',spec:mk(segD,segM)},
{name:'1 экран: список',cat:'Первый экран',spec:mk(listD,listM)}];
const RULES=['Формула заголовка: ключевое слово + выгода 1 + выгода 2 + скидка в рублях, одно предложение без запятых, 10–20 слов','Первый экран отвечает на 6 вопросов: куда попал, то ли это, что мне даст, новое ли, можно ли доверять, что делать дальше','70% посетителей не доходят до второго экрана: каждый пиксель либо продаёт, либо пустой','Скидку или экономию в рублях потом обоснуй на лендинге'];
export const FIRST_TIPS:Record<string,string[]>={
'1 экран':[...RULES,'Лучший по конверсии: квиз вместо формы, телефон просим в конце','Кнопка обещает расчёт и подарок, а не «Оставить заявку»','4 буллета: гарантия, подбор под бюджет, сервис, цифры опыта','Три плашки внизу закрывают возражения: рассрочка, цена в договоре, бесплатный замер','Фото показывает результат, который получает клиент','Мобилка: один экран, кнопка и мессенджеры закреплены внизу'],
'1 экран: форма':[...RULES,'Когда нужна быстрая заявка: срочные услуги, ремонт, клиника','Одно поле: телефон. Подсказка над полем, галочка согласия под ним','Текст кнопки совпадает с заголовком формы и содержит подарок','Подарок за заявку и срок его действия повышают срочность'],
'1 экран: сегменты':[...RULES,'Когда у компании несколько аудиторий: бизнес, госзаказ, частные клиенты','Три плашки «для кого» сразу показывают человеку, что это про него','Две кнопки: главная (расчёт) и тихая (консультация)','Доверие рядом с кнопками: стаж, количество объектов, сертификаты'],
'1 экран: список':[...RULES,'Когда услуга понятна и важна цена: бурение, установка, строительство','Цена или экономия в заголовке отсекают неподходящих клиентов','Рядом с кнопкой лицо специалиста и «Получите консультацию»','Три карточки с фото внизу доказывают масштаб и закрывают возражения']};
