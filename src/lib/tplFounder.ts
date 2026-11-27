// Основатель компании: 7 вариантов по 20 референсам (docs/refs/founder.md). ПК 1440, планшет 768, мобилка 390.
// Один блок = один экран: ПК 820, планшет до 1040, мобилка до 844 (кнопка и мессенджеры закреплены внизу).
// Все элементы обычные (текст, рамка, кнопка, картинка): правится каждая деталь. Фото и иконки это плейсхолдеры.
import {ctx,r4} from './tplFirst';
import type {C,Out} from './tplFirst';
import type {El} from '../store';
import {FW} from './dev';
import type {Dev} from './dev';

const SCR:Record<Dev,number>={desktop:820,tablet:960,mobile:780};
const CAP:Record<Dev,number>={desktop:820,tablet:1040,mobile:844};
const LX=120;
const wrap=(l:string,fs:number,w:number,b:boolean)=>{const cw=fs*(b?.67:.6);let n=1,cur=0;
for(const word of l.split(' ')){const ww=word.length*cw;if(cur===0)cur=ww;else if(cur+cw+ww<=w)cur+=cw+ww;else{n++;cur=ww}}return n};
const th=(t:string,fs:number,w:number,b=false)=>r4(t.split('\n').reduce((a,l)=>a+wrap(l,fs,w,b),0)*fs*1.3);
const T=(c:C,t:string,x:number,y:number,w:number,fs:number,more:Partial<El>={}):number=>{const h=th(t,fs,w,!!more.b);c.add('text',x,y,w,h,t,{fs,...more});return y+h};

// ---------- тексты (пример-ниша: юридическая компания) ----------
const NM='Олег Марков',RL='Основатель компании';
const H='Я основал компанию и лично отвечаю за результат по каждому делу';
const HM='Я основал компанию и лично отвечаю за результат';
const INTRO='Привет, меня зовут Олег Марков. 12 лет веду дела бизнеса в судах и знаю, где клиенты теряют деньги';
const INTM='Меня зовут Олег Марков. 12 лет веду дела бизнеса в судах';
const Q='«Берём дело, только если видим путь к выигрышу. С остальными прощаемся на первой встрече»';
const QM='«Берём дело, только если видим путь к выигрышу»';
const CTA='Обсудить дело с основателем',CTAM='Обсудить дело';
const NOTE='Основатель лично отвечает в течение 30 минут в рабочее время';
interface It{t:string;d:string;dm:string}
const F:It[]=[
{t:'12 лет в судах',d:'Веду дела бизнеса с 2014 года: споры с налоговой, подрядчиками и партнёрами',dm:'Споры бизнеса с 2014 года'},
{t:'Выиграно 380 дел',d:'В 91% случаев клиент получает то, что просил, или снижает требования больше чем наполовину',dm:'91% дел выиграно полностью или частично'},
{t:'Оплата за результат',d:'Часть гонорара платишь только после решения суда в твою пользу',dm:'Часть гонорара после решения суда'},
{t:'Отвечаю лично',d:'Первую встречу и стратегию веду сам, без передачи помощникам',dm:'Первая встреча и стратегия лично'}];
const ST:[string,string,string][]=[['12','лет ведёт дела бизнеса','лет в судах'],['380','выигранных дел','дел выиграно'],['91%','клиентов получают результат','получают результат']];

// ---------- общие части ----------
function bar(c:C,h:number,txt:string){const W=FW.mobile,X=20,w=W-40,by=h-96;
c.add('rect',0,by,W,96);c.add('text',X,by+6,w,20,'Закреплено внизу экрана',{fs:13});
c.add('btn',X,by+26,w-104,52,txt,{fs:14,acc:true});
c.add('rect',X+w-96,by+26,44,52,'TG',{fs:14,al:'c'});c.add('rect',X+w-44,by+26,44,52,'WA',{fs:14,al:'c'})}
const done=(c:C,d:Dev,y:number,txt:string):Out=>{
if(d==='mobile'){const h=Math.max(SCR.mobile,r4(y+8+96));bar(c,h,txt);return{h,els:c.els}}
return{h:Math.max(SCR[d],r4(y+40)),els:c.els}};
const fin=(c:C):Out=>{const mb=Math.max(...c.els.map(e=>e.y+e.h)),tp=Math.min(...c.els.map(e=>e.y));
const h=Math.max(SCR.desktop,r4(mb+40));const sh=h===SCR.desktop?Math.max(0,Math.floor((h-(mb-tp))/2)-tp):0;
for(const e of c.els)e.y+=sh;return{h,els:c.els}};
const fit=(f:(sub:boolean)=>Out,d:Dev):Out=>{const a=f(true);return a.h<=CAP[d]?a:f(false)};

