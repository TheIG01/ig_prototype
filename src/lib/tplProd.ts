// Собственное производство и контроль качества: 8 вариантов по 21 референсу (docs/refs/prod.md). ПК 1440, планшет 768, мобилка 390.
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

// ---------- тексты (пример-ниша: мебельная фабрика) ----------
const H='Делаем мебель на собственной фабрике и сами отвечаем за каждую деталь';
const HM='Делаем мебель на собственной фабрике';
const INTRO='Фабрика 2 000 м² в Одинцово: от распила до сборки 20 дней, брак исключают три этапа контроля';
const INTM='Фабрика 2 000 м², срок 20 дней, три этапа контроля';
const CTA='Посмотреть производство',CTAM='Посмотреть производство';
const NOTE='Экскурсия на фабрику по будням, запись за 1 минуту';
interface It{t:string;d:string;dm:string}
const CS:It[]=[
{t:'Проверка комплектующих',d:'Каждую партию фурнитуры и ткани проверяем до запуска в производство',dm:'Проверяем партию до запуска'},
{t:'Контроль после сборки',d:'Отдельный инженер осматривает изделие по чек-листу из 20 пунктов',dm:'Чек-лист из 20 пунктов'},
{t:'Проверка перед отправкой',d:'Упаковщик фотографирует каждое изделие и прикладывает фото к заказу',dm:'Фото изделия в заказе'}];
const PTS:string[][]=[['Проверка фурнитуры при поступлении','Входной замер материалов'],['Осмотр по чек-листу из 20 пунктов','Проверка геометрии и швов'],['Контроль упаковки и комплектации','Фото изделия в заказе']];
const ST:[string,string,string][]=[['2 000 м²','площадь фабрики','площадь'],['20 дней','срок изготовления','срок'],['3 этапа','контроля качества','контроль']];
const ST4:[string,string,string,string][]=[['2 000 м²','Фабрика полного цикла от распила до упаковки','Фабрика полного цикла','цех'],['9 инженеров','Контролируют качество в цехе и на складе','Контролируют качество','команда'],['3 000 м²','Собственный склад готовых изделий','Склад изделий','склад']];
const FIVE=['Распил','Склейка','Фрезеровка','Шлифовка','Сборка'];
const DEF=['Сколотый угол','Трещина','Разнотон','Царапина','Вмятина'];
const BN:It[]=[
{t:'Современное оборудование',d:'Станки с ЧПУ вырезают детали с точностью до 0,5 мм',dm:'Станки с ЧПУ, точность 0,5 мм'},
{t:'Сертифицированные материалы',d:'Работаем только с поставщиками, у которых есть сертификаты',dm:'Только сертифицированные поставщики'},
{t:'Прямые договоры',d:'Закупаем ткани и фурнитуру у производителей без посредников',dm:'Закупка без посредников'}];
const C3:{t:string;d:string;p:string[]}[]=[
{t:'Проверяем поставщиков',d:'Берём материалы у производителей с сертификатами качества',p:['Сертификат на каждую партию','Входной замер толщины']},
{t:'Принимаем каждую партию',d:'Лаборатория проверяет сырьё до запуска в цех',p:['Соответствие размеров чертежу','Отсутствие трещин и сколов']},
{t:'Осматриваем каждое изделие',d:'Инженер проверяет геометрию и сборку перед отправкой',p:['Точность швов и углов','Комплектность и упаковка']}];
const NM='Григорий Климов',RL='Директор производства';
const Q8='«Соблюдаем технологию и проверяем каждое изделие до отправки. Брак находим в цехе, до клиента»';
const Q8M='«Проверяем каждое изделие до отправки»';

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
function nrow(c:C,x:number,y:number,w:number,b:It,i:number,bs:number,ft:number,fd:number,short:boolean):number{
const tw=w-bs-16,d=short?b.dm:b.d;const hh=th(b.t,ft,tw,true)+4+th(d,fd,tw);const rh=Math.max(bs,hh);
c.add('rect',x,y+(rh-bs)/2,bs,bs,String(i+1),{fs:16,al:'c',b:true});
const ty=T(c,b.t,x+bs+16,y+(rh-hh)/2,tw,ft,{b:true})+4;T(c,d,x+bs+16,ty,tw,fd);return y+rh}
function prow(c:C,x:number,y:number,w:number,t:string,d:string,ic:number,ft:number,fd:number,lab=''):number{
const tw=w-ic-16,hh=th(t,ft,tw,true)+4+th(d,fd,tw);const rh=Math.max(ic,hh);
c.add('img',x,y+(rh-ic)/2,ic,ic,lab,{r:ic>=48?12:8,fs:13});
const ty=T(c,t,x+ic+16,y+(rh-hh)/2,tw,ft,{b:true})+4;T(c,d,x+ic+16,ty,tw,fd);return y+rh}
function cta(c:C,x:number,y:number,w:number,txt:string,note:string):number{
const bw=Math.min(440,w-144);
c.add('btn',x,y,bw,56,txt,{fs:16,acc:true});
c.add('rect',x+bw+16,y,56,56,'TG',{fs:14,al:'c'});c.add('rect',x+bw+80,y,56,56,'WA',{fs:14,al:'c'});
return T(c,note,x,y+56+10,w,14)}
function head(c:C,d:Dev,h:string,hm:string,s:string,sm:string,sub:boolean,al?:'c'):number{
const m=d==='mobile',X=m?20:48,w=FW[d]-2*X;let y=m?20:40;const o:Partial<El>=al?{al}:{};
y=T(c,m?hm:h,X,y,w,m?22:28,{b:true,...o})+12;
if(sub)y=T(c,m?sm:s,X,y,w,m?14:16,o)+(m?14:20);else y+=m?4:8;return y}
function stats(c:C,x:number,y:number,w:number,m:boolean,bf:number,n=3):number{
const g=m?8:12,cw=(w-(n-1)*g)/n,cf=m?13:14,pd=m?8:16,iw=cw-2*pd,S=ST.slice(0,n);
const h=r4(2*pd+Math.max(...S.map(s=>th(s[0],bf,iw,true)+4+th(m?s[2]:s[1],cf,iw))));
S.forEach((s,i)=>{const x0=x+i*(cw+g);c.add('rect',x0,y,cw,h);
const ty=T(c,s[0],x0+pd,y+pd,iw,bf,{b:true,al:'c'})+4;T(c,m?s[2]:s[1],x0+pd,ty,iw,cf,{al:'c'})});
return y+h}
function prof(c:C,d:Dev,y:number,X:number,w:number,q:string):number{
const m=d==='mobile',ps=m?88:140,tx=X+ps+16,tw=w-ps-16,fn=m?16:20,fq=m?14:16;
c.add('img',X,y,ps,ps,m?'':'Фото',{r:ps/2});
const hh=th(NM,fn,tw,true)+4+th(RL,14,tw)+8+th(q,fq,tw);
let ty=y+Math.max(0,(ps-hh)/2);
ty=T(c,NM,tx,ty,tw,fn,{b:true})+4;ty=T(c,RL,tx,ty,tw,14)+8;ty=T(c,q,tx,ty,tw,fq);
return Math.max(y+ps,ty)}
/** общая стопка планшета и мобилки: заголовок, тело, кнопка */
const stack=(d:Dev,sub:boolean,body:(c:C,y:number,X:number,w:number,m:boolean)=>number,hh=H,hm=HM,al?:'c'):Out=>{
const c=ctx(),m=d==='mobile',X=m?20:48,w=FW[d]-2*X;
let y=head(c,d,hh,hm,INTRO,INTM,sub,al);
y=body(c,y,X,w,m);
if(!m)y=cta(c,X,y+6,w,CTA,NOTE);
return done(c,d,y,CTAM)};
const photo=(lab:string,hd:number,hm:number)=>(c:C,y:number,X:number,w:number,m:boolean)=>{c.add('img',X,y,w,m?hm:hd,lab,{r:16});return y+(m?hm:hd)+(m?14:20)};
const steps=(n:number,nums=false)=>(c:C,y:number,X:number,w:number,m:boolean)=>{CS.slice(0,n).forEach((b,i)=>{y=(nums?nrow(c,X,y,w,b,i,m?32:40,m?15:16,m?13:14,m):row(c,X,y,w,b,m?32:40,m?15:16,m?13:14,m))+(m?10:14)});return y};
const both=(...f:((c:C,y:number,X:number,w:number,m:boolean)=>number)[])=>(c:C,y:number,X:number,w:number,m:boolean)=>f.reduce((a,g)=>g(c,a,X,w,m),y);

