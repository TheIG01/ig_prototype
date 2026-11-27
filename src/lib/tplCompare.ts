// Сравнение: 6 вариантов по 3 референсам (docs/refs/compare.md). ПК 1440, планшет 768, мобилка 390.
// Один блок = один экран: ПК 820, планшет до 1040, мобилка до 844 (кнопка и мессенджеры закреплены внизу).
// Все элементы обычные (текст, рамка, кнопка, картинка): правится каждая деталь. Фото и иконки это плейсхолдеры.
import {ctx,r4,th} from './tplFirst';
import type {C,Out} from './tplFirst';
import type {El} from '../store';
import {FW} from './dev';
import type {Dev} from './dev';

const SCR:Record<Dev,number>={desktop:820,tablet:960,mobile:780};
const XS:Record<Dev,number>={desktop:120,tablet:48,mobile:20};
const T=(c:C,t:string,x:number,y:number,w:number,fs:number,more:Partial<El>={}):number=>{const h=th(t,fs,w,!!more.b);c.add('text',x,y,w,h,t,{fs,...more});return y+h};

// ---------- тексты (пример-ниша: кухни на заказ) ----------
const H='Сравни три способа заказать кухню',HM='Сравни способы заказать кухню';
const SUB='Цена, срок, гарантия и контроль качества в одной таблице';
const CTA='Рассчитать стоимость',NOTE='Расчёт за 1 минуту, без обязательств';
const COLS=['Наша фабрика','Салон-посредник','Частный мастер'];
interface R{k:string;v:string[];ok:number[]}
const ROWS:R[]=[
{k:'Цена',v:['Фиксируем в договоре','Наценка салона 30–50%','Ниже, но без договора'],ok:[1,0,1]},
{k:'Срок',v:['20 дней','45 дней','Срок на словах'],ok:[1,0,0]},
{k:'Гарантия',v:['5 лет по договору','1 год','Только на словах'],ok:[1,1,0]},
{k:'Контроль качества',v:['3 этапа и фото в заказе','Выборочная проверка','Проверки отсутствуют'],ok:[1,0,0]},
{k:'Монтаж',v:['Свои монтажники','Подрядчик','Ищешь сам'],ok:[1,1,0]}];
const BIG:R[]=[
{k:'Цена',v:['39 000 ₽','58 000 ₽'],ok:[1,0]},
{k:'Срок',v:['20 дней','45 дней'],ok:[1,0]},
{k:'Гарантия',v:['5 лет','1 год'],ok:[1,0]},
{k:'Этапы контроля',v:['3','1'],ok:[1,0]}];
const MX:R[]=[
{k:'Цена в договоре',v:[],ok:[1,0,1,0]},{k:'Срок до 20 дней',v:[],ok:[1,0,0,0]},{k:'Гарантия 5 лет',v:[],ok:[1,0,0,0]},
{k:'Контроль качества',v:[],ok:[1,0,0,1]},{k:'Свой монтаж',v:[],ok:[1,1,0,0]},{k:'Сертификаты',v:[],ok:[1,0,0,1]}];
interface Cd{t:string;it:string[];im:string;ok:boolean}
const PATH:Cd[]=[
{t:'Заказ через салон',im:'Фото салона',ok:false,it:['Наценка салона 30–50% к цене фабрики','Срок 45 дней, часть уходит на пересылку','Гарантия 1 год, ремонт через посредника','Проверка выборочная, брак находят дома']},
{t:'Заказ на фабрике',im:'Фото цеха',ok:true,it:['Цена фабрики без наценки, фиксируем в договоре','Срок 20 дней от распила до сборки','Гарантия 5 лет, ремонт делает фабрика','3 этапа контроля и фото изделия в заказе']}];
const LST:Cd[]=[
{t:'Заказ у нас',im:'',ok:true,it:['Цена в договоре','Срок 20 дней','Гарантия 5 лет','3 этапа контроля','Монтаж нашей бригадой']},
{t:'Заказ через посредника',im:'',ok:false,it:['Цена растёт после замера','Срок сдвигается','Гарантия 1 год','Проверка выборочная','Монтаж у подрядчика']}];

