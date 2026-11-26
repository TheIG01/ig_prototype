// Этапы: 8 вариантов. 1 и 2 (табы) переключаются в просмотре: каждая вкладка это отдельный блок, показывается только активный.
// Число этапов 3–7 меняется кнопками в панели блока (resizeSteps). ПК 1440, планшет 768, мобилка 390.
// Мобилка: один блок = один экран телефона (до 844 px), кнопка и мессенджеры закреплены внизу, вместо слайдера аккордеон или компактный список.
import {ctx,th,r4} from './tplFirst';
import type {C,Out} from './tplFirst';
import {FW,DEVS} from './dev';
import type {Dev} from './dev';
import {uid} from './uid';
import type {Block,El,SV} from '../store';
import {SOC_TABS} from './tplSocial';
import {TEAM_TABS} from './tplTeam';

const di=(d:Dev)=>d==='desktop'?0:d==='tablet'?1:2;
const XX=(d:Dev)=>d==='mobile'?20:d==='tablet'?48:120;
const CT='Рассчитать стоимость и сроки';
const NOTE='Расчёт занимает 1 минуту. Телефон нужен только в конце';

// ---------- тексты: 7 этапов, для n этапов берутся первые n. Пример-ниша: бассейны, автор заменяет своим ----------
interface St{t:string;h:string;d:string;b:string[];w:string;r:string}
const ST:St[]=[
{t:'Заявка',h:'Менеджер звонит за 15 минут и подбирает три варианта',d:'Менеджер звонит за 15 минут, уточняет размер, участок и бюджет, подбирает три варианта чаши',b:['Звонок за 15 минут','Три варианта с ценой','Без предоплаты'],w:'15 минут',r:'Три варианта с ценой'},
{t:'Замер и смета',h:'Инженер приезжает на участок и фиксирует цену',d:'Инженер бесплатно приезжает на участок, замеряет грунт и фиксирует цену в смете',b:['Выезд бесплатно','Смета в тот же день','Цена фиксирована'],w:'1–2 дня',r:'Смета с фиксированной ценой'},
{t:'Договор',h:'Закрепляем цену, срок и гарантию 25 лет',d:'Подписываем договор: цена, срок с неустойкой и гарантия 25 лет закреплены в тексте',b:['Цена без доплат','Срок с неустойкой','Гарантия 25 лет'],w:'1 день',r:'Договор с гарантией 25 лет'},
{t:'Монтаж',h:'Бригада из штата собирает чашу и ставит фильтрацию',d:'Бригада из штата собирает чашу, ставит фильтрацию и отделку, фотоотчёт приходит каждый день',b:['Бригада из штата','Фотоотчёт каждый день','Уборка участка'],w:'7–10 дней',r:'Бассейн на участке'},
{t:'Запуск',h:'Наполняем воду и настраиваем автоматику',d:'Наполняем чашу, запускаем фильтрацию и настраиваем автоматику вместе с тобой на объекте',b:['Проверка вместе с тобой','Тест воды в лаборатории','Акт приёмки'],w:'1 день',r:'Чистая вода и акт приёмки'},
{t:'Обучение',h:'Показываем, как ухаживать за водой и оборудованием',d:'Инженер показывает, как ухаживать за водой, и оставляет памятку и контакт сервиса',b:['Памятка по уходу','Контакт инженера','Видео-инструкция'],w:'2 часа',r:'Памятка и личный контакт'},
{t:'Гарантия',h:'Обслуживаем бассейн и отвечаем за результат',d:'Сервис приезжает по заявке за 48 часов, гарантия 25 лет на чашу и 5 лет на оборудование',b:['Выезд за 48 часов','Гарантия 25 лет','Сервис без доплат'],w:'25 лет',r:'Сервис без доплат'}];
const pl=(n:number)=>n<5?'этапа':'этапов';
const H1=(n:number)=>`Пройди ${n} ${pl(n)}: цена и сроки закреплены в договоре`;
const SUB_T='Нажми на этап и посмотри, что делаем и что получаешь';
const SUB_S='Каждый этап идёт по договору: срок и результат известны заранее';