// ---------- 1. Лучший: фото цеха, цифры и 3 этапа ----------
function v1d(sub:boolean):Out{const c=ctx();const rx=720,rw=600,top=48;
let y=T(c,H,rx,top,rw,32,{b:true})+12;
if(sub)y=T(c,INTRO,rx,y,rw,18)+24;else y+=12;
y=stats(c,rx,y,rw,false,28)+24;
for(const b of CS)y=row(c,rx,y,rw,b,48,16,14,false)+16;
const end=cta(c,rx,y+8,rw,CTA,NOTE);
c.add('img',LX,top,560,Math.max(440,end-top),'Фото: цех фабрики, живой снимок',{r:16});
return fin(c)}
const v1s=(d:Dev,s:boolean)=>stack(d,s,both(photo('Фото: цех фабрики',220,140),(c,y,X,w,m)=>stats(c,X,y,w,m,m?20:28)+(m?14:20),steps(3)));

// ---------- 2. Три этапа в карточках ----------
function v2d(sub:boolean):Out{const c=ctx();const top=48;
let y=T(c,H,LX,top,1200,32,{b:true,al:'c'})+12;
if(sub)y=T(c,INTRO,LX,y,1200,18,{al:'c'})+24;else y+=12;
const g=24,cw=384,iw=cw-40;
const hs=CS.map(b=>th('Этап 1',13,iw,true)+4+th(b.t,20,iw,true)+8+th(b.d,16,iw));
const ch=r4(20+140+16+Math.max(...hs)+20);
CS.forEach((b,i)=>{const x0=LX+i*(cw+g);c.add('rect',x0,y,cw,ch);c.add('img',x0+20,y+20,iw,140,'Фото этапа '+(i+1),{r:12});
let ty=T(c,'Этап '+(i+1),x0+20,y+176,iw,13,{b:true})+4;ty=T(c,b.t,x0+20,ty,iw,20,{b:true})+8;T(c,b.d,x0+20,ty,iw,16)});
cta(c,LX+(1200-576)/2,y+ch+32,576,CTA,NOTE);return fin(c)}
const v2s=(d:Dev,s:boolean)=>stack(d,s,steps(3,true),H,HM,'c');