// ---------- общие части ----------
function bar(c:C,h:number,txt:string){const W=FW.mobile,X=20,w=W-40,by=h-96;
c.add('rect',0,by,W,96);c.add('text',X,by+6,w,20,'Закреплено внизу экрана',{fs:13});
c.add('btn',X,by+26,w-104,52,txt,{fs:14,acc:true});
c.add('rect',X+w-96,by+26,44,52,'TG',{fs:14,al:'c'});c.add('rect',X+w-44,by+26,44,52,'WA',{fs:14,al:'c'})}
const done=(c:C,d:Dev,y:number):Out=>{
if(d==='mobile'){const h=Math.max(SCR.mobile,r4(y+8+96));bar(c,h,CTA);return{h,els:c.els}}
return{h:Math.max(SCR[d],r4(y+40)),els:c.els}};
function cta(c:C,x:number,y:number):number{
c.add('btn',x,y,360,56,CTA,{fs:16,acc:true});
c.add('rect',x+376,y,56,56,'TG',{fs:14,al:'c'});c.add('rect',x+440,y,56,56,'WA',{fs:14,al:'c'});
return T(c,NOTE,x,y+66,496,14)}
function head(c:C,d:Dev,w?:number):number{const m=d==='mobile',X=XS[d],ww=w||FW[d]-2*X;let y=m?20:40;
y=T(c,m?HM:H,X,y,ww,m?22:d==='tablet'?26:30,{b:true})+12;
return m?y+8:T(c,SUB,X,y,ww,16)+24}
const mk=(c:C,x:number,y:number,ok:number|boolean)=>c.add('rect',x,y,24,24,ok?'✓':'✕',{fs:14,al:'c',b:true});

/** таблица: mode mt = значок и текст, m = только значок, big = крупные значения */
interface TO{hi?:number;kw:number;mode:'mt'|'m'|'big';fv?:number;pd?:number;min?:number}
function table(c:C,x:number,y:number,w:number,cols:string[],rows:R[],o:TO):number{
const n=cols.length,kw=o.kw,cw=(w-kw)/n,pd=o.pd||12,fv=o.fv||16,min=o.min||72,hi=o.hi??-1;
const hh=Math.max(...cols.map(t=>th(t,14,cw-2*pd,true)))+2*pd;
const rhs=rows.map(r=>{const kh=th(r.k,15,kw-2*pd,true)+2*pd;
const ch=o.mode==='m'?24+2*pd:Math.max(...r.v.slice(0,n).map((t,j)=>o.mode==='big'?th(t,fv,cw-2*pd,true)+2*pd:th(t,fv,cw-2*pd-36,j===0)+2*pd));
return Math.max(min,kh,ch)});
const H0=hh+rhs.reduce((a,b)=>a+b,0);
c.add('rect',x,y,w,H0);
if(hi>=0)c.add('rect',x+kw+hi*cw,y,cw,H0,'',{sw:3});
cols.forEach((t,j)=>{const h=th(t,14,cw-2*pd,true);c.add('text',x+kw+j*cw+pd,y+(hh-h)/2,cw-2*pd,h,t,{fs:14,b:true,al:'c'})});
let yy=y+hh;
rows.forEach((r,i)=>{const rh=rhs[i];c.add('rect',x,yy,w,1);
const kh=th(r.k,15,kw-2*pd,true);c.add('text',x+pd,yy+(rh-kh)/2,kw-2*pd,kh,r.k,{fs:15,b:true});
for(let j=0;j<n;j++){const x0=x+kw+j*cw;
if(o.mode==='m')mk(c,x0+(cw-24)/2,yy+(rh-24)/2,r.ok[j]);
else if(o.mode==='big'){const t=r.v[j],h=th(t,fv,cw-2*pd,true);c.add('text',x0+pd,yy+(rh-h)/2,cw-2*pd,h,t,{fs:fv,b:true,al:'c'})}
else{const t=r.v[j],h=th(t,fv,cw-2*pd-36,j===0);mk(c,x0+pd,yy+(rh-24)/2,r.ok[j]);c.add('text',x0+pd+36,yy+(rh-h)/2,cw-2*pd-36,h,t,{fs:fv,...(j===0?{b:true}:{})})}}
yy+=rh});
return y+H0}
/** список для планшета и мобилки: критерий и по строке на колонку */
function list(c:C,x:number,y:number,w:number,cols:string[],rows:R[],m:boolean):number{
const fk=m?15:16,ft=m?14:15;
for(const r of rows){c.add('rect',x,y,w,1);y+=12;y=T(c,r.k,x,y,w,fk,{b:true})+8;
cols.forEach((cn,j)=>{const t=cn+': '+r.v[j],h=Math.max(24,th(t,ft,w-36,j===0));mk(c,x,y+(h-24)/2,r.ok[j]);c.add('text',x+36,y,w-36,h,t,{fs:ft,...(j===0?{b:true}:{})});y+=h+8});
y+=4}
return y}
/** карточки: две рядом (ПК, планшет) или столбцом (мобилка) */
function cards(c:C,d:Dev,y:number,cs:Cd[],o:{img?:boolean;mk?:boolean}):number{
const m=d==='mobile',tb=d==='tablet',X=XS[d],w=FW[d]-2*X,g=m?12:tb?16:40,cw=m?w:(w-g)/2,pd=m?16:24;
const ih=o.img&&!m?(tb?120:180):0,ft=m?16:tb?18:20,fi=m?13:14,ic=o.mk?24:m?24:32,n=m?3:cs[0].it.length,tw=cw-2*pd-ic-12;
const hs=(cd:Cd)=>ih+pd+th(cd.t,ft,cw-2*pd,true)+16+cd.it.slice(0,n).reduce((a,t)=>a+Math.max(ic,th(t,fi,tw))+12,0)-12+pd;
const Hm=Math.max(...cs.map(hs));let yy=y;
cs.forEach((cd,i)=>{const x0=m?X:X+i*(cw+g),Hc=m?hs(cd):Hm;c.add('rect',x0,yy,cw,Hc);
if(ih)c.add('img',x0,yy,cw,ih,cd.im,{fs:13});
let ty=T(c,cd.t,x0+pd,yy+ih+pd,cw-2*pd,ft,{b:true,al:'c'})+16;
for(const t of cd.it.slice(0,n)){const h=th(t,fi,tw),rh=Math.max(ic,h);
if(o.mk)mk(c,x0+pd,ty+(rh-24)/2,cd.ok);else c.add('img',x0+pd,ty+(rh-ic)/2,ic,ic,'',{r:8});
c.add('text',x0+pd+ic+12,ty+(rh-h)/2,tw,h,t,{fs:fi});ty+=rh+12}
if(m)yy+=Hc+12});
return m?yy:y+Hm}

