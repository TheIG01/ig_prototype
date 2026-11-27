// Для кого: 7 вариантов по разбору 7 референсов (docs/refs/forwhom.md). Заголовок «подходит, если ты», группы аудитории, итог для каждой, одна главная кнопка.
// ПК 1440 (колонка 1200), планшет 768, мобилка 390 стопкой; на мобилке внизу закреплена кнопка.
// Тексты по copywriting.md: без «не/нет/ни», «любой», «вы/ваш», «!».
import {ctx,r4,th} from './tplFirst';
import type {C,Out} from './tplFirst';
import {FW} from './dev';
import type {Dev} from './dev';

const LX=120,CW=1200,CAT='Для кого';
const sz=(dev:Dev)=>{const m=dev==='mobile',t=dev==='tablet',d=dev==='desktop',W=FW[dev],X=d?LX:m?20:48;return{m,t,d,W,X,w:d?CW:W-2*X}};
const Y0=(dev:Dev)=>dev==='desktop'?72:dev==='mobile'?24:40;
const CTA='Узнать, подходит ли тебе';

function head(c:C,dev:Dev,y:number,h:string,s:string,hm:string,ctr:boolean):number{
 const{m,t,X,w}=sz(dev),a=ctr?{al:'c' as const}:{};
 y=c.tx(m?hm:h,X,y,w,m?24:t?30:36,{b:true,...a})+12;
 return s?c.tx(s,X,y,w,m?15:18,a)+32:y+20}
function ctaB(c:C,dev:Dev,y:number,t:string):number{
 const s=sz(dev);if(s.m)return y;const bw=s.d?Math.min(s.w,400):s.w;
 c.add('btn',s.X+(s.w-bw)/2,y,bw,56,t,{fs:16,acc:true});return y+56+16}
function fin(c:C,dev:Dev,y:number,t:string):Out{
 const{m,W,X,w,d}=sz(dev);
 if(m&&t){const h=r4(Math.max(780,y+12+80));c.add('rect',0,h-80,W,80,'',{fill:'#fff'});c.add('btn',X,h-80+12,w,56,t,{fs:16,acc:true});return{h,els:c.els}}
 return{h:r4(Math.max(m?780:d?640:0,y+(m?24:48))),els:c.els}}
/** сетка карточек: рамка у каждой, высота ряда равна самой высокой; cb рисует содержимое и возвращает низ */
function grid(c:C,dev:Dev,y:number,n:number,cols:number,gap:number,box:boolean,cb:(c:C,x:number,y:number,w:number,i:number)=>number):number{
 const{m,X,w}=sz(dev),cw=Math.floor((w-(cols-1)*gap)/cols),pad=box?(m?16:24):0;
 for(let r=0;r*cols<n;r++){const i0=c.els.length;let end=y;const xs:number[]=[];
  for(let k=0;k<cols&&r*cols+k<n;k++){const x=X+k*(cw+gap);xs.push(x);end=Math.max(end,cb(c,x+pad,y+pad,cw-2*pad,r*cols+k))}
  const rh=r4(end+pad-y);if(box){const tmp=ctx();xs.forEach(x=>tmp.add('rect',x,y,cw,rh,'',{fill:'#fff'}));c.els.splice(i0,0,...tmp.els)}
  y+=rh+gap}
 return y-gap}

const G=[
 ['Будущие родители','Только планируешь завести ребёнка и хочешь заранее понять возможные сложности','Готовые методики для типичных проблем и ошибок'],
 ['Родители малыша до 3 лет','Малыш уже растёт, а вопросов становится больше, чем ответов','Понятный порядок действий и меньше криков'],
 ['Родители нескольких детей','Двое детей и больше, а сомнений в своих методах много','Грамотная коррекция поведения и меньше конфликтов'],
 ['Родитель-одиночка','Один растишь ребёнка и хочешь дать ему полноценную опору','План, как сохранить спокойствие ребёнка и своё']];

