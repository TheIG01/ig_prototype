// Отзывы: 5 вариантов по разбору 19 референсов (docs/refs/reviews.md). ПК 1440, планшет 768, мобилка 390.
// Мобилка: один блок = один экран телефона (до 844 px), кнопка и мессенджеры закреплены внизу, вместо слайдера аккордеон.
import {ctx,th,r4} from './tplFirst';
import type {C,Out} from './tplFirst';
import {FW} from './dev';
import type {Dev} from './dev';
import {LEAD,LEAD_TIPS} from './tplLead';

const di=(d:Dev)=>d==='desktop'?0:d==='tablet'?1:2;
const XX=(d:Dev)=>d==='mobile'?20:d==='tablet'?48:120;
const CTAT='Рассчитать стоимость + получить чек-лист';
const NOTE='Тест занимает 1 минуту. Телефон нужен только в конце';

/** заголовок и подзаголовок: ПК и планшет по центру, мобилка слева */
function head(c:C,d:Dev,t:string,s:string,mt?:string){const X=XX(d),w=FW[d]-2*X,m=d==='mobile',i=di(d);const al=m?undefined:'c' as const;
let y=m?20:d==='tablet'?40:48;
y=c.tx(t,X,y,w,[32,28,22][i],{b:true,...(al?{al}:{})})+12;
y=c.tx(m&&mt?mt:s,X,y,w,[18,16,14][i],al?{al}:{})+(m?14:24);return y}
/** кнопка и пояснение под блоком (на мобилке кнопка закреплена внизу) */
function foot(c:C,d:Dev,y:number){if(d==='mobile')return y;const W=FW[d],bw=d==='desktop'?520:W-96,x=(W-bw)/2;
c.add('btn',x,y,bw,64,CTAT,{fs:18,acc:true});y+=64+8;return c.tx(NOTE,x,y,bw,14,{al:'c'})}
function fin(c:C,d:Dev,y:number):Out{if(d!=='mobile')return{h:r4(y+48),els:c.els};
const W=FW.mobile,X=20,w=W-40,bh=96,h=Math.max(r4(y+8+bh),700),by=h-bh,bw=44;
c.add('rect',0,by,W,bh);c.add('text',X,by+6,w,16,'Закреплено внизу экрана',{fs:12});
c.add('btn',X,by+26,w-2*bw-16,52,CTAT,{fs:14,acc:true});
c.add('rect',X+w-2*bw-8,by+26,bw,52,'TG',{fs:14,al:'c'});c.add('rect',X+w-bw,by+26,bw,52,'WA',{fs:14,al:'c'});
return{h,els:c.els}}
/** строка-аккордеон */
function acc(c:C,x:number,y:number,w:number,t:string){c.add('rect',x,y,w,52);c.add('text',x+16,y+14,w-72,24,t,{fs:15,b:true});c.add('text',x+w-44,y+10,28,32,'+',{fs:22,b:true,al:'c'});return y+52}
/** одинаковая высота карточек: сначала меряем на пустом холсте */
const maxH=<T,>(a:T[],f:(c:C,i:T)=>number)=>Math.max(...a.map(i=>f(ctx(),i)));