function row(c:C,x:number,y:number,w:number,b:It,ic:number,ft:number,fd:number,short:boolean):number{
const tw=w-ic-16,d=short?b.dm:b.d;const hh=th(b.t,ft,tw,true)+4+th(d,fd,tw);const rh=Math.max(ic,hh);
c.add('img',x,y+(rh-ic)/2,ic,ic,ic>=48?'Иконка':'',ic>=48?{fs:13}:{});
const ty=T(c,b.t,x+ic+16,y+(rh-hh)/2,tw,ft,{b:true})+4;T(c,d,x+ic+16,ty,tw,fd);
return y+rh}
function nameBox(c:C,x:number,y:number,w:number):number{
const h=64,a=th(NM,18,w-32,true),b=th(RL,14,w-32);c.add('rect',x,y,w,h);
const ty=T(c,NM,x+16,y+(h-a-b)/2,w-32,18,{b:true});T(c,RL,x+16,ty,w-32,14);return y+h}
function cta(c:C,x:number,y:number,w:number,txt:string,note:string):number{
const bw=Math.min(440,w-144);
c.add('btn',x,y,bw,56,txt,{fs:16,acc:true});
c.add('rect',x+bw+16,y,56,56,'TG',{fs:14,al:'c'});c.add('rect',x+bw+80,y,56,56,'WA',{fs:14,al:'c'});
return T(c,note,x,y+56+10,w,14)}
function head(c:C,d:Dev,h:string,hm:string,s:string,sm:string,sub:boolean):number{
const m=d==='mobile',X=m?20:48,w=FW[d]-2*X;let y=m?20:40;
y=T(c,m?hm:h,X,y,w,m?22:28,{b:true})+12;
if(sub)y=T(c,m?sm:s,X,y,w,m?14:16)+(m?14:20);else y+=m?4:8;return y}
function prof(c:C,d:Dev,y:number,X:number,w:number,q:string):number{
const m=d==='mobile',ps=m?88:160,tx=X+ps+16,tw=w-ps-16,fn=m?16:22,fq=m?14:16;
c.add('img',X,y,ps,ps,m?'':'Фото',{r:m?ps/2:16});
const hh=th(NM,fn,tw,true)+4+th(RL,14,tw)+8+th(q,fq,tw);
let ty=y+Math.max(0,(ps-hh)/2);
ty=T(c,NM,tx,ty,tw,fn,{b:true})+4;ty=T(c,RL,tx,ty,tw,14)+8;ty=T(c,q,tx,ty,tw,fq);
return Math.max(y+ps,ty)}
function stats(c:C,x:number,y:number,w:number,m:boolean,n=3):number{
const g=m?8:12,cw=(w-(n-1)*g)/n,bf=m?20:32,cf=m?13:14,pd=m?8:16,iw=cw-2*pd,S=ST.slice(0,n);
const h=r4(2*pd+Math.max(...S.map(s=>th(s[0],bf,iw,true)+4+th(m?s[2]:s[1],cf,iw))));
S.forEach((s,i)=>{const x0=x+i*(cw+g);c.add('rect',x0,y,cw,h);
const ty=T(c,s[0],x0+pd,y+pd,iw,bf,{b:true,al:'c'})+4;T(c,m?s[2]:s[1],x0+pd,ty,iw,cf,{al:'c'})});
return y+h}
/** общая стопка планшета и мобилки: заголовок, профиль с цитатой, тело, кнопка */
const stack=(d:Dev,sub:boolean,body:(c:C,y:number,X:number,w:number,m:boolean)=>number,hh=H,hm=HM,q=Q,qm=QM):Out=>{
const c=ctx(),m=d==='mobile',X=m?20:48,w=FW[d]-2*X;
let y=head(c,d,hh,hm,INTRO,INTM,sub);
y=prof(c,d,y,X,w,m?qm:q)+(m?14:20);
y=body(c,y,X,w,m);
if(!m)y=cta(c,X,y+6,w,CTA,NOTE);
return done(c,d,y,CTAM)};
const facts=(n:number)=>(c:C,y:number,X:number,w:number,m:boolean)=>{for(const b of F.slice(0,n))y=row(c,X,y,w,b,m?32:40,m?15:16,m?13:14,m)+(m?10:14);return y};
const withStats=(n:number)=>(c:C,y:number,X:number,w:number,m:boolean)=>facts(n)(c,stats(c,X,y,w,m)+(m?14:20),X,w,m);

