// Block templates: a tiny auto-layout engine builds wireframes for 1440 / 768 / 390 from one spec.
import {uid} from './uid';
import {FW} from './dev';
import type {Dev} from './dev';
import type {El,ET} from '../store';
import {FIRST,FIRST_TIPS} from './tplFirst';
import {REVIEWS,REVIEWS_TIPS} from './tplReviews';
import {GUAR,GUAR_TIPS} from './tplGuar';
import {STEPS,STEPS_TIPS} from './tplSteps';
import {TEAM,TEAM_TIPS} from './tplTeam';
import {MGR,MGR_TIPS} from './tplManager';
import {QUIZ,QUIZ_TIPS} from './tplQuiz';
import type {QuizCfg} from './quiz';
type Al='l'|'c'|'r';
export type Node=
|{k:'h1'|'h2'|'h3'|'p'|'sm';t:string;al?:Al}
|{k:'btn';t:string;al?:Al;full?:boolean}
|{k:'inp';t:string}
|{k:'img'|'rect';t?:string;h:number}
|{k:'gap';h:number}
|{k:'acc'|'li';t:string;r?:string}
|{k:'cols';n:number;per?:number;item?:Node[];items?:Node[][]}
|{k:'split';a:Node[];b:Node[]}
|{k:'card';item:Node[]}
|{k:'narrow';w:number;item:Node[]};
export interface Built{h:Record<Dev,number>;els:Record<Dev,El[]>;quiz?:QuizCfg}
export interface Tpl{name:string;cat:string;spec:Node[]|((d:Dev)=>{h:number;els:El[]});quiz?:()=>QuizCfg}
const PAD:Record<Dev,number>={desktop:120,tablet:48,mobile:20};
const PV:Record<Dev,number>={desktop:64,tablet:48,mobile:32};
const DI:Record<Dev,0|1|2>={desktop:0,tablet:1,mobile:2};
const FS:Record<string,[number,number,number]>={h1:[48,40,30],h2:[36,32,26],h3:[20,20,18],p:[16,16,16],sm:[14,14,14]};
const r8=(v:number)=>Math.ceil(v/8)*8;
const lines=(t:string,fs:number,w:number,bold=false)=>t.split('\n').reduce((a,l)=>a+Math.max(1,Math.ceil(l.length*fs*(bold?.68:.61)/w)),0);
const mk=(t:ET,x:number,y:number,w:number,h:number,text='',more:Partial<El>={}):El=>({id:uid(),t,x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h),text,...more});
const sub=(n:Node[],i:number):Node[]=>JSON.parse(JSON.stringify(n).replace(/\{i\}/g,String(i+1)));
const shift=(a:El[],dx:number,dy:number)=>{for(const e of a){e.x=Math.round(e.x+dx);e.y=Math.round(e.y+dy)}};

