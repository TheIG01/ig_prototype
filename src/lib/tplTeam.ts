// Команда: 4 варианта по разбору 16 референсов + прототип автора (docs/refs/team.md). ПК 1440, планшет 768, мобилка 390.
// Один блок = один экран: ПК 820, планшет до 1040, мобилка до 844 (кнопка и мессенджеры закреплены внизу).
// Число сотрудников (табов) от 3 до 8: `teamBuild(name, n)`. В библиотеке лежит типовое число каждого варианта.
// Все элементы обычные (текст, рамка, кнопка, картинка): правится каждая деталь. Фото и логотипы это плейсхолдеры.
import {ctx,th,r4} from './tplFirst';
import type {C,Out} from './tplFirst';
import {navH,navV} from './tplSocial';
import type {SocTab} from './tplSocial';
import {FW} from './dev';
import type {Dev} from './dev';

export const TEAM_MIN=3,TEAM_MAX=8;
const SCR:Record<Dev,number>={desktop:820,tablet:952,mobile:780};
const CAP:Record<Dev,number>={desktop:820,tablet:1040,mobile:844};
const LX=120,LW=1200;
const BLUE='#2F6BFF',SOFT='#E8F0FF';
const nn=(n:number)=>Math.max(TEAM_MIN,Math.min(TEAM_MAX,Math.round(n)));
const pl=(n:number)=>n<5?'специалиста':'специалистов';

interface M{nm:string;sh:string;r:string;d:string;dm:string}
const MEM:M[]=[
{nm:'Антон Громов',sh:'Антон',r:'Основатель компании',d:'Лично ведёт ключевых клиентов и принимает объекты',dm:'Ведёт ключевых клиентов'},
{nm:'Виктория Ланская',sh:'Виктория',r:'Менеджер проекта',d:'Ведёт объект от договора до сдачи и отвечает на вопросы',dm:'Ведёт объект до сдачи'},
{nm:'Валерий Седов',sh:'Валерий',r:'Главный инженер',d:'Проверяет расчёты и технологию на каждом этапе',dm:'Проверяет технологию'},
{nm:'Ольга Рудская',sh:'Ольга',r:'Проектировщик',d:'Рисует проект и согласует его до начала работ',dm:'Рисует и согласует проект'},
{nm:'Игорь Мартынов',sh:'Игорь',r:'Руководитель монтажа',d:'Отвечает за сроки и качество на площадке',dm:'Отвечает за сроки на объекте'},
{nm:'Александр Фомин',sh:'Александр',r:'Замерщик',d:'Приезжает за 2 дня и считает точную смету',dm:'Считает точную смету'},
{nm:'Алексей Орлов',sh:'Алексей',r:'Сервис-инженер',d:'Выезжает на гарантийные случаи в течение 48 часов',dm:'Выезжает в течение 48 часов'},
{nm:'Дарья Ким',sh:'Дарья',r:'Менеджер по заботе',d:'Напоминает об обслуживании и отвечает после сдачи',dm:'Заботится после сдачи'}];

/** выбранный сотрудник: цитата, 4 обязанности и 3 цифры доверия */
const L={
q:'Лично проверяю каждую смету и принимаю каждый объект перед сдачей',qm:'Лично принимаю каждый объект перед сдачей',
b:['Лично консультирует и ведёт ключевых клиентов','Утверждает материалы и технологии для каждого объекта','Контролирует сроки: объект сдаётся в день из договора','Выполняет гарантийные обязательства'],
bm:['Лично ведёт ключевых клиентов','Утверждает материалы и технологии','Сдаёт объект в день из договора'],
chips:['12 лет в отрасли','420+ сданных объектов','Ответ в течение дня'],
cta:'Написать Антону напрямую',ctam:'Написать Антону',note:'Антон свяжется в течение следующего дня'};
const SUB='Каждый работает в компании со дня основания и отвечает за свой этап';
const SUBM='Каждый отвечает за свой этап: от замера до сдачи';
const title=(n:number)=>`Над каждым объектом работают ${n} ${pl(n)} со стажем в компании от 8 лет`;
const titleM=(n:number)=>`${n} ${pl(n)} ведут объект от замера до сдачи`;
const mem=(n:number)=>MEM.slice(0,n);

