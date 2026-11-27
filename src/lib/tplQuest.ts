// Остались вопросы: 3 варианта по разбору 14 референсов (мессенджеры и время ответа, форма с телефоном, контакты и адрес).
// ПК 1440 (кнопка и форма в первых ~700 px, высота 820), планшет 768, мобилка 390 (кнопка закреплена внизу).
// Все элементы обычные (текст, рамка, кнопка, картинка, поле): правится каждая деталь.
import {ctx,th,r4} from './tplFirst';
import type {C,Out} from './tplFirst';
import {FW} from './dev';
import type {Dev} from './dev';

const SCR:Record<Dev,number>={desktop:820,tablet:952,mobile:780};
const LX=120,CAT='Формы и контакты';
interface V{name:string;h:string;hm:string;sub:string;subm:string;reply:string;ph:string;mail:string;addr:string;cta:string;note:string;tips:string[]}

/** закреплённая панель мобилки: главная кнопка и мессенджеры */
function bar(c:C,h:number,txt:string){const W=FW.mobile,X=20,w=W-40,by=h-96;
c.add('rect',0,by,W,96);c.add('text',X,by+6,w,20,'Закреплено внизу экрана',{fs:13});
c.add('btn',X,by+26,w-104,52,txt,{fs:14,acc:true});
c.add('rect',X+w-96,by+26,44,52,'TG',{fs:14,al:'c'});c.add('rect',X+w-44,by+26,44,52,'WA',{fs:14,al:'c'})}
const fin=(c:C,dev:Dev,y:number,s:V):Out=>{
if(dev==='mobile'){const h=Math.max(SCR.mobile,r4(y+8+96));bar(c,h,s.cta);return{h,els:c.els}}
return{h:Math.max(SCR[dev],r4(y+40)),els:c.els}};
const MSG=(c:C,x:number,y:number,sz=64,g=16)=>{c.add('rect',x,y,sz,sz,'TG',{fs:16,al:'c'});c.add('rect',x+sz+g,y,sz,sz,'WA',{fs:16,al:'c'});return x+2*sz+g};

// ---------- 1. Мессенджеры и время ответа (референсы: «Или задайте вопрос прямо сейчас», команда на фото) ----------
const MS:V={name:'Остались вопросы: мессенджеры',h:'Остались вопросы? Задайте их прямо сейчас',hm:'Остались вопросы?',
sub:'Менеджер ответит в чате и подберёт решение под вашу задачу',subm:'Ответит менеджер в чате',reply:'Среднее время ответа: 4 минуты в рабочее время',
ph:'+7 (999) 610-77-89',mail:'hello@company.ru',addr:'',cta:'Написать в чат',note:'Нажмите на одну из кнопок, чтобы открыть чат с менеджером в удобном мессенджере',
tips:['Оценка: +2–5% к заявкам. Подходит, когда человек не готов оставлять телефон и хочет сначала спросить','Время ответа рядом с кнопками снимает страх, что никто не ответит','Фото команды даёт лицо: человек пишет живым людям','Две кнопки мессенджеров без формы: самый короткий путь к вопросу']};
function msD(s:V):Out{const c=ctx();let y=120;
y=c.tx(s.h,LX,y,560,36,{b:true})+12;y=c.tx(s.sub,LX,y,560,18)+12;y=c.tx(s.reply,LX,y,560,14,{b:true})+32;
const e=MSG(c,LX,y);c.add('btn',e+16,y,280,64,s.cta,{fs:16,acc:true});y+=64+16;y=c.tx(s.note,LX,y,560,13)+0;
c.add('img',720,48,600,SCR.desktop-96,'Фото команды: 5–6 человек, улыбаются, смотрят в кадр');
return{h:SCR.desktop,els:c.els}}
function msS(s:V,dev:Dev):Out{const c=ctx();const m=dev==='mobile',W=FW[dev],X=m?20:48,w=W-2*X;let y=m?20:40;
y=c.tx(m?s.hm:s.h,X,y,w,m?22:30,{b:true})+10;y=c.tx(m?s.subm:s.sub,X,y,w,m?14:16)+8;y=c.tx(s.reply,X,y,w,14,{b:true})+16;
c.add('img',X,y,w,m?240:320,'Фото команды');y+=(m?240:320)+16;
if(!m){MSG(c,X,y);c.add('btn',X+152,y,Math.min(w-152,280),64,s.cta,{fs:16,acc:true});y+=64+12;y=c.tx(s.note,X,y,w,13)}
return fin(c,dev,y,s)}