// ---------- 3. Фото и чек-листы по этапам ----------
function v3d(sub:boolean):Out{const c=ctx();const top=40,iw=440,pw=744;
let y=T(c,H,LX,top,1200,28,{b:true})+12;
if(sub)y=T(c,INTRO,LX,y,1200,16)+16;else y+=4;
const tw=pw-56,pt=(b:typeof C3[0])=>b.p.map(s=>'— '+s).join('\n');
const rh=r4(Math.max(...C3.map(b=>th(b.t,22,tw,true)+8+th(b.d,16,tw)+12+th(pt(b),16,tw)))+48);
C3.forEach((b,i)=>{const left=i%2===0,ix=left?LX:LX+pw+16,px=left?LX+iw+16:LX;
c.add('img',ix,y,iw,rh,'Фото: '+['поставщик','приёмка','проверка'][i],{r:16});c.add('rect',px,y,pw,rh);
let ty=T(c,b.t,px+28,y+24,tw,22,{b:true})+8;ty=T(c,b.d,px+28,ty,tw,16)+12;T(c,pt(b),px+28,ty,tw,16);y+=rh+12});
cta(c,LX+(1200-576)/2,y+8,576,CTA,NOTE);return fin(c)}
const v3s=(d:Dev,s:boolean)=>stack(d,s,(c,y,X,w,m)=>{C3.forEach((b,i)=>{
const dd=m?b.d:b.d+'\n'+b.p.map(p=>'— '+p).join('\n');y=prow(c,X,y,w,b.t,dd,m?64:96,m?15:16,m?13:14,'Фото '+(i+1))+(m?10:14)});return y});