const avatar=(c:C,x:number,y:number,s:number,on=false)=>{
if(on)c.add('rect',x-4,y-4,s+8,s+8,'',{r:(s+8)/2,fill:SOFT,stroke:BLUE,sw:2});
c.add('img',x,y,s,s,s>=72?'Фото':'',{r:s/2})};
/** выделенная рамка активного таба */
const onBox=(c:C,x:number,y:number,w:number,h:number)=>c.add('rect',x,y,w,h,'',{fill:SOFT,stroke:BLUE,sw:2,r:12});
const box=(c:C,x:number,y:number,w:number,h:number)=>c.add('rect',x,y,w,h,'',{r:12});

/** закреплённая панель мобилки: главная кнопка и мессенджеры */
function bar(c:C,h:number,txt:string){const W=FW.mobile,X=20,w=W-40,by=h-96;
c.add('rect',0,by,W,96);c.add('text',X,by+6,w,20,'Закреплено внизу экрана',{fs:13});
c.add('btn',X,by+26,w-104,52,txt,{fs:14,acc:true});
c.add('rect',X+w-96,by+26,44,52,'TG',{fs:14,al:'c'});c.add('rect',X+w-44,by+26,44,52,'WA',{fs:14,al:'c'})}
const done=(c:C,d:Dev,y:number,txt:string):Out=>{
if(d==='mobile'){const h=Math.max(SCR.mobile,r4(y+8+96));bar(c,h,txt);return{h,els:c.els}}
return{h:Math.max(SCR[d],r4(y+40)),els:c.els}};
/** если с подзаголовком блок не влезает в экран, подзаголовок убирается */
const fit=(f:(sub:boolean)=>Out,d:Dev):Out=>{const a=f(true);return a.h<=CAP[d]?a:f(false)};

/** заголовок и подзаголовок: ПК и планшет по центру, мобилка слева */
function head(c:C,d:Dev,n:number,sub:boolean):number{
const m=d==='mobile',X=m?20:d==='tablet'?48:LX,w=FW[d]-2*X;const al=m?undefined:'c' as const;const o=al?{b:true,al}:{b:true};
let y=m?20:40;
y=c.tx(m?titleM(n):title(n),X,y,w,m?22:d==='tablet'?28:36,o)+12;
if(sub)y=c.tx(m?SUBM:SUB,X,y,w,m?14:d==='tablet'?16:18,al?{al}:{})+(m?14:24);
else y+=m?4:12;
return y}

/** обязанности не первого сотрудника: пример, автор заменяет своими */
const bulX=(p:M,m:boolean)=>m?[p.dm,'Отвечает в течение дня','Принимает каждый этап']:[p.d,'Отвечает клиентам в течение рабочего дня','Принимает каждый этап и подписывает акт','Выходит на связь в мессенджере'];
/** главный блок выбранного сотрудника для планшета и мобилки: фото, имя, роль, цитата, обязанности */
function profile(c:C,d:Dev,m0:M,y:number,X:number,w:number,k=0):number{
const m=d==='mobile',ps=m?88:136,tx=X+ps+16,tw=w-ps-16;
const top=y;avatar(c,X,y,ps);
let ty=c.tx(m0.nm,tx,y,tw,m?18:24,{b:true})+4;
ty=c.tx(m0.r,tx,ty,tw,m?14:16)+8;
ty=c.tx('«'+(k?(m?m0.dm:m0.d):m?L.qm:L.q)+'»',tx,ty,tw,m?14:16)+8;
y=Math.max(top+ps,ty)+(m?12:16);
if(!m){const g=12,cw=(w-2*g)/3;L.chips.forEach((a,i)=>c.plate(X+i*(cw+g),y,cw,48,a,14,true,'c'));y+=48+14}
for(const b of k?bulX(m0,m):m?L.bm:L.b)y=c.tx('✓ '+b,X,y,w,m?14:16)+(m?6:8);
return y+(m?6:10)}

