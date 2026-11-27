// Видео: 7 вариантов по разбору 18 референсов (docs/refs/video.md). Ролик-плейсхолдер 16:9 с кнопкой play, длительность в заголовке, одна главная кнопка.
// ПК 1440 (колонка 1200), планшет 768 и мобилка 390 строятся стопкой. На мобилке внизу закреплена одна кнопка.
// Тексты по copywriting.md: без «не/нет/ни», «любой», «вы/ваш», «!».
import {ctx,r4} from './tplFirst';
import type {C,Out} from './tplFirst';
import {FW} from './dev';
import type {Dev} from './dev';

const LX=120,CW=1200,CAT='Видео';
const sz=(dev:Dev)=>{const m=dev==='mobile',t=dev==='tablet',d=dev==='desktop',W=FW[dev],X=d?LX:m?20:48;return{m,t,d,W,X,w:d?CW:W-2*X}};
const Y0=(dev:Dev)=>dev==='desktop'?72:dev==='mobile'?24:40;
const vh=(w:number)=>r4(w*9/16);

function head(c:C,dev:Dev,y:number,h:string,s:string,hm:string,ctr:boolean):number{
 const{m,t,d,X,w}=sz(dev),a=d&&ctr?{al:'c' as const}:{};
 y=c.tx(m?hm:h,X,y,w,m?24:t?30:36,{b:true,...a})+12;
 return s?c.tx(s,X,y,w,m?15:18,a)+24:y+12}
/** ролик 16:9 с кнопкой play по центру */
function vid(c:C,x:number,y:number,w:number,h:number,label:string){c.add('img',x,y,w,h,'Видео: '+label);c.add('btn',x+w/2-32,y+h/2-28,64,56,'▶',{fs:20,acc:true});return y+h}
/** пункты с иконкой */
function list(c:C,x:number,y:number,w:number,a:string[],fs=16):number{
 for(const s of a){c.add('img',x,y,32,32,'Иконка');y=Math.max(c.tx(s,x+48,y+4,w-48,fs),y+32)+16}return y}
function ctaB(c:C,dev:Dev,y:number,t:string,ctr:boolean,x?:number,w?:number):number{
 const s=sz(dev);if(s.m)return y;const bw=w??(s.d?Math.min(s.w,400):s.w);
 c.add('btn',x??(s.X+(s.d&&ctr?(s.w-bw)/2:0)),y,bw,56,t,{fs:16,acc:true});return y+56+16}
function fin(c:C,dev:Dev,y:number,t:string):Out{
 const{m,W,X,w,d}=sz(dev);
 if(m&&t){const h=r4(Math.max(780,y+12+80));c.add('rect',0,h-80,W,80,'',{fill:'#fff'});c.add('btn',X,h-80+12,w,56,t,{fs:16,acc:true});return{h,els:c.els}}
 return{h:r4(Math.max(m?780:d?640:0,y+(m?24:48))),els:c.els}}
const dur=(c:C,x:number,y:number,w:number,t:string,al?:'c')=>c.tx(t,x,y,w,14,al?{al}:{})+16;

const ITEMS=['Сколько стоит работа и из чего складывается цена','Как проходит проект по шагам и в какие сроки','Какие гарантии ты получаешь по договору'];
const CTA='Получить расчёт';

// 1. лучший: ролик слева, три пункта «что узнаешь» справа, кнопка
const v1=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Посмотри 2-минутное видео и узнай, как мы решим твою задачу','Расскажем главное без долгих презентаций','Посмотри 2 минуты и узнай, как мы решим задачу',false);
 if(d){const vw=720,x2=X+vw+48,w2=w-vw-48,h=vh(vw);vid(c,X,y,vw,h,'ролик 2 минуты');dur(c,X,y+h+8,vw,'Длительность: 2 минуты');
  let yy=c.tx('Из видео ты узнаешь:',x2,y,w2,22,{b:true})+16;yy=list(c,x2,yy,w2,ITEMS);yy=ctaB(c,dev,yy+8,CTA,false,x2,w2);
  return fin(c,dev,Math.max(yy,y+h+48),'')}
 const h=vh(w);vid(c,X,y,w,h,'ролик 2 минуты');y=dur(c,X,y+h+8,w,'Длительность: 2 минуты');
 y=c.tx('Из видео ты узнаешь:',X,y,w,m?18:22,{b:true})+16;y=list(c,X,y,w,m?ITEMS.slice(0,2):ITEMS);
 return fin(c,dev,ctaB(c,dev,y,CTA,false),CTA)};

// 2. ролик по центру на всю колонку
const v2=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Хочешь увидеть нас в деле? Посмотри 3-минутное видео','Записали ролик специально для тебя','Посмотри 3-минутное видео',true);
 const vw=d?960:w,h=vh(vw),x=d?X+(w-vw)/2:X;vid(c,x,y,vw,h,'ролик 3 минуты');y=dur(c,x,y+h+8,vw,'Длительность: 3 минуты',d?'c':undefined);
 return fin(c,dev,ctaB(c,dev,y,'Заказать так же',true),'Заказать так же')};