// ---------- варианты ----------
const v1=(d:Dev):Out=>{const c=ctx(),m=d==='mobile',X=XS[d],w=FW[d]-2*X;let y=head(c,d);
if(d==='desktop')y=table(c,X,y,w,COLS,ROWS,{hi:0,kw:240,mode:'mt',fv:16,min:80});
else y=list(c,X,y,w,m?COLS.slice(0,2):COLS,ROWS.slice(0,m?4:5),m);
if(!m)y=cta(c,X,y+24);return done(c,d,y)};
const v2=(d:Dev):Out=>{const c=ctx();let y=head(c,d);y=cards(c,d,y,PATH,{img:true});
if(d!=='mobile')y=cta(c,XS[d],y+24);return done(c,d,y)};
const v3=(d:Dev):Out=>{const c=ctx(),m=d==='mobile',X=XS[d],w=FW[d]-2*X;let y=head(c,d);
const cl=m?['Наша фабрика','Салон']:COLS.slice(0,2);
y=table(c,X,y,w,cl,BIG,d==='desktop'?{hi:0,kw:300,mode:'big',fv:32,min:88}:d==='tablet'?{hi:0,kw:180,mode:'big',fv:28,min:80}:{hi:0,kw:110,mode:'big',fv:18,pd:8,min:72});
if(!m)y=cta(c,X,y+24);return done(c,d,y)};
const v4=(d:Dev):Out=>{const c=ctx();let y=head(c,d);y=cards(c,d,y,LST,{mk:true});
if(d!=='mobile')y=cta(c,XS[d],y+24);return done(c,d,y)};
const v5=(d:Dev):Out=>{const c=ctx(),m=d==='mobile',X=XS[d],w=FW[d]-2*X;let y=head(c,d);
const cl=['Фабрика','Салон','Мастер','Каталог'].slice(0,m?2:4),rs=MX.map(r=>({...r,ok:r.ok.slice(0,m?2:4)}));
y=table(c,X,y,w,cl,rs,{hi:0,kw:m?190:d==='tablet'?192:360,mode:'m',pd:m?8:12,min:m?56:64});
if(!m)y=cta(c,X,y+24);return done(c,d,y)};
const v6=(d:Dev):Out=>{const c=ctx(),m=d==='mobile',X=XS[d],w=FW[d]-2*X;let y:number;
if(d==='desktop'){let ty=T(c,H,X,40,560,30,{b:true})+12;ty=T(c,SUB,X,ty,560,16)+24;
c.add('img',760,40,280,200,'Фото 1',{r:24,fs:13});c.add('img',1056,40,264,200,'Фото 2',{r:24,fs:13});
y=table(c,X,Math.max(ty,240)+32,w,COLS,ROWS.slice(0,4),{hi:0,kw:240,mode:'mt',fv:15,min:64})}
else{y=head(c,d);if(d==='tablet'){c.add('img',X,y,w,140,'Фото',{r:24,fs:13});y+=140+16}
y=list(c,X,y,w,m?COLS.slice(0,2):COLS,ROWS.slice(0,4),m)}
if(!m)y=cta(c,X,y+24);return done(c,d,y)};