// ---------- 3. Все на виду: сетка карточек без табов ----------
function v3d(n:number,sub:boolean):Out{const c=ctx();const a=mem(n);
const top=head(c,'desktop',n,sub);
const nc=n<=4?n:n<=6?3:4,rows=Math.ceil(n/nc),g=16,cw=(LW-(nc-1)*g)/nc,ps=n<=4?128:64,iw=cw-32;
const ch=Math.max(...a.map(p=>r4(16+ps+12+th(p.nm,16,iw,true)+4+th(p.r,14,iw)+8+th(p.d,14,iw)+16)));
a.forEach((p,i)=>{const x=LX+(i%nc)*(cw+g),y=top+Math.floor(i/nc)*(ch+g);box(c,x,y,cw,ch);
avatar(c,x+(cw-ps)/2,y+16,ps);let ty=y+16+ps+12;ty=c.tx(p.nm,x+16,ty,iw,16,{b:true,al:'c'})+4;ty=c.tx(p.r,x+16,ty,iw,14,{al:'c'})+8;c.tx(p.d,x+16,ty,iw,14,{al:'c'})});
const y=top+rows*(ch+g)-g+20;
c.add('btn',LX,y,440,56,L.cta,{fs:16,acc:true});c.tx(L.note,LX+464,y+8,LW-464,14);
return{h:Math.max(SCR.desktop,r4(y+56+40)),els:c.els}}

function v3s(n:number,d:Dev,sub:boolean):Out{const c=ctx();const a=mem(n);const m=d==='mobile';
const X=m?20:48,w=FW[d]-2*X;let y=head(c,d,n,sub);
const nc=m?1:2,g=m?8:12,cw=(w-(nc-1)*g)/nc,av=m?40:72,tw=cw-av-16-16-12;
const ch=m?52:Math.max(...a.map(p=>r4(16+th(p.nm,16,tw,true)+4+th(p.r,14,tw)+6+th(p.d,14,tw)+16)),av+24);
a.forEach((p,i)=>{const x=X+(i%nc)*(cw+g),yy=y+Math.floor(i/nc)*(ch+g);box(c,x,yy,cw,ch);
avatar(c,x+12,yy+(ch-av)/2,av);
const tx=x+12+av+12;
if(m){const hh=th(p.nm,15,tw,true)+th(p.dm,12,tw);let ty=yy+(ch-hh)/2;ty=c.tx(p.nm,tx,ty,tw,15,{b:true});c.tx(p.dm,tx,ty,tw,12)}
else{const hh=th(p.nm,16,tw,true)+4+th(p.r,14,tw)+6+th(p.d,14,tw);let ty=yy+(ch-hh)/2;ty=c.tx(p.nm,tx,ty,tw,16,{b:true})+4;ty=c.tx(p.r,tx,ty,tw,14)+6;c.tx(p.d,tx,ty,tw,14)}});
y+=Math.ceil(n/nc)*(ch+g)-g+(m?0:20);
if(!m){c.add('btn',X,y,Math.min(w,440),56,L.cta,{fs:16,acc:true});y+=56+10;y=c.tx(L.note,X,y,w,14)}
return done(c,d,y,L.ctam)}

// ---------- 4. Общее фото и руководители (3–4 человека) ----------
const GROUP='Фото: вся команда вместе, на фоне офиса или объекта';
const STAT=['20 сотрудников в штате','12 лет вместе без текучки','420+ сданных объектов'];
const STATM='20 сотрудников · 12 лет вместе · 420+ объектов';
const lead4=(n:number)=>Math.max(3,Math.min(4,n));
function v4d(n0:number,sub:boolean):Out{const c=ctx();const n=lead4(n0);const a=mem(n);
let y=head(c,'desktop',n,sub);
c.add('img',LX,y,LW,208,GROUP);y+=208+16;
const g=24,cw=(LW-(n-1)*g)/n,ps=88,tw=cw-ps-16-32;
const ch=Math.max(...a.map(p=>r4(16+th(p.nm,16,tw,true)+4+th(p.r,14,tw)+6+th(p.d,14,tw)+16)),ps+32);
a.forEach((p,i)=>{const x=LX+i*(cw+g);box(c,x,y,cw,ch);avatar(c,x+16,y+(ch-ps)/2,ps);
const hh=th(p.nm,16,tw,true)+4+th(p.r,14,tw)+6+th(p.d,14,tw);let ty=y+(ch-hh)/2;ty=c.tx(p.nm,x+16+ps+16,ty,tw,16,{b:true})+4;ty=c.tx(p.r,x+16+ps+16,ty,tw,14)+6;c.tx(p.d,x+16+ps+16,ty,tw,14)});
y+=ch+16;
const sw=(LW-2*12)/3;STAT.forEach((t,i)=>c.plate(LX+i*(sw+12),y,sw,48,t,14,true,'c'));y+=48+20;
c.add('btn',LX,y,440,56,L.cta,{fs:16,acc:true});c.tx(L.note,LX+464,y+8,LW-464,14);
return{h:Math.max(SCR.desktop,r4(y+56+32)),els:c.els}}