// ---------- 1. Лучший: фото слева, история, 4 факта и кнопка ----------
function v1d(sub:boolean):Out{const c=ctx();const rx=600,rw=720,top=48;
let y=T(c,H,rx,top,rw,32,{b:true})+12;
if(sub)y=T(c,INTRO,rx,y,rw,18)+24;else y+=12;
for(const b of F)y=row(c,rx,y,rw,b,48,16,14,false)+16;
const end=cta(c,rx,y+8,rw,CTA,NOTE);
const ph=Math.max(420,end-top-12-64);
c.add('img',LX,top,400,ph,'Фото: основатель в офисе, живой снимок',{r:16});
nameBox(c,LX,top+ph+12,400);
return fin(c)}

// ---------- 2. Цитата и подпись ----------
function v2d(sub:boolean):Out{const c=ctx();const rx=620,rw=700,top=64;
let y=T(c,Q,rx,top,rw,32,{b:true})+20;
if(sub)y=T(c,INTRO,rx,y,rw,18)+24;else y+=8;
for(const b of F.slice(0,3))y=row(c,rx,y,rw,b,40,16,14,false)+16;
c.add('rect',rx,y+4,200,56,'Подпись',{fs:14,al:'c'});
const end=T(c,NM+', '+RL.toLowerCase(),rx+216,y+22,rw-216,16,{b:true});
const ph=Math.max(480,end-top);
c.add('img',LX,top,420,ph,'Фото: основатель, портрет по пояс',{r:16});
const by=Math.max(end,top+ph)+32;cta(c,rx,by,rw,CTA,NOTE);
return fin(c)}
const v2s=(d:Dev,s:boolean)=>stack(d,s,(c,y,X,w,m)=>{c.add('rect',X,y,Math.min(200,w),44,'Подпись',{fs:13,al:'c'});return y+44+(m?14:20)+0},H,HM,Q,QM);

// ---------- 3. Крупная цифра ----------
function v3d(sub:boolean):Out{const c=ctx();const rx=620,rw=700,top=56;
let y=T(c,'Выиграно дел на сумму',rx,top,rw,18)+8;
y=T(c,'380 млн ₽',rx,y,rw,72,{b:true})+12;
if(sub)y=T(c,INTRO,rx,y,rw,18)+24;else y+=12;
y=stats(c,rx,y,rw,false)+24;
const end=cta(c,rx,y,rw,CTA,NOTE);
const ph=Math.max(480,end-top-12-64);
c.add('img',LX,top,400,ph,'Фото: основатель в кресле, живой снимок',{r:16});
nameBox(c,LX,top+ph+12,400);
return fin(c)}
const v3s=(d:Dev,s:boolean)=>stack(d,s,withStats(2),'Выиграно дел на 380 млн ₽','Выиграно дел на 380 млн ₽');

// ---------- 4. Два основателя ----------
const N2:[string,string][]=[['Олег Марков','Основатель, судебные споры'],['Игорь Седов','Сооснователь, налоги и договоры']];
function duo(c:C,x:number,y:number,w:number,ph:number,g:number):number{
const cw=(w-g)/2;let e=y;N2.forEach((n,i)=>{const x0=x+i*(cw+g);
c.add('img',x0,y,cw,ph,'Фото: '+(i?'сооснователь':'основатель'),{r:16});
const bh=r4(th(n[0],16,cw-24,true)+2+th(n[1],13,cw-24)+16);c.add('rect',x0,y+ph+8,cw,bh);const a=T(c,n[0],x0+12,y+ph+16,cw-24,16,{b:true});T(c,n[1],x0+12,a+2,cw-24,13);e=Math.max(e,y+ph+8+bh)});return e+8}
function v4d(sub:boolean):Out{const c=ctx();const rx=760,rw=560,top=48;
const e=duo(c,LX,top,600,360,16);
let y=T(c,'Мы основали компанию и сами ведём каждое дело',rx,top,rw,32,{b:true})+12;
if(sub)y=T(c,'Вдвоём 24 года в судах: Олег ведёт споры, Игорь отвечает за налоги и договоры',rx,y,rw,18)+24;else y+=12;
for(const b of F.slice(0,3))y=row(c,rx,y,rw,b,40,16,14,false)+16;
const end=cta(c,rx,Math.max(y+8,e-56),rw,CTA,NOTE);void end;
return fin(c)}
function v4s(d:Dev,sub:boolean):Out{const c=ctx();const m=d==='mobile',X=m?20:48,w=FW[d]-2*X;
let y=head(c,d,'Мы основали компанию и сами ведём каждое дело','Мы основали компанию и сами ведём дела','Вдвоём 24 года в судах: споры, налоги и договоры','24 года в судах на двоих',sub);
y=duo(c,X,y,w,m?160:260,m?8:16)+(m?10:14);
for(const b of F.slice(0,m?2:3))y=row(c,X,y,w,b,m?32:40,m?15:16,m?13:14,m)+(m?10:14);
if(!m)y=cta(c,X,y+6,w,CTA,NOTE);
return done(c,d,y,CTAM)}

