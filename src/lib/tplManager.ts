// Персональный менеджер: 4 варианта по разбору 12 референсов (docs/refs/manager.md). ПК 1440, планшет 768, мобилка 390.
// Один блок = один экран: ПК 820, планшет до 1040, мобилка до 844 (кнопка и мессенджеры закреплены внизу).
// Все элементы обычные (текст, рамка, кнопка, картинка): правится каждая деталь. Фото и иконки это плейсхолдеры.
// Пример-ниша: монтаж и производство под заказ. Имя, сроки и цифры автор заменяет своими.
import {ctx,r4} from './tplFirst';
import type {C,Out} from './tplFirst';
import type {El} from '../store';
import {FW} from './dev';
import type {Dev} from './dev';

const SCR:Record<Dev,number>={desktop:820,tablet:952,mobile:780};
const CAP:Record<Dev,number>={desktop:820,tablet:1040,mobile:844};
const LX=120,LW=1200,SOFT='#E8F0FF';

interface It{t:string;d:string;dm:string}
/** высота текста: пословный перенос по ширине Inter (проверено в Chromium), строка 1.3 */
const wrap=(l:string,fs:number,w:number,b:boolean)=>{const cw=fs*(b?.67:.6);let n=1,cur=0;
for(const word of l.split(' ')){const ww=word.length*cw;if(cur===0)cur=ww;else if(cur+cw+ww<=w)cur+=cw+ww;else{n++;cur=ww}}return n};
const th=(t:string,fs:number,w:number,b=false)=>r4(t.split('\n').reduce((a,l)=>a+wrap(l,fs,w,b),0)*fs*1.3);
const T=(c:C,t:string,x:number,y:number,w:number,fs:number,more:Partial<El>={}):number=>{const h=th(t,fs,w,!!more.b);c.add('text',x,y,w,h,t,{fs,...more});return y+h};

// ---------- тексты ----------
const NM='Виктория Ланская',RL='Персональный менеджер';
const H='Закрепляем в договоре персонального менеджера на весь срок работ и гарантии';
const HM='Персональный менеджер на весь срок работ и гарантии';
const SUB='Один человек ведёт заказ от замера до сдачи и отвечает даже в нерабочее время';
const SUBM='Один человек ведёт заказ от замера до сдачи';
const Q='«Сообщаю об актуальном этапе, согласовываю нюансы и принимаю правки, до результата на 100%»';
const QM='«Сообщаю об этапе, согласовываю нюансы и принимаю правки до результата на 100%»';
const NOTE='Менеджер отвечает в течение 5 минут в рабочее время';
const CTA1='Получить расчёт и связь с менеджером',CTA1M='Получить расчёт';

/** выгоды: «Получите … за счёт …», заголовок и описание, короткое описание для мобилки */
const B:It[]=[
{t:'На связи каждый день',d:'Получите ответ за 5 минут по телефону или в мессенджере, даже вечером и в выходные',dm:'Ответ за 5 минут, даже вечером'},
{t:'Сообщает о каждом этапе',d:'Получите фото и отчёт после замера, производства, доставки и монтажа',dm:'Фото и отчёт после каждого этапа'},
{t:'Берёт на себя согласования',d:'Экономьте время за счёт одного контакта: менеджер сам согласует сроки и нюансы',dm:'Один контакт вместо десяти звонков'},
{t:'Помогает после сдачи',d:'Организует сервис и гарантийный ремонт без новых заявок',dm:'Сервис и гарантия без новых заявок'}];