// ---------- 2. Форма и телефон с перепиской (референсы: смартфон с чатом, «Не нашли ответ на свой вопрос?») ----------
const FM:V={name:'Остались вопросы: форма и телефон',h:'Не нашли ответ на свой вопрос?',hm:'Не нашли ответ?',
sub:'Задайте его руководителю лично. Ответим в течение 15 минут в рабочее время',subm:'Руководитель ответит лично',reply:'',
ph:'+7 (999) 610-77-89',mail:'',addr:'',cta:'Задать вопрос',note:'Нажимая на кнопку, вы соглашаетесь с политикой конфиденциальности',
tips:['Оценка: +3–6% к заявкам. Подходит услугам с высоким чеком, где решает доверие к человеку','Имя руководителя в кнопке («Задать вопрос Наталье») добавляет личный тон','Телефон под формой ловит тех, кто не любит писать','Картинка смартфона с перепиской показывает, как будет выглядеть ответ']};
function fmD(s:V):Out{const c=ctx();const fx=760,fw=560;
c.add('img',LX,48,520,SCR.desktop-96,'Смартфон с перепиской: вопрос клиента и ответ руководителя');
let y=120;y=c.tx(s.h,fx,y,fw,36,{b:true})+12;y=c.tx(s.sub,fx,y,fw,16)+24;
c.add('input',fx,y,fw,96,'Введите ваш вопрос');y+=96+12;c.add('input',fx,y,fw,56,'+7 (___) ___-__-__');y+=56+12;
c.add('btn',fx,y,fw,60,s.cta,{fs:16,acc:true});y+=60+12;y=c.tx(s.note,fx,y,fw,13)+16;
y=c.tx('Или позвоните: '+s.ph,fx,y,fw,18,{b:true});
return{h:SCR.desktop,els:c.els}}
function fmS(s:V,dev:Dev):Out{const c=ctx();const m=dev==='mobile',W=FW[dev],X=m?20:48,w=W-2*X;let y=m?20:40;
y=c.tx(m?s.hm:s.h,X,y,w,m?22:30,{b:true})+10;y=c.tx(m?s.subm:s.sub,X,y,w,m?14:16)+16;
c.add('input',X,y,w,m?88:96,'Введите ваш вопрос');y+=(m?88:96)+12;c.add('input',X,y,w,56,'+7 (___) ___-__-__');y+=56+12;
if(!m){c.add('btn',X,y,Math.min(w,360),56,s.cta,{fs:16,acc:true});y+=56+12}
y=c.tx(s.note,X,y,w,13)+12;y=c.tx('Или позвоните: '+s.ph,X,y,w,16,{b:true});
return fin(c,dev,y,s)}