// 3. эксперт: фото слева, заголовок и ролик справа, имя под роликом
const v3=(dev:Dev):Out=>{const c=ctx(),{m,t,d,X,w}=sz(dev);let y=Y0(dev);const T='Посмотри 2-минутное видео и узнай, как мы поможем разрешить спор';
 if(d){const px=400,x2=X+px+48,w2=w-px-48,h=vh(w2);
  let yy=c.tx(T,x2,y,w2,32,{b:true})+24;c.add('img',X,y,px,h+120,'Фото: эксперт в полный рост');
  yy=vid(c,x2,yy,w2,h,'ролик 2 минуты')+16;yy=c.tx('Игорь Орлов',x2,yy,w2,18,{b:true})+4;yy=c.tx('Руководитель компании, юрист с опытом 12 лет',x2,yy,w2,14)+24;
  yy=ctaB(c,dev,yy,'Получить консультацию',false,x2,w2);return fin(c,dev,Math.max(yy,y+h+144),'')}
 y=c.tx(m?'Посмотри 2 минуты и узнай, как мы поможем':T,X,y,w,m?24:30,{b:true})+16;const h=vh(w);y=vid(c,X,y,w,h,'ролик 2 минуты')+16;
 c.add('img',X,y,72,72,'Фото');let yy=c.tx('Игорь Орлов',X+88,y+8,w-88,18,{b:true})+4;yy=c.tx('Руководитель компании, юрист с опытом 12 лет',X+88,yy,w-88,14);y=Math.max(yy,y+72)+24;
 return fin(c,dev,ctaB(c,dev,y,'Получить консультацию',false),'Получить консультацию')};

// 4. приглашение: плашка поверх кадра, кнопка записи под роликом
const v4=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);
 const vw=d?960:w,h=d?vh(vw):vh(w)+(m?40:0),x=d?X+(w-vw)/2:X;
 vid(c,x,y,vw,h,'приглашение на консультацию');
 c.plate(x+24,y+24,m?vw-48:520,m?56:44,'Приглашение на консультацию от Марины Пантелеевой',14);y+=h+24;
 y=dur(c,x,y,vw,'Видео на 1 минуту: расскажу, как проходит первая встреча',d?'c':undefined);
 return fin(c,dev,ctaB(c,dev,y,'Записаться на консультацию',true),'Записаться на консультацию')};

// 5. ролик и форма: ролик слева, карточка с телефоном справа
const F='Получить расчёт после видео';
function form(c:C,x:number,y:number,w:number,m:boolean):number{const pad=m?16:24,iw=w-2*pad,i0=c.els.length;let yy=y+pad;
 yy=c.tx(F,x+pad,yy,iw,m?18:22,{b:true})+12;yy=c.tx('Введи телефон: менеджер пришлёт расчёт в день просмотра',x+pad,yy,iw,14)+12;
 c.add('input',x+pad,yy,iw,52,'Введи телефон');yy+=64;c.add('btn',x+pad,yy,iw,52,F,{fs:15,acc:true});yy+=64;
 yy=c.tx('✓ Согласен на обработку персональных данных',x+pad,yy,iw,13)+pad;
 c.add('rect',x,y,w,r4(yy-y),'',{fill:'#fff'});const r=c.els.pop();if(r)c.els.splice(i0,0,r);return r4(yy-y)}
const v5=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Посмотри видео и получи расчёт на свой проект','За 2 минуты разберём цену, сроки и этапы','Посмотри видео и получи расчёт',false);
 if(d){const vw=720,x2=X+vw+48,w2=w-vw-48,h=vh(vw);vid(c,X,y,vw,h,'ролик 2 минуты');const fh=form(ctx(),0,0,w2,false);form(c,x2,y,w2,false);return fin(c,dev,y+Math.max(h,fh)+24,'')}
 const h=vh(w);y=vid(c,X,y,w,h,'ролик 2 минуты')+16;y+=form(c,X,y,w,m)+16;return fin(c,dev,y,'')};

// 6. три вопроса: карточка «что узнаешь» слева, ролик справа, автор записи
const Q=['✓ Сколько стоит проект и от чего зависит цена','✓ Какие шаги проходим до запуска','✓ Что делать, чтобы получить результат за 30 дней'];
function qcard(c:C,x:number,y:number,w:number,m:boolean):number{const pad=m?16:24,iw=w-2*pad,i0=c.els.length;let yy=y+pad;
 yy=c.tx('Что ты узнаешь за 15 минут:',x+pad,yy,iw,m?18:20,{b:true})+12;for(const q of Q)yy=c.tx(q,x+pad,yy,iw,16)+12;
 c.add('img',x+pad,yy+4,56,56,'Фото');let y2=c.tx('Александр Деменко',x+pad+72,yy+8,iw-72,16,{b:true})+4;y2=c.tx('Видео записал основатель',x+pad+72,y2,iw-72,13);yy=Math.max(y2,yy+60)+pad;
 c.add('rect',x,y,w,r4(yy-y),'',{fill:'#fff'});const r=c.els.pop();if(r)c.els.splice(i0,0,r);return r4(yy-y)}