// ---------- общие части ----------
/** закреплённая панель мобилки: главная кнопка и мессенджеры */
function bar(c:C,h:number,txt:string){const W=FW.mobile,X=20,w=W-40,by=h-96;
c.add('rect',0,by,W,96);c.add('text',X,by+6,w,16,'Закреплено внизу экрана',{fs:12});
c.add('btn',X,by+26,w-104,52,txt,{fs:14,acc:true});
c.add('rect',X+w-96,by+26,44,52,'TG',{fs:14,al:'c'});c.add('rect',X+w-44,by+26,44,52,'WA',{fs:14,al:'c'})}
const done=(c:C,d:Dev,y:number,txt:string):Out=>{
if(d==='mobile'){const h=Math.max(SCR.mobile,r4(y+8+96));bar(c,h,txt);return{h,els:c.els}}
return{h:Math.max(SCR[d],r4(y+40)),els:c.els}};
/** ПК: содержимое по центру экрана 820, поля сверху и снизу равны; выше экрана блок просто растёт */
const fin=(c:C):Out=>{const mb=Math.max(...c.els.map(e=>e.y+e.h)),tp=Math.min(...c.els.map(e=>e.y));
const h=Math.max(SCR.desktop,r4(mb+40));const sh=h===SCR.desktop?Math.max(0,Math.floor((h-(mb-tp))/2)-tp):0;
for(const e of c.els)e.y+=sh;return{h,els:c.els}};
/** если с подзаголовком блок не влезает в экран, подзаголовок убирается */
const fit=(f:(sub:boolean)=>Out,d:Dev):Out=>{const a=f(true);return a.h<=CAP[d]?a:f(false)};

/** строка выгоды: иконка слева, заголовок и описание справа; возвращает нижнюю границу */
function row(c:C,x:number,y:number,w:number,b:It,ic:number,ft:number,fd:number,short:boolean):number{
const tw=w-ic-16,d=short?b.dm:b.d;const hh=th(b.t,ft,tw,true)+4+th(d,fd,tw);const rh=Math.max(ic,hh);
c.add('img',x,y+(rh-ic)/2,ic,ic,ic>=48?'Иконка':'',ic>=48?{fs:12}:{});
const ty=T(c,b.t,x+ic+16,y+(rh-hh)/2,tw,ft,{b:true})+4;T(c,d,x+ic+16,ty,tw,fd);
return y+rh}

/** плашка с именем и должностью под фото (ПК) */
function nameBox(c:C,x:number,y:number,w:number):number{
const h=64,a=th(NM,18,w-32,true),b=th(RL,14,w-32);c.add('rect',x,y,w,h);
const ty=T(c,NM,x+16,y+(h-a-b)/2,w-32,18,{b:true});T(c,RL,x+16,ty,w-32,14);return y+h}

/** главная кнопка, кнопки мессенджеров и пояснение под ними (ПК и планшет) */
function cta(c:C,x:number,y:number,w:number,txt:string,note:string):number{
const bw=Math.min(440,w-144);
c.add('btn',x,y,bw,56,txt,{fs:16,acc:true});
c.add('rect',x+bw+16,y,56,56,'TG',{fs:14,al:'c'});c.add('rect',x+bw+80,y,56,56,'WA',{fs:14,al:'c'});
return T(c,note,x,y+56+10,w,14)}

/** заголовок и подзаголовок: ПК и планшет по центру или слева, мобилка слева */
function head(c:C,d:Dev,h:string,hm:string,s:string,sm:string,center:boolean,sub:boolean):number{
const m=d==='mobile',X=m?20:48,w=FW[d]-2*X,ce=center&&!m;
let y=m?20:40;
y=T(c,m?hm:h,X,y,w,m?22:28,ce?{b:true,al:'c'}:{b:true})+12;
if(sub)y=T(c,m?sm:s,X,y,w,m?14:16,ce?{al:'c'}:{})+(m?14:20);else y+=m?4:8;
return y}

/** фото, имя, должность и строка под ними (цитата или закрепление) для планшета и мобилки */
function prof(c:C,d:Dev,y:number,X:number,w:number,q:string):number{
const m=d==='mobile',ps=m?88:160,tx=X+ps+16,tw=w-ps-16,fn=m?16:22,fq=m?14:16;
c.add('img',X,y,ps,ps,m?'':'Фото',{r:m?ps/2:16});
const hh=th(NM,fn,tw,true)+4+th(RL,14,tw)+8+th(q,fq,tw);
let ty=y+Math.max(0,(ps-hh)/2);
ty=T(c,NM,tx,ty,tw,fn,{b:true})+4;ty=T(c,RL,tx,ty,tw,14)+8;ty=T(c,q,tx,ty,tw,fq);
return Math.max(y+ps,ty)}