// ---------- общие части ----------
function head(c:C,d:Dev,n:number,s:string,ms:string):number{const m=d==='mobile',X=XX(d),w=FW[d]-2*X;const al=m?undefined:'c' as const;
let y=m?20:d==='tablet'?40:48;
y=c.tx(H1(n),X,y,w,[34,28,22][di(d)],{b:true,sk:'hd',...(al?{al}:{})})+12;
if(m&&!ms)return y+4;
return c.tx(m?ms:s,X,y,w,[18,16,14][di(d)],al?{al}:{})+(m?12:24)}
const bg=(c:C,x:number,y:number,w:number,h:number)=>{c.els.unshift({id:uid(),t:'rect',x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h),text:''})};
function foot(c:C,d:Dev,y:number){if(d==='mobile')return y;const W=FW[d],bw=d==='desktop'?520:W-96,x=(W-bw)/2;
c.add('btn',x,y,bw,64,CT,{fs:18,acc:true});y+=64+8;return c.tx(NOTE,x,y,bw,14,{al:'c'})}
function fin(c:C,d:Dev,y:number):Out{if(d!=='mobile')return{h:r4(y+48),els:c.els};
const W=FW.mobile,X=20,w=W-40,bh=96,h=Math.max(r4(y+8+bh),700),by=h-bh,bw=44;
c.add('rect',0,by,W,bh);c.add('text',X,by+6,w,20,'Закреплено внизу экрана',{fs:13});
c.add('btn',X,by+26,w-2*bw-16,52,CT,{fs:14,acc:true});
c.add('rect',X+w-2*bw-8,by+26,bw,52,'TG',{fs:14,al:'c'});c.add('rect',X+w-bw,by+26,bw,52,'WA',{fs:14,al:'c'});
return{h,els:c.els}}
/** плашки с равной высотой: в ряд или столбиком */
function plates(c:C,x:number,y:number,w:number,a:string[],fs:number,row:boolean):number{
if(row){const pw=(w-16)/2,ph=r4(Math.max(48,...a.map(t=>th(t,fs,pw-32,true)+16)));a.forEach((t,k)=>c.plate(x+k*(pw+16),y,pw,ph,t,fs,true));return y+ph+16}
for(const t of a){const ph=r4(Math.max(48,th(t,fs,w-32,true)+16));c.plate(x,y,w,ph,t,fs,true);y+=ph+8}return y+8}
/** содержимое вкладки: этап i. side: фото слева (только ПК), stack: фото сверху. Возвращает нижнюю границу */
function body(c:C,d:Dev,x:number,y:number,w:number,s:St,i:number,n:number,mode:'side'|'stack'):number{
const m=d==='mobile',t=d==='tablet',ft=m?20:t?24:30,fd=m?14:t?16:18,fb=t?15:16;
const side=mode==='side'&&d==='desktop';const x0=side?x+480:x,rw=side?w-480:w;let yy=y;
if(!side&&!m){const ih=t?180:200;c.add('img',x,yy,w,ih,'Фото этапа: '+s.t);yy+=ih+16}
yy=c.tx(`Этап ${i+1} из ${n}`,x0,yy,rw,13,{b:true})+6;
yy=c.tx(s.t,x0,yy,rw,ft,{b:true,sk:'pt'})+8;
yy=c.tx(s.d,x0,yy,rw,fd,{sk:'pd'})+12;
if(!m){for(const b of s.b)yy=c.tx('✓ '+b,x0,yy,rw,fb)+6;yy+=8}
const pa=['Срок: '+s.w,'Ты получаешь: '+s.r];
if(m)yy=c.tx(pa.join('. '),x0,yy,rw,14,{b:true})+4;
else{yy=plates(c,x0,yy,rw,pa,t?14:16,rw>=560);c.add('btn',x0,yy,Math.min(rw,420),56,CT,{fs:16,acc:true});yy+=56}
if(side)c.add('img',x,y,440,Math.max(220,yy-y),'Фото этапа: '+s.t);
return yy}
/** вертикальный таймлайн: кружок слева, справа название, описание, срок. Возвращает нижнюю границу */
function tl(c:C,x:number,y:number,w:number,n:number,o:{cs:number;ft:number;fd:number;desc:'none'|'h'|'d';srok:boolean;gap:number}):number{
const tw=w-(o.cs+16),tx=x+o.cs+16;let yy=y,last=y;
for(let k=0;k<n;k++){const s=ST[k];const ty=th(s.t,o.ft,tw,true);const ds=o.desc==='none'?'':o.desc==='h'?s.h:s.d;const dy=ds?th(ds,o.fd,tw):0;const sr='Срок: '+s.w,sy=o.srok?th(sr,14,tw,true):0;
const rh=r4(Math.max(o.cs,ty+(dy?4+dy:0)+(sy?4+sy:0)));const top=yy+(rh-(ty+(dy?4+dy:0)+(sy?4+sy:0)))/2;
c.add('btn',x,yy,o.cs,o.cs,String(k+1),{fs:o.cs>44?20:16,...(k===0?{acc:true}:{})});last=yy;
let ny=c.tx(s.t,tx,Math.max(yy,top),tw,o.ft,{b:true,sk:'t'+k})+4;
if(dy)ny=c.tx(ds,tx,ny,tw,o.fd,{sk:'d'+k})+4;
if(sy)c.tx(sr,tx,ny,tw,14,{b:true});
yy+=rh+o.gap}
bg(c,x+o.cs/2-1,y+o.cs,3,Math.max(8,last-(y+o.cs)));
return yy-o.gap}
/** компактный список для мобилки: кружок и название, при need описание */
function rows(c:C,x:number,y:number,w:number,n:number,cs:number,gap:number,one:boolean):number{
const tw=w-(cs+12);let yy=y;
for(let k=0;k<n;k++){const s=ST[k];const t1=one?`${s.t} · ${s.w}`:s.t,ty=th(t1,15,tw,true),sy=one?0:th('Срок: '+s.w,14,tw,true);
const rh=r4(Math.max(cs,ty+(sy?4+sy:0)));
c.add('btn',x,yy+(rh-cs)/2,cs,cs,String(k+1),{fs:16,...(k===0?{acc:true}:{})});
let ny=yy+(rh-(ty+(sy?4+sy:0)))/2;ny=c.tx(t1,x+cs+12,ny,tw,15,{b:true,sk:'t'+k})+4;if(sy)c.tx('Срок: '+s.w,x+cs+12,ny,tw,14);
yy+=rh+gap}
return yy-gap}
const maxH=<T,>(a:T[],f:(c:C,i:T)=>number)=>Math.max(...a.map(i=>f(ctx(),i)));