function v4s(n0:number,d:Dev,sub:boolean):Out{const c=ctx();const n=lead4(n0);const a=mem(n);const m=d==='mobile';
const X=m?20:48,w=FW[d]-2*X;let y=head(c,d,n,sub);
c.add('img',X,y,w,m?136:200,GROUP);y+=(m?136:200)+12;
const av=m?48:72,tw=w-av-16-16-12,rh=m?64:Math.max(av+24,...a.map(p=>r4(16+th(p.nm,16,tw,true)+4+th(p.r,14,tw)+6+th(p.d,14,tw)+16)));
a.forEach(p=>{box(c,X,y,w,rh);avatar(c,X+12,y+(rh-av)/2,av);const tx=X+12+av+12;
if(m){const hh=th(p.nm,15,tw,true)+th(p.r,12,tw);let ty=y+(rh-hh)/2;ty=c.tx(p.nm,tx,ty,tw,15,{b:true});c.tx(p.r,tx,ty,tw,12)}
else{const hh=th(p.nm,16,tw,true)+4+th(p.r,14,tw)+6+th(p.d,14,tw);let ty=y+(rh-hh)/2;ty=c.tx(p.nm,tx,ty,tw,16,{b:true})+4;ty=c.tx(p.r,tx,ty,tw,14)+6;c.tx(p.d,tx,ty,tw,14)}
y+=rh+(m?8:10)});
y=c.tx(m?STATM:STAT.join(' · '),X,y+(m?2:6),w,m?13:14,{b:true,...(m?{}:{al:'c' as const})})+(m?4:14);
if(!m){c.add('btn',X,y,Math.min(w,440),56,L.cta,{fs:16,acc:true});y+=56+10;y=c.tx(L.note,X,y,w,14)}
return done(c,d,y,L.ctam)}