// ---------- 1. Лучший: фото слева, выгоды и кнопка справа ----------
function v1d(sub:boolean):Out{const c=ctx();const rx=600,rw=720,top=48;
let y=T(c,H,rx,top,rw,32,{b:true})+12;
if(sub)y=T(c,SUB,rx,y,rw,18)+24;else y+=12;
for(const b of B)y=row(c,rx,y,rw,b,48,16,14,false)+16;
const end=cta(c,rx,y+8,rw,CTA1,NOTE);
const ph=Math.max(420,end-top-12-64);
c.add('img',LX,top,400,ph,'Фото: менеджер за рабочим столом, живой снимок',{r:16});
nameBox(c,LX,top+ph+12,400);
return fin(c)}

function v1s(d:Dev,sub:boolean):Out{const c=ctx();const m=d==='mobile',X=m?20:48,w=FW[d]-2*X;
let y=head(c,d,H,HM,SUB,SUBM,false,sub);
y=prof(c,d,y,X,w,m?QM:Q)+(m?14:20);
for(const b of B)y=row(c,X,y,w,b,m?32:40,m?15:16,m?13:14,m)+(m?10:14);
if(!m)y=cta(c,X,y+6,w,CTA1,NOTE);
return done(c,d,y,CTA1M)}

// ---------- 2. Цитата менеджера, три факта и подарок ----------
const CH=['Закреплён в договоре','На связи 12/7','Ответ за 5 минут'];
const CHM=CH.join(' · ');
const GIFT='Подарок: чек-лист «10 вопросов подрядчику» после заявки';
const CTA2='Получить расчёт в 3 вариантах + подарок',CTA2M='Расчёт + подарок';

function v2d(sub:boolean):Out{const c=ctx();
let y=T(c,H,LX,48,LW,36,{b:true,al:'c'})+12;
if(sub)y=T(c,SUB,LX,y,LW,18,{al:'c'})+28;else y+=16;
const top=y,pad=24,pw=320,tx=LX+pad+pw+32,tw=LW-pad-pw-32-pad,bw=Math.min(tw,500);
const cont=th(Q,24,tw)+16+th(NM,18,tw,true)+4+th(RL,14,tw)+20+52+20+56+10+th(GIFT,14,tw);
const ch=Math.max(440+2*pad,r4(cont+2*pad));
c.add('rect',LX,top,LW,ch);
c.add('img',LX+pad,top+pad,pw,ch-2*pad,'Фото: менеджер с телефоном, живой снимок',{r:16});
let ty=top+(ch-cont)/2;
ty=T(c,Q,tx,ty,tw,24)+16;ty=T(c,NM,tx,ty,tw,18,{b:true})+4;ty=T(c,RL,tx,ty,tw,14)+20;
const g=12,cw=(tw-2*g)/3;CH.forEach((t,i)=>c.plate(tx+i*(cw+g),ty,cw,52,t,14,true,'c'));ty+=52+20;
c.add('btn',tx,ty,bw,56,CTA2,{fs:16,acc:true});ty+=56+10;T(c,GIFT,tx,ty,tw,14);
return fin(c)}

function v2s(d:Dev,sub:boolean):Out{const c=ctx();const m=d==='mobile',X=m?20:48,w=FW[d]-2*X,pad=m?16:24,iw=w-2*pad;
let y=head(c,d,H,HM,SUB,SUBM,true,sub);
const top=y;c.add('rect',X,top,w,0);const fr=c.els[c.els.length-1];
let yy=top+pad;const ps=m?72:112,tw=iw-ps-16,fn=m?16:20;
c.add('img',X+pad,yy,ps,ps,m?'':'Фото',{r:ps/2});
const hh=th(NM,fn,tw,true)+4+th(RL,14,tw);let ty=yy+(ps-hh)/2;
ty=T(c,NM,X+pad+ps+16,ty,tw,fn,{b:true})+4;T(c,RL,X+pad+ps+16,ty,tw,14);
yy+=ps+14;
yy=T(c,m?QM:Q,X+pad,yy,iw,m?15:18)+14;
if(m)yy=T(c,CHM,X+pad,yy,iw,13,{b:true})+2;
else{const g=12,cw=(iw-2*g)/3;CH.forEach((t,i)=>c.plate(X+pad+i*(cw+g),yy,cw,56,t,14,true,'c'));yy+=56+2}
fr.h=r4(yy-top+pad);y=top+fr.h+(m?12:16);
if(!m){c.add('btn',X,y,Math.min(w,500),56,CTA2,{fs:16,acc:true});y+=56+10}
y=T(c,GIFT,X,y,w,m?14:14);
return done(c,d,y,CTA2M)}