const navFs=(n:number,m:boolean)=>m?16:n>=6?15:16;
// ---------- 1. Табы горизонтально (лучший) ----------
function tabsH(d:Dev,n:number,i:number,g:string):Out{const c=ctx(),m=d==='mobile',W=FW[d],X=XX(d),w=W-2*X;
let y=head(c,d,n,SUB_T,'Нажми на этап');
const gap=m?6:d==='tablet'?8:12;let tw=(w-(n-1)*gap)/n;let lab=!m;if(d==='tablet'&&tw<120)lab=false;
if(m)tw=Math.min(56,Math.floor((w-(n-1)*gap)/n));
const nfs=navFs(n,m),nh=m?44:r4(3*nfs*1.3+12),x0=m?X:X+(w-(n*tw+(n-1)*gap))/2;
for(let k=0;k<n;k++)c.add('btn',x0+k*(tw+gap),y,tw,nh,lab?`${k+1}. ${ST[k].t}`:String(k+1),{fs:nfs,...(k===i?{acc:true}:{}),tg:g+':'+k,sk:'t'+k});
y+=nh+(m?12:24);
const pad=m?16:d==='tablet'?24:32,top=y;const bt=body(c,d,X+pad,y+pad,w-2*pad,ST[i],i,n,'side');
const ch=r4(bt+pad-top);bg(c,X,top,w,ch);return fin(c,d,top+ch)}

// ---------- 2. Табы вертикально (лучший) ----------
function tabsV(d:Dev,n:number,i:number,g:string):Out{const c=ctx(),m=d==='mobile',t=d==='tablet',W=FW[d],X=XX(d),w=W-2*X;
let y=head(c,d,n,'Нажми на этап слева и посмотри, что делаем и что получаешь','Нажми на этап');
const nh=m?44:r4(3*(t?14:18)*1.3+12),gp=m?6:8,nw=m?w:t?200:360,top=y;
for(let k=0;k<n;k++)c.add('btn',X,top+k*(nh+gp),nw,nh,`${k+1}. ${ST[k].t}`,{fs:m?15:t?14:18,...(k===i?{acc:true}:{}),tg:g+':'+k,sk:'t'+k});
const nb=top+n*nh+(n-1)*gp;
if(m){const p=16,cy=nb+12;const bt=body(c,d,X+p,cy+p,w-2*p,ST[i],i,n,'stack');const ch=r4(bt+p-cy);bg(c,X,cy,w,ch);return fin(c,d,cy+ch)}
const cx=X+nw+(t?16:24),cw=X+w-cx,p=t?20:32;
const bt=body(c,d,cx+p,top+p,cw-2*p,ST[i],i,n,'stack');
const ch=Math.max(r4(bt+p-top),7*nh+6*gp);bg(c,cx,top,cw,ch);return fin(c,d,top+ch)}

// ---------- 3. Линия: этапы в ряд ----------
function lineV(d:Dev,n:number):Out{const c=ctx(),W=FW[d],X=XX(d),w=W-2*X;let y=head(c,d,n,SUB_S,'');
if(d==='mobile')return fin(c,d,rows(c,X,y,w,n,40,8,false));
const one=d==='desktop'||n<=4,cc=one?n:3,gx=one?0:16,cw=(w-(cc-1)*gx)/cc,tw=cw-16,fT=d==='desktop'?18:16,fD=d==='desktop'?15:14;
const hh=Math.max(...ST.slice(0,n).map(s=>56+12+th(s.t,fT,tw,true)+6+th(s.h,fD,tw)+6+th('Срок: '+s.w,14,tw,true)));
const rws=Math.ceil(n/cc);
for(let r=0;r<rws;r++){const ry=y+r*(hh+24);if(one)c.add('line',X+cw/2,ry+28,w-cw,0);
for(let q=0;q<cc&&r*cc+q<n;q++){const k=r*cc+q,s=ST[k],cx=X+q*(cw+gx)+cw/2,tx=cx-tw/2;
c.add('btn',cx-28,ry,56,56,String(k+1),{fs:20,...(k===0?{acc:true}:{})});
let yy=ry+56+12;yy=c.tx(s.t,tx,yy,tw,fT,{b:true,al:'c',sk:'t'+k})+6;yy=c.tx(s.h,tx,yy,tw,fD,{al:'c',sk:'d'+k})+6;c.tx('Срок: '+s.w,tx,yy,tw,14,{b:true,al:'c'})}}
y+=rws*(hh+24);return fin(c,d,foot(c,d,y))}