// ---------- 1. Результат (лучший) ----------
interface Rev{n:string;r:string;m:string;q:string;l:string}
const REV:Rev[]=[
{n:'Алексей Морозов',r:'Подмосковье · бассейн 8×3 м',m:'Сдали за 38 дней вместо 45',q:'«Сдали на неделю раньше срока, смета осталась прежней до рубля. Гарантию 25 лет внесли в договор, как и обещали»',l:'Смотреть договор и фото'},
{n:'Марина Соколова',r:'Казань · бассейн 6×3 м с подогревом',m:'Доплат по смете: 0 руб.',q:'«Сравнивали четыре компании. Выбрали эту за фиксированную цену и рассрочку 0%. Через год бассейн работает без вопросов»',l:'Смотреть договор и фото'},
{n:'Сергей Лебедев',r:'Сочи · бассейн 10×4 м с навесом',m:'Экономия 64 000 руб. по акции',q:'«Замерщик приехал на второй день, смету прислали в тот же вечер. Обучили обслуживать воду и дали контакт инженера»',l:'Смотреть договор и фото'}];
/** карточка отзыва: фото, имя, метрика результата, цитата, ссылка на оригинал. hh=0: естественная высота */
function pcard(c:C,x:number,y:number,w:number,hh:number,r:Rev,p:number){const iw=w-2*p,tw=iw-76;
c.add('rect',x,y,w,hh);const rc=c.els[c.els.length-1];
c.add('img',x+p,y+p,64,64,'Фото клиента');
const nh=th(r.n,16,tw,true),rh=th(r.r,14,tw),top=Math.max(64,nh+4+rh);
const ny=y+p+(top-(nh+4+rh))/2;c.tx(r.n,x+p+76,ny,tw,16,{b:true});c.tx(r.r,x+p+76,ny+nh+4,tw,14);
let yy=y+p+top+12;const mh=r4(th(r.m,16,iw-32,true)+16);c.plate(x+p,yy,iw,mh,r.m,16,true,'c');yy+=mh+12;
yy=c.tx(r.q,x+p,yy,iw,16)+12;
const lt=r.l+' →',lh=th(lt,14,iw,true),nat=r4(yy-y+lh+p),H=hh||nat;rc.h=H;
c.tx(lt,x+p,y+H-p-lh,iw,14,{b:true});return H}
const H1='Читайте, как три семьи получили бассейн в срок и без доплат';
const S1='Каждый отзыв подтверждён договором, актом и фото объекта';
function resultV(d:Dev):Out{const c=ctx();const W=FW[d],X=XX(d),w=W-2*X;let y=head(c,d,H1,S1,'Договор, акт и фото объекта подтверждают каждый отзыв');
if(d==='desktop'){const g=24,cw=(w-2*g)/3,hh=maxH(REV,(t,r)=>pcard(t,0,0,cw,0,r,24));REV.forEach((r,i)=>pcard(c,X+i*(cw+g),y,cw,hh,r,24));y+=hh+32}
else if(d==='tablet'){const hh=pcard(ctx(),0,0,w,0,REV[0],24);pcard(c,X,y,w,hh,REV[0],24);y+=hh+12;for(const r of REV.slice(1))y=acc(c,X,y,w,r.n+', '+r.r.split(' · ')[0])+8;y+=8}
else{const hh=pcard(ctx(),0,0,w,0,REV[0],16);pcard(c,X,y,w,hh,REV[0],16);y+=hh+10;for(const r of REV.slice(1))y=acc(c,X,y,w,r.n+', '+r.r.split(' · ')[0])+8}
return fin(c,d,foot(c,d,y))}

// ---------- 2. Видео ----------
const VID=[{n:'Алексей Морозов',r:'Подмосковье · бассейн 8×3 м',q:'«Сдали на неделю раньше срока»',t:'0:48'},{n:'Марина Соколова',r:'Казань · бассейн с подогревом',q:'«Выбрали за цену в договоре»',t:'0:52'},{n:'Сергей Лебедев',r:'Сочи · бассейн с навесом',q:'«Смету прислали в тот же вечер»',t:'0:41'},{n:'Ирина Власова',r:'Тюмень · бассейн для дачи',q:'«Купаемся с мая, вода чистая»',t:'0:57'}];
/** видео 16:9, кнопка play и длительность поверх, под ним имя, место и цитата */
function vcard(c:C,x:number,y:number,w:number,v:typeof VID[0],big=false){const ih=Math.round(w*9/16/4)*4;
c.add('img',x,y,w,ih,'Видеоотзыв: '+v.n);const pl=big?72:56;
c.add('btn',x+(w-pl)/2,y+(ih-pl)/2,pl,pl,'▶',{fs:big?24:20,acc:true,al:'c'});
c.add('rect',x+w-64,y+ih-36,52,24,v.t,{fs:12,al:'c'});
let yy=y+ih+12;yy=c.tx(v.n,x,yy,w,16,{b:true})+2;yy=c.tx(v.r,x,yy,w,14)+6;yy=c.tx(v.q,x,yy,w,15)+4;return yy-y}
const FILT=['Все видео','Бассейны с подогревом','Дачи','Коммерция'];
function chips(c:C,d:Dev,y:number){const ws=FILT.map(t=>Math.ceil(t.length*14*.6)+40),g=12,tot=ws.reduce((a,b)=>a+b,0)+g*(ws.length-1);let x=(FW[d]-tot)/2;
FILT.forEach((t,i)=>{if(i===0)c.add('btn',x,y,ws[i],40,t,{fs:14,acc:true});else c.plate(x,y,ws[i],40,t,14,false,'c');x+=ws[i]+g});return y+40+24}
const H2V='Смотрите, что говорят клиенты через год после сдачи бассейна';
const S2V='Четыре видео по минуте: без монтажа и сценария';
function videoV(d:Dev):Out{const c=ctx();const W=FW[d],X=XX(d),w=W-2*X;let y=head(c,d,H2V,S2V,'Четыре видео по минуте, без сценария');
if(d!=='mobile')y=chips(c,d,y);
if(d==='desktop'){const g=24,cw=(w-3*g)/4;let hh=0;VID.forEach((v,i)=>{hh=Math.max(hh,vcard(c,X+i*(cw+g),y,cw,v))});y+=hh+32}
else if(d==='tablet'){const g=24,cw=(w-g)/2;for(let r=0;r<2;r++){let hh=0;for(let k=0;k<2;k++)hh=Math.max(hh,vcard(c,X+k*(cw+g),y,cw,VID[r*2+k]));y+=hh+24}}
else{y+=vcard(c,X,y,w,VID[0],true)+12;for(const v of VID.slice(1))y=acc(c,X,y,w,v.n+' · '+v.t)+8}
return fin(c,d,foot(c,d,y))}