// ---------- 3. Чат в мессенджере ----------
const A3:It[]=[
{t:'Согласует сроки и этапы',d:'Назначает дату каждого этапа и подтверждает её в мессенджере',dm:'Дата каждого этапа в мессенджере'},
{t:'Присылает фото и отчёты',d:'Получите снимки с объекта после замера, производства и монтажа',dm:'Снимки с объекта после каждого этапа'},
{t:'Предупреждает о переносе',d:'Сообщает о задержке заранее и сразу предлагает новую дату',dm:'Сообщает о задержке заранее'}];
const MSG:[boolean,string][]=[
[false,'Когда привезут материалы?'],
[true,'Завтра в 12:00. Водитель позвонит за час, фото упаковки уже отправила'],
[true,'img'],
[false,'Спасибо. Можно перенести монтаж на субботу?'],
[true,'Уже согласовала с бригадой: суббота в 10:00, напомню накануне']];
const H3='Менеджер ведёт заказ в мессенджере и сообщает о каждом этапе';
const H3M='Менеджер ведёт заказ в мессенджере';
const S3='Один человек на связи весь срок работ: пишет первым и на связи до сдачи';
const S3M='Пишет первым, на связи до сдачи';
const CTA3='Написать менеджеру в мессенджер',CTA3M='Написать менеджеру';

/** мокап телефона: шапка чата, n сообщений из списка, строка ввода */
function chat(c:C,x:number,y:number,w:number,n:number,fs:number,ih:number):number{
const p=14,iw=w-2*p,bw=Math.round(iw*.8);
c.add('rect',x,y,w,0,'',{r:28});const fr=c.els[c.els.length-1];
let yy=y+p;
c.add('img',x+p,yy,36,36,'',{r:18});
T(c,'Виктория, менеджер',x+p+48,yy,iw-48,14,{b:true});T(c,'в сети',x+p+48,yy+20,iw-48,12);
yy+=36+12;
for(const [who,t] of MSG.slice(0,n)){
if(t==='img'){c.add('img',x+p,yy,bw,ih,'Фото процесса',{r:12});yy+=ih+8;continue}
const bh=th(t,fs,bw-32)+16,bx=who?x+p:x+p+iw-bw;
c.add('rect',bx,yy,bw,bh,'',{r:12,...(who?{fill:SOFT}:{})});c.add('text',bx+16,yy+8,bw-32,bh-16,t,{fs});yy+=bh+8}
c.add('rect',x+p,yy,iw-48,40,'',{r:20});c.add('text',x+p+16,yy+10,iw-48-32,20,'Сообщение',{fs:14});
c.add('rect',x+p+iw-40,yy,40,40,'',{r:20});c.add('text',x+p+iw-40,yy+8,40,24,'→',{fs:16,al:'c'});
yy+=40;fr.h=r4(yy+p-y);return y+fr.h}

function v3d(sub:boolean):Out{const c=ctx();const lw=700,top=48;
let y=T(c,H3,LX,top,lw,32,{b:true})+12;
if(sub)y=T(c,S3,LX,y,lw,18)+24;else y+=12;
for(const b of A3)y=row(c,LX,y,lw,b,48,16,14,false)+16;
const end=cta(c,LX,y+8,lw,CTA3,NOTE);
const pe=chat(c,LX+LW-400,top,400,5,15,136);
return fin(c)}