// ---------- 4. Таймлайн с фото и кнопкой ----------
function timeV(d:Dev,n:number):Out{const c=ctx(),W=FW[d],X=XX(d),w=W-2*X;let y=head(c,d,n,SUB_S,'');
if(d==='desktop'){const b=tl(c,X,y,640,n,{cs:56,ft:22,fd:16,desc:'d',srok:true,gap:24});const ix=X+720,iw=w-720,ih=Math.max(240,b-y-72);
c.add('img',ix,y,iw,ih,'Фото объекта');c.add('btn',ix,y+ih+16,iw,56,CT,{fs:16,acc:true});return fin(c,d,Math.max(b,y+ih+72))}
if(d==='tablet'){const b=tl(c,X,y,w,n,{cs:48,ft:20,fd:15,desc:'d',srok:true,gap:20});return fin(c,d,foot(c,d,b+24))}
return fin(c,d,tl(c,X,y,w,n,{cs:40,ft:16,fd:14,desc:'h',srok:false,gap:12}))}

// ---------- 5. Карточки с большими цифрами ----------
function card(c:C,x:number,y:number,w:number,hh:number,k:number,p:number,big:number):number{const s=ST[k],iw=w-2*p;c.add('rect',x,y,w,hh);const rc=c.els[c.els.length-1];
let yy=y+p;yy=c.tx(String(k+1),x+p,yy,iw,big,{b:true})+6;yy=c.tx(s.t,x+p,yy,iw,20,{b:true,sk:'t'+k})+8;yy=c.tx(s.h,x+p,yy,iw,15,{sk:'d'+k})+12;
const sr='Срок: '+s.w,sh=th(sr,14,iw,true),nat=r4(yy-y+sh+p),H=hh||nat;rc.h=H;c.tx(sr,x+p,y+H-p-sh,iw,14,{b:true});return H}
function cardsV(d:Dev,n:number):Out{const c=ctx(),W=FW[d],X=XX(d),w=W-2*X;let y=head(c,d,n,SUB_S,'');
const idx=Array.from({length:n},(_,k)=>k);
if(d==='mobile'){for(let k=0;k<n;k++){const op=k===0;const s=ST[k];
if(op){const dh=th(s.d,14,w-32),sh=th('Срок: '+s.w,14,w-32,true),H=r4(52+dh+8+sh+16);c.add('rect',X,y,w,H);c.add('text',X+16,y+14,w-72,24,`${k+1}. ${s.t}`,{fs:15,b:true,sk:'t'+k});c.add('text',X+w-44,y+10,28,32,'−',{fs:22,b:true,al:'c'});
let yy=c.tx(s.d,X+16,y+52,w-32,14,{sk:'d'+k})+8;c.tx('Срок: '+s.w,X+16,yy,w-32,14,{b:true});y+=H+8}
else{c.add('rect',X,y,w,52);c.add('text',X+16,y+14,w-72,24,`${k+1}. ${s.t}`,{fs:15,b:true,sk:'t'+k});c.add('text',X+w-44,y+10,28,32,'+',{fs:22,b:true,al:'c'});y+=52+8}}
return fin(c,d,y-8)}
const cc=d==='desktop'?(n<=4?n:n<=6?3:4):2,g=d==='tablet'?16:24,cw=(w-(cc-1)*g)/cc,p=20,big=d==='desktop'?40:32;
const hh=maxH(idx,(t,k)=>card(t,0,0,cw,0,k,p,big));
idx.forEach(k=>card(c,X+(k%cc)*(cw+g),y+Math.floor(k/cc)*(hh+g),cw,hh,k,p,big));
y+=Math.ceil(n/cc)*(hh+g)-g+24;return fin(c,d,foot(c,d,y))}

// ---------- 6. Аккордеон ----------
function accV(d:Dev,n:number):Out{const c=ctx(),m=d==='mobile',W=FW[d],X=XX(d),w=W-2*X;let y=head(c,d,n,SUB_S,'');
const cw=d==='desktop'?880:w,x=X+(w-cw)/2,rh=m?56:72,cs=m?36:44,fs=m?15:20;
for(let k=0;k<n;k++){const s=ST[k],op=k===0,x0=x+16+cs+12,w0=cw-(x0-x)-16;let H=rh;let yy=y+rh;
if(op){const fd=m?14:16;let hh=th(s.d,fd,w0)+8;if(!m)hh+=s.b.reduce((a,b)=>a+th('✓ '+b,16,w0)+6,0)+8+56+8;else hh+=th('Результат: '+s.r,14,w0,true)+4;H=rh+hh+8}
c.add('rect',x,y,cw,H);c.add('btn',x+16,y+(rh-cs)/2,cs,cs,String(k+1),{fs:16,...(k===0?{acc:true}:{})});
const tw=cw-(x0-x)-(m?56:44+150);c.add('text',x0,y+(rh-th(s.t,fs,tw,true))/2,tw,th(s.t,fs,tw,true),s.t,{fs,b:true,sk:'t'+k});
if(!m)c.add('text',x+cw-44-150,y+(rh-24)/2,140,24,s.w,{fs:16,b:true,al:'r'});
c.add('text',x+cw-44,y+(rh-32)/2,28,32,op?'−':'+',{fs:24,b:true,al:'c'});
if(op){yy=c.tx(s.d,x0,yy,w0,m?14:16,{sk:'d'+k})+8;
if(m)c.tx('Результат: '+s.r,x0,yy,w0,14,{b:true});
else{for(const b of s.b)yy=c.tx('✓ '+b,x0,yy,w0,16)+6;yy+=8;c.add('btn',x0,yy,360,56,CT,{fs:16,acc:true})}}
y+=H+8}
return fin(c,d,m?y-8:foot(c,d,y+16))}