const v6=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Посмотри короткое видео о том, как будет делаться твой проект','','Посмотри видео о том, как делаем проект',false);
 if(d){const cw=400,x2=X+cw+48,w2=w-cw-48,h=vh(w2),ch=qcard(ctx(),0,0,cw,false);qcard(c,X,y,cw,false);vid(c,x2,y,w2,h,'ролик 15 минут');
  const yy=ctaB(c,dev,y+Math.max(h,ch)+24,'Получить разбор проекта',false,x2,w2);return fin(c,dev,yy,'')}
 const h=vh(w);y=vid(c,X,y,w,h,'ролик 15 минут')+16;y+=qcard(c,X,y,w,m)+16;
 return fin(c,dev,ctaB(c,dev,y,'Получить разбор проекта',false),'Получить разбор проекта')};

// 7. три ролика в ряд
const V3=[['Как проходит занятие','2 мин 49 сек'],['Наш пансионат с высоты','1 мин 30 сек'],['Отзыв родителей','3 мин']];
const v7=(dev:Dev):Out=>{const c=ctx(),{m,t,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Три коротких видео о нас: выбери, что смотреть первым','','Посмотри видео о нас',true);
 const a=m?V3.slice(0,2):V3;
 if(m){for(const[n,l]of a){const h=vh(w);vid(c,X,y,w,h,n);y+=h+8;y=c.tx(n,X,y,w,16,{b:true})+4;y=c.tx('Длительность: '+l,X,y,w,13)+20}return fin(c,dev,y,'Смотреть все видео')}
 const g=t?16:24,cw=(w-2*g)/3;let end=y;
 a.forEach(([n,l],i)=>{const x=X+i*(cw+g),h=vh(cw);vid(c,x,y,cw,h,n);let yy=c.tx(n,x,y+h+8,cw,d?18:16,{b:true})+4;yy=c.tx('Длительность: '+l,x,yy,cw,13);end=Math.max(end,yy)});
 return fin(c,dev,ctaB(c,dev,end+24,'Смотреть все видео',true),'Смотреть все видео')};

interface S{name:string;spec:(d:Dev)=>Out;tips:string[]}
const ALL:S[]=[
{name:'Видео: ролик и три пункта',spec:v1,tips:['Оценка: подходит почти всегда. Заголовок обещает результат и длительность, пункты справа говорят, зачем смотреть','Один главный призыв под пунктами: клиент досмотрел и сразу нажимает']},
{name:'Видео: ролик по центру',spec:v2,tips:['Оценка: подходит, когда ролик единственный и главный. Ничего не отвлекает от просмотра','Длительность в заголовке и под роликом снимает страх «это надолго»']},
{name:'Видео: эксперт и ролик',spec:v3,tips:['Оценка: подходит для услуг, где покупают человека: юрист, врач, консультант. Фото в полный рост показывает, кто говорит','Имя и должность под роликом подтверждают опыт']},
{name:'Видео: приглашение на консультацию',spec:v4,tips:['Оценка: подходит для записи на встречу. Плашка на кадре называет автора приглашения, кнопка под роликом ведёт на запись','Короткий ролик на 1 минуту досматривают чаще длинного']},
{name:'Видео: ролик и форма',spec:v5,tips:['Оценка: подходит, когда нужна заявка сразу после просмотра. Форма рядом с роликом: телефон, согласие, кнопка с тем же словом, что в заголовке формы','Подсказка над полем говорит, что придёт после заявки']},
{name:'Видео: три вопроса к ролику',spec:v6,tips:['Оценка: подходит для длинного ролика. Карточка с тремя вопросами объясняет, зачем тратить 15 минут','Автор записи с фото возле вопросов повышает доверие']},
{name:'Видео: три ролика в ряд',spec:v7,tips:['Оценка: подходит, когда несколько сюжетов: занятие, объект, отзыв. Клиент выбирает, что смотреть первым','Названия роликов называют пользу, длительность стоит под каждым']}];
export const VIDEO:{name:string;cat:string;spec:(d:Dev)=>Out}[]=ALL.map(s=>({name:s.name,cat:CAT,spec:s.spec}));
const CR=['Загрузи ролик на RuTube или YouTube и замени плейсхолдер: длительность в заголовке сверяй с реальной','Кадр-обложку выбирай с лицом или результатом: клиент нажимает на то, что понятно за секунду'];
export const VIDEO_TIPS:Record<string,string[]>=Object.fromEntries(ALL.map(s=>[s.name,[...s.tips,...CR]]));