function v3s(d:Dev,sub:boolean):Out{const c=ctx();const m=d==='mobile',X=m?20:48,w=FW[d]-2*X;
let y=head(c,d,H3,H3M,S3,S3M,false,sub);
if(m){y=chat(c,X,y,w,2,14,0)+16;for(const b of A3)y=row(c,X,y,w,b,32,15,13,true)+10;return done(c,d,y,CTA3M)}
const lw=336,gp=24,cx=X+lw+gp,cw=w-lw-gp;let ly=y;
for(const b of A3)ly=row(c,X,ly,lw,b,40,16,14,false)+14;
const ce=chat(c,cx,y,cw,4,14,96);
y=cta(c,X,Math.max(ly-14,ce)+20,w,CTA3,NOTE);
return done(c,d,y,CTA3M)}

// ---------- 4. На связи 12/7 и обязанности ----------
const H4='Персональный менеджер на связи 12/7 весь срок работ и гарантии';
const H4M='Менеджер на связи 12/7 весь срок работ';
const S4='Один человек знает всё про заказ и решает вопросы, даже срочные вечером и в выходные';
const S4M='Один человек знает всё про заказ и решает вопросы';
const P4='Закреплён в договоре на весь срок работ и гарантии';
const ST:[string,string,string][]=[
['12/7','на связи 12 часов в день и 7 дней в неделю','на связи'],
['Срочно','отвечает даже в нерабочее время','в нерабочее время'],
['1 день','на передачу истории новому сотруднику клиента','на передачу истории']];
const D4:It[]=[
{t:'Знает всё про заказ',d:'Владеет ситуацией по выполненным и запланированным этапам и сообщает статус по запросу',dm:'Статус по этапам по запросу'},
{t:'Согласует условия оплаты',d:'Подбирает индивидуальные условия оплаты, постоплаты и рассрочки',dm:'Рассрочка и постоплата'},
{t:'Подключает инженера',d:'Организует переговоры технического отдела клиента с инженером компании при нестандартном вопросе',dm:'Переговоры с инженером компании'},
{t:'Передаёт историю переговоров',d:'Знакомит нового сотрудника клиента со всеми договорённостями за 1 день',dm:'Новый сотрудник за 1 день в курсе'}];

/** три цифры: на связи, срочно, передача истории */
function stats(c:C,x:number,y:number,w:number,m:boolean):number{
const g=m?8:12,cw=(w-2*g)/3,bf=m?20:32,cf=m?13:14,pd=m?8:16,iw=cw-2*pd;
const h=r4(2*pd+Math.max(...ST.map(s=>th(s[0],bf,iw,true)+4+th(m?s[2]:s[1],cf,iw))));
ST.forEach((s,i)=>{const x0=x+i*(cw+g);c.add('rect',x0,y,cw,h);
const ty=T(c,s[0],x0+pd,y+pd,iw,bf,{b:true,al:'c'})+4;T(c,m?s[2]:s[1],x0+pd,ty,iw,cf,{al:'c'})});
return y+h}

function v4d(sub:boolean):Out{const c=ctx();const rx=540,rw=780,top=48;
let y=T(c,H4,rx,top,rw,32,{b:true})+12;
if(sub)y=T(c,S4,rx,y,rw,18)+24;else y+=12;
y=stats(c,rx,y,rw,false)+24;
const gw=16,cw=(rw-gw)/2;
for(let i=0;i<4;i+=2){const a=row(c,rx,y,cw,D4[i],40,16,14,false),b=row(c,rx+cw+gw,y,cw,D4[i+1],40,16,14,false);y=Math.max(a,b)+20}
const end=cta(c,rx,y+4,rw,CTA1,NOTE);
const ph=Math.max(420,end-top-12-64);
c.add('img',LX,top,360,ph,'Фото: менеджер на связи, живой снимок',{r:16});
nameBox(c,LX,top+ph+12,360);
return fin(c)}