// ---------- 7. Этапы с результатом: таблица ----------
function resV(d:Dev,n:number):Out{const c=ctx(),m=d==='mobile',W=FW[d],X=XX(d),w=W-2*X;let y=head(c,d,n,SUB_S,'');
if(m){const tw=w-72;for(let k=0;k<n;k++){const s=ST[k],t1=`${s.t} · ${s.w}`,t2='Получаешь: '+s.r,a=th(t1,15,tw,true),b=th(t2,13,tw),H=r4(a+4+b+24);
c.add('rect',X,y,w,H);c.add('btn',X+12,y+(H-36)/2,36,36,String(k+1),{fs:15,...(k===0?{acc:true}:{})});
let yy=c.tx(t1,X+60,y+12,tw,15,{b:true,sk:'t'+k})+4;c.tx(t2,X+60,yy,tw,13,{sk:'d'+k});y+=H+8}
return fin(c,d,y-8)}
const D=d==='desktop',K=D?{num:16,tx:80,txw:440,wx:560,ww:140,rx:720,rw:w-720-16}:{num:12,tx:60,txw:300,wx:376,ww:96,rx:488,rw:w-488-12};
const fT=D?18:15,fD=D?15:13,fR=D?16:14;
c.tx('Этап',X+K.tx,y,K.txw,14,{b:true});c.tx('Срок',X+K.wx,y,K.ww,14,{b:true});c.tx('Ты получаешь',X+K.rx,y,K.rw,14,{b:true});y+=14*1.3+12;y=r4(y);
for(let k=0;k<n;k++){const s=ST[k],a=th(s.t,fT,K.txw,true),b=th(s.h,fD,K.txw),r=th(s.r,fR,K.rw,true),H=r4(Math.max(64,a+4+b+24,r+24));
c.add('rect',X,y,w,H);c.add('btn',X+K.num,y+(H-(D?44:36))/2,D?44:36,D?44:36,String(k+1),{fs:16,...(k===0?{acc:true}:{})});
let yy=y+(H-(a+4+b))/2;yy=c.tx(s.t,X+K.tx,yy,K.txw,fT,{b:true,sk:'t'+k})+4;c.tx(s.h,X+K.tx,yy,K.txw,fD,{sk:'d'+k});
c.tx(s.w,X+K.wx,y+(H-th(s.w,fR,K.ww,true))/2,K.ww,fR,{b:true});c.tx(s.r,X+K.rx,y+(H-r)/2,K.rw,fR,{b:true});y+=H+8}
return fin(c,d,foot(c,d,y+16))}

// ---------- 8. Этапы и форма рядом ----------
function formCard(c:C,d:Dev,x:number,y:number,w:number):number{const m=d==='mobile',p=m?16:d==='tablet'?24:32,iw=w-2*p;let yy=y+p;
yy=c.tx(CT,x+p,yy,iw,m?18:d==='tablet'?24:26,{b:true})+8;
yy=c.tx('Введи телефон: пришлём расчёт цены и график по этапам',x+p,yy,iw,m?14:16)+12;
const ih=m?48:56;c.add('input',x+p,yy,iw,ih,'+7 (___) ___-__-__');yy+=ih+12;
if(!m){c.add('btn',x+p,yy,iw,56,CT,{fs:16,acc:true});yy+=56+12}
yy=c.tx('☐ Я принимаю условия передачи информации',x+p,yy,iw,12)+p;
bg(c,x,y,w,r4(yy-y));return r4(yy-y)}
function formV(d:Dev,n:number):Out{const c=ctx(),W=FW[d],X=XX(d),w=W-2*X;let y=head(c,d,n,SUB_S,'');
if(d==='desktop'){const b=tl(c,X,y,660,n,{cs:48,ft:20,fd:15,desc:'h',srok:true,gap:20});const fh=formCard(c,d,X+720,y,w-720);return fin(c,d,Math.max(b,y+fh))}
if(d==='tablet'){const b=tl(c,X,y,w,n,{cs:44,ft:18,fd:15,desc:'h',srok:true,gap:16});const fh=formCard(c,d,X,b+32,w);return fin(c,d,b+32+fh)}
const b=rows(c,X,y,w,n,36,6,true);const fh=formCard(c,d,X,b+16,w);return fin(c,d,b+16+fh)}

