import type {Project,Block,BlockTpl,El} from '../store';import type {Dev} from './dev';
import {FW,DEVS,onDev} from './dev';import {resolve,SHAPES,MOCKS,BULLETS} from './art';import type {PStyle} from './art';
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
- Заметки внутри блока это пожелания и логика работы (поведение, переходы).
- Тексты из блоков сохраняй дословно, лишнего не добавляй.

## Правила проекта (мои принципы)
- Один экран = один смысл, выгода вперёд, много воздуха между блоками.
- Кнопки контрастные и заметные, подсказка над полем ввода, у формы одно поле: телефон, плюс галочка согласия.
- Мобильная версия: один блок помещается в один экран телефона, контрастное разграничение блоков, кнопка в зоне большого пальца, закреплённая кнопка действия внизу экрана, кнопки мессенджеров.
- Вместо слайдеров раскрывающиеся блоки. Всплывающих окон избегать, а если есть, то без тяжёлых картинок.
- Светлый монохромный фон, шрифт без засечек, абзацы короткие.
`;
const kind=(e:El)=>e.t==='shape'?` (${nm2(SHAPES,e.sh??'rect').toLowerCase()}${e.n&&(e.sh==='poly'||e.sh==='star')?`, ${e.n}`:''})`:e.t==='icon'?` (иконка «${ICN(e.ic)}»)`:e.t==='mock'?` (${nm2(MOCKS,e.mk??'phone').toLowerCase()}, внутри экран-заглушка)`:e.t==='list'?` (маркеры: ${nm2(BULLETS,e.bu??'dot').toLowerCase()})`:'';
const look=(e:El)=>[e.fill&&e.fill!=='none'?`заливка ${e.fill}`:e.fill==='none'?'без заливки':'',e.stroke&&e.stroke!=='none'?`обводка ${e.stroke}`:'',e.c?`цвет ${e.c}`:'',e.r!==undefined?`скругление ${e.r}`:'',e.op!==undefined?`прозрачность ${Math.round(e.op*100)}%`:'',e.role?`стиль «${e.role}»`:''].filter(Boolean).map(x=>' · '+x).join('');
const fl=(p:PStyle|undefined)=>(e0:El,nm:Record<string,string>)=>{const e=resolve(e0,p);return `- ${EN[e.t]}${kind(e)}${e.text?` «${e.text.replace(/\n/g,' / ')}»`:''} · x${e.x} y${e.y} ${e.w}×${e.h}${e.fs?` · ${e.fs}px`:''}${e.b?' · жирный':''}${e.al==='c'?' · по центру':e.al==='r'?' · вправо':''}${e.acc?' · ★ АКЦЕНТ':''}${look(e0)}${e.go&&nm[e.go]?` · → ведёт на «${nm[e.go]}»`:''}`};
const layNote=(b:Block,d:Dev)=>{const L=b.lay?.[d];if(!L)return'';const o=Object.entries(L).filter(([g])=>b.els[d].some(e=>e.g===g));return o.length?'\n'+o.map(([g,c])=>`- Авто-лейаут: ${b.els[d].filter(e=>e.g===g).length} эл. в ${c.d==='v'?'колонку':'строку'}, отступ ${c.gap} px, выравнивание ${c.al==='s'?'по началу':c.al==='c'?'по центру':'по концу'}${c.mx?', по центру блока':''}${c.fl?c.d==='v'?', одинаковая ширина':', одинаковая высота':''}`).join('\n'):''};
const layout=(b:Block,nm:Record<string,string>,p?:PStyle)=>DEVS.filter(d=>b.els[d].length&&onDev(b,d)).map(d=>{const a=[...b.els[d]].sort((p,q)=>p.y-q.y||p.x-q.x);const top=Math.min(...a.map(e=>e.y)),bot=b.h[d]-Math.max(...a.map(e=>e.y+e.h));return`#### ${d} (${FW[d]} px) · высота блока ${b.h[d]} px · отступ сверху ≈${top}, снизу ≈${bot}\n`+a.map(e=>fl(p)(e,nm)).join('\n')+layNote(b,d)+'\n'}).join('\n');
const styleMd=(st?:PStyle)=>st?`## Стиль проекта (если дизайн ещё не задан, опирайся на него)\n- Палитра прототипа: ${st.palette.join(', ')} (это рабочие цвета, нейросеть вправе предложить фирменные)\n- Шрифт заголовков: ${st.head}, основной текст: ${st.body}\n- Базовые размеры текста: ${(['h1','h2','h3','p','sm'] as const).map(k=>`${k} ${st.roles[k].fs}px${st.roles[k].b?' жирный':''}`).join(', ')}\n`:'';
export const briefMd=(p:Project,typeName:string)=>{const nm:Record<string,string>={};for(const s of p.sheets)nm[s.id]=(s.kind==='popup'?'попап ':'страница ')+s.name;return`# ${p.name}\n\nТип сайта: ${typeName}\n\nСделай по этому прототипу дизайн и рабочий код (HTML/CSS/JS). Полная структура с координатами лежит в project.json.\n\n${RULES}\n${styleMd(p.style)}\n`+p.sheets.map(s=>`## ${s.kind==='popup'?'Попап':'Страница'}: ${s.name}\n\n`+(s.blocks.map((b,i)=>`### ${i+1}. ${b.title}${b.dv?` (только: ${b.dv.join(', ')})`:''}\n${b.text.trim()||'_заметок нет_'}\n\n${layout(b,nm,p.style)}`).join('\n')||'_блоков нет_\n')).join('\n')};