// ---------- 3. Контакты и адрес (референсы: «Если у вас остались вопросы, вы можете обратиться», карта и офис) ----------
const CT:V={name:'Остались вопросы: контакты и адрес',h:'Если остались вопросы, обратитесь к нам',hm:'Остались вопросы?',
sub:'Отвечаем по телефону и почте с 10:00 до 19:00, в субботу до 16:00',subm:'Отвечаем с 10:00 до 19:00',reply:'',
ph:'+7 (499) 649-90-28',mail:'info@company.ru',addr:'Москва, ул. Земляной Вал, 50к3',cta:'Позвонить',note:'',
tips:['Оценка: +1–3% к звонкам. Подходит бизнесу с офисом, где важно показать, что компания настоящая','Три карточки (телефон, почта, адрес) читаются за секунду','Карта рядом с адресом снимает сомнения в реальности офиса','Режим работы сразу показывает, когда ждать ответа']};
function ctD(s:V):Out{const c=ctx();let y=96;
y=c.tx(s.h,LX,y,1200,36,{b:true,al:'c'})+12;y=c.tx(s.sub,LX,y,1200,18,{al:'c'})+40;
const g=24,cw=(1200-2*g)/3,hh=172;
const cards:[string,string,string][]=[['По телефону',s.ph,'Перезвоните нам'],['На электронную почту',s.mail,'Ответим за 1 рабочий день'],['Наш офис',s.addr,'Пн–Пт 10:00–19:00']];
cards.forEach((k,i)=>{const x=LX+i*(cw+g);c.add('rect',x,y,cw,hh);let t=c.tx(k[0],x+24,y+24,cw-48,16,{b:true})+8;t=c.tx(k[1],x+24,t,cw-48,20,{b:true})+8;c.tx(k[2],x+24,t,cw-48,14)});
y+=hh+32;c.add('btn',LX+(1200-360)/2,y,360,60,s.cta,{fs:16,acc:true});
return{h:SCR.desktop,els:c.els}}
function ctS(s:V,dev:Dev):Out{const c=ctx();const m=dev==='mobile',W=FW[dev],X=m?20:48,w=W-2*X;let y=m?20:40;
y=c.tx(m?s.hm:s.h,X,y,w,m?22:30,{b:true})+10;y=c.tx(m?s.subm:s.sub,X,y,w,m?14:16)+20;
const rows:[string,string][]=[['По телефону',s.ph],['На почту',s.mail],['Офис',s.addr]];
rows.forEach(k=>{const hh=r4(16+16+4+th(k[1],16,w-32,true)+16);c.add('rect',X,y,w,hh);const t=c.tx(k[0],X+16,y+16,w-32,14)+4;c.tx(k[1],X+16,t,w-32,16,{b:true});y+=hh+8});
y-=8;if(!m){y+=24;c.add('btn',X,y,Math.min(w,360),56,s.cta,{fs:16,acc:true});y+=56}
return fin(c,dev,y,s)}

// ---------- 4. Две крупные кнопки на тёмном фоне (референсы: «Пишите, если остались вопросы», «Или задайте вопрос прямо сейчас») ----------
const DK:V={name:'Остались вопросы: две кнопки',h:'Пишите, если остались вопросы',hm:'Остались вопросы?',
sub:'Ответим в чате за 4 минуты в рабочее время, с 10:00 до 19:00',subm:'Ответим за 4 минуты',reply:'',
ph:'+7 (999) 610-77-89',mail:'hello@company.ru',addr:'',cta:'Задать вопрос',note:'Нажмите на кнопку, чтобы открыть чат с менеджером',
tips:['Оценка: +2–4% к обращениям. Подходит, когда вопрос проще решить в чате, чем в форме','Две большие кнопки: канал с ответами и личный вопрос','Тёмный фон выделяет блок на светлой странице и ведёт глаз к кнопкам','Контакты и юридические ссылки внизу блока, не отвлекают от кнопок']};
function dkD(s:V):Out{const c=ctx();c.add('rect',0,0,FW.desktop,SCR.desktop);let y=180;
y=c.tx(s.h,LX,y,1200,40,{b:true,al:'c'})+12;y=c.tx(s.sub,LX,y,1200,18,{al:'c'})+40;
const bw=360,g=24,x0=LX+(1200-2*bw-g)/2;c.add('btn',x0,y,bw,72,'Канал с ответами',{fs:18,acc:true});c.add('btn',x0+bw+g,y,bw,72,s.cta,{fs:18,acc:true});y+=72+16;
y=c.tx(s.note,LX,y,1200,13,{al:'c'});
c.add('rect',LX,SCR.desktop-120,1200,1);c.tx(s.ph,LX,SCR.desktop-88,400,16,{b:true});c.tx(s.mail,LX+440,SCR.desktop-88,400,16,{b:true});c.tx('Политика конфиденциальности',LX+880,SCR.desktop-88,320,14);
return{h:SCR.desktop,els:c.els}}
function dkS(s:V,dev:Dev):Out{const c=ctx();const m=dev==='mobile',W=FW[dev],X=m?20:48,w=W-2*X;let y=m?20:40;
y=c.tx(m?s.hm:s.h,X,y,w,m?22:30,{b:true})+10;y=c.tx(m?s.subm:s.sub,X,y,w,m?14:16)+20;
if(!m){c.add('btn',X,y,w,64,'Канал с ответами',{fs:16,acc:true});y+=64+12;c.add('btn',X,y,w,64,s.cta,{fs:16,acc:true});y+=64+16}
else{c.add('rect',X,y,w,56,'Канал с ответами',{fs:15,al:'c'});y+=56+12}
y=c.tx(s.note,X,y,w,13)+16;y=c.tx(s.ph+'\n'+s.mail,X,y,w,16,{b:true});
return fin(c,dev,y,s)}