// ---------- 4. Три фото с цифрами ----------
function v4d(sub:boolean):Out{const c=ctx();const top=48;
let y=T(c,H,LX,top,1200,32,{b:true,al:'c'})+12;
if(sub)y=T(c,INTRO,LX,y,1200,18,{al:'c'})+24;else y+=12;
const g=24,cw=384,ph=240,iw=cw-32;
const bh=r4(32+Math.max(...ST4.map(s=>th(s[0],36,iw,true)+4+th(s[1],16,iw))));
ST4.forEach((s,i)=>{const x0=LX+i*(cw+g);c.add('img',x0,y,cw,ph,'Фото: '+s[3],{r:16});c.add('rect',x0,y+ph+8,cw,bh);
const a=T(c,s[0],x0+16,y+ph+24,iw,36,{b:true})+4;T(c,s[1],x0+16,a,iw,16)});
cta(c,LX+(1200-576)/2,y+ph+8+bh+32,576,CTA,NOTE);return fin(c)}
const v4s=(d:Dev,s:boolean)=>stack(d,s,(c,y,X,w,m)=>{const ps=m?88:120;
ST4.forEach(q=>{c.add('img',X,y,ps,ps,m?'':'Фото: '+q[3],{r:12});const tw=w-ps-16,fn=m?22:28,fc=m?13:16,t=m?q[2]:q[1];
const hh=th(q[0],fn,tw,true)+4+th(t,fc,tw);const ty=T(c,q[0],X+ps+16,y+(ps-hh)/2,tw,fn,{b:true})+4;T(c,t,X+ps+16,ty,tw,fc);y+=ps+(m?10:14)});return y});

// ---------- 5. Полный цикл по шагам ----------
const H5='Весь цикл производства под одной крышей',H5M='Весь цикл под одной крышей';
function v5d(sub:boolean):Out{const c=ctx();const rw=460,top=48;
let y=T(c,'Полный цикл производства',LX,top,rw,14,{b:true})+8;
y=T(c,H5,LX,y,rw,32,{b:true})+12;
if(sub)y=T(c,INTRO,LX,y,rw,16)+20;else y+=8;
for(const b of CS)y=row(c,LX,y,rw,b,40,16,14,false)+14;
const end=cta(c,LX,y+6,rw,CTA,NOTE);
const sx=640,sw=126,sg=12,ph=Math.max(440,end-top-28);
FIVE.forEach((s,i)=>{const x0=sx+i*(sw+sg);c.add('img',x0,top,sw,ph,'Фото',{r:12});T(c,(i+1)+'. '+s,x0,top+ph+8,sw,14,{b:true,al:'c'})});
return fin(c)}
const v5s=(d:Dev,s:boolean)=>stack(d,s,(c,y,X,w,m)=>{
if(m){FIVE.forEach((s2,i)=>{c.add('img',X,y,48,48,'',{r:8});T(c,(i+1)+'. '+s2,X+64,y+15,w-64,16,{b:true});y+=56});return y+4}
const g=12,sw=(w-4*g)/5;FIVE.forEach((s2,i)=>{const x0=X+i*(sw+g);c.add('img',x0,y,sw,200,'Фото',{r:12});T(c,(i+1)+'. '+s2,x0,y+208,sw,14,{b:true,al:'c'})});
y+=208+18+20;return steps(3)(c,y,X,w,m)},H5,H5M);

// ---------- 6. Изделие и контроль ----------
const H6='3 этапа контроля исключают брак в каждом изделии',H6M='3 этапа контроля исключают брак';
function v6d(sub:boolean):Out{const c=ctx();const rw=540,top=48;
let y=T(c,H6,LX,top,rw,32,{b:true})+12;
if(sub)y=T(c,INTRO,LX,y,rw,16)+20;else y+=8;
CS.forEach((b,i)=>{y=prow(c,LX,y,rw,b.t,PTS[i].map(s=>'— '+s).join('\n'),48,18,14,'Иконка')+18});
const end=cta(c,LX,y+6,rw,CTA,NOTE);
c.add('img',700,top,620,Math.max(480,end-top),'Фото: готовое изделие крупным планом',{r:16});
return fin(c)}
const v6s=(d:Dev,s:boolean)=>stack(d,s,both(photo('Фото: готовое изделие',260,150),(c,y,X,w,m)=>{CS.forEach((b,i)=>{
y=prow(c,X,y,w,b.t,m?b.dm:PTS[i].map(p=>'— '+p).join('\n'),m?32:48,m?15:16,m?13:14,m?'':'Иконка')+(m?10:14)});return y}),H6,H6M);

