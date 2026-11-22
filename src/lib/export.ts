import type {Project,Block,BlockTpl,El,TplSetItem} from '../store';import type {Dev} from './dev';
import {FW,DEVS,onDev} from './dev';import {resolve,SHAPES,MOCKS,BULLETS} from './art';import {normalizeQuiz,quizFrame} from './quiz';import type {QuizCfg} from './quiz';import type {PStyle} from './art';
export function download(name:string,text:string,type='text/plain'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
const EN:Record<string,string>={text:'Текст',rect:'Рамка / карточка',btn:'Кнопка',input:'Поле ввода',img:'Изображение (заглушка)',line:'Линия',shape:'Фигура',icon:'Иконка',mock:'Мокап устройства',list:'Список с маркерами'};
const nm2=(a:[string,string][],k?:string)=>a.find(x=>x[0]===k)?.[1]??k??'';
const ICN=(id?:string)=>id??'';
const RULES=`## Как читать этот прототип
- Это чёрно-белый wireframe, а не макет. Пиксель-перфект не нужен: смотри на структуру, порядок блоков, расположение элементов, тексты, акценты, примерные отступы.
- Координаты x, y даны от левого верхнего угла блока в px, размер ширина×высота. Каждый блок описан для трёх фреймов: desktop 1440, tablet 768, mobile 390.
- Элементы с пометкой ★ АКЦЕНТ самые важные: на них делается визуальный акцент (цвет, размер, контраст).
- Серая рамка с крестом это заглушка изображения (внутри мокапа устройства это место под скриншот), «Фигура» это декоративная плашка нужной формы, «Иконка» это значок по названию (lucide), «Список» это пункты с маркерами, «≡» это меню-бургер, «+» в строке это раскрывающийся блок (спойлер).
- Элементы с пометкой «→ ведёт на …» кликабельны: сделай переход на эту страницу, а попап открой как модальное окно.
- Блоки с пометкой «вкладка N из M» это вкладки (табы): на странице виден только блок активной вкладки, клик по элементу «переключает на вкладку» показывает нужный. Блоки «доп. блок» показываются вместе с вкладкой, к которой привязаны.\n- «роль» у элемента (заголовок блока, подзаголовок, главная кнопка, поле формы и др.) выведена по типу, размеру и положению: это подсказка о смысле, а не жёсткое правило.\n- Заметки внутри блока это пожелания и логика работы (поведение, переходы).
- Тексты из блоков сохраняй дословно, лишнего не добавляй.

## Правила проекта (мои принципы)
- Один экран = один смысл, выгода вперёд, много воздуха между блоками.
- Кнопки контрастные и заметные, подсказка над полем ввода, у формы одно поле: телефон, плюс галочка согласия.
- Мобильная версия: один блок помещается в один экран телефона, контрастное разграничение блоков, кнопка в зоне большого пальца, закреплённая кнопка действия внизу экрана, кнопки мессенджеров.
- Вместо слайдеров раскрывающиеся блоки. Всплывающих окон избегать, а если есть, то без тяжёлых картинок.
- Светлый монохромный фон, шрифт без засечек, абзацы короткие.

## Правила текстов (автор)
- «Задача текста» над блоком это зачем блок нужен: каждая правка текста служит ей. Тексты из прототипа не переписывай, а если правишь, соблюдай правила ниже.
- Выгода вперёд, обещание конкретное (цифра, срок, гарантия). Абзац до 140 символов и 4 строк. Простые слова, короткие предложения, настоящее время.
- В текстах нет «Вы», «не/нет/ни», «любой» и восклицаний. Кнопка называется так же, как заголовок формы. Рядом с кнопкой ясно, что будет после нажатия.
- Жирным только важное, до 4 слов. Первые три слова абзаца работают как мини-заголовок.
- Заголовок слева или сверху, контент и форма справа или снизу; связанные по смыслу элементы стоят рядом, отступы по шкале 4/8/12/16/24/32/48/64.
`;
const kind=(e:El)=>e.t==='shape'?` (${nm2(SHAPES,e.sh??'rect').toLowerCase()}${e.n&&(e.sh==='poly'||e.sh==='star')?`, ${e.n}`:''})`:e.t==='icon'?` (иконка «${ICN(e.ic)}»)`:e.t==='mock'?` (${nm2(MOCKS,e.mk??'phone').toLowerCase()}, внутри экран-заглушка)`:e.t==='list'?` (маркеры: ${nm2(BULLETS,e.bu??'dot').toLowerCase()})`:'';
const look=(e:El)=>[e.fill&&e.fill!=='none'?`заливка ${e.fill}`:e.fill==='none'?'без заливки':'',e.stroke&&e.stroke!=='none'?`обводка ${e.stroke}`:'',e.c?`цвет ${e.c}`:'',e.r!==undefined?`скругление ${e.r}`:'',e.op!==undefined?`прозрачность ${Math.round(e.op*100)}%`:'',e.role?`стиль «${e.role}»`:''].filter(Boolean).map(x=>' · '+x).join('');
/** роль элемента выводится по типу, размеру и положению (не хранится в файле) */
const roles=(a:El[]):Map<El,string>=>{const m=new Map<El,string>();const tx=a.filter(e=>e.t==='text'&&!e.tg);const big=tx.reduce((q:El|undefined,e)=>!q||(e.fs??16)>(q.fs??16)||((e.fs??16)===(q.fs??16)&&e.y<q.y)?e:q,undefined);const bf=big?.fs??16;
for(const e of a){const fs=e.fs??16;let r='';
if(e.t==='text'){if(e.tg)r='название вкладки';else if(e===big&&fs>=24)r='заголовок блока';else if(big&&fs>=20&&fs<bf&&e.y>big.y&&e.y-big.y-big.h<=64&&Math.abs(e.x-big.x)<=big.w)r='подзаголовок';else if(fs>=20)r='заголовок пункта или карточки';else if(fs<14)r='подпись или примечание';else r='основной текст'}
else if(e.t==='btn')r=e.tg?'вкладка (кнопка)':e.acc?'главная кнопка (призыв к действию)':'вторичная кнопка или ссылка';
else if(e.t==='input')r='поле формы';else if(e.t==='img')r='изображение по смыслу блока';else if(e.t==='mock')r='показ продукта на устройстве';else if(e.t==='icon')r='значок к соседнему тексту';else if(e.t==='list')r='список пунктов (выгоды или шаги)';else if(e.t==='rect')r='карточка или контейнер';else if(e.t==='line')r='разделитель';else if(e.t==='shape')r='декор';
if(r)m.set(e,r)}return m};
const fl=(p:PStyle|undefined)=>(e0:El,nm:Record<string,string>,rl?:string)=>{const e=resolve(e0,p);return `- ${EN[e.t]}${kind(e)}${e.text?` «${e.text.replace(/\n/g,' / ')}»`:''} · x${e.x} y${e.y} ${e.w}×${e.h}${e.fs?` · ${e.fs}px`:''}${e.b?' · жирный':''}${e.lh?` · интервал строк ${e.lh}`:''}${e.ls?` · интервал букв ${e.ls}px`:''}${e.va==='t'?' · текст сверху':e.va==='b'?' · текст снизу':''}${e.al==='c'?' · по центру':e.al==='r'?' · вправо':''}${e.acc?' · ★ АКЦЕНТ':''}${rl?` · роль: ${rl}`:''}${look(e0)}${e.go&&nm[e.go]?` · → ведёт на «${nm[e.go]}»`:''}${e.tg?` · переключает на вкладку ${+e.tg.split(':')[1]+1}`:''}`};
const layNote=(b:Block,d:Dev)=>{const L=b.lay?.[d];if(!L)return'';const o=Object.entries(L).filter(([g])=>b.els[d].some(e=>e.g===g));return o.length?'\n'+o.map(([g,c])=>`- Авто-лейаут: ${b.els[d].filter(e=>e.g===g).length} эл. в ${c.d==='v'?'колонку':'строку'}, отступ ${c.gap} px, выравнивание ${c.al==='s'?'по началу':c.al==='c'?'по центру':'по концу'}${c.mx?', по центру блока':''}${c.fl?c.d==='v'?', одинаковая ширина':', одинаковая высота':''}`).join('\n'):''};
const quizMd=(c:QuizCfg)=>{const f=quizFrame(c,{pos:0,ans:[]},'desktop');const bt={percent:'процент прохождения',discount:'скидка растёт с каждым ответом ('+c.bonus.per+' '+c.bonus.unit+' за ответ)',gift:'сколько ответов до подарка',steps:'номер шага'}[c.bonus.kind];
return `#### Квиз: работает по шагам, при нажатии показывает следующий (${f.kinds.length} экранов)\n- Заголовок: ${c.title}\n- Подзаголовок: ${c.sub||'нет'}\n- Подарки: ${c.gifts.join('; ')}${c.giftsTop?' (плашки над квизом)':''}${c.giftsSide?' (список «'+c.giftsTitle+'» справа)':''}\n- Шкала сверху: ${c.progress==='tabs'?'вкладки «Вопрос 1…»':c.progress==='bar'?'полоса, подпись «'+c.bonus.text+'», '+bt:'нет'}\n`+
(c.cons.on?`- Консультант: ${c.cons.name}, ${c.cons.role}, ${c.cons.phone}; на каждом шаге пишет своё сообщение\n`:'')+
(c.counter||c.card?`- Подбор: счётчик «${c.counterStart}» → «${c.counterAfter}», стартовое число ${c.total} («${c.noun.join(' / ')}»); карточка «${c.cardTitle}» меняется по ответам${c.chips?', ниже плашки выбранных ответов':''}\n`:'')+
c.steps.map((s,i)=>`- Вопрос ${i+1}: ${s.q} (${s.lay==='cards'?'карточки с картинками, '+s.cols+' в ряд':'список'}${s.multi?', можно несколько':''}${s.skip?', есть «пропустить»':''}; после ответа осталось ${s.left})\n${s.msg?'  - сообщение консультанта: '+s.msg+'\n':''}`+s.opts.map(o=>`  - ${o.t}${o.res?' → показывает решение «'+o.res+'»':''}`).join('\n')).join('\n')+'\n'+
(c.bridge.on?`- Вопрос-прокладка: ${c.bridge.q}: ${c.bridge.opts.join(' / ')}\n`:'')+
`- Телефон: заголовок «${c.phone.title}», подсказка над полем «${c.phone.hint}», одно поле без маски, кнопка «${c.phone.cta}», напоминание «${c.phone.remind}», галочка согласия${c.phone.timer?', таймер '+c.phone.mins+' мин':''}${c.phone.stock?', «'+c.phone.stock+'»':''}${c.phone.proof?', «'+c.phone.proof+'»':''}\n`+
(c.load.on?`- Загрузка: «${c.load.title}», строки: ${c.load.lines.join(' / ')}\n`:'')+
`- Спасибо: «${c.thanks.title}», ${c.thanks.text}; что дальше: ${c.thanks.steps.join(' / ')}${c.phone.msgr?'; кнопки WhatsApp и Telegram':''}\n- Кнопки: «${c.txt.next}», «${c.txt.back}»; ${c.auto?'выбор варианта сразу переходит дальше':'переход по кнопке «Далее»'}. На мобилке кнопка закреплена внизу, блок помещается в один экран.\n`};
const layout=(b:Block,nm:Record<string,string>,p?:PStyle)=>b.quiz?quizMd(b.quiz):DEVS.filter(d=>b.els[d].length&&onDev(b,d)).map(d=>{const a=[...b.els[d]].sort((p,q)=>p.y-q.y||p.x-q.x);const rm=roles(a);const top=Math.min(...a.map(e=>e.y)),bot=b.h[d]-Math.max(...a.map(e=>e.y+e.h));return`#### ${d} (${FW[d]} px) · высота блока ${b.h[d]} px · отступ сверху ≈${top}, снизу ≈${bot}${d==='mobile'?'\n_Мобилка: блок помещается в один экран телефона, главная кнопка блока закреплена внизу, пока блок на экране; первый экран на полную высоту (100svh)._':''}\n`+a.map(e=>fl(p)(e,nm,rm.get(e))).join('\n')+layNote(b,d)+'\n'}).join('\n');
const styleMd=(st?:PStyle)=>st?`## Стиль проекта (если дизайн ещё не задан, опирайся на него)\n- Палитра прототипа: ${st.palette.join(', ')} (это рабочие цвета, нейросеть вправе предложить фирменные)\n- Шрифт заголовков: ${st.head}, основной текст: ${st.body}\n- Базовые размеры текста: ${(['h1','h2','h3','p','sm'] as const).map(k=>`${k} ${st.roles[k].fs}px${st.roles[k].b?' жирный':''}`).join(', ')}\n`:'';
export const briefMd=(p:Project,typeName:string)=>{const nm:Record<string,string>={};for(const s of p.sheets)nm[s.id]=(s.kind==='popup'?'попап ':'страница ')+s.name;return`# ${p.name}\n\nТип сайта: ${typeName}\n\nСделай по этому прототипу дизайн и рабочий код (HTML/CSS/JS). Полная структура с координатами лежит в project.json.\n\n${RULES}\n${styleMd(p.style)}\n`+p.sheets.map(s=>`## ${s.kind==='popup'?'Попап':'Страница'}: ${s.name}\n\n`+(s.blocks.map((b,i)=>`### ${i+1}. ${b.title}${b.sv?.tab?` · вкладка ${b.sv.i+1} из ${b.sv.n}${b.sv.x?' (доп. блок)':''}`:''}${b.dv?` (только: ${b.dv.join(', ')})`:''}\n${b.goal?.trim()?`**Задача текста:** ${b.goal.trim()}\n`:''}${b.bg?`**Фон блока:** ${b.bg}\n`:''}${b.text.trim()||'_заметок нет_'}\n\n${layout(b,nm,p.style)}`).join('\n')||'_блоков нет_\n')).join('\n')};

/** один блок для вставки в чат с нейросетью: тексты, заметки и элементы с координатами для каждого устройства */
export const blockMd=(p:Project,b:Block)=>{const nm:Record<string,string>={};for(const s of p.sheets)nm[s.id]=(s.kind==='popup'?'попап ':'страница ')+s.name;return`### ${b.title}${b.sv?.tab?` · вкладка ${b.sv.i+1} из ${b.sv.n}${b.sv.x?' (доп. блок)':''}`:''}${b.dv?` (только: ${b.dv.join(', ')})`:''}\n${b.goal?.trim()?`**Задача текста:** ${b.goal.trim()}\n`:''}${b.bg?`**Фон блока:** ${b.bg}\n`:''}${b.text.trim()||'_заметок нет_'}\n\n${layout(b,nm,p.style)}`};
/** файл блока: его можно загрузить в Настройках как шаблон */
export const blockFile=(b:Block)=>JSON.stringify({kind:'ig-block',v:1,name:b.title,text:b.text,quiz:b.quiz,bg:b.bg,h:b.h,els:b.els},null,1);
export const tplsFile=(l:BlockTpl[])=>JSON.stringify({kind:'ig-tpls',v:1,list:l.map(({name,cat,text,h,els,quiz,st,set,ss})=>({name,cat,st,set,ss,text,quiz,h,els}))},null,1);
export interface TplIn{st?:{v:string;i:number};set?:TplSetItem[];ss?:{v:string;n:number;g:string};quiz?:QuizCfg;name:string;cat?:string;text:string;h:Record<Dev,number>;els:Record<Dev,El[]>}
const okEl=(e:unknown):e is El=>!!e&&typeof e==='object'&&typeof (e as El).t==='string'&&['x','y','w','h'].every(k=>typeof (e as unknown as Record<string,unknown>)[k]==='number');
/** разбор файла шаблонов: один блок, набор шаблонов или массив. Бросает ошибку с понятным текстом */
export const parseTpls=(txt:string):TplIn[]=>{
let o:unknown;try{o=JSON.parse(txt)}catch{throw new Error('файл не похож на JSON')}
const raw:unknown[]=Array.isArray(o)?o:(o as {kind?:string;list?:unknown[]})?.kind==='ig-tpls'&&Array.isArray((o as {list:unknown[]}).list)?(o as {list:unknown[]}).list:(o as {kind?:string})?.kind==='ig-block'?[o]:[];
const out:TplIn[]=[];
for(const r of raw){const t=r as Partial<TplIn>;if(!t||typeof t.name!=='string'||!t.els||typeof t.els!=='object')continue;
const els={} as Record<Dev,El[]>;const h={} as Record<Dev,number>;
for(const d of DEVS){const a=(t.els as Record<string,unknown>)[d];els[d]=Array.isArray(a)?a.filter(okEl):[];const hv=t.h?.[d];h[d]=typeof hv==='number'&&isFinite(hv)?Math.max(80,Math.round(hv)):400}
const st=(t as TplIn).st;const ss=(t as TplIn).ss;const rs=(t as TplIn).set;const set=ss&&typeof ss.v==='string'&&typeof ss.n==='number'&&typeof ss.g==='string'&&Array.isArray(rs)?rs.filter(x=>x&&typeof x.i==='number'&&x.els&&typeof x.els==='object').map(x=>{const e2={} as Record<Dev,El[]>;const h2={} as Record<Dev,number>;for(const d of DEVS){const a=(x.els as Record<string,unknown>)[d];e2[d]=Array.isArray(a)?a.filter(okEl):[];const hv=x.h?.[d];h2[d]=typeof hv==='number'&&isFinite(hv)?Math.max(80,Math.round(hv)):400}return{i:x.i,...(x.x?{x:1 as const}:{}),title:typeof x.title==='string'?x.title.slice(0,80):t.name!,text:typeof x.text==='string'?x.text:'',h:h2,els:e2,...(x.lay&&typeof x.lay==='object'?{lay:x.lay}:{})}}):[];out.push({...(set.length&&ss?{set,ss:{v:ss.v,n:ss.n,g:ss.g}}:{}),...(st&&typeof st.v==='string'&&typeof st.i==='number'?{st:{v:st.v,i:st.i}}:{}),quiz:t.quiz&&typeof t.quiz==='object'?normalizeQuiz(t.quiz):undefined,name:t.name.slice(0,80),cat:typeof t.cat==='string'?t.cat.slice(0,60):undefined,text:typeof t.text==='string'?t.text:'',h,els})}
if(!out.length)throw new Error('в файле нет блоков или шаблонов');return out};