function place(ns:Node[],x:number,y:number,w:number,dev:Dev,out:El[],gap=16):number{
const di=DI[dev];
for(const n of ns){
switch(n.k){
case 'h1':case 'h2':case 'h3':case 'p':case 'sm':{const fs=FS[n.k][di];const h=r8(lines(n.t,fs,w,n.k[0]==='h')*fs*1.35);const more:Partial<El>={fs};if(n.k[0]==='h')more.b=true;if(n.al)more.al=n.al;out.push(mk('text',x,y,w,h,n.t,more));y+=h;break}
case 'btn':{const bw=dev==='mobile'||n.full?w:Math.min(w,260);const bx=n.al==='c'?x+(w-bw)/2:n.al==='r'?x+w-bw:x;out.push(mk('btn',bx,y,bw,52,n.t,{fs:16}));y+=52;break}
case 'inp':{out.push(mk('input',x,y,w,52,n.t));y+=52;break}
case 'img':case 'rect':{const ih=n.k==='img'?Math.round(n.h*(dev==='mobile'?.55:dev==='tablet'?.8:1)/8)*8:n.h;out.push(mk(n.k,x,y,w,ih,n.t??''));y+=ih;break}
case 'gap':{y+=n.h-gap;break}
case 'acc':{out.push(mk('rect',x,y,w,56));out.push(mk('text',x+16,y+16,w-72,24,n.t,{fs:16}));out.push(mk('text',x+w-40,y+14,24,28,'+',{fs:20,b:true}));y+=56;break}
case 'li':{out.push(mk('rect',x,y,w,64));out.push(mk('text',x+16,y+20,w*.6,24,n.t,{fs:16}));if(n.r)out.push(mk('text',x+w-176,y+20,160,24,n.r,{fs:16,b:true,al:'r'}));y+=64;break}
case 'card':{const p=dev==='mobile'?16:24;const r=mk('rect',x,y,w,0);out.push(r);const e=place(n.item,x+p,y+p,w-2*p,dev,out,12);r.h=r8(e-y+p);y+=r.h;break}
case 'narrow':{const nw=Math.min(n.w,w);y=place(n.item,x+(w-nw)/2,y,nw,dev,out,gap);break}
case 'cols':{const per=n.per??n.n;const nc=dev==='mobile'?1:dev==='tablet'?Math.min(per,2):per;const g=dev==='mobile'?16:24;const cw=(w-(nc-1)*g)/nc;let top=y;
for(let i=0;i<n.n;i+=nc){let end=top;for(let c=0;c<nc&&i+c<n.n;c++){const it=n.items?n.items[i+c]:sub(n.item??[],i+c);end=Math.max(end,place(it,x+c*(cw+g),top,cw,dev,out,gap))}top=end+g}
y=top-g;break}
case 'split':{if(dev!=='desktop'){const e=place(n.a,x,y,w,dev,out,gap);y=place(n.b,x,e+gap,w,dev,out,gap);break}
const g=64;const hw=(w-g)/2;const A:El[]=[],B:El[]=[];const ea=place(n.a,0,0,hw,dev,A,gap),eb=place(n.b,0,0,hw,dev,B,gap);const hh=Math.max(ea,eb);
shift(A,x,y+(hh-ea)/2);shift(B,x+hw+g,y+(hh-eb)/2);out.push(...A,...B);y+=hh;break}
}
y+=gap}
return y-gap}

function render(ns:Node[],dev:Dev){const els:El[]=[];const end=place(ns,PAD[dev],PV[dev],FW[dev]-2*PAD[dev],dev,els);return{h:Math.max(120,r8(end+PV[dev])),els}}
const header=(dev:Dev)=>{const W=FW[dev],P=PAD[dev];const els:El[]=[];
if(dev==='desktop'){els.push(mk('text',P,14,200,28,'Логотип',{fs:20,b:true}));els.push(mk('text',P,44,230,40,'Собственное производство бассейнов с 2012 года',{fs:14}));els.push(mk('text',380,22,320,40,'★ 4,9 на Яндекс Картах · более 420 построенных объектов',{fs:14}));els.push(mk('rect',740,20,36,36,'TG',{fs:12}));els.push(mk('rect',784,20,36,36,'WA',{fs:12}));els.push(mk('text',740,62,200,24,'Ответим за 2 минуты',{fs:12}));els.push(mk('text',940,16,190,24,'+7 (000) 000-00-00',{fs:16,b:true,al:'r'}));els.push(mk('text',940,44,190,24,'● Сейчас работаем',{fs:12,al:'r'}));els.push(mk('btn',W-P-170,20,170,44,'Перезвоните мне',{fs:14}));return{h:96,els}}
if(dev==='tablet'){els.push(mk('text',P,20,160,32,'Логотип',{fs:20,b:true}));els.push(mk('text',W-P-44-16-200,24,200,24,'+7 (000) 000-00-00',{fs:16,b:true,al:'r'}));els.push(mk('rect',W-P-44,14,44,44,'≡',{fs:20}));return{h:72,els}}
els.push(mk('text',P,16,160,32,'Логотип',{fs:20,b:true}));els.push(mk('rect',W-P-40,12,40,40,'≡',{fs:20}));return{h:64,els}};

