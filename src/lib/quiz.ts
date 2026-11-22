// Квиз: настройки (QuizCfg), проверка по правилам автора и сборщик макета quizFrame.
// quizFrame чистая функция без внешних зависимостей: редактор, миниатюры и экспортированный HTML вызывают один и тот же код,
// поэтому в просмотре квиз работает по тем же настройкам, что и в редакторе. Не импортировать сюда ничего кроме типов.
import type {El} from '../store';
import type {Dev} from './dev';

export interface QOpt{t:string;img?:string;res?:string}
export interface QStep{q:string;msg:string;lay:'cards'|'list';cols:2|3|4;multi?:boolean;skip?:boolean;left:number;opts:QOpt[]}
export interface QuizCfg{
v:1;gen:string;title:string;sub:string;sticker:string;
progress:'bar'|'tabs'|'none';giftsTop:boolean;giftsSide:boolean;giftsTitle:string;gifts:string[];
cons:{on:boolean;name:string;role:string;phone:string;online:boolean};
counter:boolean;card:boolean;chips:boolean;noun:[string,string,string];total:number;counterStart:string;counterAfter:string;cardTitle:string;cardDef:string;
bonus:{kind:'percent'|'discount'|'gift'|'steps';per:number;unit:string;text:string;done:string};
txt:{next:string;back:string;skip:string};auto:boolean;back:boolean;
steps:QStep[];
bridge:{on:boolean;q:string;msg:string;opts:string[]};
phone:{title:string;sub:string;hint:string;ph:string;cta:string;consent:string;remind:string;msg:string;matchTitle:string;timer:boolean;mins:number;timerText:string;stock:string;proof:string;msgr:boolean};
load:{on:boolean;title:string;lines:string[]};
thanks:{title:string;text:string;steps:string[];msg:string;cta:string};
view:number}
/** состояние прохождения: pos позиция в потоке (вопросы, прокладка, телефон, загрузка, спасибо), ans выбранные варианты по шагам */
export interface QState{pos:number;ans:number[][];phone?:string;consent?:boolean;err?:string;li?:number;demo?:boolean}
export interface QOut{h:number;els:El[];kinds:string[]}

export const UNKNOWN=/не знаю|консульт|затрудня|не определ|пока присматр/i;
export const BONUS_TXT:Record<QuizCfg['bonus']['kind'],string>={percent:'Расчёт пройден на {p}%',discount:'Скидка за ответы: {d}',gift:'До секретного подарка: {ra}',steps:'Шаг {n} из {all}'};
export const BONUS_NAME:Record<QuizCfg['bonus']['kind'],string>={percent:'Процент прохождения',discount:'Скидка растёт с каждым ответом',gift:'Сколько ответов до подарка',steps:'Номер шага'};
export const TOKENS:[string,string][]=[['{q}','число вопросов'],['{qw}','«4 вопроса»'],['{n}','номер шага'],['{all}','всего шагов'],['{p}','процент'],['{k}','дано ответов'],['{r}','осталось ответов'],['{ra}','«3 ответа»'],['{d}','скидка сейчас'],['{dmax}','скидка в конце'],['{left}','решений осталось'],['{noun}','слово «решений»'],['{via}','куда отправить']];

const mkStep=(q:string,opts:string[],o:Partial<QStep>={}):QStep=>({q,msg:'',lay:'cards',cols:3,left:10,opts:opts.map(t=>({t})),...o});
export const baseCfg=():QuizCfg=>({v:1,gen:'g4',title:'Ответь на {qw} и получи подбор решений со скидкой до {dmax}',sub:'Подберём варианты под твои ответы за 1 минуту',sticker:'подарок за прохождение теста',
progress:'bar',giftsTop:false,giftsSide:true,giftsTitle:'В конце получишь:',gifts:['Персональную подборку решений','Расчёт стоимости и сроков','Подарок за прохождение теста'],
cons:{on:true,name:'Иван',role:'Старший мастер компании',phone:'+7 (999) 999-99-99',online:true},
counter:true,card:true,chips:true,noun:['решение','решения','решений'],total:38,counterStart:'Подбираем из {left} {noun}',counterAfter:'Осталось {left} {noun}',cardTitle:'Предварительно подходит:',cardDef:'Подбор по твоим ответам | уточним на следующем шаге',
bonus:{kind:'percent',per:500,unit:'₽',text:BONUS_TXT.percent,done:'Подарок открыт'},
txt:{next:'Далее',back:'Назад',skip:'Пропустить вопрос'},auto:false,back:true,
steps:[mkStep('Первый простой вопрос',['Вариант 1','Вариант 2','Вариант 3','Не знаю / нужна консультация'],{msg:'Отвечай как есть, остальное уточнит менеджер',left:21}),mkStep('Второй простой вопрос',['Вариант 1','Вариант 2','Вариант 3','Не знаю / нужна консультация'],{left:14}),mkStep('Третий простой вопрос',['Вариант 1','Вариант 2','Не знаю / нужна консультация'],{left:9}),mkStep('Когда планируешь начать?',['В ближайший месяц','Через 1–3 месяца','Пока присматриваюсь','Нужна консультация'],{lay:'list',cols:2,left:4})],
bridge:{on:true,q:'Куда отправить расчёт?',msg:'Выбери, как удобнее получить результат',opts:['WhatsApp','SMS','Бесплатная консультация по телефону: хочу узнать подробнее об акциях']},
phone:{title:'Система подобрала {left} {noun} под твои ответы',sub:'Оставь номер: сразу откроем персональный расчёт и закрепим подарок',hint:'Введи номер телефона',ph:'+7',cta:'Получить результат + бонусы',consent:'Согласен с политикой конфиденциальности',remind:'Скидка {d} и подарок закрепятся за этим номером',msg:'Остался последний шаг, подарок уже ждёт',matchTitle:'Уже подобрано для тебя:',timer:true,mins:15,timerText:'Подарок закреплён за номером ещё {t}',stock:'Сегодня осталось 3 места на бесплатный расчёт',proof:'За сегодня расчёт получили 17 человек',msgr:true},
load:{on:true,title:'Собираем твой результат',lines:['Исключаем неподходящие варианты…','Считаем стоимость и сроки…','Закрепляем скидку и подарок…']},
thanks:{title:'Результат отправлен, подарок закреплён за тобой',text:'Менеджер свяжется в течение 15 минут и пришлёт персональный расчёт',steps:['Менеджер позвонит и уточнит детали','Пришлём расчёт стоимости и сроков','Зафиксируем скидку и подарок'],msg:'Спасибо за ответы, всё уже в работе',cta:'Пройти квиз заново'},view:0});