// 1. лучший: 4 группы, фото, ситуация, итог «в результате»
const f1=(dev:Dev):Out=>{const c=ctx(),{m,t,d}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Самые большие результаты получают те, кто:','','Больше всего пользы получают те, кто:',true);
 const a=m?G.slice(0,3):G;
 y=grid(c,dev,y,a.length,d?4:t?2:1,d?24:16,false,(c,x,y,w,i)=>{
  c.add('img',x,y,w,m?140:d?170:200,'Фото: '+G[i][0]);y+=(m?140:d?170:200)+16;
  y=c.tx(G[i][0],x,y,w,20,{b:true})+8;y=c.tx(G[i][1],x,y,w,15)+16;
  y=c.tx('В результате:',x,y,w,14,{b:true})+4;return c.tx(G[i][2],x,y,w,15)});
 y=ctaB(c,dev,y+24,CTA);return fin(c,dev,y,CTA)};

// 2. карточки 2x2: пункты, фото-аватар справа, плашка итога
const P=[['Новичок или хочешь на фриланс','Стартуешь без опыта и сразу с результатом','Проект сопровождают 6 специалистов','Окупаешь вход на первом заказе'],
 ['Действующий специалист','Упаковываешь себя за 1 день','Повышаешь точность результатов на 30–50%','Становишься тем, кому доверяют проекты под ключ'],
 ['Владелец агентства','Занимаешься стратегией и ростом','Передаёшь 80% задач команде и управляешь как директор','Увеличиваешь пропускную способность в 5–10 раз'],
 ['Предприниматель','Быстро тестируешь и запускаешь маркетинг','Упаковка, лендинг и реклама за 2–3 дня','Получаешь клиентов без переплат']];
const f2=(dev:Dev):Out=>{const c=ctx(),{m,d,t}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Продукт для тебя, если ты:','','Продукт для тебя, если ты:',true);
 const a=m?P.slice(0,3):P,av=m?64:96;
 y=grid(c,dev,y,a.length,d||t?2:1,24,true,(c,x,y,w,i)=>{
  c.add('img',x+w-av,y,av,av,'Фото');let yy=Math.max(c.tx(P[i][0],x,y+(m?4:16),w-av-16,m?18:22,{b:true}),y+av)+16;
  yy=c.tx('• '+P[i][1],x,yy,w,15)+8;yy=c.tx('• '+P[i][2],x,yy,w,15)+16;
  const hh=th(P[i][3],15,w-32,true)+24;c.add('rect',x,yy,w,hh,'',{fill:'#eee'});c.tx(P[i][3],x+16,yy+12,w-32,15,{b:true});return yy+hh});
 y=ctaB(c,dev,y+24,CTA);return fin(c,dev,y,CTA)};

// 3. две широкие строки: фото, название, 4 пункта с иконками
const R=[['Для специалистов и руководителей','Рабочие инструменты и связки','Нейросети для работы','Разборы кейсов','Обновления площадок'],
 ['Для бизнеса и школ','Как применять нейросети в бизнесе','Каналы с лучшей окупаемостью','Автоматизация рекламы','Построение отдела маркетинга']];
const f3=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Реальные кейсы и рабочие стратегии для двух групп','Выбери свою и смотри, что получишь','Кейсы и стратегии для двух групп',false);
 for(const r of R){const pad=m?16:24,i0=c.els.length,iw=w-2*pad,y0=y;let yy=y+pad;
  if(d){c.add('img',X+pad,yy,128,128,'Фото');const x2=X+pad+128+24;c.tx(r[0],x2,yy+40,260,20,{b:true});
   const cw=(iw-128-24-260-24-24)/2,bx=x2+260+24;let e=yy;
   r.slice(1).forEach((s,k)=>{const x=bx+(k%2)*(cw+24),yk=yy+Math.floor(k/2)*72;c.add('img',x,yk,32,32,'Иконка');e=Math.max(e,c.tx(s,x+48,yk+4,cw-48,15)+0,yk+32)});yy=Math.max(e,yy+128)}
  else{c.add('img',X+pad,yy,72,72,'Фото');yy=Math.max(c.tx(r[0],X+pad+88,yy+8,iw-88,18,{b:true}),yy+72)+16;
   for(const s of r.slice(1)){c.add('img',X+pad,yy,32,32,'Иконка');yy=Math.max(c.tx(s,X+pad+48,yy+4,iw-48,15),yy+32)+12}yy-=12}
  const hh=r4(yy+pad-y0);const tmp=ctx();tmp.add('rect',X,y0,w,hh,'',{fill:'#fff'});c.els.splice(i0,0,...tmp.els);y=y0+hh+24}
 y=ctaB(c,dev,y,CTA);return fin(c,dev,y,CTA)};