// ---------- 5. Фото по центру, факты по бокам ----------
function v5d(sub:boolean):Out{const c=ctx();const top=48;
let y=T(c,H,LX,top,1200,32,{b:true,al:'c'})+12;
if(sub)y=T(c,INTRO,LX,y,1200,18,{al:'c'})+24;else y+=12;
const cw=380,px=LX+cw+20,pw=1200-2*(cw+20);const ph=360;
c.add('img',px,y,pw,ph,'Фото: основатель в полный рост',{r:16});
F.slice(0,3).forEach((b,i)=>{row(c,LX+0,y+i*(ph/3),cw,b,40,16,14,false)});
F.slice(3).concat([{t:'Без помощников',d:'Стратегию и позицию в суде утверждаю лично',dm:''},{t:'Фиксируем цену',d:'Гонорар по этапам прописан в договоре',dm:''}]).slice(0,3).forEach((b,i)=>{row(c,px+pw+20,y+i*(ph/3),cw,b,40,16,14,false)});
const by=nameBox(c,px,y+ph+12,pw)+28;cta(c,LX+(1200-576)/2,by,576,CTA,NOTE);
return fin(c)}
const v5s=(d:Dev,s:boolean)=>stack(d,s,facts(3));

// ---------- 6. Вопрос клиента и ответ ----------
const HQ='Как выиграть суд, если документы против тебя?';
function v6d(sub:boolean):Out{const c=ctx();const rx=620,rw=700,top=56;
let y=T(c,HQ,rx,top,rw,36,{b:true})+16;
y=T(c,'Отвечает основатель компании Олег Марков:',rx,y,rw,16)+8;
y=T(c,'«В 9 из 10 дел клиент приходит с ошибкой в первом ответе. Её можно исправить, если начать до заседания»',rx,y,rw,18)+(sub?24:12);
for(const b of F.slice(0,3))y=row(c,rx,y,rw,b,40,16,14,false)+16;
const end=cta(c,rx,y+8,rw,CTA,NOTE);
const ph=Math.max(480,end-top-12-64);
c.add('img',LX,top,420,ph,'Фото: основатель, портрет',{r:16});
nameBox(c,LX,top+ph+12,420);
return fin(c)}
const v6s=(d:Dev,s:boolean)=>stack(d,s,facts(3),HQ,'Как выиграть суд, если документы против тебя?','«В 9 из 10 дел клиент приходит с ошибкой в первом ответе. Её можно исправить до заседания»','«Ошибку в первом ответе можно исправить до заседания»');

// ---------- 7. Компактный: круг, цифры и кнопка ----------
function v7d(sub:boolean):Out{const c=ctx();const X=240,W=960,top=56;
c.add('img',X+(W-160)/2,top,160,160,'Фото',{r:80});
let y=T(c,NM+', '+RL.toLowerCase(),X,top+176,W,18,{b:true,al:'c'})+12;
y=T(c,H,X,y,W,32,{b:true,al:'c'})+12;
if(sub)y=T(c,INTRO,X,y,W,18,{al:'c'})+24;else y+=12;
y=stats(c,X,y,W,false)+24;
const bw=440;c.add('btn',X+(W-bw)/2,y,bw,56,CTA,{fs:16,acc:true});
T(c,NOTE,X,y+66,W,14,{al:'c'});
return fin(c)}
function v7s(d:Dev,sub:boolean):Out{const c=ctx();const m=d==='mobile',X=m?20:48,w=FW[d]-2*X;
const ps=m?96:140;c.add('img',X+(w-ps)/2,m?20:40,ps,ps,'Фото',{r:ps/2});
let y=(m?20:40)+ps+12;
y=T(c,NM+', '+RL.toLowerCase(),X,y,w,m?14:16,{b:true,al:'c'})+8;
y=T(c,m?HM:H,X,y,w,m?22:28,{b:true,al:'c'})+12;
if(sub)y=T(c,m?INTM:INTRO,X,y,w,m?14:16,{al:'c'})+(m?14:20);
y=stats(c,X,y,w,m)+(m?14:20);
if(!m)y=cta(c,X,y+6,w,CTA,NOTE);
return done(c,d,y,CTAM)}