/** приводит любые настройки к рабочему виду: ничего не ломается при ручной правке или импорте */
export function normalizeQuiz(raw:unknown):QuizCfg{
const b=baseCfg();const o=(raw&&typeof raw==='object'?raw:{}) as Record<string,unknown>;
const mg=<T extends object>(d:T,s:unknown):T=>{const r={...d} as Record<string,unknown>;if(s&&typeof s==='object')for(const k of Object.keys(d)){const v=(s as Record<string,unknown>)[k];if(v!==undefined&&typeof v===typeof (d as Record<string,unknown>)[k]&&!Array.isArray(v)===!Array.isArray((d as Record<string,unknown>)[k]))r[k]=v}return r as T};
const c:QuizCfg={...mg(b,o),cons:mg(b.cons,o.cons),bonus:mg(b.bonus,o.bonus),txt:mg(b.txt,o.txt),bridge:mg(b.bridge,o.bridge),phone:mg(b.phone,o.phone),load:mg(b.load,o.load),thanks:mg(b.thanks,o.thanks),steps:b.steps,noun:b.noun};
const st=Array.isArray(o.steps)?o.steps:b.steps;
c.steps=st.slice(0,8).map((x:unknown)=>{const m=mg(mkStep('',[]),x);const os=(x as {opts?:unknown})?.opts;m.opts=(Array.isArray(os)?os:[]).slice(0,8).map((q:unknown)=>mg({t:'',img:'',res:''},q) as QOpt).map(q=>{const r:QOpt={t:q.t};if(q.img)r.img=q.img;if(q.res)r.res=q.res;return r});
while(m.opts.length<2)m.opts.push({t:'Вариант '+(m.opts.length+1)});m.cols=m.cols===2||m.cols===4?m.cols:3;m.lay=m.lay==='list'?'list':'cards';m.left=Math.max(0,Math.round(+m.left||0));return m});
if(!c.steps.length)c.steps=b.steps.slice(0,1);
const nn=Array.isArray(o.noun)&&o.noun.length===3&&o.noun.every(v=>typeof v==='string')?o.noun as string[]:b.noun;c.noun=[nn[0],nn[1],nn[2]];
c.gifts=(Array.isArray(o.gifts)?o.gifts.filter((v):v is string=>typeof v==='string'):b.gifts).slice(0,6);
c.bridge.opts=(Array.isArray(c.bridge.opts)?c.bridge.opts.filter(v=>typeof v==='string'):b.bridge.opts).slice(0,5);while(c.bridge.opts.length<2)c.bridge.opts.push('Вариант '+(c.bridge.opts.length+1));
c.load.lines=(Array.isArray(c.load.lines)?c.load.lines.filter(v=>typeof v==='string'):[]).slice(0,4);if(!c.load.lines.length)c.load.lines=b.load.lines.slice(0,1);
c.thanks.steps=(Array.isArray(c.thanks.steps)?c.thanks.steps.filter(v=>typeof v==='string'):b.thanks.steps).slice(0,4);
c.progress=c.progress==='tabs'||c.progress==='none'?c.progress:'bar';
if(!(c.bonus.kind in BONUS_TXT))c.bonus.kind='percent';
c.bonus.per=Math.max(0,Math.min(100000,Math.round(+c.bonus.per||0)));c.total=Math.max(1,Math.min(9999,Math.round(+c.total||1)));c.phone.mins=Math.max(1,Math.min(99,Math.round(+c.phone.mins||15)));
c.view=Math.max(0,Math.min(c.steps.length+(c.bridge.on?1:0)+1+(c.load.on?1:0),Math.round(+c.view||0)));
return c}