// 4. сетка из 6 плашек с иконкой и цифрой опыта над ней
const S=['Маркетологов','Владельцев агентств','Специалистов по найму','Технических специалистов','Директоров по найму','Всех, кто оказывает услуги бизнесу'];
const f4=(dev:Dev):Out=>{const c=ctx(),{m,d,t}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Алгоритм отточен на 7000+ специалистов за 9 лет и подходит для:','','Алгоритм подходит для:',true);
 const a=m?S.slice(0,4):S;
 y=grid(c,dev,y,a.length,d?3:t?2:1,16,true,(c,x,y,w,i)=>{c.add('img',x,y,48,48,'Иконка');const e=c.tx(S[i],x+64,y+(th(S[i],18,w-64,true)>24?0:12),w-64,18,{b:true});return Math.max(e,y+48)});
 y=ctaB(c,dev,y+24,CTA);return fin(c,dev,y,CTA)};

// 5. 4 карточки: фото сверху, название, описание ситуации
const Q=[['Молодые и в поисках себя','Хочешь заработок и понятный путь развития уже сейчас'],['Предприниматели и фрилансеры','Навыки продаж важны и новичку, и опытному специалисту'],['Работяги на выбранном пути','Текущая работа даёт мало результата и перспектив, пора менять'],['Специалисты с опытом','Осваиваешь новые направления и создаёшь собственный бизнес']];
const f5=(dev:Dev):Out=>{const c=ctx(),{m,d,t}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Для кого сделан этот проект?','','Для кого этот проект?',true);
 const a=m?Q.slice(0,3):Q;
 y=grid(c,dev,y,a.length,d?4:t?2:1,24,true,(c,x,y,w,i)=>{const ph=m?120:d?150:180;c.add('img',x,y,w,ph,'Фото: '+Q[i][0]);y+=ph+16;
  y=c.tx(Q[i][0],x,y,w,18,{b:true,al:'c'})+8;return c.tx(Q[i][1],x,y,w,15,{al:'c'})});
 y=ctaB(c,dev,y+24,CTA);return fin(c,dev,y,CTA)};

// 6. три иллюстрации и тезисы «предприниматели, которые…»
const T=['только запустили проект и хотят максимум со старта','хотят поднять оборот и получать больше заявок','настроили поток заявок и хотят обойти конкурентов'];
const f6=(dev:Dev):Out=>{const c=ctx(),{m,d,t}=sz(dev);let y=Y0(dev);
 y=head(c,dev,y,'Максимальный результат получают предприниматели, которые:','','Больше всего пользы получают те, кто:',true);
 y=grid(c,dev,y,3,d||t?3:1,d?32:16,false,(c,x,y,w,i)=>{const ph=m?140:d?220:160;c.add('img',x,y,w,ph,'Иллюстрация '+(i+1));y+=ph+16;return c.tx('• '+T[i],x,y,w,16)});
 y=ctaB(c,dev,y+24,CTA);return fin(c,dev,y,CTA)};