// ---------- 5. Консультант с фото и форма в одну строку (референсы: «Оставьте заявку, консультант перезвонит», «Задайте вопрос лично Наталье») ----------
const CS:V={name:'Остались вопросы: консультант и заявка',h:'Остались вопросы? Консультация бесплатно',hm:'Остались вопросы?',
sub:'Оставьте телефон: Анна перезвонит за 15 минут и ответит на все вопросы',subm:'Анна перезвонит за 15 минут',reply:'',
ph:'+7 (999) 610-77-89',mail:'',addr:'',cta:'Получить консультацию',note:'Нажимая на кнопку, вы соглашаетесь с политикой конфиденциальности',
tips:['Оценка: +3–7% к заявкам. Подходит услугам, где перед покупкой нужен разговор','Лицо консультанта и имя в тексте повышают доверие','Форма из двух элементов (телефон и кнопка) без лишних полей','Срок перезвона в цифрах: 15 минут']};
function csD(s:V):Out{const c=ctx();c.add('img',LX+720,48,480,SCR.desktop-48,'Фото консультанта по пояс, улыбается');
let y=160;y=c.tx(s.h,LX,y,640,36,{b:true})+12;y=c.tx(s.sub,LX,y,600,18)+32;
c.add('input',LX,y,340,60,'+7 (___) ___-__-__');c.add('btn',LX+356,y,284,60,s.cta,{fs:16,acc:true});y+=60+12;y=c.tx(s.note,LX,y,640,13)+24;
c.tx('Анна Королёва, старший консультант',LX,y,640,16,{b:true});
return{h:SCR.desktop,els:c.els}}
function csS(s:V,dev:Dev):Out{const c=ctx();const m=dev==='mobile',W=FW[dev],X=m?20:48,w=W-2*X;let y=m?20:40;
y=c.tx(m?s.hm:s.h,X,y,w,m?22:30,{b:true})+10;y=c.tx(m?s.subm:s.sub,X,y,w,m?14:16)+16;
c.add('img',X,y,m?72:96,m?72:96,'Фото');c.tx('Анна Королёва\nстарший консультант',X+(m?84:108),y+(m?10:24),w-(m?84:108),15,{b:true});y+=(m?72:96)+16;
c.add('input',X,y,w,56,'+7 (___) ___-__-__');y+=56+12;
if(!m){c.add('btn',X,y,Math.min(w,360),56,s.cta,{fs:16,acc:true});y+=56+12}
y=c.tx(s.note,X,y,w,13);
return fin(c,dev,y,s)}