const v7=(d:Dev):Out=>{const c=ctx(),m=d==='mobile',X=XS[d],w=FW[d]-2*X;let y=head(c,d);
const tn=['Салон','Мастер','Каталог'],g=8,tw=m?(w-2*g)/3:d==='tablet'?(w-2*g)/3:200;
tn.forEach((t,i)=>c.add('btn',X+i*(tw+g),y,tw,m?44:48,t,{fs:14,...(i===0?{acc:true}:{})}));y+=(m?44:48)+16;
const rs=ROWS.slice(0,4).map(r=>({...r,v:r.v.slice(0,2),ok:r.ok.slice(0,2)}));
if(m)y=list(c,X,y,w,COLS.slice(0,2),rs,true);
else y=table(c,X,y,w,COLS.slice(0,2),rs,{hi:0,kw:d==='tablet'?180:300,mode:'mt',fv:d==='tablet'?15:16,min:72});
if(!m)y=cta(c,X,y+24);return done(c,d,y)};
interface V{name:string;spec:(d:Dev)=>Out;tips:string[]}
const VARS:V[]=[
{name:'Сравнение: таблица с выделенной колонкой',spec:v1,tips:['Оценка: +6–10% к конверсии страницы. Лучший вариант: три способа в одной таблице, наша колонка выделена рамкой, одна кнопка','Рамка вокруг нашей колонки ведёт глаз к выбору без лишних слов','Значки ✓ и ✕ читаются за секунду, текст в ячейке даёт факт','Планшет и мобилка: критерий и строка на каждый способ, без горизонтальной прокрутки']},
{name:'Сравнение: два пути с фото',spec:v2,tips:['Оценка: +4–7% к конверсии страницы. Подходит, когда выбор бинарный: «через посредника или напрямую»','Два фото и по 4 пункта с иконками: клиент видит разницу по смыслу, а не по таблице','Пункты слева и справа идут по одним критериям, чтобы глаз сравнивал строка со строкой','Мобилка: фото убираются, остаётся 3 пункта']},
{name:'Сравнение: крупные цифры в две колонки',spec:v3,tips:['Оценка: +5–8% к конверсии страницы. Подходит, когда есть сильные числа: цена, срок, гарантия','Цифра 32 пт читается без чтения текста: клиент сравнивает за 3 секунды','Только два столбца: мы и главный конкурент','Цифры замени реальными и укажи, откуда они взяты']},
{name:'Сравнение: чек-лист с нами и без нас',spec:v4,tips:['Оценка: +4–6% к конверсии страницы. Подходит для услуг, где клиента пугает скрытая цена и срыв сроков','Левая карточка вся из ✓, правая вся из ✕: контраст виден до чтения','Пять коротких пунктов вместо таблицы: легко пролистать с телефона']},
{name:'Сравнение: матрица из 4 способов',spec:v5,tips:['Оценка: +3–6% к конверсии страницы. Подходит, когда конкурентов много и важно показать, что у нас закрыты все критерии','Только значки: матрица читается за 5 секунд, детали уходят в соседний блок','Наша колонка в рамке, остальные способы короткими названиями','Мобилка: только мы и главный конкурент']},
{name:'Сравнение: фото и таблица',spec:v6,tips:['Оценка: +5–8% к конверсии страницы. Подходит, когда нужно сочетать доверие и аргументы: фото команды или цеха рядом с заголовком','Два фото справа от заголовка добавляют лицо, таблица ниже даёт факты','Таблица из четырёх критериев: больше не нужно, остальное в других блоках','Фото замени реальными: цех, замер, готовая кухня']},
{name:'Сравнение: вкладки по конкурентам',spec:v7,tips:['Оценка: +4–7% к конверсии страницы. Подходит, когда конкурентов несколько и у каждого свои слабые места','Наша колонка всегда слева, справа меняется выбранный способ: клиент сравнивает с тем, кого знает','Вкладки это макет: в просмотре они не переключают таблицу, продублируй блок на каждый способ','Три вкладки максимум, названия в одно слово']}]
const GEN=['Сравнивай по критериям клиента: цена, срок, гарантия, риск','Конкурентов называй обобщённо («салон», «частный мастер»), без брендов','Каждая ячейка это проверяемый факт, а не оценка «лучше»','Блок ставь после преимуществ и перед ценами или формой','Критерии замени своими: оставь 4–5, где ты сильнее всего'];
export const COMPARE:{name:string;cat:string;spec:(d:Dev)=>Out}[]=VARS.map(v=>({name:v.name,cat:'Сравнение',spec:v.spec}));
export const COMPARE_TIPS:Record<string,string[]>=Object.fromEntries(VARS.map(v=>[v.name,[...v.tips,...GEN]]));