// ---------- сборка ----------
interface V{name:string;dsk:(s:boolean)=>Out;stk:(d:Dev,s:boolean)=>Out;tips:string[]}
const s1=(d:Dev,s:boolean)=>stack(d,s,facts(4));
const VARS:V[]=[
{name:'Основатель: фото, история и 4 факта',dsk:v1d,stk:s1,tips:['Оценка: +6–10% к конверсии страницы. Лучший вариант: лицо, имя, история в одной фразе, четыре факта и кнопка связи','Живое фото слева с именем и должностью отвечает на вопрос «кто за этим стоит»','Факты с цифрами (годы, выигранные дела, процент) доказывают опыт, а не заявляют его','Кнопка и мессенджеры рядом: клиент пишет основателю напрямую','Мобилка: фото с цитатой, два-три факта в одну строку, кнопка и мессенджеры закреплены внизу']},
{name:'Основатель: цитата и подпись',dsk:v2d,stk:v2s,tips:['Оценка: +5–8% к конверсии страницы. Подходит, когда доверие строится на позиции и принципах основателя','Цитата в заголовке говорит от первого лица: что компания делает и чего не делает','Подпись под текстом делает обращение личным','Три факта под цитатой снимают вопрос «а он правда в этом разбирается»','Мобилка: фото с цитатой, подпись, факты и закреплённая кнопка']},
{name:'Основатель: крупная цифра',dsk:v3d,stk:v3s,tips:['Оценка: +5–8% к конверсии страницы. Подходит, когда есть одна сильная цифра: сумма, число клиентов, лет на рынке','Цифра 72 пикселя читается за секунду, фото рядом связывает её с человеком','Три плашки под цифрой подтверждают её фактами','Цифру замени реальной: без подтверждения она вредит','Мобилка: цифра в заголовке, фото с цитатой, две плашки, закреплённая кнопка']},
{name:'Основатель: два основателя',dsk:v4d,stk:v4s,tips:['Оценка: +4–7% к конверсии страницы. Подходит, когда компания держится на двух людях с разной экспертизой','Две фото с именами и ролями: клиент видит, кто за что отвечает','Заголовок «Мы…» объединяет, а роли под фото разделяют','Три факта отвечают на вопрос «почему вам, а не другим»','Мобилка: два фото в ряд, три строки фактов, закреплённая кнопка']},
{name:'Основатель: фото по центру',dsk:v5d,stk:v5s,tips:['Оценка: +4–6% к конверсии страницы. Подходит для эксперта-бренда: фото в центре, достижения по бокам','Три факта слева и три справа читаются как «досье»: опыт, результаты, условия','Имя и должность под фото закрепляют личность','Кнопка по центру под фото: взгляд идёт сверху вниз','Планшет и мобилка: общая стопка вместо трёх колонок']},
{name:'Основатель: вопрос и ответ',dsk:v6d,stk:v6s,tips:['Оценка: +5–8% к конверсии страницы. Подходит для сложных услуг: заголовок это вопрос клиента, ответ даёт основатель','Вопрос в заголовке совпадает с поисковым запросом и болью клиента','Ответ от первого лица доказывает экспертность лучше списка регалий','Три факта и кнопка закрывают вопрос «к кому идти дальше»','Мобилка: короткий вопрос, фото с ответом, факты и закреплённая кнопка']},
{name:'Основатель: компактный с цифрами',dsk:v7d,stk:v7s,tips:['Оценка: +3–5% к конверсии страницы. Подходит как короткая вставка между блоками, когда нужен лишь штрих доверия','Круглое фото, имя и три цифры занимают меньше экрана','Одна кнопка без мессенджеров: блок не отвлекает от основной формы','Ставь после первого экрана или перед формой','Мобилка: круглое фото, три плашки, закреплённая кнопка']}];
const MK=(v:V)=>(dev:Dev):Out=>fit(s=>dev==='desktop'?v.dsk(s):v.stk(dev,s),dev);
const GEN=['Живое фото основателя, не сток: без него блок выглядит выдумкой','Имя, должность и один факт про опыт обязательны в каждом варианте','Цифры замени реальными: непроверяемое обещание убивает доверие','Блок ставь после первого экрана или выгод и перед формой','Не пиши «опытный профессионал»: покажи годы, число дел или клиентов'];
export const FOUNDER:{name:string;cat:string;spec:(d:Dev)=>Out}[]=VARS.map(v=>({name:v.name,cat:'Основатель',spec:MK(v)}));
export const FOUNDER_TIPS:Record<string,string[]>=Object.fromEntries(VARS.map(v=>[v.name,[...v.tips,...GEN]]));
