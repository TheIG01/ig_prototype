// Адреса: 7 вариантов по разбору 15 референсов (docs/refs/address.md). Карта-плейсхолдер, карточка с адресом, режимом и телефоном, одна главная кнопка.
// ПК 1440 (колонка 1200), планшет 768 и мобилка 390 строятся стопкой: сначала карточка, под ней карта. На мобилке внизу закреплена одна кнопка.
// Все элементы обычные (текст, рамка, кнопка, поле, картинка): правится каждая деталь. Тексты по copywriting.md: без «не/нет/ни», «любой», «вы/ваш», «!».
import {ctx,th,r4} from './tplFirst';
import type {C,Out} from './tplFirst';
import {FW} from './dev';
import type {Dev} from './dev';

const LX=120,CW=1200,CAT='Адреса',MAP='Карта: отметь точку офиса';
type Row=[string,string];
interface K{t:string;sub?:string;rs?:Row[];img?:string;ih?:number;inp?:string;btn?:string;note?:string;al?:'c';big?:boolean;mh?:number}

const sz=(dev:Dev)=>{const m=dev==='mobile',t=dev==='tablet',d=dev==='desktop',W=FW[dev],X=d?LX:m?20:48;return{m,t,d,W,X,w:d?CW:W-2*X}};
const Y0=(dev:Dev)=>dev==='desktop'?72:dev==='mobile'?24:40;

/** заголовок и подзаголовок; ctr: по центру на ПК. Возвращает y под ними */
function head(c:C,dev:Dev,y:number,h:string,s:string,hm:string,ctr:boolean):number{
 const{m,t,d,X,w}=sz(dev),a=d&&ctr?{al:'c' as const}:{};
 y=c.tx(m?hm:h,X,y,w,m?24:t?30:36,{b:true,...a})+12;
 return c.tx(s,X,y,w,m?15:18,a)+24}
/** пары «подпись + значение» */
function rows(c:C,x:number,y:number,w:number,rs:Row[],m:boolean,al?:'c'):number{
 const a=al?{al}:{};for(const[l,v]of rs){y=c.tx(l,x,y,w,13,{b:true,...a})+2;y=c.tx(v,x,y,w,m?15:16,a)+12}return y}
/** белая карточка (рамка под содержимым). Возвращает высоту */
function card(c:C,x:number,y:number,w:number,dev:Dev,o:K):number{
 const m=dev==='mobile',pad=m?16:24,iw=w-2*pad,a=o.al?{al:o.al}:{},bh=m?48:52,i0=c.els.length;let yy=y+pad;
 yy=c.tx(o.t,x+pad,yy,iw,m?18:o.big?24:20,{b:true,...a})+12;
 if(o.sub)yy=c.tx(o.sub,x+pad,yy,iw,14,a)+12;
 if(o.rs)yy=rows(c,x+pad,yy,iw,o.rs,m,o.al);
 if(o.img){const ih=o.ih??112;c.add('img',x+pad,yy,iw,ih,o.img);yy+=ih+12}
 if(o.inp){c.add('input',x+pad,yy,iw,bh,o.inp);yy+=bh+12}
 if(o.btn){c.add('btn',x+pad,yy,iw,bh,o.btn,{fs:15,acc:true});yy+=bh+12}
 if(o.note)yy=c.tx(o.note,x+pad,yy,iw,13,a)+12;
 const H=Math.max(r4(yy-y+pad-12),o.mh??0);
 c.add('rect',x,y,w,H,'',{fill:'#fff'});const r=c.els.pop();if(r)c.els.splice(i0,0,r);return H}
/** высота карточки без отрисовки */
const hc=(w:number,dev:Dev,o:K)=>card(ctx(),0,0,w,dev,o);
/** главная кнопка блока: на ПК и планшете в потоке, на мобилке её рисует fin */
function ctaB(c:C,dev:Dev,y:number,t:string,ctr:boolean):number{
 const{m,d,X,w}=sz(dev);if(m)return y;const bw=d?Math.min(w,400):w;
 c.add('btn',X+(d&&ctr?(w-bw)/2:0),y,bw,56,t,{fs:16,acc:true});return y+56+16}
/** итог: на мобилке один экран и закреплённая кнопка внизу (t пусто: кнопки нет) */
function fin(c:C,dev:Dev,y:number,t:string):Out{
 const{m,W,X,w,d}=sz(dev);
 if(m&&t){const h=r4(Math.max(780,y+12+80));c.add('rect',0,h-80,W,80,'',{fill:'#fff'});c.add('btn',X,h-80+12,w,56,t,{fs:16,acc:true});return{h,els:c.els}}
 return{h:r4(Math.max(m?780:d?640:0,y+(m?24:48))),els:c.els}}