/** один блок для вставки в чат с нейросетью: тексты, заметки и элементы с координатами для каждого устройства */
export const blockMd=(p:Project,b:Block)=>{const nm:Record<string,string>={};for(const s of p.sheets)nm[s.id]=(s.kind==='popup'?'попап ':'страница ')+s.name;return`### ${b.title}${b.dv?` (только: ${b.dv.join(', ')})`:''}\n${b.text.trim()||'_заметок нет_'}\n\n${layout(b,nm,p.style)}`};
/** файл блока: его можно загрузить в Настройках как шаблон */
export const blockFile=(b:Block)=>JSON.stringify({kind:'ig-block',v:1,name:b.title,text:b.text,h:b.h,els:b.els},null,1);
export const tplsFile=(l:BlockTpl[])=>JSON.stringify({kind:'ig-tpls',v:1,list:l.map(({name,cat,text,h,els})=>({name,cat,text,h,els}))},null,1);
export interface TplIn{name:string;cat?:string;text:string;h:Record<Dev,number>;els:Record<Dev,El[]>}
const okEl=(e:unknown):e is El=>!!e&&typeof e==='object'&&typeof (e as El).t==='string'&&['x','y','w','h'].every(k=>typeof (e as unknown as Record<string,unknown>)[k]==='number');
/** разбор файла шаблонов: один блок, набор шаблонов или массив. Бросает ошибку с понятным текстом */
export const parseTpls=(txt:string):TplIn[]=>{
let o:unknown;try{o=JSON.parse(txt)}catch{throw new Error('файл не похож на JSON')}
const raw:unknown[]=Array.isArray(o)?o:(o as {kind?:string;list?:unknown[]})?.kind==='ig-tpls'&&Array.isArray((o as {list:unknown[]}).list)?(o as {list:unknown[]}).list:(o as {kind?:string})?.kind==='ig-block'?[o]:[];
const out:TplIn[]=[];
for(const r of raw){const t=r as Partial<TplIn>;if(!t||typeof t.name!=='string'||!t.els||typeof t.els!=='object')continue;
const els={} as Record<Dev,El[]>;const h={} as Record<Dev,number>;
for(const d of DEVS){const a=(t.els as Record<string,unknown>)[d];els[d]=Array.isArray(a)?a.filter(okEl):[];const hv=t.h?.[d];h[d]=typeof hv==='number'&&isFinite(hv)?Math.max(80,Math.round(hv)):400}
out.push({name:t.name.slice(0,80),cat:typeof t.cat==='string'?t.cat.slice(0,60):undefined,text:typeof t.text==='string'?t.text:'',h,els})}
if(!out.length)throw new Error('в файле нет блоков или шаблонов');return out};