// ---------- реестр ----------
interface V{name:string;tab:boolean;vert?:boolean;n0?:number;gen:(d:Dev,n:number,i:number,g:string)=>Out}
const VARS:V[]=[
{name:'Этапы: табы горизонтально',tab:true,gen:tabsH},
{name:'Этапы: табы вертикально',tab:true,vert:true,gen:tabsV},
{name:'Этапы: линия',tab:false,gen:(d,n)=>lineV(d,n)},
{name:'Этапы: таймлайн',tab:false,gen:(d,n)=>timeV(d,n)},
{name:'Этапы: карточки',tab:false,gen:(d,n)=>cardsV(d,n)},
{name:'Этапы: аккордеон',tab:false,gen:(d,n)=>accV(d,n)},
{name:'Этапы: результат',tab:false,gen:(d,n)=>resV(d,n)},
{name:'Этапы: с формой',tab:false,gen:(d,n)=>formV(d,n)},
...SOC_TABS.map(t=>({name:t.name,tab:true,vert:t.vert,n0:t.n0,gen:t.gen})),
...TEAM_TABS.map(t=>({name:t.name,tab:true,vert:t.vert,n0:t.n0,gen:t.gen}))];
/** вкладочные шаблоны других групп показываются в своих группах, в «Этапах» не дублируются */
const OWN=new Set([...SOC_TABS,...TEAM_TABS].map(t=>t.name));
export const STEPS:{name:string;cat:string;spec:(d:Dev)=>Out}[]=VARS.filter(v=>!OWN.has(v.name)).map(v=>({name:v.name,cat:'Этапы',spec:(d:Dev)=>v.gen(d,5,0,'t')}));
const mk=(v:V,n:number,i:number,g:string):Block=>{const h={} as Record<Dev,number>,els={} as Record<Dev,El[]>;
for(const d of DEVS){const o=v.gen(d,n,i,g);h[d]=o.h;els[d]=o.els}
return{id:uid(),title:v.name,text:v.tab?`Вкладка ${i+1} из ${n}. В просмотре виден только блок активной вкладки, клик по вкладке переключает этапы`:`Этапов: ${n}`,h,els,sv:{v:v.name,g,i,n,tab:v.tab}}};
/** новый набор блоков: табы дают по блоку на каждую вкладку, остальные один блок. null, если имя не из этапов */
export function stepsBlocks(name:string,n0?:number):Block[]|null{const v=VARS.find(x=>x.name===name);if(!v)return null;const g=uid();const n=n0??v.n0??5;
return Array.from({length:v.tab?n:1},(_,i)=>mk(v,n,i,g))}
/** группа вкладок, к которой можно привязать блок: у доп. блока своя, у обычного ближайшая выше */
export function stageGroup(bl:Block[],b:Block):SV|null{if(b.sv?.x)return b.sv;if(b.sv)return null;
for(let k=bl.indexOf(b)-1;k>=0;k--){const s=bl[k].sv;if(s?.tab)return s}return null}
const keepTxt=(ne:El,pool:El[],defs:El[])=>{const o=pool.find(e=>e.sk===ne.sk),df=defs.find(e=>e.sk===ne.sk);if(ne.sk&&o&&df&&o.text!==df.text)ne.text=o.text};
const bot=(a:El[])=>Math.max(0,...a.map(e=>e.y+e.h));
function navRebuild(x:Block,v:V,n:number,old:number){const sv=x.sv!;
for(const d of DEVS){const nw=v.gen(d,n,sv.i,sv.g),od=v.gen(d,old,sv.i,sv.g);
const nav=nw.els.filter(e=>e.tg),on=x.els[d].filter(e=>e.tg);
for(const ne of nav)keepTxt(ne,on,od.els);
const hn=nw.els.find(e=>e.sk==='hd'),ho=x.els[d].find(e=>e.sk==='hd'),hf=od.els.find(e=>e.sk==='hd');
if(hn&&ho&&hf&&ho.text===hf.text)ho.text=hn.text;
const dy=v.vert&&d==='mobile'&&on.length?bot(nav)-bot(on):0,ny=on.length?Math.min(...on.map(e=>e.y)):0;
const rest=x.els[d].filter(e=>!e.tg);
if(dy)for(const e of rest)if(e.y>=ny)e.y+=dy;
x.els[d]=[...rest,...nav];if(dy)x.h[d]=Math.max(x.h[d]+dy,120)}}
function rebuild(b:Block,v:V,n:number){const sv=b.sv!,old=sv.n;
for(const d of DEVS){const nw=v.gen(d,n,0,sv.g),od=v.gen(d,old,0,sv.g);for(const ne of nw.els)keepTxt(ne,b.els[d],od.els);b.els[d]=nw.els;b.h[d]=nw.h}
if(b.text===`Этапов: ${old}`)b.text=`Этапов: ${n}`;sv.n=n}
/** меняет число этапов 3–7 во всей группе: у табов добавляет или убирает вкладки-блоки и пересобирает ряд вкладок, у остальных пересобирает блок. Тексты, которые ты правил, сохраняются */
export function resizeSteps(bl:Block[],b:Block,n:number){const sv=b.sv;if(!sv)return;n=Math.max(3,Math.min(7,Math.round(n)));if(n===sv.n)return;
const v=VARS.find(x=>x.name===sv.v);if(!v)return;const old=sv.n;
if(!v.tab){rebuild(b,v,n);return}
const g=sv.g,grp=bl.filter(x=>x.sv?.g===g);
for(const x of grp)if(x.sv!.i>=n)bl.splice(bl.indexOf(x),1);
const keep=grp.filter(x=>x.sv!.i<n);
for(const x of keep){x.sv!.n=n;x.text=x.text.replace(/из \d+/,'из '+n);if(!x.sv!.x)navRebuild(x,v,n,old)}
let at=Math.max(...keep.map(x=>bl.indexOf(x)));
for(let i=old;i<n;i++){bl.splice(++at,0,mk(v,n,i,g))}}