// ---------- 3. Оригиналы: переписки, письма, сканы ----------
const ORG=[{k:'Скриншот WhatsApp',q:'Сдали на неделю раньше, смета та же'},{k:'Благодарственное письмо',q:'Гарантию внесли в договор, как обещали'},{k:'Скан рукописного отзыва',q:'Обучили обслуживать воду, помогли с запуском'},{k:'Скриншот Telegram',q:'Купаемся с мая, вода чистая без химии'}];
function ocard(c:C,x:number,y:number,w:number,ih:number,o:typeof ORG[0],fs:number){c.add('img',x,y,w,ih,o.k);return c.tx(o.q,x,y+ih+8,w,fs,{b:true})-y}
const H3='Читайте отзывы в оригинале: переписки, письма и сканы';
const S3='Нажми на скриншот или скан, чтобы открыть оригинал отзыва';
function origV(d:Dev):Out{const c=ctx();const W=FW[d],X=XX(d),w=W-2*X;let y=head(c,d,H3,S3,'Нажми на скриншот, чтобы открыть оригинал');
if(d==='desktop'){const g=24,cw=(w-3*g)/4;let hh=0;ORG.forEach((o,i)=>{hh=Math.max(hh,ocard(c,X+i*(cw+g),y,cw,300,o,15))});y+=hh+32}
else{const g=d==='tablet'?24:12,cw=(w-g)/2,ih=d==='tablet'?200:200,fs=d==='tablet'?15:13;for(let r=0;r<2;r++){let hh=0;for(let k=0;k<2;k++)hh=Math.max(hh,ocard(c,X+k*(cw+g),y,cw,ih,ORG[r*2+k],fs));y+=hh+(d==='tablet'?16:12)}}
return fin(c,d,foot(c,d,y))}