const H2=(t:string,al?:Al):Node=>({k:'h2',t,al});
const card=(...item:Node[]):Node=>({k:'card',item});
const cols=(n:number,per:number,...item:Node[]):Node=>({k:'cols',n,per,item});
const CTA:Node={k:'btn',t:'Получить расчёт'};
const formCard=card({k:'sm',t:'Введите ваш телефон'},{k:'inp',t:'+7 (___) ___-__-__'},{k:'btn',t:'Получить расчёт',full:true},{k:'sm',t:'☐ Я принимаю условия передачи информации'});
/** first screen = one phone/desktop screen minus header: content is centered in a block of that height */
const SCR:Record<Dev,number>={desktop:820,tablet:952,mobile:780};
const screen=(ns:Node[])=>(d:Dev)=>{const r=render(ns,d);if(r.h<SCR[d]){shift(r.els,0,r8((SCR[d]-r.h)/2));r.h=SCR[d]}return r};
export const TPLS:Tpl[]=[
{name:'Шапка',cat:'Шапка и подвал',spec:header},
{name:'Подвал',cat:'Шапка и подвал',spec:[{k:'cols',n:3,items:[[{k:'h3',t:'Логотип'},{k:'sm',t:'© 2026. Название компании'}],[{k:'sm',t:'Политика конфиденциальности'},{k:'sm',t:'Реквизиты'}],[{k:'p',t:'+7 (000) 000-00-00'},{k:'sm',t:'info@company.ru'}]]}]},
...FIRST,
{name:'Баннер',cat:'Первый экран',spec:[card(H2('Акция: выгода в цифрах','c'),{k:'p',t:'Условия и срок действия',al:'c'},{k:'btn',t:'Получить предложение',al:'c'})]},
{name:'Кнопка старта',cat:'Первый экран',spec:[{k:'h1',t:'Заголовок квиза с ключевым словом',al:'c'},{k:'p',t:'Ответьте на 5 простых вопросов и получите расчёт',al:'c'},{k:'btn',t:'Начать',al:'c'}]},
{name:'Преимущества',cat:'Доверие',spec:[H2('Выгоды для вас','c'),cols(4,4,card({k:'img',h:56,t:'Иконка'},{k:'h3',t:'Выгода в цифрах'},{k:'p',t:'Вы получите … за счёт …'}))]},
{name:'Кейсы',cat:'Доверие',spec:[H2('Кейсы','c'),cols(3,3,card({k:'img',h:200,t:'Фото'},{k:'h3',t:'Название кейса'},{k:'p',t:'Задача → результат в цифрах'}))]},
{name:'Команда',cat:'Доверие',spec:[H2('Команда','c'),cols(4,4,card({k:'img',h:200,t:'Фото'},{k:'h3',t:'Имя Фамилия'},{k:'sm',t:'Должность'}))]},
{name:'О компании',cat:'Доверие',spec:[{k:'split',a:[H2('О компании'),{k:'p',t:'Чем занимаемся, сколько лет на рынке, главные цифры'},{k:'p',t:'Почему нам доверяют: гарантии, сертификаты, опыт'}],b:[{k:'img',h:360,t:'Фото'}]}]},
{name:'История',cat:'Доверие',spec:[{k:'split',a:[H2('История'),{k:'p',t:'Как начинали и чего достигли'}],b:[{k:'img',h:320,t:'Фото'}]}]},
...REVIEWS,
...STEPS,
...GUAR,
...TEAM,
...MGR,
...QUIZ,
{name:'Услуги',cat:'Продажа',spec:[H2('Услуги','c'),cols(3,3,card({k:'img',h:160,t:'Фото'},{k:'h3',t:'Услуга {i}'},{k:'p',t:'Результат для клиента'},{k:'btn',t:'Подробнее'}))]},
{name:'Список услуг',cat:'Продажа',spec:[H2('Услуги и цены'),{k:'li',t:'Услуга 1',r:'от 10 000 ₽'},{k:'li',t:'Услуга 2',r:'от 10 000 ₽'},{k:'li',t:'Услуга 3',r:'от 10 000 ₽'},{k:'li',t:'Услуга 4',r:'от 10 000 ₽'}]},
{name:'Тарифы',cat:'Продажа',spec:[H2('Тарифы','c'),cols(3,3,card({k:'h3',t:'Тариф {i}'},{k:'h2',t:'Цена ₽'},{k:'p',t:'• Что входит\n• Что входит\n• Что входит'},{k:'btn',t:'Выбрать',full:true}))]},
{name:'Хиты',cat:'Продажа',spec:[H2('Хиты продаж'),cols(4,4,card({k:'img',h:180,t:'Фото'},{k:'p',t:'Название товара'},{k:'h3',t:'Цена ₽'},{k:'btn',t:'В корзину',full:true}))]},
{name:'Категории',cat:'Продажа',spec:[H2('Категории'),cols(4,4,card({k:'img',h:140,t:'Фото'},{k:'h3',t:'Категория'}))]},
{name:'Сетка товаров',cat:'Продажа',spec:[cols(8,4,card({k:'img',h:180,t:'Фото'},{k:'p',t:'Название товара'},{k:'h3',t:'Цена ₽'},{k:'btn',t:'В корзину',full:true}))]},
{name:'Похожие',cat:'Продажа',spec:[H2('Похожие товары'),cols(4,4,card({k:'img',h:160,t:'Фото'},{k:'p',t:'Название товара'},{k:'h3',t:'Цена ₽'}))]},
{name:'Галерея',cat:'Продажа',spec:[cols(6,3,{k:'img',h:240,t:'Фото {i}'})]},
{name:'Описание',cat:'Продажа',spec:[{k:'split',a:[{k:'img',h:440,t:'Фото товара'}],b:[H2('Название товара'),{k:'p',t:'Описание: главные свойства и выгоды'},{k:'h3',t:'Цена ₽'},{k:'btn',t:'В корзину'}]}]},
{name:'Форма заявки',cat:'Конверсия',spec:[{k:'split',a:[H2('Получите расчёт за 1 минуту'),{k:'p',t:'Что получит человек после отправки'}],b:[formCard]}]},
{name:'Форма',cat:'Конверсия',spec:[{k:'narrow',w:520,item:[card({k:'h2',t:'Оставьте заявку'},{k:'p',t:'Что будет после отправки'},{k:'sm',t:'Введите ваш телефон'},{k:'inp',t:'+7 (___) ___-__-__'},{k:'btn',t:'Оставить заявку',full:true},{k:'sm',t:'☐ Я принимаю условия передачи информации'})]}]},
{name:'Контакты',cat:'Конверсия',spec:[{k:'split',a:[H2('Контакты'),{k:'p',t:'+7 (000) 000-00-00'},{k:'p',t:'Город, улица, дом'},{k:'p',t:'info@company.ru'},{k:'btn',t:'Заказать звонок'}],b:[{k:'img',h:320,t:'Карта'}]}]},
{name:'FAQ',cat:'Конверсия',spec:[H2('Вопросы и ответы'),{k:'acc',t:'Вопрос 1'},{k:'acc',t:'Вопрос 2'},{k:'acc',t:'Вопрос 3'},{k:'acc',t:'Вопрос 4'}]},
{name:'Подтверждение',cat:'Конверсия',spec:[{k:'h1',t:'Спасибо! Заявка принята',al:'c'},{k:'p',t:'Что будет дальше: менеджер позвонит в течение 15 минут',al:'c'},{k:'btn',t:'Вернуться на сайт',al:'c'}]},
{name:'Прогресс',cat:'Квиз',spec:[{k:'rect',h:16},{k:'sm',t:'Шаг 1 из 5'}]},
{name:'Вопрос',cat:'Квиз',spec:[{k:'h2',t:'Простой вопрос без экспертизы',al:'c'}]},
{name:'Варианты',cat:'Квиз',spec:[cols(4,4,card({k:'img',h:120,t:'Картинка'},{k:'p',t:'Вариант {i}',al:'c'})),{k:'sm',t:'Не забудь вариант «Не знаю / нужна консультация»',al:'c'}]},
{name:'Далее',cat:'Квиз',spec:[{k:'btn',t:'Далее',al:'c'},{k:'sm',t:'Назад',al:'c'}]},
{name:'Бонус',cat:'Квиз',spec:[{k:'split',a:[H2('Подарок закреплён за вашим номером'),{k:'p',t:'Куда отправить расчёт?'}],b:[{k:'img',h:300,t:'Подарок'}]}]},
{name:'Проблемы',cat:'Прочее',spec:[H2('Знакомые проблемы?','c'),cols(3,3,card({k:'h3',t:'Проблема клиента'},{k:'p',t:'Как она мешает жить и зарабатывать'}))]},
{name:'Как работаем',cat:'Прочее',spec:[H2('Как работаем','c'),cols(4,4,card({k:'h2',t:'{i}'},{k:'h3',t:'Этап {i}'},{k:'p',t:'Что делаем и что получает клиент'}))]},
{name:'Карта',cat:'Прочее',spec:[{k:'img',h:400,t:'Карта'}]},
{name:'Фильтры',cat:'Прочее',spec:[cols(4,4,{k:'inp',t:'Фильтр {i}'})]},
{name:'Список',cat:'Прочее',spec:[{k:'li',t:'Товар 1',r:'0 ₽'},{k:'li',t:'Товар 2',r:'0 ₽'},{k:'li',t:'Товар 3',r:'0 ₽'}]},
{name:'Итого',cat:'Прочее',spec:[card({k:'p',t:'Товары: 0 ₽'},{k:'p',t:'Доставка: 0 ₽'},{k:'h2',t:'Итого: 0 ₽'},{k:'btn',t:'Оформить заказ',full:true})]}];
export const CATS=[...new Set(TPLS.map(t=>t.cat))];
export const TIPS:Record<string,string[]>={...FIRST_TIPS,...REVIEWS_TIPS,...STEPS_TIPS,...GUAR_TIPS,...TEAM_TIPS,...MGR_TIPS,...QUIZ_TIPS,'Отзывы':REVIEWS_TIPS['Отзывы: результат'],
'Шапка':['Шапка занимает до 10% первого экрана','Логотип, дескриптор, телефон и «Заказать звонок»'],
'Преимущества':['Формула: «Вы получите … за счёт …»','Иконка и заголовок 3 уровня работают лучше сплошного текста'],
'Форма заявки':['Только телефон, остальное выяснит менеджер','Подсказка над полем, маска номера не нужна','Если есть поле, нужна галочка согласия','Форма каждые 2–3 блока, но не одинаковая','Текст кнопки совпадает с заголовком формы'],
'Форма':['Только телефон, остальное выяснит менеджер','Всплывающая форма без картинок','Кнопка большая и контрастная'],
'Вопрос':['4–6 вопросов, от простого к сложному','Покупатель не эксперт: вопросы простые'],
'Варианты':['Добавь вариант «Не знаю / нужна консультация»','Руками вводят только телефон'],
'Бонус':['Перед телефоном спроси, куда отправить результат','Напомни про подарок: он закреплён за этим номером'],
'Подтверждение':['Прогревающая страница: что будет дальше, преимущества, отзывы'],
'FAQ':['Раскрывающиеся блоки вместо слайдеров'],
'Тарифы':['Чем больше блок влияет на конверсию, тем крупнее элемент']};
export function buildTpl(t:Tpl):Built{const h={} as Record<Dev,number>,els={} as Record<Dev,El[]>;
for(const d of ['desktop','tablet','mobile'] as Dev[]){const r=typeof t.spec==='function'?t.spec(d):render(t.spec,d);h[d]=r.h;els[d]=r.els}return{h,els,quiz:t.quiz?.()}}
export const buildByName=(name:string):Built|null=>{if(name==='Оффер')name='1 экран';if(name==='Отзывы')name='Отзывы: результат';const t=TPLS.find(x=>x.name===name);return t?buildTpl(t):null};
export const emptyBuild=():Built=>({h:{desktop:400,tablet:400,mobile:480},els:{desktop:[],tablet:[],mobile:[]}});
export const fresh=(e:Record<Dev,El[]>):Record<Dev,El[]>=>({desktop:e.desktop.map(x=>({...x,id:uid()})),tablet:e.tablet.map(x=>({...x,id:uid()})),mobile:e.mobile.map(x=>({...x,id:uid()}))});