// ---------- 7. Ноль дефектов ----------
function v7d(sub:boolean):Out{const c=ctx();const lw=440,top=48;
let y=T(c,'Ноль дефектов',LX,top,lw,56,{b:true})+16;
y=T(c,'Находим и убираем брак на 5 участках цеха до того, как изделие попадёт к клиенту',LX,y,lw,18)+(sub?16:8);
if(sub)y=T(c,INTRO,LX,y,lw,16)+20;
const end=cta(c,LX,y+8,lw,CTA,NOTE);
const g=20,cw=200,ih=150,sx=640;
DEF.forEach((s,i)=>{const x0=sx+(i%3)*(cw+g),y0=top+Math.floor(i/3)*(ih+8+20+24);c.add('img',x0,y0,cw,ih,'Фото: '+s.toLowerCase(),{r:12});T(c,s,x0,y0+ih+8,cw,14,{b:true})});
void end;return fin(c)}
const v7s=(d:Dev,s:boolean)=>stack(d,s,(c,y,X,w,m)=>{
const n=m?2:3,g=m?8:16,cw=(w-(n-1)*g)/n,ih=m?96:140,list=m?DEF.slice(0,4):DEF;
list.forEach((s2,i)=>{const x0=X+(i%n)*(cw+g),y0=y+Math.floor(i/n)*(ih+8+18+(m?10:14));c.add('img',x0,y0,cw,ih,'Фото',{r:12});T(c,s2,x0,y0+ih+8,cw,14,{b:true})});
return y+Math.ceil(list.length/n)*(ih+8+18+(m?10:14))},'Ноль дефектов на выходе из цеха','Ноль дефектов');

// ---------- 8. Преимущества, цитата и цифры ----------
const H8='Собственное производство и контроль качества на каждом этапе',H8M='Свой цех и контроль качества';
function v8d(sub:boolean):Out{const c=ctx();const top=40;
let y=T(c,H8,LX,top,1200,28,{b:true,al:'c'})+12;
if(sub)y=T(c,INTRO,LX,y,1200,16,{al:'c'})+20;else y+=8;
const g=24,cw=384,tw=cw-40-64;
const ch=r4(40+Math.max(...BN.map(b=>Math.max(48,th(b.t,16,tw,true)+4+th(b.d,14,tw)))));
BN.forEach((b,i)=>{const x0=LX+i*(cw+g);c.add('rect',x0,y,cw,ch);row(c,x0+20,y+20,cw-40,b,48,16,14,false)});
y+=ch+20;
c.add('img',LX,y,280,260,'Фото: директор производства',{r:16});
c.add('rect',LX,y+268,280,64);const a=T(c,NM,LX+16,y+268+(64-th(NM,18,248,true)-th(RL,14,248))/2,248,18,{b:true});T(c,RL,LX+16,a,248,14);
const qx=LX+280+24,qw=560;
let qy=T(c,Q8,qx,y,qw,22,{b:true})+16;
qy=T(c,'Подпись',qx,qy,200,14)+24;
cta(c,qx,Math.max(qy,y+180),qw,CTA,NOTE);
const sx=qx+qw+24,sw=1320-sx;ST.forEach((s,i)=>{const y0=y+i*(84+12),iw=sw-32;c.add('rect',sx,y0,sw,84);
const t=T(c,s[0],sx+16,y0+14,iw,28,{b:true})+2;T(c,s[1],sx+16,t,iw,14)});
return fin(c)}
const v8s=(d:Dev,s:boolean)=>stack(d,s,(c,y,X,w,m)=>{
for(const b of BN)y=row(c,X,y,w,b,m?32:40,m?15:16,m?13:14,m)+(m?10:14);
y=prof(c,d,y+(m?0:4),X,w,m?Q8M:Q8)+(m?14:20);
return stats(c,X,y,w,m,m?20:28)+(m?14:20)},H8,H8M);