function v4s(d:Dev,sub:boolean):Out{const c=ctx();const m=d==='mobile',X=m?20:48,w=FW[d]-2*X;
let y=head(c,d,H4,H4M,S4,S4M,false,sub);
y=prof(c,d,y,X,w,P4)+(m?14:20);
y=stats(c,X,y,w,m)+(m?14:20);
for(const b of D4)y=row(c,X,y,w,b,m?32:40,m?15:16,m?13:14,m)+(m?10:14);
if(!m)y=cta(c,X,y+6,w,CTA1,NOTE);
return done(c,d,y,CTA1M)}

// ---------- сборка ----------
interface V{name:string;dsk:(s:boolean)=>Out;stk:(d:Dev,s:boolean)=>Out;tips:string[]}
const VARS:V[]=[
{name:'Менеджер: фото, выгоды и кнопка',dsk:v1d,stk:v1s,tips:['Оценка: +6–10% к конверсии страницы. Лучший вариант: лицо, имя, четыре выгоды и кнопка связи в одном экране','Живое фото слева и имя с должностью под ним отвечают на вопрос «с кем я буду говорить»','Выгоды по формуле «Получите … за счёт …»: ответ за 5 минут, отчёт по этапам, согласования, сервис после сдачи','Кнопка и мессенджеры рядом: клиент пишет менеджеру напрямую, без формы','Мобилка: фото с цитатой, три выгоды в одну строку, кнопка и мессенджеры закреплены внизу']},
{name:'Менеджер: цитата и подарок',dsk:v2d,stk:v2s,tips:['Оценка: +5–8% к конверсии страницы. Сильнее всего, когда нужно «очеловечить» компанию: менеджер говорит от первого лица','Цитата без «Вы»: что менеджер делает, а не как приятно с ним работать','Три факта над кнопкой (договор, 12/7, 5 минут) снимают сомнение «а ответят ли мне после оплаты»','Подарок рядом с кнопкой напоминает, зачем оставлять заявку именно сейчас','Мобилка: карточка с цитатой, факты в одну строку, подарок и закреплённая кнопка']},
{name:'Менеджер: чат в мессенджере',dsk:v3d,stk:v3s,tips:['Оценка: +4–7% к конверсии страницы. Показывает, как выглядит работа с менеджером: переписка с фото и переносом срока','Три действия слева объясняют, чем менеджер полезен до сдачи заказа','Телефон с перепиской убеждает лучше слов: видно, что отвечают быстро и по делу','Подходит, когда клиенты привыкли писать в мессенджеры: услуги, ремонт, доставка, производство под заказ','Мобилка: короткая переписка из двух сообщений, три строки действий, кнопка закреплена внизу']},
{name:'Менеджер: на связи 12/7',dsk:v4d,stk:v4s,tips:['Оценка: +4–7% к конверсии страницы. Подходит для сложных заказов: техника, стройка, оборудование, где важна скорость ответа и ответственность','Цифра в заголовке (12/7) повторена в первой плашке: обещание и подтверждение рядом','Четыре обязанности закрывают вопросы: статус, оплата, инженер, передача дел при смене сотрудника','Плашки «12/7», «Срочно» и «1 день» читаются за секунду, даже если описание не прочитали','Мобилка: фото с подписью, три плашки, четыре короткие обязанности, кнопка закреплена внизу']}];
const MK=(v:V)=>(dev:Dev):Out=>fit(s=>dev==='desktop'?v.dsk(s):v.stk(dev,s),dev);
const GEN=['Имя, должность и фото живого человека на виду: без них менеджер выглядит выдумкой','Закрепление в договоре сильнее обещания на словах: впиши менеджера и срок связи в договор','Цифры (5 минут, 12/7, 1 день) замени реальными: невыполненное обещание убивает доверие','Блок ставь после выгод или этапов и перед формой: он снимает страх «после оплаты пропадут»','Не обещай менеджера, которого нет: если менеджер один на 50 клиентов, пиши честно про время ответа'];

export const MGR:{name:string;cat:string;spec:(d:Dev)=>Out}[]=VARS.map(v=>({name:v.name,cat:'Менеджер',spec:MK(v)}));
export const MGR_TIPS:Record<string,string[]>=Object.fromEntries(VARS.map(v=>[v.name,[...v.tips,...GEN]]));
export const MGR_NAMES=VARS.map(v=>v.name);