// ---------- 4. Крупно: один отзыв, переключатель по людям ----------
const H4='Пять клиентов рассказывают, как получили бассейн в срок и без доплат';
const S4='Выбери клиента и посмотри видео';
const SUM='Сдали за 38 дней вместо 45 и без доплат по смете';
const Q4='«Сдали на неделю раньше срока, смета осталась прежней до рубля. Гарантию 25 лет внесли в договор. Через два года бассейн без ремонтов»';
const WHO='Алексей Морозов, Подмосковье · бассейн 8×3 м';
function avatars(c:C,x:number,y:number,sz:number,g:number){for(let i=0;i<5;i++){const ax=x+i*(sz+g);if(i===0){c.add('rect',ax-4,y-4,sz+8,sz+8,'',{stroke:'#1d4ed8',sw:3})}c.add('img',ax,y,sz,sz,'Фото')}return y+sz+4}
function bigV(d:Dev):Out{const c=ctx();const W=FW[d],X=XX(d),w=W-2*X,m=d==='mobile';let y=head(c,d,H4,S4,'Выбери клиента и посмотри видео');
const sz=m?56:64,g=m?12:16;y=avatars(c,m?X+4:d==='tablet'?(W-(5*sz+4*g))/2:X+4,y+4,sz,g)+16;
y=c.tx(SUM,X,y,w,m?18:d==='tablet'?24:28,{b:true})+16;
if(d==='desktop'){const vw=560,vh=336,qx=X+vw+48,qw=w-vw-48;c.add('img',X,y,vw,vh,'Видеоотзыв: Алексей Морозов');c.add('btn',X+(vw-88)/2,y+(vh-88)/2,88,88,'▶',{fs:32,acc:true,al:'c'});
let yy=c.tx(Q4,qx,y,qw,22)+16;yy=c.tx(WHO,qx,yy,qw,16,{b:true})+24;
c.add('btn',qx,yy,220,56,'Следующий отзыв →',{fs:16});c.add('btn',qx+236,yy,qw-236,56,CTAT,{fs:14,acc:true});y=Math.max(y+vh,yy+56)+32}
else{const vh=m?196:300;c.add('img',X,y,w,vh,'Видеоотзыв: Алексей Морозов');const pl=m?64:80;c.add('btn',X+(w-pl)/2,y+(vh-pl)/2,pl,pl,'▶',{fs:24,acc:true,al:'c'});y+=vh+12;
y=c.tx(m?'«Сдали на неделю раньше срока, смета осталась прежней до рубля. Гарантию внесли в договор»':Q4,X,y,w,m?15:18)+10;y=c.tx(WHO,X,y,w,m?14:16,{b:true})+(m?12:16);
if(!m){c.add('btn',X,y,240,56,'Следующий отзыв →',{fs:16});y+=56+16}else y=c.tx('Следующий отзыв →',X,y,w,15,{b:true})+8}
return fin(c,d,d==='tablet'?foot(c,d,y):y)}

// ---------- 5. Рейтинг площадок ----------
const PL=[['Яндекс Карты','214'],['Google','167'],['2ГИС','98'],['Zoon','41']];
const PR=[{n:'Юлия Ковалёва',r:'★★★★★ · 12 мая',q:'Бассейн сдали на неделю раньше. Смета та же, что в договоре. Рекомендую'},{n:'Anna Morozova',r:'★★★★★ · 3 июня',q:'Замерщик приехал на второй день, смету прислали вечером. Обучили, как обслуживать воду'},{n:'Игорь Н.',r:'★★★★★ · 19 апреля',q:'Сравнивали четыре компании. Выбрали за фиксированную цену. Через год всё работает'}];
function badge(c:C,x:number,y:number,w:number,h:number,p:string[],m:boolean){c.add('rect',x,y,w,h);c.add('img',x+12,y+(h-(m?32:48))/2,m?32:(m?32:48),m?32:48,'Лого');const tx=x+12+(m?44:60),tw=w-(tx-x)-8;
const a=th(p[0],m?13:15,tw,true),b=th('4,9 ★',m?16:20,tw,true),cc=th(p[1]+' отзывов',m?12:14,tw);let yy=y+(h-(a+b+cc+4))/2;
yy=c.tx(p[0],tx,yy,tw,m?13:15,{b:true});yy=c.tx('4,9 ★',tx,yy,tw,m?16:20,{b:true});c.tx(p[1]+' отзывов',tx,yy+4,tw,m?12:14)}
function rcard(c:C,x:number,y:number,w:number,hh:number,r:typeof PR[0],src:string,p:number){const iw=w-2*p;c.add('rect',x,y,w,hh);const rc=c.els[c.els.length-1];
c.add('img',x+p,y+p,48,48,'Фото');const tw=iw-60;c.tx(r.n,x+p+60,y+p,tw,16,{b:true});c.tx(r.r,x+p+60,y+p+24,tw,14);
let yy=y+p+48+12;yy=c.tx(r.q,x+p,yy,iw,15)+10;const st='Отзыв с площадки: '+src,sh=th(st,13,iw),nat=r4(yy-y+sh+p),H=hh||nat;rc.h=H;c.tx(st,x+p,y+H-p-sh,iw,13);return H}
const H5='Клиенты оценили нас на 4,9 из 5 на независимых площадках';
const S5='Отзывы лежат на сторонних площадках, править их может только автор';
function rateV(d:Dev):Out{const c=ctx();const W=FW[d],X=XX(d),w=W-2*X;let y=head(c,d,H5,S5,'Отзывы лежат на сторонних площадках, править их может только автор');
if(d==='desktop'){const g=24,bw=(w-3*g)/4;PL.forEach((p,i)=>badge(c,X+i*(bw+g),y,bw,96,p,false));y+=96+24;
const cw=(w-2*g)/3,hh=maxH(PR,(t,r)=>rcard(t,0,0,cw,0,r,'Яндекс Карты',24));PR.forEach((r,i)=>rcard(c,X+i*(cw+g),y,cw,hh,r,PL[i][0],24));y+=hh+16}
else if(d==='tablet'){const g=16,bw=(w-g)/2;PL.forEach((p,i)=>badge(c,X+(i%2)*(bw+g),y+Math.floor(i/2)*(88+g),bw,88,p,false));y+=2*88+g+24;
for(const r of PR.slice(0,2)){const hh=rcard(ctx(),0,0,w,0,r,'Яндекс Карты',20);rcard(c,X,y,w,hh,r,'Яндекс Карты',20);y+=hh+12}y+=4}
else{const g=10,bw=(w-g)/2;PL.forEach((p,i)=>badge(c,X+(i%2)*(bw+g),y+Math.floor(i/2)*(80+g),bw,80,p,true));y+=2*80+g+14;
const r=PR[0],hh=rcard(ctx(),0,0,w,0,r,'Яндекс Карты',16);rcard(c,X,y,w,hh,r,'Яндекс Карты',16);y+=hh+10;y=acc(c,X,y,w,'Открыть все отзывы')}
if(d!=='mobile'){c.add('btn',(W-360)/2,y,360,48,'Открыть все отзывы на площадках →',{fs:15});y+=48+24}
return fin(c,d,foot(c,d,y))}