const SR=['Число в заголовке совпадает с числом этапов в блоке: меняй его кнопками «Этапов» в панели блока','Название этапа это действие или результат, а не отдел: «Замер и смета», а не «Технический отдел»','У каждого этапа срок и то, что получает клиент','Блок этапов ставь после выгод и перед отзывами: человек понял оффер и хочет увидеть, как всё пройдёт','Рядом с этапами нужна кнопка: человек дочитал и готов действовать'];
const TB=['Табы показывают по одному этапу: экран остаётся коротким, человек сам выбирает, что читать','В просмотре клик по вкладке переключает блоки. В редакторе каждая вкладка это отдельный блок, рисуй в нём что нужно','Кнопка «Добавить блок в этот этап» или «Показывать в этапе» у любого блока кладёт его внутрь выбранной вкладки','Табы от 3 до 7 этапов; на мобилке вкладки это номера, название этапа внутри'];
export const STEPS_TIPS:Record<string,string[]>={
'Этапы: табы горизонтально':[...TB,...SR,'Лучший по конверсии на ПК: когда этапов 3–5 и названия короткие'],
'Этапы: табы вертикально':[...TB,...SR,'Лучший, когда этапов 6–7 или названия длинные: список слева, этап справа'],
'Этапы: линия':[...SR,'Когда этапов 3–5 и важна простота: видно весь путь сразу','На планшете и мобилке линия превращается в сетку и список'],
'Этапы: таймлайн':[...SR,'Когда каждый этап нужно объяснить: описание, срок и фото объекта рядом','Кнопка рядом с фото закрывает вопрос «что дальше»'],
'Этапы: карточки':[...SR,'Когда этапы равнозначны и читаются по отдельности','Большая цифра держит порядок, срок внизу карточки одинаковый'],
'Этапы: аккордеон':[...SR,'Когда текста много, а экран мобилки один: открыт первый этап, остальные раскрываются','Менее конверсионный вариант: человек должен нажимать, чтобы читать'],
'Этапы: результат':[...SR,'Когда заказ сложный и человеку важно, что он получит на каждом шаге','Три колонки: что делаем, срок, что получаешь. Формула «Получите … за счёт …»'],
'Этапы: с формой':[...SR,'Форма рядом с этапами: человек понял путь и оставляет телефон не уходя с экрана','Подсказка над полем, кнопка с тем же текстом, что заголовок формы']};

// ---------- авто-лейаут вкладок ----------
const tkOf=(e:El)=>+(e.tg??':0').split(':')[1];
/** правка названия вкладки в одном этапе подтягивается в остальные этапы группы (с ПК ещё и на планшет и мобилку, если там не просто номер) */
export function syncTabText(bl:Block[],src:Block,dev:Dev,e:El){const g=src.sv?.g;if(!g||!e.tg)return;
for(const b of bl)if(b.sv?.g===g&&!b.sv.x)for(const d of DEVS){if(d!==dev&&dev!=='desktop')continue;
for(const t of b.els[d])if(t.tg===e.tg&&t!==e&&(d===dev||!/^\d+$/.test(t.text)))t.text=e.text}}
/** высота вкладок по тексту: влезает 3 строки, длиннее удлиняется. Горизонтальные: все равны, содержимое ниже сдвигается. Вертикальные: каждая по тексту, ряд пересчитывается. Во всех этапах одинаково */
export function syncTabs(bl:Block[]|undefined){if(!bl||!bl.some(b=>b.sv?.tab))return;const seen=new Set<string>();
for(const b0 of bl){const sv=b0.sv;if(!sv||!sv.tab||sv.x||seen.has(sv.g))continue;seen.add(sv.g);
const v=VARS.find(x=>x.name===sv.v);if(!v)continue;const ps=bl.filter(x=>x.sv?.g===sv.g&&!x.sv.x);
for(const d of DEVS){const base=v.gen(d,sv.n,0,sv.g).els.find(e=>e.tg)?.h??0;
const ref=ps[0].els[d].filter(e=>e.tg).sort((a,b)=>tkOf(a)-tkOf(b));if(ref.length<2)continue;
const need=ref.map(e=>Math.max(base,r4(th(e.text,e.fs??16,Math.max(20,e.w-12),true)+16)));
const H=Math.max(...need);
for(const p of ps){const tabs=p.els[d].filter(e=>e.tg).sort((a,b)=>tkOf(a)-tkOf(b));if(tabs.length!==ref.length)continue;
const top=Math.min(...tabs.map(e=>e.y)),oldB=Math.max(...tabs.map(e=>e.y+e.h));let delta=0;
if(!v.vert){if(tabs.every(e=>e.h===H))continue;for(const e of tabs)e.h=H;delta=H-(oldB-top)}
else{const gap=tabs[1].y-tabs[0].y-tabs[0].h;let y=top;tabs.forEach((e,k)=>{e.y=y;e.h=need[k];y+=need[k]+gap});const nb=y-gap;delta=nb-oldB;if(!delta&&tabs.every((e,k)=>e.h===need[k]))continue;
if(d!=='mobile'){const right=Math.max(...tabs.map(e=>e.x+e.w));const card=p.els[d].find(e=>e.t==='rect'&&e.x>=right&&Math.abs(e.y-top)<2);
if(card&&card.h<nb-top)card.h=nb-top;p.h[d]=Math.max(p.h[d],r4(nb+48));continue}}
if(delta)for(const e of p.els[d])if(!e.tg&&e.y>=oldB-1)e.y+=delta;
p.h[d]=Math.max(120,p.h[d]+delta)}}}}