// ---------- сборка ----------
interface V{name:string;dsk:(s:boolean)=>Out;stk:(d:Dev,s:boolean)=>Out;tips:string[]}
const VARS:V[]=[
{name:'Производство: фабрика, цифры и 3 этапа контроля',dsk:v1d,stk:v1s,tips:['Оценка: +6–10% к конверсии страницы. Лучший вариант: живое фото цеха, три цифры и три этапа контроля с кнопкой связи','Три цифры (площадь, срок, этапы) отвечают на вопрос «они правда производят сами»','Этапы контроля превращают слово «качество» в конкретные действия','Кнопка «Посмотреть производство» ведёт на экскурсию или видео цеха: это сильнее, чем «Оставить заявку»','Мобилка: фото цеха, три плашки, три строки этапов, кнопка и мессенджеры закреплены внизу']},
{name:'Производство: три этапа в карточках',dsk:v2d,stk:v2s,tips:['Оценка: +5–8% к конверсии страницы. Подходит, когда главное доказательство качества это процесс из трёх шагов','Каждая карточка: фото этапа, номер, название и одно действие','Номера задают порядок: клиент видит путь изделия, а не набор слов','Фото этапа бери из цеха: руки мастера, инструмент, проверка','Планшет и мобилка: три нумерованные строки вместо трёх колонок']},
{name:'Производство: фото и чек-листы по этапам',dsk:v3d,stk:v3s,tips:['Оценка: +5–8% к конверсии страницы. Подходит для B2B и тяжёлого оборудования, где клиент проверяет детали','Фото и текст чередуются слева и справа: страница читается без монотонности','В каждой панели заголовок, описание и два пункта чек-листа с конкретикой','Пункты чек-листа пиши как в реальном акте приёмки: размеры, сертификаты, допуски','Мобилка: фото-миниатюра, название и описание в строку, кнопка закреплена внизу']},
{name:'Производство: три фото с цифрами',dsk:v4d,stk:v4s,tips:['Оценка: +4–7% к конверсии страницы. Подходит, когда есть сильные цифры: площадь, команда, склад','Крупная цифра под фото читается за секунду и привязана к месту: цех, команда, склад','Подпись из одной фразы объясняет, что цифра значит для клиента','Фото настоящие: цех, сотрудники в форме, стеллажи со складом','Мобилка: фото-квадрат слева, цифра и подпись справа, три строки подряд']},
{name:'Производство: полный цикл по шагам',dsk:v5d,stk:v5s,tips:['Оценка: +4–6% к конверсии страницы. Подходит для сложного изделия, где важна последовательность операций','Пять вертикальных полос показывают цикл от сырья до упаковки','Номер и название операции под каждым фото: клиент пролистывает цикл за 5 секунд','Слева три факта и кнопка: взгляд идёт от цикла к действию','Мобилка: пять строк с миниатюрами и номерами, кнопка закреплена внизу']},
{name:'Производство: изделие и контроль',dsk:v6d,stk:v6s,tips:['Оценка: +4–6% к конверсии страницы. Подходит, когда продаёшь одно понятное изделие: окно, дверь, диван','Большое фото готового изделия показывает результат, чек-листы показывают, как к нему пришли','Заголовок с цифрой «3 этапа» обещает конкретику','Пункты контроля пиши глаголами в действии: проверяем, измеряем, фотографируем','Мобилка: фото изделия, три короткие строки этапов, кнопка закреплена внизу']},
{name:'Производство: ноль дефектов',dsk:v7d,stk:v7s,tips:['Оценка: +3–6% к конверсии страницы. Подходит для товаров, где клиент боится брака: мебель, окна, дерево','Заголовок «Ноль дефектов» работает как обещание, плитки показывают, какой брак мы находим','Пять типичных дефектов с фото убеждают сильнее общих слов про качество','Покажи реальные дефекты из цеха: клиент ценит честность','Мобилка: четыре плитки в сетке 2×2, кнопка закреплена внизу']},
{name:'Производство: преимущества, цитата и цифры',dsk:v8d,stk:v8s,tips:['Оценка: +5–8% к конверсии страницы. Подходит для компаний с командой и документами: добавляет лицо и доверие','Три преимущества сверху отвечают на вопрос «чем вы лучше»: оборудование, материалы, прямые договоры','Цитата директора делает цифры личными: за качество отвечает человек','Справа три цифры закрепляют масштаб: площадь, срок, этапы','Мобилка: преимущества, директор с цитатой, цифры и закреплённая кнопка']}];
const MK=(v:V)=>(dev:Dev):Out=>fit(s=>dev==='desktop'?v.dsk(s):v.stk(dev,s),dev);
const GEN=['Живые фото цеха, не сток: без них блок выглядит выдумкой','Цифры замени реальными: площадь, срок, число этапов','Покажи людей и оборудование: клиент верит тому, что видит','Блок ставь после первого экрана и перед формой или ценами','Не пиши «высокое качество»: покажи, какие проверки проходит изделие'];
export const PROD:{name:string;cat:string;spec:(d:Dev)=>Out}[]=VARS.map(v=>({name:v.name,cat:'Производство',spec:MK(v)}));
export const PROD_TIPS:Record<string,string[]>=Object.fromEntries(VARS.map(v=>[v.name,[...v.tips,...GEN]]));