const mkS=(f:(d:Dev)=>Out)=>f;
const REV0:{name:string;cat:string;spec:(d:Dev)=>Out}[]=[
{name:'Отзывы: результат',cat:'Отзывы',spec:mkS(resultV)},
{name:'Отзывы: видео',cat:'Отзывы',spec:mkS(videoV)},
{name:'Отзывы: оригиналы',cat:'Отзывы',spec:mkS(origV)},
{name:'Отзывы: крупно',cat:'Отзывы',spec:mkS(bigV)},
{name:'Отзывы: рейтинг',cat:'Отзывы',spec:mkS(rateV)}];
/** группа «Лид-магниты» (tplLead.ts) подключена здесь, чтобы не трогать tpl.ts */
export const REVIEWS=[...REV0,...LEAD];
const RR=['Отзыв без имени, фото и места не работает: нужны имя, город и что именно заказывал','Метрика результата в отзыве (срок, деньги, баллы) убеждает сильнее похвалы','Ссылка на оригинал: договор, переписка, карточка на площадке','Блок отзывов ставь после выгод и перед формой: форма закрывает сомнение','Цифра в заголовке совпадает с числом отзывов в блоке'];
const RT0:Record<string,string[]>={
'Отзывы: результат':[...RR,'Лучший по конверсии: человек, результат в цифрах, цитата, проверка','Три карточки на ПК, на мобилке два и аккордеон «Показать ещё»','Кнопка под отзывами повторяет оффер первого экрана'],
'Отзывы: видео':[...RR,'Когда нужно живое доверие: услуги, обучение, медицина, дети','Видео короткие, до минуты, с именем и местом под роликом','Фильтры по теме нужны, когда видео больше шести','На мобилке одно видео крупно, остальные в аккордеоне'],
'Отзывы: оригиналы':[...RR,'Когда отзывы приходят в мессенджерах или письмах: B2B, доставка, строительство','Скриншот с подписью-выжимкой: человек читает вывод и проверяет оригинал','Подсказка «Нажми, чтобы открыть оригинал» поднимает клики по скриншотам'],
'Отзывы: крупно':[...RR,'Когда мало отзывов, но они сильные: один показан крупно, остальные под аватаркой','Заголовок-вывод над отзывом говорит результат до чтения цитаты','Две кнопки: «Следующий отзыв» тихая, главная ведёт в расчёт'],
'Отзывы: рейтинг':[...RR,'Когда есть отзывы на Яндекс Картах, Google, 2ГИС: независимость сильнее любых слов на сайте','Рейтинг площадок показывай вверху, живые отзывы под ним','Ссылка «Открыть все отзывы» ведёт на площадку, а не на страницу сайта']};
export const REVIEWS_TIPS:Record<string,string[]>={...RT0,...LEAD_TIPS};