const tail=(c:C,dev:Dev,y:number,t:string,ctr=true)=>fin(c,dev,ctaB(c,dev,y,t,ctr),t);
const map=(c:C,x:number,y:number,w:number,h:number,s=MAP)=>c.add('img',x,y,w,h,s);

/** три выгоды в ряд (ПК) или столбиком (планшет), на мобилке пропускаются */
function benRow(c:C,dev:Dev,y:number,a:Row[]):number{
 const{m,d,X,w}=sz(dev);if(m)return y;const g=48,cw=(w-(a.length-1)*g)/a.length;
 if(d){let end=y;a.forEach(([h,s],i)=>{const x=X+i*(cw+g);c.add('img',x,y,32,32,'Иконка');const hh=c.tx(h,x+48,y,cw-48,16,{b:true})+4;end=Math.max(end,c.tx(s,x+48,hh,cw-48,14),y+32)});return end+24}
 for(const[h,s]of a){c.add('img',X,y,32,32,'Иконка');const hh=c.tx(h,X+48,y,w-48,16,{b:true})+4;y=Math.max(c.tx(s,X+48,hh,w-48,14),y+32)+16}return y+8}

// 1. лучший: заголовок, три выгоды, карта с карточкой офиса, кнопка записи
const BEN1:Row[]=[['Смету и план работ','Считаем стоимость по этапам на встрече'],['Варианты оплаты','Подбираем рассрочку или оплату по этапам'],['Подбор материалов','Показываем образцы и подбираем декор']];
const O1:K={t:'Офис',rs:[['Адрес','г. Москва, ул. Покровка, д. 26/1, офис 12'],['Режим работы','пн–пт с 9:00 до 19:00'],['Телефон','+7 (495) 119-76-56'],['Почта','info@example.ru']],btn:'Построить маршрут'};
const v1=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Приезжай в офис и обсуди проект лично с руководителем','Получи точный расчёт стоимости и сроков, а также:','Приезжай в офис и обсуди проект',true);
 y=benRow(c,dev,y,BEN1);
 if(d){const H=Math.max(440,hc(380,dev,O1)+48);map(c,X,y,w,H);card(c,X+24,y+24,380,dev,O1);return tail(c,dev,y+H+24,'Записаться на встречу')}
 y+=card(c,X,y,w,dev,O1)+16;const mh=m?160:260;map(c,X,y,w,mh);return tail(c,dev,y+mh+16,'Записаться на встречу')};

// 2. карта филиалов и форма «узнать адрес»
const O2:K={t:'Узнать адрес филиала',sub:'Введи телефон: менеджер назовёт адрес и время работы',inp:'Введи телефон',btn:'Узнать адрес филиала',note:'✓ Согласен на обработку персональных данных'};
const v2=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Филиалы в 48 городах России','Приезжай в ближайший и посмотри работы вживую','Филиалы в 48 городах',true);
 if(d){const H=Math.max(480,hc(400,dev,O2)+48);map(c,X,y,w,H,'Карта: метки филиалов');card(c,X+w-24-400,y+24,400,dev,O2);return fin(c,dev,y+H+24,'')}
 y+=card(c,X,y,w,dev,O2)+16;const mh=m?160:280;map(c,X,y,w,mh,'Карта: метки филиалов');return fin(c,dev,y+mh+16,'')};

// 3. карта на всю ширину, плашка по центру: адрес, контакты, реквизиты
const O3:K={t:'Наш адрес',big:true,al:'c',rs:[['Офис','г. Москва, ул. Академика Павлова, д. 1, офис 400'],['Контакты','+7 (499) 391-76-16, info@example.ru'],['Реквизиты','ИНН 7715204224, ОГРН 1157746901759']],btn:'Построить маршрут'};
const v3=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w,W}=sz(dev);
 if(d){const cw=560,h=hc(cw,dev,O3),H=r4(Math.max(560,h+96));map(c,0,0,W,H);card(c,(W-cw)/2,r4((H-h)/2),cw,dev,O3);return{h:H,els:c.els}}
 let y=Y0(dev);y+=card(c,X,y,w,dev,O3)+16;const mh=m?200:300;map(c,X,y,w,mh);return fin(c,dev,y+mh+16,'')};