// ---------- 6. Карточка с формой на три поля (референсы: «Консультация с менеджером», «Задайте вопрос» с именем, телефоном и почтой) ----------
const FC:V={name:'Остались вопросы: форма-карточка',h:'Остались вопросы?',hm:'Остались вопросы?',
sub:'Заполните форму: менеджер свяжется с вами в течение рабочего дня и ответит на все вопросы',subm:'Менеджер свяжется в течение дня',reply:'',
ph:'',mail:'',addr:'',cta:'Задать вопрос',note:'Нажимая на кнопку, вы соглашаетесь с политикой конфиденциальности',
tips:['Оценка: +2–5% к заявкам. Подходит, когда менеджеру нужны имя и контакт для точного ответа','Три поля в карточке: имя, телефон, вопрос. Больше полей снижает отправку','Карточка по центру: один столбец, глаз идёт сверху вниз до кнопки','Согласие с политикой мелким текстом под кнопкой']};
function fcD(s:V):Out{const c=ctx();let y=72;
y=c.tx(s.h,LX,y,1200,40,{b:true,al:'c'})+12;y=c.tx(s.sub,LX+240,y,720,18,{al:'c'})+32;
const w=560,x=LX+(1200-w)/2,p=32;c.add('rect',x,y,w,SCR.desktop-y-48);let yy=y+p;
c.tx('Консультация с менеджером',x+p,yy,w-2*p,20,{b:true,al:'c'});yy+=32;
['Введите ваше имя','+7 (___) ___-__-__','Введите ваш вопрос'].forEach((v,i)=>{const h=i===2?88:56;c.add('input',x+p,yy,w-2*p,h,v);yy+=h+12});
c.add('btn',x+p,yy,w-2*p,60,s.cta,{fs:16,acc:true});yy+=60+12;c.tx(s.note,x+p,yy,w-2*p,13,{al:'c'});
return{h:SCR.desktop,els:c.els}}
function fcS(s:V,dev:Dev):Out{const c=ctx();const m=dev==='mobile',W=FW[dev],X=m?20:48,w=W-2*X;let y=m?20:40;
y=c.tx(s.h,X,y,w,m?22:30,{b:true})+10;y=c.tx(m?s.subm:s.sub,X,y,w,m?14:16)+16;
['Введите ваше имя','+7 (___) ___-__-__','Введите ваш вопрос'].forEach((v,i)=>{const h=i===2?(m?80:88):56;c.add('input',X,y,w,h,v);y+=h+12});
if(!m){c.add('btn',X,y,Math.min(w,360),56,s.cta,{fs:16,acc:true});y+=56+12}
y=c.tx(s.note,X,y,w,13);
return fin(c,dev,y,s)}

export const QUEST:{name:string;cat:string;spec:(d:Dev)=>Out}[]=[
{name:MS.name,cat:CAT,spec:d=>d==='desktop'?msD(MS):msS(MS,d)},
{name:DK.name,cat:CAT,spec:d=>d==='desktop'?dkD(DK):dkS(DK,d)},
{name:CS.name,cat:CAT,spec:d=>d==='desktop'?csD(CS):csS(CS,d)},
{name:FC.name,cat:CAT,spec:d=>d==='desktop'?fcD(FC):fcS(FC,d)},
{name:FM.name,cat:CAT,spec:d=>d==='desktop'?fmD(FM):fmS(FM,d)},
{name:CT.name,cat:CAT,spec:d=>d==='desktop'?ctD(CT):ctS(CT,d)}];
const QR=['Время ответа пиши с цифрой, обещай только то, что выдержишь','Одна главная кнопка в блоке, без слайдеров и всплывающих окон'];
export const QUEST_TIPS:Record<string,string[]>=Object.fromEntries([MS,FM,CT,DK,CS,FC].map(s=>[s.name,[...s.tips,...QR]]));