// ---------- табы с переключением: вкладка = отдельный блок (механизм «Этапов»: Block.sv, El.tg) ----------
const CTAT='Написать эксперту напрямую',CTATM='Написать эксперту';
const lab=(p:M)=>p.nm+'\n'+p.r;
/** планшет и мобилка обоих вариантов: ряд вкладок, под ним выбранный сотрудник */
function tabS(c:C,d:Dev,a:M[],n:number,i:number,g:string,y:number):Out{const m=d==='mobile',X=m?20:48,w=FW[d]-2*X;
y=navH(c,d,y,a.map(p=>p.sh),n,i,g);y=profile(c,d,a[i],y,X,w,i);
if(!m){c.add('btn',X,y,Math.min(w,440),56,CTAT,{fs:16,acc:true});y+=56+10;y=c.tx(L.note,X,y,w,14)}
return done(c,d,y,CTATM)}
/** 1. вертикальные вкладки слева, выбранный сотрудник справа */
function t1(d:Dev,n:number,i:number,g:string):Out{return fit(sub=>{const c=ctx();const a=mem(n);const p=a[i];const top=head(c,d,n,sub);
if(d!=='desktop')return tabS(c,d,a,n,i,g,top);
const nb=navV(c,d,LX,top,380,a.map(lab),n,i,g);
const rx=560,rw=760,ps=200,q=i?p.d:L.q,bl=i?bulX(p,false):L.b;
avatar(c,rx,top,ps);const tx=rx+ps+28,tw=rw-ps-28;
const blk=th(p.nm,28,tw,true)+4+th(p.r,16,tw)+14+th('«'+q+'»',16,tw);let ty=top+(ps-blk)/2;
ty=c.tx(p.nm,tx,ty,tw,28,{b:true})+4;ty=c.tx(p.r,tx,ty,tw,16)+14;c.tx('«'+q+'»',tx,ty,tw,16);
let y=top+ps+20;const g2=12,cw=(rw-2*g2)/3;L.chips.forEach((t,k)=>c.plate(rx+k*(cw+g2),y,cw,52,t,14,true,'c'));y+=52+16;
const bw=(rw-48-16)/2,bh=[0,1].map(r=>Math.max(...[0,1].map(k=>th('✓ '+bl[r*2+k],16,bw)))),ch=r4(24+bh[0]+14+bh[1]+24);
box(c,rx,y,rw,ch);let by=y+24;[0,1].forEach(r=>{[0,1].forEach(k=>c.tx('✓ '+bl[r*2+k],rx+24+k*(bw+16),by,bw,16));by+=bh[r]+14});
y+=ch+20;c.add('btn',rx,y,440,56,CTAT,{fs:16,acc:true});c.tx(L.note,rx+464,y+8,rw-464,14);
return{h:Math.max(SCR.desktop,r4(Math.max(y+56,nb)+40)),els:c.els}},d)}
/** 2. горизонтальные вкладки сверху, панель под ними */
function t2(d:Dev,n:number,i:number,g:string):Out{return fit(sub=>{const c=ctx();const a=mem(n);const p=a[i];const top=head(c,d,n,sub);
if(d!=='desktop')return tabS(c,d,a,n,i,g,top);
const py=navH(c,d,top,a.map(x=>x.sh+'\n'+x.r),n,i,g)-8;
const ps=240,tx=LX+24+ps+32,tw2=LW-48-ps-32,q=i?p.d:L.q,bl=i?bulX(p,false):L.b;
const bw=(tw2-16)/2,bh=[0,1].map(r=>Math.max(...[0,1].map(k=>th('✓ '+bl[r*2+k],16,bw)))),
bk=th(p.nm,28,tw2,true)+4+th(p.r,16,tw2)+14+th('«'+q+'»',16,tw2)+20+bh[0]+12+bh[1]+22+56,ph=Math.max(ps+48,r4(bk+48));
box(c,LX,py,LW,ph);avatar(c,LX+24,py+(ph-ps)/2,ps);
let y=py+(ph-bk)/2;y=c.tx(p.nm,tx,y,tw2,28,{b:true})+4;y=c.tx(p.r,tx,y,tw2,16)+14;y=c.tx('«'+q+'»',tx,y,tw2,16)+20;
[0,1].forEach(r=>{[0,1].forEach(k=>c.tx('✓ '+bl[r*2+k],tx+k*(bw+16),y,bw,16));y+=bh[r]+(r?0:12)});y+=22;
c.add('btn',tx,y,400,56,CTAT,{fs:16,acc:true});c.tx(L.note,tx+420,y+8,tw2-420,14);
return{h:Math.max(SCR.desktop,r4(py+ph+40)),els:c.els}},d)}