export interface Chk{ok:boolean;t:string;fix?:string}
/** проверка по правилам квизов автора; h высоты блока по устройствам (для правила одного экрана) */
export function quizCheck(c:QuizCfg,h?:Partial<Record<Dev,number>>):Chk[]{
const n=c.steps.length;const noUnk=c.steps.map((s,i)=>s.opts.some(o=>UNKNOWN.test(o.t))?0:i+1).filter(Boolean);
const long=c.steps.map((s,i)=>s.q.length>60||s.opts.length>6?i+1:0).filter(Boolean);
const num=[...(c.title+' '+c.sub).matchAll(/(\d+)\s+(?:простых\s+)?вопрос/gi)].map(m=>+m[1]);
const out:Chk[]=[
{ok:n>=4&&n<=6,t:`Вопросов: ${n}. Правило: 4–6`,fix:n<4?'Добавь вопрос':'Убери лишний вопрос'},
{ok:!noUnk.length,t:noUnk.length?`Нет варианта «Не знаю / нужна консультация» в вопросах: ${noUnk.join(', ')}`:'В каждом вопросе есть вариант «Не знаю / нужна консультация»'},
{ok:c.bridge.on,t:c.bridge.on?'Перед телефоном есть вопрос «Куда отправить результат»':'Нет вопроса «Куда отправить результат» перед телефоном',fix:'Включи вопрос-прокладку на вкладке «Телефон и финал»'},
{ok:!long.length,t:long.length?`Слишком сложно в вопросах: ${long.join(', ')} (длинный вопрос или больше 6 вариантов)`:'Вопросы простые: короткие, до 6 вариантов'},
{ok:!num.length||num.every(v=>v===n),t:num.some(v=>v!==n)?`Цифра в заголовке не совпадает с числом вопросов (${n}). Поставь {qw}`:'Цифра в заголовке совпадает с числом вопросов'},
{ok:/закреп/i.test(c.phone.remind),t:/закреп/i.test(c.phone.remind)?'Напоминание: подарок и скидка закреплены за номером':'Напиши, что скидка или подарок закрепятся за этим номером'},
{ok:!/[_(]/.test(c.phone.ph),t:/[_(]/.test(c.phone.ph)?'В поле телефона маска: люди не дописывают цифру. Убери':'В поле телефона нет маски'},
{ok:c.gifts.length>=3,t:c.gifts.length>=3?`Подарков в конце: ${c.gifts.length}`:`Подарков ${c.gifts.length}. Покажи в начале хотя бы 3`},
{ok:true,t:'Ручной ввод только в телефоне, одно поле'}];
if(h?.mobile!==undefined)out.push({ok:h.mobile<=844,t:h.mobile<=844?`Мобилка: блок ${h.mobile} px, помещается в экран`:`Мобилка: блок ${h.mobile} px, выше экрана 844. Убери вариант или подзаголовок`});
return out}

/** Сборщик макета. Возвращает элементы (как в редакторе) для позиции s.pos и общую высоту блока: она одинакова на всех шагах, кнопка стоит на одном месте. */
export function quizFrame(c:QuizCfg,s:QState,dev:Dev):QOut{
const D=dev==='desktop',T=dev==='tablet',M=dev==='mobile';
const nq=c.steps.length,hb=c.bridge.on;
const kinds:string[]=[];for(let i=0;i<nq;i++)kinds.push('q');if(hb)kinds.push('bridge');kinds.push('phone');if(c.load.on)kinds.push('load');kinds.push('thanks');
const units=nq+(hb?1:0)+1;
const ln=(t:string,fs:number,w:number,b?:boolean)=>t.split('\n').reduce((a,l)=>a+Math.max(1,Math.ceil(l.length*fs*(b?.66:.58)/Math.max(8,w))),0);
const th=(t:string,fs:number,w:number,b?:boolean)=>Math.ceil(ln(t,fs,w,b)*fs*1.3/4)*4;
const pl=(n:number,f:string[])=>{const a=Math.abs(n)%100,b=a%10;return a>10&&a<20?f[2]:b===1?f[0]:b>1&&b<5?f[1]:f[2]};
const money=(n:number,u:string)=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'\u00A0')+(u==='%'?'%':'\u00A0'+u);
const clip=(t:string,n:number)=>t.length>n?t.slice(0,n-1)+'…':t;
const sp=(t:string):string[]=>{const i=t.indexOf('|');return i<0?[t.trim(),'']:[t.slice(0,i).trim(),t.slice(i+1).trim()]};
const X0=D?120:T?48:0,CW=D?1200:T?672:390,PX=D?32:T?24:16,PT=D?56:T?40:16,PB=D?56:T?40:0;
const IX=X0+PX,IW=CW-2*PX;
const hasSide=D&&(c.cons.on||c.counter||c.card||c.giftsSide);
const R=hasSide?360:0,G=hasSide?40:0,LW=IW-R-G,RX=IX+LW+G;
const GR='#CBD5E1',LT='#F1F5F9',DK='#0F172A',MU='#64748B';
let cmp=false;
const build=(pos:number,Hfix?:number)=>{
const kind=kinds[pos];const qi=pos<nq?pos:-1;
const E:El[]=[];let nid=0;
const add=(t:El['t'],x:number,y:number,w:number,h:number,text='',more:Partial<El>={}):number=>{E.push({id:'q'+(++nid),t,x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h),text,...more});return y+h};
const k=Math.min(pos,units-1);const pct=kind==='thanks'?100:kind==='load'?99:Math.round((k+1)/units*100);
const disc=c.bonus.per*k,r=units-1-k;
const leftNow=pos===0?c.total:c.steps[Math.min(pos,nq)-1].left;
const sel=(i:number):number[]=>{const a=s.ans[i];if(a&&a.length)return a;if(i<Math.min(pos,nq+(hb?1:0))||(s.demo&&i===pos))return[0];return[]};
const via=hb?(c.bridge.opts[sel(nq)[0]]??c.bridge.opts[0]).split(':')[0].trim():'';
const rep=(t:string,x:Record<string,string|number>={}):string=>t.replace(/\{(\w+)\}/g,(m,key:string)=>{const all:Record<string,string|number>={q:nq,qw:nq+' '+pl(nq,['вопрос','вопроса','вопросов']),n:Math.min(pos+1,units),all:units,p:pct,k,r,ra:r+' '+pl(r,['ответ','ответа','ответов']),d:money(disc,c.bonus.unit),dmax:money(c.bonus.per*(units-1),c.bonus.unit),left:leftNow,noun:pl(leftNow,c.noun),via,...x};const v=all[key];return v===undefined?m:String(v)});
/* подобранные решения: свежие по ответам, без повторов */
const found:string[][]=[];for(let i=Math.min(pos,nq)-1;i>=0;i--)for(const j of sel(i)){const o=c.steps[i].opts[j];if(o&&o.res&&!found.some(f=>f[0]===sp(o.res!)[0]))found.push(sp(o.res))}
if(!found.length)found.push(sp(c.cardDef));
let y=PT;
/* заголовок, подзаголовок, стикер, подарки сверху */
const tfs=D?36:T?30:24,tw=D?1000:T?CW:CW-32,tx=X0+(CW-tw)/2;
const ttl=rep(c.title);y=add('text',tx,y,tw,th(ttl,tfs,tw,true),ttl,{fs:tfs,b:true,al:'c',role:'h2'})+(M?10:14);
if(c.sub&&!(M&&(kind!=='q'||cmp))){const sfs=D?18:T?16:15;const t=rep(c.sub);y=add('text',tx,y,tw,th(t,sfs,tw),t,{fs:sfs,al:'c',c:MU})+(M?10:14)}
if(c.sticker&&!(M&&cmp)){const t='🎁 '+rep(c.sticker);const sw=Math.min(tw,Math.max(200,Math.ceil(t.length*14*.62)+40));const sx=X0+(CW-sw)/2;add('rect',sx,y,sw,M?32:36,'',{r:18,fill:LT,stroke:GR,sw:1});add('text',sx+12,y+4,sw-24,M?24:28,t,{fs:14,b:true,al:'c'});y+=(M?32:36)+(M?10:14)}
if(c.giftsTop&&c.gifts.length&&!(M&&cmp)){if(M){const t='🎁 В конце теста: '+c.gifts.length+' '+pl(c.gifts.length,['подарок','подарка','подарков']);add('rect',IX,y,IW,40,'',{r:12,fill:LT,stroke:GR,sw:1});add('text',IX+12,y+6,IW-24,28,t,{fs:14,b:true,al:'c'});y+=40+10}
else{const g=c.gifts.slice(0,3),n=g.length,gw=(CW-(n-1)*16)/n,gt=gw-72;const gh=Math.max(64,...g.map(t=>th(t,16,gt,true)+24));g.forEach((t,i)=>{const gx=X0+i*(gw+16);add('rect',gx,y,gw,gh,'',{r:14,fill:LT,stroke:GR,sw:1});add('btn',gx+16,y+(gh-36)/2,36,36,'🎁',{fs:16,r:18,fill:'#FFFFFF',stroke:GR,sw:1,c:DK});add('text',gx+64,y+(gh-th(t,16,gt,true))/2,gt,th(t,16,gt,true),t,{fs:16,b:true})});y+=gh+16}}
const cardY=y;const cardEl=D||T?(add('rect',X0,cardY,CW,0,'',{r:20,fill:'#FFFFFF',stroke:GR,sw:1.5}),E[E.length-1]):null;
let cy=cardY+(M?0:PX);const top0=cy;
/* прогресс: полоса с подписью или вкладки */
const barW=IW-(D&&hasSide?R+G:0);
const bonusT=c.bonus.kind==='gift'&&r===0?c.bonus.done:rep(c.bonus.text||({percent:'Расчёт пройден на {p}%',discount:'Скидка за ответы: {d}',gift:'До секретного подарка: {ra}',steps:'Шаг {n} из {all}'})[c.bonus.kind]);
if(c.progress==='tabs'&&!M){const n=nq,g=8,pw=Math.min(150,(barW-(n-1)*g)/n);for(let i=0;i<n;i++){const done=pos>i,cur=pos===i,tx2=IX+i*(pw+g);const st:Partial<El>=cur?{fill:DK,stroke:'none',c:'#FFFFFF'}:done?{fill:LT,stroke:DK,sw:1.5,c:DK}:{fill:LT,stroke:GR,sw:1.5,c:MU};
add('rect',tx2,cy,pw,40,'',{r:20,fill:st.fill,stroke:st.stroke,sw:st.sw??0,qa:'tab:'+i});add('text',tx2+8,cy+6,pw-16,28,'Вопрос '+(i+1),{fs:14,b:true,al:'c',c:st.c,qa:'tab:'+i})}cy+=40+(D?28:20)}
else if(c.progress!=='none'){const fs=D?16:T?15:14;cy=add('text',IX,cy,barW,th(bonusT,fs,barW,true),bonusT,{fs,b:true})+6;add('rect',IX,cy,barW,12,'',{r:6,fill:LT,stroke:GR,sw:1});add('rect',IX,cy,Math.max(24,Math.round(barW*pct/100)),12,'',{r:6,fill:DK,stroke:'none',sw:0});cy+=12+(D?28:M?22:20)}
const bodyY=cy;
/* помощники блоков боковой колонки */
const gifts=(x:number,yy:number,w:number,open:boolean):number=>{yy=add('text',x,yy,w,24,c.giftsTitle,{fs:16,b:true})+8;for(const g of c.gifts){const gt=th(g,15,w-44),gh=Math.max(36,gt);add('btn',x,yy+(gh-32)/2,32,32,open?'✓':'🔒',{fs:14,r:8,fill:LT,stroke:GR,sw:1,c:DK});add('text',x+44,yy+(gh-gt)/2,w-44,gt,g,{fs:15});yy+=gh+8}return yy-8};
const cons=(x:number,yy:number,w:number,msg:string):number=>{const av=72;add('img',x,yy,av,av,'Фото',{r:36});add('text',x+av+16,yy+2,w-av-16,24,c.cons.name,{fs:18,b:true});if(c.cons.phone)add('text',x+av+16,yy+28,w-av-16,22,c.cons.phone,{fs:15,b:true});const rt=(c.cons.online?'● ':'')+c.cons.role;const rh=th(rt,14,w-av-16);add('text',x+av+16,yy+52,w-av-16,rh,rt,{fs:14,c:MU});yy+=Math.max(av,52+rh);
if(!msg)return yy;yy+=12;const mh=th(msg,15,w-32)+24;add('rect',x,yy,w,mh,'',{r:14,fill:LT,stroke:GR,sw:1});add('text',x+16,yy+12,w-32,mh-24,msg,{fs:15});return yy+mh};
const consC=(x:number,yy:number,w:number,msg:string):number=>{const av=T?56:48,bx=x+av+12,bw=w-av-12,fs=T?15:14;add('img',x,yy,av,av,'',{r:av/2});const mh=Math.max(av,th(msg,fs,bw-24)+20);add('rect',bx,yy,bw,mh,'',{r:14,fill:LT,stroke:GR,sw:1});add('text',bx+12,yy+(mh-th(msg,fs,bw-24))/2,bw-24,th(msg,fs,bw-24),msg,{fs});return yy+mh};
const chips=(x:number,yy:number,w:number):number=>{let cx=x,cr=yy,any=false;for(let i=0;i<Math.min(pos,nq);i++){const o=c.steps[i].opts[sel(i)[0]];if(!o)continue;const t=clip(o.t,16)+' ✓';const cw2=Math.min(w,Math.ceil(t.length*14*.6)+28);if(cx+cw2>x+w){cx=x;cr+=40}add('rect',cx,cr,cw2,32,'',{r:16,fill:LT,stroke:GR,sw:1});add('text',cx+10,cr+4,cw2-20,24,t,{fs:14,b:true,al:'c'});cx+=cw2+8;any=true}return any?cr+32:yy};
const counterCard=(x:number,yy:number,w:number):number=>{const p=20;add('rect',x,yy,w,0,'',{r:16,fill:'#FFFFFF',stroke:GR,sw:1});const rc=E[E.length-1];let cy2=yy+p;
if(c.counter){const t=rep(pos===0?c.counterStart:c.counterAfter);cy2=add('text',x+p,cy2,w-2*p,th(t,24,w-2*p,true),t,{fs:24,b:true,al:'c'})+8}
if(c.card){cy2=add('text',x+p,cy2,w-2*p,20,c.cardTitle,{fs:14,al:'c',c:MU})+8;cy2=add('img',x+p,cy2,w-2*p,120,'Фото решения',{r:12})+8;const more=leftNow-1;if(c.counter&&more>0){const t='…и ещё '+more+' '+pl(more,['вариант','варианта','вариантов']);cy2=add('text',x+p,cy2,w-2*p,20,t,{fs:14,c:MU,al:'c'})+8}
const [nm,sb]=found[0];cy2=add('text',x+p,cy2,w-2*p,th(nm,16,w-2*p,true),nm,{fs:16,b:true})+4;if(sb)cy2=add('text',x+p,cy2,w-2*p,th(sb,14,w-2*p),sb,{fs:14,c:MU})+8}
if(c.bonus.kind==='discount'&&c.bonus.per>0){add('rect',x+p,cy2,w-2*p,44,'',{r:12,fill:LT,stroke:'none',sw:0});add('text',x+p+12,cy2+8,w-2*p-24,28,rep('Скидка за ответы: {d}'),{fs:16,b:true,al:'c'});cy2+=44+10}
if(c.chips){const e=chips(x+p,cy2,w-2*p);if(e>cy2)cy2=e+10}
rc.h=Math.round(cy2-yy+p-10);return yy+rc.h};
const sideQ=(yy:number):number=>{let e=yy;if(c.cons.on)e=cons(RX,e,R,kind==='bridge'?c.bridge.msg:c.steps[Math.max(0,qi)]?.msg??'')+16;if(c.counter||c.card)e=counterCard(RX,e,R)+16;if(c.giftsSide)e=gifts(RX,e,R,false)+16;return e-16};
const matchesCard=(x:number,yy:number,w:number):number=>{const p=16;add('rect',x,yy,w,0,'',{r:16,fill:'#FFFFFF',stroke:GR,sw:1});const rc=E[E.length-1];let q2=yy+p;q2=add('text',x+p,q2,w-2*p,22,c.phone.matchTitle,{fs:14,b:true,c:MU})+8;
for(const [nm,sb] of found.slice(0,3)){const tw2=w-2*p-96,nh=th(nm,15,tw2,true),sh=sb?th(sb,14,tw2):0;const rh=Math.max(64,nh+sh+8);add('img',x+p,q2,80,rh>64?64:rh,'');add('text',x+p+92,q2+(rh-nh-sh)/2,tw2,nh,nm,{fs:15,b:true});if(sb)add('text',x+p+92,q2+(rh-nh-sh)/2+nh,tw2,sh,sb,{fs:14,c:MU});q2+=rh+8}
const m=leftNow-found.length;if(m>0){const t='…и ещё '+m+' '+pl(m,c.noun)+': пришлём в полном расчёте';q2=add('text',x+p,q2,w-2*p,th(t,14,w-2*p),t,{fs:14,c:MU})+8}
rc.h=Math.round(q2-yy-8+p);return yy+rc.h};
/* тело шага */
let leftBottom=bodyY,sideBottom=bodyY,foot=0;let footer:((fy:number)=>void)|null=null;
const fh=D?56:52;
if(kind==='q'||kind==='bridge'){
const isB=kind==='bridge';const st=isB?null:c.steps[qi];
const opts:QOpt[]=isB?c.bridge.opts.map(t=>({t})):st!.opts;
const lay:'cards'|'list'=isB?'list':(M&&opts.length>4?'list':st!.lay);const multi=!isB&&!!st!.multi;
const qt=isB?c.bridge.q:st!.q,qfs=D?28:T?24:20;let yy=bodyY;
const bt=isB?'Почти готово':'Вопрос '+(qi+1)+' из '+nq;
if(M){add('rect',IX,yy,isB?120:124,28,'',{r:14,fill:LT,stroke:GR,sw:1});add('text',IX+8,yy+2,(isB?120:124)-16,24,bt,{fs:14,b:true,al:'c'});yy+=28+8;yy=add('text',IX,yy,IW,th(qt,qfs,IW,true),qt,{fs:qfs,b:true,role:'h2'})+12}
else{const bw=D?160:140,tw2=LW-bw-16,hh=Math.max(36,th(qt,qfs,tw2,true));add('rect',IX,yy,bw,36,'',{r:18,fill:LT,stroke:GR,sw:1});add('text',IX+8,yy+4,bw-16,28,bt,{fs:14,b:true,al:'c'});add('text',IX+bw+16,yy+(hh-th(qt,qfs,tw2,true))/2,tw2,th(qt,qfs,tw2,true),qt,{fs:qfs,b:true,role:'h2'});yy+=hh+(D?20:16)}
if(multi)yy=add('text',IX,yy,LW,20,'Можно выбрать несколько вариантов',{fs:14,c:MU})+(M?8:12);
const chosen=sel(pos);const sty=(on:boolean):Partial<El>=>on?{fill:LT,stroke:DK,sw:2.5,r:14}:{fill:'#FFFFFF',stroke:GR,sw:1.5,r:14};
const mark=(on:boolean,x:number,y2:number,i:number)=>add('btn',x,y2,24,24,on?'✓':'',{fs:14,r:12,fill:on?DK:'#FFFFFF',stroke:on?'none':GR,sw:on?0:1.5,c:'#FFFFFF',qa:'o:'+i});
if(lay==='cards'){const nc=D?st!.cols:T?Math.min(st!.cols,3):2,g=M?12:16,cw=(LW-(nc-1)*g)/nc,ih=D?140:T?120:64,lt=cw-60;const lab=Math.max(28,...opts.map(o=>th(o.t,M?14:15,lt)));const chh=8+ih+8+lab+8;
opts.forEach((o,i)=>{const cx=IX+(i%nc)*(cw+g),cyy=yy+Math.floor(i/nc)*(chh+g),on=chosen.includes(i);add('rect',cx,cyy,cw,chh,'',{...sty(on),qa:'o:'+i});add('img',cx+8,cyy+8,cw-16,ih,o.img||'Фото',{r:10,qa:'o:'+i});mark(on,cx+10,cyy+8+ih+8+(lab-24)/2,i);add('text',cx+44,cyy+8+ih+8,cw-54,lab,o.t,{fs:M?14:15,qa:'o:'+i})});
yy+=Math.ceil(opts.length/nc)*(chh+g)-g}
else{const nc=isB||M?1:2,g=M?8:12,cw=(LW-(nc-1)*g)/nc,rh=D?64:T?60:52,rfs=D?18:T?17:16,lt=cw-64;
const rowH=(i:number)=>{const a=th(opts[i].t,rfs,lt);return Math.max(rh,a+16)};const rows=Math.ceil(opts.length/nc);const hs:number[]=[];for(let q3=0;q3<rows;q3++)hs.push(Math.max(...opts.slice(q3*nc,q3*nc+nc).map((_,j)=>rowH(q3*nc+j))));
let ry=yy;for(let q3=0;q3<rows;q3++){for(let j=0;j<nc&&q3*nc+j<opts.length;j++){const i=q3*nc+j,cx=IX+j*(cw+g),on=chosen.includes(i),a=th(opts[i].t,rfs,lt);add('rect',cx,ry,cw,hs[q3],'',{...sty(on),qa:'o:'+i});mark(on,cx+14,ry+(hs[q3]-24)/2,i);add('text',cx+50,ry+(hs[q3]-a)/2,lt,a,opts[i].t,{fs:rfs,qa:'o:'+i})}ry+=hs[q3]+g}yy=ry-g}
leftBottom=yy;
/* боковая колонка (ПК) или компактные блоки (планшет, мобилка) */
if(hasSide)sideBottom=sideQ(top0);
else{let e=leftBottom;const msg=isB?c.bridge.msg:st!.msg;
if(c.cons.on&&msg){/* консультант выше вопроса не двигаем: ставим под вариантами одной строкой */e=consC(IX,e+(M?12:16),IW,msg)}
if(c.counter||c.card){const t=rep(pos===0?c.counterStart:c.counterAfter)+(c.bonus.kind==='discount'&&c.bonus.per>0&&pos>0?' · скидка '+money(disc,c.bonus.unit):'');e+=M?12:16;add('rect',IX,e,IW,44,'',{r:12,fill:LT,stroke:GR,sw:1});add('text',IX+12,e+8,IW-24,28,t,{fs:14,b:true,al:'c'});e+=44}
leftBottom=e}
foot=fh;
footer=(fy:number)=>{const bw=D?220:T?200:IW-84;
if(c.back&&qi!==0&&!(pos===0)){add('text',IX,fy+(fh-40)/2,M?72:120,40,'← '+c.txt.back,{fs:16,c:MU,qa:'back'})}
const sk=!isB&&st!.skip;const mid=s.err==='sel'?'Выбери вариант, чтобы продолжить':sk?c.txt.skip:'';
if(mid&&!M)add('text',IX+(LW-240)/2,fy+(fh-40)/2,240,40,mid,{fs:14,b:s.err==='sel',al:'c',c:s.err==='sel'?DK:MU,qa:s.err==='sel'?undefined:'skip'});
else if(mid&&M)add('text',IX+84,fy-26,IW-84,22,mid,{fs:14,b:s.err==='sel',al:'c',c:s.err==='sel'?DK:MU,qa:s.err==='sel'?undefined:'skip'});
add('btn',IX+(M?84:LW-bw),fy,M?IW-84:bw,fh,c.txt.next+' →',{fs:D?18:16,b:true,qa:'next'})}}
else if(kind==='phone'){
const fw=hasSide?LW:Math.min(IW,D?640:T?560:IW),fx=hasSide||M?IX:IX+(IW-fw)/2;let yy=bodyY;
const t1=rep(c.phone.title),t2=rep(c.phone.sub);const f1=D?32:T?28:22;
yy=add('text',fx,yy,fw,th(t1,f1,fw,true),t1,{fs:f1,b:true,role:'h2'})+10;
if(t2)yy=add('text',fx,yy,fw,th(t2,D?17:16,fw),t2,{fs:D?17:16,c:MU})+(M?14:20);
const hint=rep(c.phone.hint);yy=add('text',fx,yy,fw,22,hint,{fs:15,b:true})+8;
const ih=M?56:64;yy=add('input',fx,yy,fw,ih,c.phone.ph,{fs:18,qa:'phone',r:12})+(M?10:12);
const rm=s.err==='phone'?'Введи номер полностью: минимум 10 цифр':s.err==='consent'?'Поставь галочку согласия':rep(c.phone.remind);if(rm)yy=add('text',fx,yy,fw,th(rm,14,fw),rm,{fs:14,b:true})+(M?10:14);
const cta=rep(c.phone.cta);
if(!M){yy=add('btn',fx,yy,fw,ih,cta,{fs:18,b:true,qa:'submit'})+12}
const cs='Согласен с политикой конфиденциальности';const ct=(s.consent===false?'☐ ':'☑ ')+(c.phone.consent||cs);yy=add('text',fx,yy,fw,24,ct,{fs:14,qa:'consent'})+(M?8:12);
if(c.phone.timer){const t=rep(c.phone.timerText,{t:String(c.phone.mins).padStart(2,'0')+':00'});yy=add('text',fx,yy,fw,th(t,14,fw,true),t,{fs:14,b:true,qa:'timer:'+c.phone.mins})+(M?6:8)}
if(c.phone.stock)yy=add('text',fx,yy,fw,th(c.phone.stock,14,fw),c.phone.stock,{fs:14,c:MU})+(M?6:8);
if(c.phone.proof)yy=add('text',fx,yy,fw,th(c.phone.proof,14,fw),c.phone.proof,{fs:14,c:MU})+8;
leftBottom=yy-8;
if(hasSide){let e=top0;if(c.cons.on)e=cons(RX,e,R,c.phone.msg)+16;e=matchesCard(RX,e,R)+16;if(c.giftsSide)e=gifts(RX,e,R,false)+16;sideBottom=e-16}
else if(!M&&c.cons.on&&c.phone.msg){leftBottom=consC(fx,leftBottom+16,fw,c.phone.msg)}
if(M){foot=fh;footer=(fy:number)=>{add('btn',IX,fy,IW,fh,cta,{fs:16,b:true,qa:'submit'})}}
}
else if(kind==='load'){
const w=Math.min(IW,560),x=IX+(IW-w)/2;let yy=bodyY+(D?72:M?40:48);
yy=add('text',x,yy,w,64,'◌',{fs:56,al:'c',c:MU})+12;const t=rep(c.load.title);yy=add('text',x,yy,w,th(t,D?32:24,w,true),t,{fs:D?32:24,b:true,al:'c',role:'h2'})+12;
const l=c.load.lines[(s.li??0)%c.load.lines.length];yy=add('text',x,yy,w,th(l,16,w),l,{fs:16,al:'c',c:MU,qa:'load'})+(D?72:M?40:48);leftBottom=yy}
else{
const fw=hasSide?LW:Math.min(IW,D?720:IW),fx=hasSide||M?IX:IX+(IW-fw)/2;let yy=bodyY;
const t1=rep(c.thanks.title),t2=rep(c.thanks.text),f1=D?34:T?28:22;
yy=add('text',fx,yy,fw,th(t1,f1,fw,true),t1,{fs:f1,b:true,role:'h2'})+10;
if(t2)yy=add('text',fx,yy,fw,th(t2,16,fw),t2,{fs:16,c:MU})+16;
yy=add('text',fx,yy,fw,24,'Что будет дальше:',{fs:18,b:true})+8;
c.thanks.steps.forEach((t,i)=>{const a=th(t,16,fw-72),rh=Math.max(M?52:60,a+16);add('rect',fx,yy,fw,rh,'',{r:14,fill:'#FFFFFF',stroke:GR,sw:1.5});add('btn',fx+14,yy+(rh-32)/2,32,32,String(i+1),{fs:15,r:16,fill:DK,stroke:'none',sw:0});add('text',fx+58,yy+(rh-a)/2,fw-72,a,t,{fs:16});yy+=rh+8});
yy+=4;if(c.phone.msgr&&!M){const bw=(fw-12)/2;add('btn',fx,yy,bw,52,'WhatsApp',{fs:16,b:true});add('btn',fx+bw+12,yy,bw,52,'Telegram',{fs:16,b:true});yy+=52+12}
if(!M)yy=add('btn',fx,yy,fw,52,c.thanks.cta,{fs:16,b:true,fill:'#FFFFFF',stroke:DK,sw:1.5,c:DK,qa:'restart'})+8;else yy=add('text',fx,yy,fw,40,c.thanks.cta,{fs:14,b:true,al:'c',c:MU,qa:'restart'})+8;
leftBottom=yy-8;
if(hasSide){let e=top0;if(c.cons.on)e=cons(RX,e,R,c.thanks.msg)+16;if(c.giftsSide)e=gifts(RX,e,R,true)+16;sideBottom=e-16}
if(M&&c.phone.msgr){foot=fh;const half=(IW-12)/2;footer=(fy:number)=>{add('btn',IX,fy,half,fh,'WhatsApp',{fs:16,b:true});add('btn',IX+half+12,fy,half,fh,'Telegram',{fs:16,b:true})}}}
/* итог: высота блока, кнопка закреплена внизу */
const gap=D?32:M?36:20;const footTopNat=leftBottom+(foot?gap:0);
const natInner=Math.max(foot?footTopNat+foot:leftBottom,sideBottom);
const natH=natInner+(M?PX:PX+PB);
const H=Hfix===undefined?natH:Math.max(Hfix,natH);
if(footer&&foot){const fy=Hfix===undefined?footTopNat:H-(M?PX:PX+PB)-foot;footer(fy)}
if(cardEl)cardEl.h=H-PB-cardY;
return{h:Math.ceil(H/8)*8,els:E}};
let H=0;for(let i=0;i<kinds.length;i++)H=Math.max(H,build(i).h);
if(M&&H>844){cmp=true;H=0;for(let i=0;i<kinds.length;i++)H=Math.max(H,build(i).h)}
const pos=Math.max(0,Math.min(kinds.length-1,Math.round(s.pos)||0));
const o=build(pos,H);
return{h:H,els:o.els,kinds}}

/** вставить макет текущего шага во все три размера блока (editor): новые id, высоты по макету */
export function applyQuiz(c:QuizCfg):{h:Record<Dev,number>;els:Record<Dev,El[]>}{
const out={h:{} as Record<Dev,number>,els:{} as Record<Dev,El[]>};
for(const d of ['desktop','tablet','mobile'] as Dev[]){const r=quizFrame(c,{pos:c.view,ans:[],demo:true},d);out.h[d]=r.h;out.els[d]=r.els}
return out}