// 4. список филиалов с метро или районом, часы приёма, телефон для записи
const BR:Row[]=[['Таганская','г. Москва, ул. Таганская, д. 2, стр. 7'],['Кузьминки','г. Москва, Волгоградский проспект, д. 135, к. 3'],['Курская','г. Москва, ул. Земляной Вал, д. 15'],['Октябрьская','г. Москва, ул. Донская, д. 7, к. 3'],['Красные Ворота','г. Москва, ул. Каланчёвская, д. 2'],['Раменское','г. Раменское, ул. Воровского, д. 8']];
const v4=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Ждём тебя на приёме в одной из 6 клиник','Запишись онлайн или по телефону. Приём в день обращения','Приём в одной из 6 клиник',true);
 if(m){for(const[a,b]of BR){y=c.tx(a,X,y,w,15,{b:true})+2;y=c.tx(b,X,y,w,14)+12}y+=4}
 else{const n=d?3:2,g=16,cw=(w-(n-1)*g)/n,hh=r4(Math.max(...BR.map(([a,b])=>16+th(a,16,cw-32,true)+4+th(b,15,cw-32)+16)));
  BR.forEach(([a,b],i)=>{const x=X+(i%n)*(cw+g),yy=y+Math.floor(i/n)*(hh+g);c.add('rect',x,yy,cw,hh,'',{fill:'#fff'});const ye=c.tx(a,x+16,yy+16,cw-32,16,{b:true})+4;c.tx(b,x+16,ye,cw-32,15)});
  y+=Math.ceil(BR.length/n)*(hh+g)+8}
 const pw=d?400:w;c.plate(d?X+(w-pw)/2:X,y,pw,56,'Приём ежедневно с 9:00 до 21:00',15,true,'c');y+=56+24;
 const a=d?{al:'c' as const}:{};y=c.tx('Телефон для записи на приём:',X,y,w,m?15:16,a)+4;y=c.tx('+7 (499) 877-39-28',X,y,w,m?24:28,{b:true,...a})+16;
 return tail(c,dev,y,'Записаться на приём')};

// 5. города вкладками, время работы, четыре колонки контактов
const CITIES=['Москва','Раменское','Коломна','Егорьевск','Дмитров'];
const COLS:Row[]=[['Адрес офиса и склада','г. Москва, Ореховый проезд, д. 15'],['Телефон','8 (499) 119-86-25'],['E-mail','info@example.ru'],['График работы','пн–пт с 9:00 до 18:00']];
const v5=(dev:Dev):Out=>{const c=ctx(),{m,t,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Приезжай на показ в офис своего города','Выбери город: мы работаем в 5 городах','Приезжай на показ в офис',true);
 const n=m?2:5,g=12,bw=(w-(n-1)*g)/n,bh=m?44:48;
 CITIES.forEach((s,i)=>c.add('btn',X+(i%n)*(bw+g),y+Math.floor(i/n)*(bh+g),bw,bh,s,{fs:14,...(i===0?{acc:true}:{})}));
 y+=Math.ceil(CITIES.length/n)*(bh+g)+16;
 y=c.tx('Время работы: ежедневно с 9:00 до 20:00',X,y,w,m?16:18,{b:true,...(d?{al:'c' as const}:{})})+24;
 const k=d?4:t?2:1,cg=24,cw=(w-(k-1)*cg)/k;
 for(let r=0;r<COLS.length;r+=k){let end=y;COLS.slice(r,r+k).forEach(([l,v],i)=>{const x=X+i*(cw+cg);c.add('img',x,y,32,32,'Иконка');const ye=c.tx(l,x+44,y,cw-44,13,{b:true})+2;end=Math.max(end,c.tx(v,x+44,ye,cw-44,16),y+32)});y=end+16}
 return tail(c,dev,y+8,'Записаться на показ')};

// 6. стоимость доставки, самовывоз, карта, способы оплаты
const O6:K={t:'Самовывоз',rs:[['Адрес','г. Москва, Осташковский проезд, д. 5, стр. 3, офис 306'],['Метро','Волгоградский проспект'],['Режим работы','пн–вс с 9:00 до 23:00']]};
const v6=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Доставим по Москве и области уже в день заказа','Курьер привозит заказ в удобное время или забирай сам','Доставим в день заказа',true);
 const L=m?['По Москве','По МО','Сборка']:['Доставка по Москве','Доставка по МО','Сборка'],P=['700 ₽','1 500 ₽','1 500 ₽'],g=16;
 const cw=d?184:(w-2*g)/3,pf=m?20:24,ch=r4(Math.max(...L.map(l=>16+th(l,14,cw-24)+8+th('1 500 ₽',pf,cw-24,true)+16)));
 const ph=d?hc(w-3*(cw+g),dev,O6):0,rh=Math.max(ch,ph);
 L.forEach((l,i)=>{const x=X+i*(cw+g);c.add('rect',x,y,cw,rh,'',{fill:'#fff'});c.add('text',x+12,y+16,cw-24,th(l,14,cw-24),l,{fs:14,al:'c'});c.add('text',x+12,y+rh-16-th(P[i],pf,cw-24,true),cw-24,th(P[i],pf,cw-24,true),P[i],{fs:pf,b:true,al:'c'})});
 if(d){card(c,X+3*(cw+g),y,w-3*(cw+g),dev,{...O6,mh:rh});y+=rh+g}
 else{y+=rh+g;y+=card(c,X,y,w,dev,O6)+g}
 const mh=d?300:m?160:240;map(c,X,y,w,mh,'Карта: пункт самовывоза');y+=mh+16;
 const a=d?{al:'c' as const}:{};y=c.tx('Оплата при получении наличными или картой',X,y,w,15,a)+12;
 const lw=m?72:96,lg=16,tot=4*lw+3*lg,x0=d?X+(w-tot)/2:X;['Visa','Mastercard','Maestro','Мир'].forEach((b,i)=>c.add('img',x0+i*(lw+lg),y,lw,40,b));y+=40+24;
 return tail(c,dev,y,'Заказать доставку')};