const renum=(t:string,k:number)=>/^\d+\.\s/.test(t)?t.replace(/^\d+\./,`${k+1}.`):/^\d+$/.test(t)?String(k+1):t;
const setTxt=(x:Block,n:number)=>{const s=x.sv!;x.text=x.text.replace(/Вкладка \d+ из \d+/,`Вкладка ${s.i+1} из ${n}`)};
/** сдвиг вкладок в ряду: от номера from все вкладки получают номер на step больше, тексты вкладок сдвигаются вместе с ними */
function moveNav(x:Block,g:string,from:number,step:number){for(const d of DEVS)for(const e of x.els[d])if(e.tg){const k=tkOf(e);if(k>=from){e.tg=g+':'+(k+step);e.sk='t'+(k+step);e.text=renum(e.text,k+step)}}}
/** дубль этапа: копия `o` встаёт новым этапом сразу после этапа `b`, остальные сдвигаются. false, если этапов уже 7 или блок не главный блок вкладки */
export function dupStage(bl:Block[],b:Block,o:Block):boolean{const sv=b.sv;if(!sv||!sv.tab||sv.x||sv.n>=7)return false;
const v=VARS.find(x=>x.name===sv.v);if(!v)return false;const g=sv.g,p=sv.i+1,old=sv.n,n=old+1;
const cp={} as Record<Dev,string|undefined>;for(const d of DEVS)cp[d]=b.els[d].find(e=>e.tg&&tkOf(e)===sv.i)?.text;
for(const x of bl)if(x.sv?.g===g){if(x.sv.i>=p)x.sv.i++;x.sv.n=n;if(!x.sv.x)setTxt(x,n)}
o.sv={v:sv.v,g,i:p,n,tab:true};setTxt(o,n);
let at=bl.indexOf(b);bl.forEach((x,k)=>{if(x.sv?.g===g&&x.sv.i===sv.i)at=k});bl.splice(at+1,0,o);
for(const x of bl)if(x.sv?.g===g&&!x.sv.x){moveNav(x,g,p,1);navRebuild(x,v,n,old);
for(const d of DEVS){const t=x.els[d].find(e=>e.tg&&tkOf(e)===p);if(t&&cp[d])t.text=renum(cp[d]!,p)}}
return true}
/** удаляет этап вместе с его блоками, остальные сдвигаются. false, если этапов 3 или меньше */
export function delStage(bl:Block[],b:Block):boolean{const sv=b.sv;if(!sv||!sv.tab||sv.x||sv.n<=3)return false;
const v=VARS.find(x=>x.name===sv.v);if(!v)return false;const g=sv.g,p=sv.i,old=sv.n,n=old-1;
for(let k=bl.length-1;k>=0;k--)if(bl[k].sv?.g===g&&bl[k].sv!.i===p)bl.splice(k,1);
for(const x of bl)if(x.sv?.g===g){if(x.sv.i>p)x.sv.i--;x.sv.n=n;if(!x.sv.x)setTxt(x,n)}
for(const x of bl)if(x.sv?.g===g&&!x.sv.x){for(const d of DEVS)x.els[d]=x.els[d].filter(e=>!(e.tg&&tkOf(e)===p));moveNav(x,g,p+1,-1);navRebuild(x,v,n,old)}
return true}
/** шаблон блока этапа вставляется в группу вкладок выше (того же варианта): дополнительным блоком нужного этапа. Иначе блок обычный, вкладки в нём превращаются в простые кнопки */
export function bindTplStage(bl:Block[],at:number,b:Block,st:{v:string;i:number}):boolean{
let grp:SV|null=null;for(let k=Math.min(at,bl.length-1);k>=0;k--){const s=bl[k].sv;if(s?.tab&&s.v===st.v){grp=s;break}}
for(const d of DEVS)b.els[d]=grp?b.els[d].filter(e=>!e.tg):b.els[d].map(e=>{if(e.tg){const c={...e};delete c.tg;delete c.sk;return c}return e});
if(!grp)return false;b.sv={v:grp.v,g:grp.g,i:Math.min(st.i,grp.n-1),n:grp.n,tab:true,x:1};return true}