// ---------- сборка ----------
type Fn=(n:number)=>(dev:Dev)=>Out;
const mk=(dsk:(n:number,s:boolean)=>Out,stk:(n:number,d:Dev,s:boolean)=>Out):Fn=>n=>dev=>dev==='desktop'?fit(s=>dsk(n,s),dev):fit(s=>stk(n,dev,s),dev);
const B3=mk(v3d,v3s);
const B4=mk(v4d,v4s);
interface V{name:string;n:number;f:Fn;tips:string[];tab?:boolean}
const COMMON=['Цифра в заголовке совпадает с числом людей в блоке: заголовок обещает N специалистов, в блоке ровно N','Фото живых людей на рабочем месте работает лучше студийных портретов: покажи реальную команду','Подпись «что делает для клиента» сильнее одной должности: человек видит, кто за что отвечает','Подставь реальных людей, их роли и цифры: бассейны и имена это пример','От 3 до 8 человек: меньше выглядит пусто, больше размывает доверие. Остальных убери в отдельную страницу «О компании»','Кнопка ведёт к руководителю лично: письмо основателю даёт больше заявок, чем общая форма'];
const TABT=['Вкладка = отдельный блок: в просмотре клик по сотруднику переключает блоки. Число вкладок 3–7 меняется кнопкой «Этапов» в панели блока','Тексты сотрудников, кроме первого, это пример: замени на настоящие имена, роли и обязанности'];
const VARS:V[]=[
{name:'Команда: табы слева и эксперт',n:6,tab:true,f:n=>d=>t1(d,n,0,'t'),tips:['Оценка: +7–11% к конверсии страницы. Лучший вариант: человек выбирает сотрудника в списке и сразу видит его роль, цитату, цифры и 4 обязанности','Список слева даёт быстрый обзор всей команды, а блок справа показывает главного человека крупно и с доказательствами: 3 цифры и 4 обязанности','Кнопка «Написать …» привязана к руководителю: личный контакт повышает доверие','Табы кастомные: при нажатии на сотрудника справа открывается его карточка (в просмотре показана карточка первого)','Мобилка: полоса аватаров, под ней карточка выбранного, кнопка и мессенджеры закреплены внизу']},
{name:'Команда: табы сверху',n:4,tab:true,f:n=>d=>t2(d,n,0,'t'),tips:['Оценка: +5–9% к конверсии страницы. Подходит, когда людей 3–5 и у каждого есть что показать подробно','Горизонтальные табы читаются слева направо, как этапы: человек проходит команду по очереди','Крупная панель под табами даёт место для цитаты, цифр и 4 обязанностей','При 6–8 людях табы становятся вертикальными карточками (аватар сверху), ничего не обрезается','Мобилка: аккордеон вместо слайдера, раскрыта первая строка']},
{name:'Команда: все на виду',n:8,f:B3,tips:['Оценка: +4–7% к конверсии страницы. Нет кликов, вся команда видна сразу: подходит, когда людей 6–8 и лишние нажатия мешают','Карточка: фото, имя, роль, одна строка «что делает для клиента». Длинные описания убирай на отдельную страницу','Сетка 4×2 при 7–8 людях, 3×2 при 5–6, одна строка при 3–4','Ставь после выгод и перед формой: форма закрывает сомнение «а кто будет работать с моим заказом»','Мобилка: компактный список с одной строкой пояснения, кнопка закреплена внизу']},
{name:'Команда: общее фото и руководители',n:3,f:B4,tips:['Оценка: +4–8% к конверсии страницы. Сильнее всего у производств и сервисов: общее фото показывает масштаб, три руководителя дают лица','Общее фото в одном кадре со всеми: видно, что компания живая и людей много','Три цифры под карточками (штат, стаж, объекты) подтверждают масштаб, как и число в заголовке','Подходит для 3–4 руководителей: остальные сотрудники показаны на общем фото','Мобилка: общее фото сверху, три компактные строки, цифры в одну строку, кнопка закреплена внизу']}];

export const TEAM:{name:string;cat:string;spec:(d:Dev)=>Out}[]=VARS.map(v=>({name:v.name,cat:'Команда',spec:v.f(v.n)}));
export const TEAM_TIPS:Record<string,string[]>=Object.fromEntries(VARS.map(v=>[v.name,[...v.tips,...(v.tab?TABT:[]),...COMMON]]));
/** сборка варианта с нужным числом сотрудников (3–8): для проверки и будущего счётчика */
export const teamBuild=(name:string,n:number,dev:Dev):Out|null=>{const v=VARS.find(x=>x.name===name);return v?v.f(nn(n))(dev):null};
export const TEAM_NAMES=VARS.map(v=>v.name);
/** типовое число сотрудников варианта по имени блока, null если имя не из «Команды» */
export const teamN=(name:string):number|null=>{const v=VARS.find(x=>x.name===name);return v&&!v.tab?v.n:null};
/** варианты с вкладками: подключены к механизму «Этапов» (tplSteps), каждая вкладка отдельный блок */
export const TEAM_TABS:SocTab[]=[{name:'Команда: табы слева и эксперт',vert:true,n0:6,gen:t1},{name:'Команда: табы сверху',n0:4,gen:t2}];