// 7. заголовок и список слева, карточка проверки справа
const L=['Только запустил проект и ищешь быстрый старт','Хочешь увеличить оборот и получать больше заявок','Настроил поток клиентов и хочешь обойти конкурентов','Руководишь командой и хочешь передать рутину','Начинаешь с нуля и ищешь понятные шаги'];
const f7=(dev:Dev):Out=>{const c=ctx(),{m,d,X,w}=sz(dev);let y=Y0(dev);const F='Проверить, подходит ли тебе';
 const form=(c:C,x:number,y:number,w:number):number=>{const pad=m?16:24,iw=w-2*pad,i0=c.els.length;let yy=y+pad;
  yy=c.tx(F,x+pad,yy,iw,m?18:22,{b:true})+12;yy=c.tx('Введи телефон: эксперт ответит, подходит ли тебе продукт',x+pad,yy,iw,14)+12;
  c.add('input',x+pad,yy,iw,52,'Введи телефон');yy+=64;c.add('btn',x+pad,yy,iw,52,F,{fs:15,acc:true});yy+=64;
  yy=c.tx('✓ Согласен на обработку персональных данных',x+pad,yy,iw,13)+pad;
  const tmp=ctx();tmp.add('rect',x,y,w,r4(yy-y),'',{fill:'#fff'});c.els.splice(i0,0,...tmp.els);return r4(yy-y)};
 const lst=(x:number,y:number,w:number,a:string[])=>{for(const s of a){c.add('img',x,y,32,32,'Иконка');y=Math.max(c.tx(s,x+48,y+4,w-48,16),y+32)+16}return y};
 if(d){const lw=640,x2=X+lw+48,w2=w-lw-48;let yy=c.tx('Продукт подходит, если ты:',X,y,lw,36,{b:true})+24;yy=lst(X,yy,lw,L);
  const fh=form(ctx(),0,0,w2);form(c,x2,y,w2);return fin(c,dev,Math.max(yy,y+fh)+24,'')}
 y=c.tx('Продукт подходит, если ты:',X,y,w,m?24:30,{b:true})+20;y=lst(X,y,w,m?L.slice(0,4):L);y+=form(c,X,y+8,w)+24;return fin(c,dev,y,'')};

interface S0{name:string;spec:(d:Dev)=>Out;tips:string[]}
const ALL:S0[]=[
{name:'Для кого: четыре группы и итог',spec:f1,tips:['Оценка: подходит почти всегда. Каждая группа узнаёт свою ситуацию и видит свой итог','Итог отдельной строкой «В результате» превращает узнавание в желание купить']},
{name:'Для кого: карточки с плашкой итога',spec:f2,tips:['Оценка: подходит для разных ролей клиента (новичок, специалист, владелец). Плашка в конце карточки называет выгоду роли','Аватар персонажа делает карточку живой, пунктов не больше двух']},
{name:'Для кого: две широкие группы',spec:f3,tips:['Оценка: подходит, когда аудитории две и у каждой свои задачи. Четыре пункта с иконками показывают, что получит именно эта группа','Название группы слева, пункты справа: заголовок ближе к фото, чем к пунктам']},
{name:'Для кого: шесть плашек',spec:f4,tips:['Оценка: подходит для короткого перечня профессий. Читается за 3 секунды','Цифра опыта в заголовке («7000+ специалистов») подтверждает, что алгоритм проверен']},
{name:'Для кого: карточки с фото',spec:f5,tips:['Оценка: подходит, когда клиентов узнают по жизненной ситуации, а не по должности','Название группы крупнее описания, описание начинается с ситуации клиента']},
{name:'Для кого: три стадии клиента',spec:f6,tips:['Оценка: подходит, когда клиенты на разных стадиях: старт, рост, масштаб','Каждый тезис описывает цель клиента, иллюстрация показывает стадию']},
{name:'Для кого: список и проверка',spec:f7,tips:['Оценка: подходит, когда нужна заявка сразу. Слева список «если ты», справа форма проверки с телефоном','Подсказка над полем говорит, что придёт после заявки']}];
export const FORWHOM:{name:string;cat:string;spec:(d:Dev)=>Out}[]=ALL.map(s=>({name:s.name,cat:CAT,spec:s.spec}));
const CR=['Группы называй по ситуации клиента: так он узнаёт себя быстрее, чем по должности','Три-четыре группы работают лучше шести: каждая получает свой итог'];
export const FORWHOM_TIPS:Record<string,string[]>=Object.fromEntries(ALL.map(s=>[s.name,[...s.tips,...CR]]));