// 7. офис с фото: карточка с фото сотрудника на карте, фото образцов справа
const O7:K={t:'Адрес офиса',rs:[['Адрес','г. Санкт-Петербург, Кантемировская ул., д. 39, офис 211'],['Режим работы','пн–пт с 9:00 до 18:00'],['Телефон','+7 (812) 438-12-36']],img:'Фото: менеджер в офисе',ih:112};
const v7=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'В офисе показываем системы для частного дома вживую','Приезжай и выбери систему, которая подходит твоему дому','Приезжай и выбери систему',true);
 if(d){const H=Math.max(480,hc(380,dev,O7)+48),pw=280,ph=(H-48-16)/2;map(c,X,y,w,H);card(c,X+24,y+24,380,dev,O7);
  c.add('img',X+w-24-pw,y+24,pw,ph,'Фото: образцы в офисе');c.add('img',X+w-24-pw,y+24+ph+16,pw,ph,'Фото: стенд с системами');return tail(c,dev,y+H+24,'Записаться на визит')}
 y+=card(c,X,y,w,dev,O7)+16;const pw=(w-16)/2,ph=m?96:140;
 c.add('img',X,y,pw,ph,'Фото: образцы в офисе');c.add('img',X+pw+16,y,pw,ph,'Фото: стенд с системами');y+=ph+16;
 const mh=m?160:240;map(c,X,y,w,mh);return tail(c,dev,y+mh+16,'Записаться на визит')};

interface S{name:string;spec:(d:Dev)=>Out;tips:string[]}
const ALL:S[]=[
{name:'Адреса: карта и карточка офиса',spec:v1,tips:['Оценка: подходит для офиса, куда клиент приезжает на встречу. Три выгоды объясняют, зачем ехать, карточка отвечает, куда','Адрес, режим и телефон лежат в одной карточке на карте: клиент не ищет их по странице']},
{name:'Адреса: карта и форма филиала',spec:v2,tips:['Оценка: подходит для сети с десятками точек. Клиент оставляет телефон, менеджер называет ближайший адрес','Форма на карте собирает заявки у тех, кто не нашёл свой город: подсказка над полем, согласие и кнопка с тем же словом']},
{name:'Адреса: плашка по центру карты',spec:v3,tips:['Оценка: подходит для подвала страницы или блока контактов. Карта на всю ширину, адрес и реквизиты в одной плашке','Реквизиты в плашке показывают, что компания настоящая: ИНН и ОГРН читаются без перехода на другую страницу']},
{name:'Адреса: список филиалов',spec:v4,tips:['Оценка: подходит для клиник, салонов и сервисов с 4–8 точками. Метро или район стоит первым, адрес под ним','Телефон записи крупно под списком: клиент звонит сразу, кнопка записи ведёт на форму']},
{name:'Адреса: города вкладками',spec:v5,tips:['Оценка: подходит, когда офисы в разных городах и у каждого свои контакты. Первый город выбран, остальные одним нажатием','Четыре колонки с иконками читаются за 3 секунды: адрес, телефон, почта, график']},
{name:'Адреса: самовывоз и доставка',spec:v6,tips:['Оценка: подходит для магазинов с доставкой и самовывозом. Цены доставки в ряд, пункт самовывоза рядом','Способы оплаты под картой снимают последний вопрос перед заказом']},
{name:'Адреса: офис с фото',spec:v7,tips:['Оценка: подходит, когда важно показать, что за дверью. Фото сотрудника в карточке и фото образцов справа','Реальные фото офиса и стенда снимают страх «а есть ли он на самом деле»']}];
export const ADDRESS:{name:string;cat:string;spec:(d:Dev)=>Out}[]=ALL.map(s=>({name:s.name,cat:CAT,spec:s.spec}));
const CR=['Адрес, телефон и режим работы замени на настоящие: клиент проверяет их по карте','Метку на карте ставь точно: клиент сверяет её с навигатором'];
export const ADDRESS_TIPS:Record<string,string[]>=Object.fromEntries(ALL.map(s=>[s.name,[...s.tips,...CR]]));
