import {create} from 'zustand';import {immer} from 'zustand/middleware/immer';
import {save} from './lib/vault';import {migrate,mkBlock,mkFromTpl} from './lib/migrate';import {uid} from './lib/uid';
import {fresh} from './lib/tpl';import {stepsBlocks,resizeSteps,stageGroup,syncTabs,syncTabText,dupStage,delStage,bindTplStage} from './lib/tplSteps';import {teamBuild,teamN} from './lib/tplTeam';import {toast} from './lib/toast';import {sheetsFromOutline} from './lib/outline';
import {applyQuiz,normalizeQuiz} from './lib/quiz';import type {QuizCfg} from './lib/quiz';
import {FW,DEVS,onDev} from './lib/dev';import {defStyle} from './lib/art';import type {PStyle,Role} from './lib/art';import type {Dev} from './lib/dev';
export {FW,DEVS,onDev};export type {Dev};
export type Kind='page'|'popup';
export type ET='text'|'rect'|'btn'|'input'|'img'|'line'|'shape'|'icon'|'mock'|'list';
export interface El{id:string;t:ET;x:number;y:number;w:number;h:number;text:string;fs?:number;b?:boolean;al?:'l'|'c'|'r';acc?:boolean;go?:string;g?:string;sh?:string;ic?:string;mk?:string;bu?:string;n?:number;fill?:string;stroke?:string;sw?:number;r?:number;op?:number;c?:string;role?:Role;hug?:'w'|'h';mh?:number;lh?:number;ls?:number;va?:'t'|'m'|'b';qa?:string;tg?:string;sk?:string}
/** авто-лейаут группы: d направление, gap отступ, al выравнивание поперёк, x y начало, mx центр по ширине блока, fl одинаковый поперечный размер */
export interface Lay{d:'h'|'v';gap:number;al:'s'|'c'|'e';x:number;y:number;mx?:boolean;fl?:boolean}
/** этапы: v вариант, g группа, i номер вкладки, n число этапов, tab вкладки переключаются в просмотре, x доп. блок этапа */
export interface SV{v:string;g:string;i:number;n:number;tab:boolean;x?:1}
export interface Block{id:string;title:string;text:string;goal?:string;sv?:SV;tm?:number;quiz?:QuizCfg;dv?:Dev[];h:Record<Dev,number>;els:Record<Dev,El[]>;lay?:Partial<Record<Dev,Record<string,Lay>>>;guides?:Partial<Record<Dev,{x:number[];y:number[]}>>}
export interface BlockTpl{id:string;name:string;cat?:string;quiz?:QuizCfg;st?:{v:string;i:number};text:string;h:Record<Dev,number>;els:Record<Dev,El[]>}
export interface Sheet{id:string;name:string;kind:Kind;blocks:Block[]}
export interface Project{id:string;name:string;typeId:string;style:PStyle;sheets:Sheet[];createdAt:number;updatedAt:number}
export interface SiteType{id:string;name:string;builtin?:boolean;pages:{name:string;kind:Kind;blocks:string[]}[]}
export interface Data{schemaVersion:5;projects:Project[];siteTypes:SiteType[];blockTpls:BlockTpl[]}
const P=(name:string,blocks:string[],kind:Kind='page')=>({name,kind,blocks});
export const PRESETS:SiteType[]=[
{id:'landing',name:'Лендинг',builtin:true,pages:[P('Главная',['Шапка','1 экран','Проблемы','Преимущества','Как работаем','Кейсы','Отзывы: результат','Тарифы','FAQ','Форма заявки','Подвал']),P('Заявка',['Форма'],'popup'),P('Спасибо',['Подтверждение'])]},
{id:'multi',name:'Многостраничный',builtin:true,pages:[P('Главная',['Шапка','1 экран','Услуги','О компании','Отзывы: результат','Подвал']),P('Услуги',['Шапка','Список услуг','Форма заявки','Подвал']),P('О нас',['Шапка','История','Команда','Подвал']),P('Контакты',['Шапка','Контакты','Карта','Подвал'])]},
{id:'shop',name:'Интернет-магазин',builtin:true,pages:[P('Главная',['Шапка','Баннер','Категории','Хиты','Преимущества','Подвал']),P('Каталог',['Шапка','Фильтры','Сетка товаров','Подвал']),P('Товар',['Шапка','Галерея','Описание','Похожие','Подвал']),P('Корзина',['Шапка','Список','Итого','Подвал'])]},
{id:'quiz4',name:'Квиз 4 поколения',builtin:true,pages:[P('Старт',['1 экран']),P('Квиз',['Квиз 4 поколения: подбор решений'])]},
{id:'quiz',name:'Квиз',builtin:true,pages:[P('Старт',['1 экран','Кнопка старта']),P('Вопрос',['Прогресс','Вопрос','Варианты','Далее']),P('Контакты',['Бонус','Форма заявки']),P('Спасибо',['Подтверждение'])]}];
/** wires typical buttons: header/CTA -> popup, forms -> thanks page, quiz start -> first question */
const autoLink=(sheets:Sheet[])=>{const pop=sheets.find(x=>x.kind==='popup');const thx=sheets.find(x=>x.kind!=='popup'&&/спасибо/i.test(x.name));const q=sheets.find(x=>x.kind!=='popup'&&/вопрос/i.test(x.name));
for(const sh of sheets)for(const b of sh.blocks)for(const d of DEVS)for(const e of b.els[d]){if(e.t!=='btn')continue;let to:string|undefined;
if(sh.kind==='popup')to=thx?.id;else if(sh===thx)to=undefined;
else if(/^форма/i.test(b.title))to=thx?.id;
else if(/начать/i.test(e.text))to=q?.id;
else if(/(звонок|перезвон|заявк|расч[её]т|подробн|выбрать|предложени)/i.test(e.text))to=pop?.id??thx?.id;
if(to)e.go=to}};
/** top (y) of every block for a device */
export const blockTops=(bs:Block[],dev:Dev)=>{let y=0;return bs.map(b=>{const t=y;if(onDev(b,dev))y+=b.h[dev];return t})};
interface S{data:Data|null;projectId:string|null;sheetId:string|null;blockId:string|null;elId:string|null;status:'saved'|'saving';clip:{e:El;dev:Dev;n:number}|null;clipM:{es:El[];dev:Dev;n:number}|null;multi:string[];editId:string|null;snap:Block|null;
enterEdit:(id:string)=>void;exitEdit:(save:boolean)=>void;
load:(d:Data)=>void;addProject:(name:string,typeId:string)=>void;importOutline:(name:string,text:string)=>void;delProject:(id:string)=>void;openProject:(id:string)=>void;renameProject:(id:string,n:string)=>void;
addSheet:(name:string,kind:Kind)=>void;renameSheet:(id:string,n:string)=>void;delSheet:(id:string)=>void;setSheet:(id:string)=>void;
addBlock:(title:string,o?:{after?:string;tpl?:string;dev?:Dev})=>void;delBlock:(id:string,dev?:Dev)=>void;moveBlock:(id:string,dir:-1|1,dev?:Dev)=>void;setDevs:(id:string,devs:Dev[],from?:Dev)=>void;adaptSheet:(dev:Dev,from:Dev)=>void;delAsk:{id:string;dev:Dev}|null;setDelAsk:(v:{id:string;dev:Dev}|null)=>void;dupBlock:(id:string)=>void;setSteps:(id:string,n:number)=>void;addStepBlock:(id:string)=>void;setStage:(id:string,i:number|null)=>void;delStage:(id:string)=>void;setTeam:(id:string,n:number)=>void;
setQuiz:(id:string,f:(c:QuizCfg)=>void)=>void;unlinkQuiz:(id:string)=>void;editBlock:(id:string,patch:Partial<Pick<Block,'title'|'text'|'goal'>>)=>void;setH:(dev:Dev,id:string,h:number)=>void;setGuides:(id:string,dev:Dev,g:{x:number[];y:number[]})=>void;saveBlockTpl:(id:string,name:string,cat?:string)=>void;delBlockTpl:(id:string)=>void;importTpls:(l:{name:string;cat?:string;st?:{v:string;i:number};quiz?:QuizCfg;text:string;h:Record<Dev,number>;els:Record<Dev,El[]>}[])=>void;
addEl:(dev:Dev,t:ET,x:number,y:number,bid?:string,extra?:Partial<El>)=>void;setStyle:(patch:Partial<PStyle>)=>void;setRole:(r:Role,p:Partial<PStyle['roles'][Role]>)=>void;updEl:(dev:Dev,id:string,patch:Partial<El>)=>void;dragEl:(dev:Dev,id:string,patch:Partial<El>)=>void;dropEl:(dev:Dev,id:string,stay?:boolean)=>void;
delEl:(dev:Dev,id:string)=>void;dupEl:(dev:Dev,id:string)=>void;moveEl:(dev:Dev,id:string,dir:number)=>void;copyEl:(dev:Dev,id:string)=>void;
clipSet:(dev:Dev,id:string)=>void;clipPaste:(dev:Dev)=>void;setEl:(id:string|null)=>void;setMulti:(ids:string[])=>void;dragMany:(dev:Dev,ps:{id:string;x:number;y:number}[])=>void;delEls:(dev:Dev,ids:string[])=>void;dupEls:(dev:Dev,ids:string[],off:number,nid:string[],k?:string)=>void;alignEls:(dev:Dev,ids:string[],m:'l'|'c'|'r'|'t'|'m'|'b'|'dh'|'dv'|'ew'|'eh')=>void;gapEls:(dev:Dev,ids:string[],gap:number)=>void;flipEls:(dev:Dev,ids:string[],axis:'x'|'y',side?:boolean)=>void;flipBlock:(id:string,axis:'x'|'y')=>void;swapEls:(dev:Dev,a:string[],b:string[])=>void;groupEls:(dev:Dev,ids:string[],on:boolean)=>void;autoLay:(dev:Dev,ids:string[])=>void;setLay:(dev:Dev,gid:string,p:Partial<Lay>)=>void;delLay:(dev:Dev,gid:string)=>void;clipSetMany:(dev:Dev,ids:string[])=>void;clipPasteMany:(dev:Dev)=>void;setBlock:(id:string|null)=>void;
undo:()=>void;redo:()=>void;saveType:(name:string)=>void}
const EL_DEF:Record<ET,[number,number,string]>={text:[240,40,'Заголовок'],rect:[320,200,''],btn:[180,48,'Кнопка'],input:[280,44,'Поле ввода'],img:[320,220,'Изображение'],line:[300,0,''],shape:[200,140,''],icon:[48,48,''],mock:[260,420,''],list:[320,120,'Первый пункт\nВторой пункт\nТретий пункт']};
type Ctx={data:Data|null;projectId:string|null;sheetId:string|null};
const curSheet=(s:Ctx)=>s.data?.projects.find(p=>p.id===s.projectId)?.sheets.find(x=>x.id===s.sheetId);
const findEl=(sh:Sheet,dev:Dev,id:string)=>{for(const b of sh.blocks){const e=b.els[dev].find(x=>x.id===id);if(e)return{b,e}}return null};
const hasEl=(sh:Sheet|undefined,id:string|null)=>!!id&&!!sh&&sh.blocks.some(b=>DEVS.some(d=>b.els[d].some(e=>e.id===id)));
/** a block grows so that its elements always fit */
import {hugSize} from './lib/measure';
const LDV:Dev[]=['desktop','tablet','mobile'];const lh=(e:El)=>e.t==='line'?0:e.h;
/** пересчёт авто-лейаута: порядок по центрам, одинаковый отступ, выравнивание, блок растёт под содержимое */
const reflow=(b:Block,dev:Dev)=>{const L=b.lay?.[dev];if(!L)return;const W=FW[dev];
for(const gid of Object.keys(L)){const c=L[gid];const m=b.els[dev].filter(e=>e.g===gid);if(m.length<2){delete L[gid];continue}
const v=c.d==='v';const ord=[...m].sort((a,q)=>v?a.y+lh(a)/2-(q.y+lh(q)/2):a.x+a.w/2-(q.x+q.w/2));
if(c.fl&&!v)for(const e of m)if(e.t!=='line'&&e.hug!=='h'&&e.mh===undefined)e.mh=e.h;
const cs=(e:El)=>v?e.w:lh(e);const nat=(e:El)=>v?e.w:e.t==='line'?0:e.hug==='h'?e.h:(e.mh??e.h);const cross=Math.max(...m.map(c.fl?nat:cs));
if(c.fl)for(const e of m){if(v)e.w=cross;else if(e.t!=='line')e.h=cross}
const main=ord.reduce((a,e)=>a+(v?lh(e):e.w),0)+c.gap*(ord.length-1);
let ox=c.x,oy=c.y;if(c.mx){if(v)ox=Math.round((W-cross)/2);else ox=Math.round((W-main)/2)}
ox=Math.max(0,ox);oy=Math.max(0,oy);let p=v?oy:ox;
for(const e of ord){const off=c.al==='s'?0:c.al==='c'?(cross-cs(e))/2:cross-cs(e);
if(v){e.x=Math.round(ox+off);e.y=Math.round(p);p+=lh(e)+c.gap}else{e.y=Math.round(oy+off);e.x=Math.round(p);p+=e.w+c.gap}}
grow(b,dev)}};
/** размер по содержимому: пересчёт текста, кнопок и полей с флагом hug */
const hugAll=(sh?:Sheet,st?:Project['style'])=>{if(!sh)return;for(const b of sh.blocks)for(const d of LDV){let ch=false;for(const e of b.els[d]){if(!e.hug)continue;const z=hugSize(e,st);if(!z)continue;if(z.w!==undefined&&e.w!==z.w){e.w=z.w;ch=true}if(z.h!==undefined&&e.h!==z.h){e.h=z.h;ch=true}}if(ch)grow(b,d)}};
const reflowAll=(sh?:Sheet)=>{if(!sh)return;for(const b of sh.blocks)if(b.lay)for(const d of LDV)reflow(b,d)};
const grow=(b:Block,dev:Dev)=>{const bt=Math.max(0,...b.els[dev].map(e=>e.y+e.h));if(bt+24>b.h[dev])b.h[dev]=Math.ceil((bt+24)/8)*8};
/** зеркало элементов по оси внутри [a0,a1]: позиции, выравнивание текста, настройки авто-лейаута групп */
const mirror=(b:Block,dev:Dev,es:El[],ax:'x'|'y',a0:number,a1:number,keepMx:boolean)=>{for(const e of es){if(ax==='x'){e.x=Math.max(0,a0+a1-e.x-e.w);if(e.al==='l'||(!e.al&&e.t==='text'))e.al='r';else if(e.al==='r')e.al=e.t==='text'?undefined:'l'}else{e.y=Math.max(0,a0+a1-e.y-lh(e));if(e.va==='t')e.va='b';else if(e.va==='b')e.va='t'}}
const L=b.lay?.[dev];if(!L)return;for(const gid of Object.keys(L)){const m=b.els[dev].filter(e=>e.g===gid);if(!m.length||!m.every(e=>es.includes(e)))continue;const c=L[gid];const v=c.d==='v';if((ax==='x'&&v)||(ax==='y'&&!v))c.al=c.al==='s'?'e':c.al==='e'?'s':c.al;c.x=Math.min(...m.map(e=>e.x));c.y=Math.min(...m.map(e=>e.y));if(!keepMx)delete c.mx}};
/** сдвиг набора элементов; целая группа с авто-лейаутом сдвигает и свою точку привязки */
const shiftEls=(b:Block,dev:Dev,es:El[],dx:number,dy:number)=>{for(const e of es){e.x=Math.max(0,e.x+dx);e.y=Math.max(0,e.y+dy)}const L=b.lay?.[dev];if(!L)return;for(const gid of Object.keys(L)){const m=b.els[dev].filter(e=>e.g===gid);if(m.length&&m.every(e=>es.includes(e))){L[gid].x=Math.max(0,L[gid].x+dx);L[gid].y=Math.max(0,L[gid].y+dy);delete L[gid].mx}}};
/** единица выбора: выбранный элемент или вся его группа */
const unit=(b:Block,dev:Dev,ids:string[])=>{const gs=new Set(ids.map(i=>b.els[dev].find(e=>e.id===i)?.g).filter(Boolean));return b.els[dev].filter(e=>ids.includes(e.id)||(e.g&&gs.has(e.g)))};
const blockAt=(bs:Block[],dev:Dev,y:number)=>{const t=blockTops(bs,dev);let last=-1;for(let k=0;k<bs.length;k++){if(!onDev(bs[k],dev))continue;last=k;if(y<t[k]+bs[k].h[dev])return k}return last<0?0:last};
/** добавить блок на устройство d; пустой экран заполняется копией с from (x и ширина пересчитываются) */
const addDevTo=(b:Block,d:Dev,from?:Dev)=>{const was=b.dv??[...DEVS];if(was.includes(d))return false;let copied=false;if(from&&from!==d&&!b.els[d].length&&b.els[from].length){const r=FW[d]/FW[from];b.els[d]=b.els[from].map(e=>{const w=Math.max(8,Math.round(e.w*r));return{...e,id:uid(),w,x:Math.max(0,Math.min(FW[d]-w,Math.round(e.x*r)))}});b.h[d]=Math.max(b.h[d],b.h[from]);copied=true}const nx=[...was,d];if(nx.length>=DEVS.length)delete b.dv;else b.dv=DEVS.filter(x=>nx.includes(x));return copied};
let t:ReturnType<typeof setTimeout>;let past:Data[]=[],fut:Data[]=[],lastK='',lastT=0;
export const useStore=create<S>()(immer((set,get)=>{
const persist=()=>{clearTimeout(t);t=setTimeout(async()=>{await save(get().data);set({status:'saved'})},400)};
const restore=(d:Data)=>{set(s=>{s.data=d;const p=d.projects.find(x=>x.id===s.projectId)??d.projects[0];s.projectId=p?.id??null;const h=p?.sheets.find(x=>x.id===s.sheetId)??p?.sheets[0];s.sheetId=h?.id??null;if(!h?.blocks.some(b=>b.id===s.blockId))s.blockId=null;if(!h?.blocks.some(b=>b.id===s.editId)){s.editId=null;s.snap=null}if(!hasEl(h,s.elId))s.elId=null;s.status='saving'});persist()};
const mut=(f:(s:S,p?:Project)=>void,k='')=>{const now=Date.now();if(!(k&&k===lastK&&now-lastT<1200)){past.push(get().data!);if(past.length>60)past.shift();fut=[]}lastK=k;lastT=now;set(s=>{f(s,s.data?.projects.find(p=>p.id===s.projectId));hugAll(curSheet(s),s.data?.projects.find(p=>p.id===s.projectId)?.style);syncTabs(curSheet(s)?.blocks);reflowAll(curSheet(s));const p=s.data?.projects.find(p=>p.id===s.projectId);if(p)p.updatedAt=Date.now();s.status='saving'});persist()};
return{data:null,projectId:null,sheetId:null,blockId:null,elId:null,status:'saved',clip:null,clipM:null,multi:[],editId:null,snap:null,delAsk:null,
load:d0=>{past=[];fut=[];const d=migrate(d0);set({data:d,editId:null,snap:null,blockId:null,elId:null,projectId:d.projects[0]?.id??null,sheetId:d.projects[0]?.sheets[0]?.id??null})},
addProject:(name,typeId)=>mut(s=>{const ty=[...PRESETS,...s.data!.siteTypes].find(x=>x.id===typeId)!;const sheets:Sheet[]=ty.pages.map(p=>({id:uid(),name:p.name,kind:p.kind,blocks:p.blocks.map(b=>mkBlock(b))}));autoLink(sheets);const pr:Project={id:uid(),name,typeId,style:defStyle(),sheets,createdAt:Date.now(),updatedAt:Date.now()};s.data!.projects.unshift(pr);s.projectId=pr.id;s.sheetId=sheets[0]?.id??null;s.blockId=null;s.elId=null}),
importOutline:(name,text)=>mut(s=>{const sheets=sheetsFromOutline(text);autoLink(sheets);const pr:Project={id:uid(),name,typeId:'import',style:defStyle(),sheets,createdAt:Date.now(),updatedAt:Date.now()};s.data!.projects.unshift(pr);s.projectId=pr.id;s.sheetId=sheets[0]?.id??null;s.blockId=null;s.elId=null}),
delProject:id=>mut(s=>{s.data!.projects=s.data!.projects.filter(p=>p.id!==id);if(s.projectId===id){s.projectId=s.data!.projects[0]?.id??null;s.sheetId=s.data!.projects[0]?.sheets[0]?.id??null;s.blockId=null;s.elId=null}}),
openProject:id=>set(s=>{s.projectId=id;s.editId=null;s.snap=null;s.blockId=null;s.elId=null;s.sheetId=s.data!.projects.find(p=>p.id===id)?.sheets[0]?.id??null}),
renameProject:(id,n)=>mut(s=>{const x=s.data!.projects.find(q=>q.id===id);if(x)x.name=n}),
addSheet:(name,kind)=>mut((s,p)=>{if(!p)return;const sh:Sheet={id:uid(),name,kind,blocks:[]};p.sheets.push(sh);s.sheetId=sh.id;s.blockId=null;s.elId=null}),
renameSheet:(id,n)=>mut((_,p)=>{const x=p?.sheets.find(q=>q.id===id);if(x)x.name=n}),
delSheet:id=>mut((s,p)=>{if(!p)return;p.sheets=p.sheets.filter(q=>q.id!==id);if(s.sheetId===id){s.sheetId=p.sheets[0]?.id??null;s.blockId=null;s.elId=null}}),
setSheet:id=>set({sheetId:id,blockId:null,elId:null,editId:null,snap:null}),
addBlock:(title,o)=>mut(s=>{const sh=curSheet(s);if(!sh)return;const tp=o?.tpl?s.data!.blockTpls.find(x=>x.id===o.tpl):undefined;const sg=tp?null:stepsBlocks(title);const bs=sg??[tp?mkFromTpl(tp):mkBlock(title)];const b=bs[0];if(o?.dev)for(const x of bs)x.dv=[o.dev];if(!tp&&!sg){const tn=teamN(title);if(tn)b.tm=tn}const i=o?.after?sh.blocks.findIndex(x=>x.id===o.after):-1;let at=i>=0?i:sh.blocks.length-1;
if(tp?.st){if(bindTplStage(sh.blocks,at,b,tp.st)){const g=b.sv!;sh.blocks.forEach((x,k)=>{if(x.sv?.g===g.g&&x.sv.i===g.i)at=k})}else toast('Выше нет вкладок этого вида: блок вставлен обычным, вкладки в нём стали кнопками',undefined,5000)}
sh.blocks.splice(at+1,0,...bs);s.blockId=b.id;s.elId=null}),
setSteps:(id,n)=>mut(s=>{const sh=curSheet(s);const b=sh?.blocks.find(x=>x.id===id);if(!sh||!b)return;resizeSteps(sh.blocks,b,n);if(!sh.blocks.some(x=>x.id===id)){s.blockId=null;s.elId=null}}),
addStepBlock:id=>mut(s=>{const sh=curSheet(s);const b=sh?.blocks.find(x=>x.id===id);if(!sh||!b?.sv)return;const sv=b.sv;let at=-1;sh.blocks.forEach((x,k)=>{if(x.sv?.g===sv.g&&x.sv.i===sv.i)at=k});
const nb:Block={id:uid(),title:'Блок этапа '+(sv.i+1),text:'',h:{desktop:400,tablet:400,mobile:480},els:{desktop:[],tablet:[],mobile:[]},sv:{...sv,x:1}};sh.blocks.splice(at+1,0,nb);s.blockId=nb.id;s.elId=null}),
setStage:(id,i)=>mut(s=>{const sh=curSheet(s);const b=sh?.blocks.find(x=>x.id===id);if(!sh||!b)return;const g=stageGroup(sh.blocks,b);if(!g)return;if(i===null)delete b.sv;else b.sv={v:g.v,g:g.g,i,n:g.n,tab:true,x:1}}),
delStage:id=>mut(s=>{const sh=curSheet(s);const b=sh?.blocks.find(x=>x.id===id);if(!sh||!b)return;if(delStage(sh.blocks,b)){s.blockId=null;s.elId=null}}),
setTeam:(id,n)=>mut(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(!b)return;const ne={...b.els} as Record<Dev,El[]>;for(const d of DEVS){const o=teamBuild(b.title,n,d);if(o){ne[d]=o.els;b.h[d]=o.h}}b.els=fresh(ne);b.tm=Math.max(3,Math.min(8,Math.round(n)));if(b.lay)delete b.lay}),
delBlock:(id,dev)=>mut(s=>{const sh=curSheet(s);if(!sh)return;const b=sh.blocks.find(x=>x.id===id);if(!b)return;if(!dev&&delStage(sh.blocks,b)){s.blockId=null;s.elId=null;return}const rest=dev?(b.dv??[...DEVS]).filter(d=>d!==dev):[];if(dev&&rest.length){b.dv=DEVS.filter(d=>rest.includes(d))}else sh.blocks=sh.blocks.filter(x=>x.id!==id);if(s.blockId===id){s.blockId=null;s.elId=null}if(s.editId===id){s.editId=null;s.snap=null}}),
enterEdit:id=>set(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(!b)return;s.editId=id;s.blockId=id;s.elId=null;s.snap=JSON.parse(JSON.stringify(b))}),
exitEdit:save=>{if(save){set(s=>{s.editId=null;s.snap=null;s.elId=null});return}mut(s=>{if(s.snap&&s.editId){const sh=curSheet(s);const i=sh?sh.blocks.findIndex(b=>b.id===s.editId):-1;if(sh&&i>=0)sh.blocks[i]=s.snap}s.editId=null;s.snap=null;s.elId=null})},
moveBlock:(id,dir,dev)=>mut(s=>{const a=curSheet(s)?.blocks;if(!a)return;const i=a.findIndex(b=>b.id===id);if(i<0)return;let j=i+dir;if(dev)while(j>=0&&j<a.length&&!onDev(a[j],dev))j+=dir;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]]}),
setDevs:(id,devs,from)=>mut(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(!b||!devs.length)return;for(const d of devs)addDevTo(b,d,from);const keep=DEVS.filter(d=>devs.includes(d));if(keep.length>=DEVS.length)delete b.dv;else b.dv=keep}),
adaptSheet:(dev,from)=>mut(s=>{const sh=curSheet(s);if(!sh)return;for(const b of sh.blocks)if(onDev(b,from)&&!onDev(b,dev))addDevTo(b,dev,from)}),
setDelAsk:v=>set(s=>{s.delAsk=v}),
dupBlock:id=>mut(s=>{const a=curSheet(s)?.blocks;const i=a?a.findIndex(b=>b.id===id):-1;if(!a||i<0)return;const o=JSON.parse(JSON.stringify(a[i])) as Block;o.id=uid();o.els=fresh(o.els);if(a[i].sv?.tab&&!a[i].sv!.x&&dupStage(a,a[i],o)){}else{if(o.sv){if(o.sv.tab){o.sv={...o.sv,x:1};if(!a[i].sv!.x)toast('Этапов уже 7: копия лежит внутри этого этапа',undefined,5000)}else delete o.sv}a.splice(i+1,0,o)}s.blockId=o.id;s.elId=null}),
setQuiz:(id,f)=>mut(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(!b||!b.quiz)return;const c=JSON.parse(JSON.stringify(b.quiz)) as QuizCfg;f(c);b.quiz=normalizeQuiz(c);const a=applyQuiz(b.quiz);for(const d of DEVS){b.els[d]=a.els[d].map(e=>({...e,id:uid()}));b.h[d]=a.h[d]}s.elId=null},'qz'+id),
unlinkQuiz:id=>mut(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(b)delete b.quiz}),
editBlock:(id,patch)=>mut(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(b)Object.assign(b,patch)},'e'+id),
setGuides:(id,dev,g)=>mut(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(!b)return;const u=(a:number[])=>[...new Set(a.map(v=>Math.round(v)))].sort((p,q)=>p-q);const gs={...(b.guides??{})} as NonNullable<Block['guides']>;const x=u(g.x),y=u(g.y);if(!x.length&&!y.length)delete gs[dev];else gs[dev]={x,y};if(Object.keys(gs).length)b.guides=gs;else delete b.guides},'g'+id),
setH:(dev,id,h)=>mut(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(!b)return;const bt=Math.max(0,...b.els[dev].map(e=>e.y+e.h));b.h[dev]=Math.max(80,bt,Math.round(h))},'h'+id),
saveBlockTpl:(id,name,cat)=>mut(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(!b)return;const c=JSON.parse(JSON.stringify(b)) as Block;s.data!.blockTpls.push({id:uid(),name,cat:cat||undefined,...(c.sv?{st:{v:c.sv.v,i:c.sv.i}}:{}),quiz:c.quiz,text:c.text,h:c.h,els:fresh(c.els)})}),
importTpls:l=>mut(s=>{for(const t of l)s.data!.blockTpls.push({id:uid(),name:t.name,cat:t.cat||undefined,...(t.st?{st:t.st}:{}),quiz:t.quiz?normalizeQuiz(t.quiz):undefined,text:t.text,h:t.h,els:fresh(t.els)})}),
delBlockTpl:id=>mut(s=>{s.data!.blockTpls=s.data!.blockTpls.filter(x=>x.id!==id)}),
setStyle:(patch)=>mut(s=>{const p=s.data!.projects.find(x=>x.id===s.projectId);if(p)Object.assign(p.style,patch)},'pstyle'),
setRole:(r,patch)=>mut(s=>{const p=s.data!.projects.find(x=>x.id===s.projectId);if(p)Object.assign(p.style.roles[r],patch)},'prole'+r),
addEl:(dev,tp,x,y,bid,extra)=>mut(s=>{const sh=curSheet(s);if(!sh)return;if(!sh.blocks.some(q=>onDev(q,dev))){const nb=mkBlock('Блок');nb.dv=[dev];sh.blocks.push(nb)}let i:number,ry:number;if(bid){i=Math.max(0,sh.blocks.findIndex(q=>q.id===bid));ry=y}else{i=y<0?Math.max(0,sh.blocks.findIndex(q=>onDev(q,dev))):blockAt(sh.blocks,dev,y);ry=y-blockTops(sh.blocks,dev)[i]}const b=sh.blocks[i];const [w,h,text]=EL_DEF[tp];const e:El={id:uid(),t:tp,x:Math.max(0,x),y:Math.max(0,Math.round(ry)),w,h,text,...extra};b.els[dev].push(e);grow(b,dev);s.elId=e.id;s.blockId=b.id}),
updEl:(dev,id,patch)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(!f)return;const e=f.e;
if(e.hug&&!('hug' in patch)){const cw=patch.w!==undefined&&patch.w!==e.w,chh=patch.h!==undefined&&patch.h!==e.h;if((e.hug==='w'&&(cw||chh))||(e.hug==='h'&&chh)){delete e.hug;delete e.mh}}
if(patch.h!==undefined&&patch.h!==e.h&&e.hug!=='h'&&e.mh!==undefined&&!('mh' in patch))delete e.mh;Object.assign(e,patch);if(e.hug===undefined)delete e.hug;if(patch.text!==undefined&&e.tg)syncTabText(sh.blocks,f.b,dev,e);grow(f.b,dev)},'u'+id),
dragEl:(dev,id,patch)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(f){const e=f.e;if(patch.h!==undefined&&patch.h!==e.h){if(e.hug==='h'&&e.t!=='text')patch={...patch,mh:patch.h};else if(e.mh!==undefined)delete e.mh}Object.assign(e,patch)}},'u'+id),
dropEl:(dev,id,stay)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(!sh||!f)return;const tops=blockTops(sh.blocks,dev);const i0=sh.blocks.findIndex(b=>b.id===f.b.id);const absTop=tops[i0]+f.e.y;const j=stay?i0:blockAt(sh.blocks,dev,absTop+f.e.h/2);let tb=f.b;
if(j>=0&&j!==i0){tb=sh.blocks[j];f.b.els[dev]=f.b.els[dev].filter(x=>x.id!==id);f.e.y=Math.round(absTop-tops[j]);tb.els[dev].push(f.e);s.blockId=tb.id}
const el=tb.els[dev].find(x=>x.id===id);if(el){el.y=Math.max(0,el.y)}grow(tb,dev)},'u'+id),
delEl:(dev,id)=>mut(s=>{const sh=curSheet(s);if(!sh)return;for(const b of sh.blocks)b.els[dev]=b.els[dev].filter(e=>e.id!==id);if(s.elId===id)s.elId=null}),
dupEl:(dev,id)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(!f)return;const c:El={...f.e,id:uid(),x:f.e.x+16,y:f.e.y+16};f.b.els[dev].push(c);grow(f.b,dev);s.elId=c.id}),
moveEl:(dev,id,dir)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(!f)return;const a=f.b.els[dev];const i=a.findIndex(e=>e.id===id);const j=Math.max(0,Math.min(a.length-1,i+dir));if(j===i)return;const [x]=a.splice(i,1);a.splice(j,0,x)}),
copyEl:(dev,id)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(!f)return;for(const d of DEVS){if(d===dev)continue;const k=FW[d]/FW[dev];f.b.els[d].push({...f.e,id:uid(),x:Math.round(f.e.x*k),w:Math.max(16,Math.round(f.e.w*k))});grow(f.b,d)}}),
clipSet:(dev,id)=>{const g=get();const sh=curSheet(g);const f=sh&&findEl(sh,dev,id);if(f)set({clip:{e:{...f.e},dev,n:0},clipM:null})},
clipPaste:dev=>mut(s=>{const c=s.clip;const sh=curSheet(s);if(!c||!sh||!sh.blocks.length)return;const b=sh.blocks.find(x=>x.els[dev].some(e=>e.id===s.elId))??sh.blocks.find(x=>x.id===s.blockId)??sh.blocks[sh.blocks.length-1];const k=FW[dev]/FW[c.dev];c.n+=1;const o=16*c.n;const w=Math.max(16,Math.round(c.e.w*k));const e:El={...c.e,id:uid(),w,x:Math.max(0,Math.min(FW[dev]-w,Math.round(c.e.x*k)+o)),y:c.e.y+o};b.els[dev].push(e);grow(b,dev);s.elId=e.id;s.blockId=b.id}),
setEl:id=>set(s=>{s.elId=id;if(id){const sh=curSheet(s);const b=sh?.blocks.find(x=>DEVS.some(d=>x.els[d].some(e=>e.id===id)));if(b)s.blockId=b.id}}),
setMulti:ids=>set(s=>{s.multi=ids;s.elId=ids[ids.length-1]??null;if(s.elId){const sh=curSheet(s);const b=sh?.blocks.find(x=>DEVS.some(d=>x.els[d].some(e=>e.id===s.elId)));if(b)s.blockId=b.id}}),
dragMany:(dev,ps)=>mut(s=>{const sh=curSheet(s);if(!sh)return;for(const b of sh.blocks){const L=b.lay?.[dev];if(!L)continue;for(const gid of Object.keys(L)){const m=b.els[dev].filter(e=>e.g===gid);if(m.length&&m.every(e=>ps.some(p=>p.id===e.id))){const p0=ps.find(p=>p.id===m[0].id)!;L[gid].x+=p0.x-m[0].x;L[gid].y+=p0.y-m[0].y}}}const bs=new Set<Block>();for(const p of ps){const f=findEl(sh,dev,p.id);if(f){f.e.x=p.x;f.e.y=p.y;bs.add(f.b)}}bs.forEach(b=>grow(b,dev))},'um'+(ps[0]?.id??'')),
delEls:(dev,ids)=>mut(s=>{const sh=curSheet(s);if(!sh)return;const q=new Set(ids);for(const b of sh.blocks)b.els[dev]=b.els[dev].filter(e=>!q.has(e.id));s.elId=null;s.multi=[]}),
dupEls:(dev,ids,off,nid,k)=>mut(s=>{const sh=curSheet(s);if(!sh)return;const out:string[]=[];const gm:Record<string,string>={};ids.forEach((id,i)=>{const f=findEl(sh,dev,id);if(!f)return;const c:El={...f.e,id:nid[i]??uid(),x:f.e.x+off,y:f.e.y+off};if(c.g)c.g=gm[c.g]??=uid();f.b.els[dev].push(c);grow(f.b,dev);out.push(c.id)});s.multi=out;s.elId=out[out.length-1]??null},k??''),
alignEls:(dev,ids,m)=>mut(s=>{const sh=curSheet(s);if(!sh)return;const fs=ids.map(i=>findEl(sh,dev,i)).filter(Boolean) as {b:Block;e:El}[];if(fs.length<2)return;const es=fs.map(f=>f.e);
const L=Math.min(...es.map(e=>e.x)),R=Math.max(...es.map(e=>e.x+e.w)),T=Math.min(...es.map(e=>e.y)),B=Math.max(...es.map(e=>e.y+e.h));
if(m==='ew'||m==='eh'){const w=m==='ew';const mx=Math.max(...es.filter(e=>e.t!=='line'||w).map(e=>w?e.w:e.h));for(const e of es){if(w){e.w=mx;if(e.hug==='w')delete e.hug}else if(e.t!=='line'){e.h=mx;if(e.hug==='h')delete e.hug}}}
else if(m==='dh'||m==='dv'){const h=m==='dh';const a=[...es].sort((p,q)=>h?p.x-q.x:p.y-q.y);const tot=a.reduce((n,e)=>n+(h?e.w:e.h),0);const gap=((h?R-L:B-T)-tot)/(a.length-1);let pos=h?L:T;for(const e of a){if(h)e.x=Math.round(pos);else e.y=Math.round(pos);pos+=(h?e.w:e.h)+gap}}
else for(const e of es){if(m==='l')e.x=L;else if(m==='r')e.x=R-e.w;else if(m==='c')e.x=Math.round((L+R)/2-e.w/2);else if(m==='t')e.y=T;else if(m==='b')e.y=B-e.h;else e.y=Math.round((T+B)/2-e.h/2)}
new Set(fs.map(f=>f.b)).forEach(b=>grow(b,dev))}),
autoLay:(dev,ids)=>mut(s=>{const sh=curSheet(s);if(!sh)return;const fs=ids.map(i=>findEl(sh,dev,i)).filter(Boolean) as {b:Block;e:El}[];if(fs.length<2)return;const b=fs[0].b;if(fs.some(f=>f.b!==b))return;
const m=fs.map(f=>f.e);const g0=m[0].g;const gid=g0&&m.every(e=>e.g===g0)?g0:uid();m.forEach(e=>{e.g=gid});
const x0=Math.min(...m.map(e=>e.x)),y0=Math.min(...m.map(e=>e.y));const cx=m.map(e=>e.x+e.w/2),cy=m.map(e=>e.y+lh(e)/2);
const d:'h'|'v'=Math.max(...cy)-Math.min(...cy)>=Math.max(...cx)-Math.min(...cx)?'v':'h';const v=d==='v';
const ord=[...m].sort((a,q)=>v?a.y-q.y:a.x-q.x);const gs:number[]=[];for(let i=0;i<ord.length-1;i++)gs.push(v?ord[i+1].y-(ord[i].y+lh(ord[i])):ord[i+1].x-(ord[i].x+ord[i].w));gs.sort((a,q)=>a-q);const med=gs[Math.floor(gs.length/2)]??16;
const gap=med>0?Math.min(64,Math.max(4,Math.round(med/4)*4)):16;
const left=Math.max(...m.map(e=>e.x))-Math.min(...m.map(e=>e.x))<=4,mid=Math.max(...cx)-Math.min(...cx)<=4,rt=Math.max(...m.map(e=>e.x+e.w))-Math.min(...m.map(e=>e.x+e.w))<=4;
const top=Math.max(...m.map(e=>e.y))-Math.min(...m.map(e=>e.y))<=4,vm=Math.max(...cy)-Math.min(...cy)<=4,bt=Math.max(...m.map(e=>e.y+lh(e)))-Math.min(...m.map(e=>e.y+lh(e)))<=4;
const al:'s'|'c'|'e'=v?(left?'s':mid?'c':rt?'e':'s'):(top?'s':vm?'c':bt?'e':'s');
const dl=((b.lay??={})[dev]??={});dl[gid]={d,gap,al,x:x0,y:y0,...(d==='h'&&m.every(e=>e.t==='btn'||e.t==='input')?{fl:true}:{})};s.multi=ids}),
setLay:(dev,gid,p)=>mut(s=>{const sh=curSheet(s);if(!sh)return;for(const b of sh.blocks){const c=b.lay?.[dev]?.[gid];if(c)Object.assign(c,p)}},'lay'+gid),
delLay:(dev,gid)=>mut(s=>{const sh=curSheet(s);if(!sh)return;for(const b of sh.blocks){const L=b.lay?.[dev];if(L)delete L[gid]}}),
gapEls:(dev,ids,gap)=>mut(s=>{const sh=curSheet(s);if(!sh)return;const fs=ids.map(i=>findEl(sh,dev,i)).filter(Boolean) as {b:Block;e:El}[];if(fs.length<2)return;const es=fs.map(f=>f.e);const L=Math.min(...es.map(e=>e.x)),R=Math.max(...es.map(e=>e.x+e.w)),T=Math.min(...es.map(e=>e.y)),B=Math.max(...es.map(e=>e.y+lh(e)));const h=R-L>B-T;const a=[...es].sort((p,q)=>h?p.x-q.x:p.y-q.y);let pos=h?L:T;for(const e of a){if(h)e.x=Math.round(pos);else e.y=Math.round(pos);pos+=(h?e.w:lh(e))+gap}new Set(fs.map(f=>f.b)).forEach(b=>grow(b,dev))}),
flipEls:(dev,ids,axis,side)=>mut(s=>{const sh=curSheet(s);if(!sh)return;const f=ids.map(i=>findEl(sh,dev,i)).filter(Boolean) as {b:Block;e:El}[];if(!f.length)return;const b=f[0].b;if(f.some(x=>x.b!==b))return;const es=unit(b,dev,ids);if(side)mirror(b,dev,es,axis,0,axis==='x'?FW[dev]:b.h[dev],true);else{const x0=Math.min(...es.map(e=>e.x)),x1=Math.max(...es.map(e=>e.x+e.w)),y0=Math.min(...es.map(e=>e.y)),y1=Math.max(...es.map(e=>e.y+lh(e)));mirror(b,dev,es,axis,axis==='x'?x0:y0,axis==='x'?x1:y1,false)}grow(b,dev)}),
flipBlock:(id,axis)=>mut(s=>{const sh=curSheet(s);const b=sh?.blocks.find(x=>x.id===id);if(!b)return;for(const d of LDV){const es=b.els[d];if(es.length)mirror(b,d,es,axis,0,axis==='x'?FW[d]:b.h[d],true)}}),
swapEls:(dev,a,c)=>mut(s=>{const sh=curSheet(s);if(!sh)return;const fa=findEl(sh,dev,a[0]),fc=findEl(sh,dev,c[0]);if(!fa||!fc||fa.b!==fc.b)return;const b=fa.b;const A=unit(b,dev,a),B=unit(b,dev,c);if(A.some(e=>B.includes(e)))return;const bb=(m:El[])=>({x:Math.min(...m.map(e=>e.x)),y:Math.min(...m.map(e=>e.y))});const pa=bb(A),pb=bb(B);shiftEls(b,dev,A,pb.x-pa.x,pb.y-pa.y);shiftEls(b,dev,B,pa.x-pb.x,pa.y-pb.y);grow(b,dev)}),
groupEls:(dev,ids,on)=>mut(s=>{const sh=curSheet(s);if(!sh)return;const g=on?uid():undefined;for(const id of ids){const f=findEl(sh,dev,id);if(!f)continue;if(g)f.e.g=g;else delete f.e.g}}),
clipSetMany:(dev,ids)=>{const sh=curSheet(get());if(!sh)return;const es=ids.map(i=>findEl(sh,dev,i)?.e).filter(Boolean).map(e=>({...e!}));set({clipM:{es,dev,n:0},clip:null})},
clipPasteMany:dev=>mut(s=>{const c=s.clipM;const sh=curSheet(s);if(!c||!sh||!sh.blocks.length)return;const b=sh.blocks.find(x=>x.id===s.editId)??sh.blocks.find(x=>x.id===s.blockId)??sh.blocks[sh.blocks.length-1];const k=FW[dev]/FW[c.dev];c.n+=1;const o=16*c.n;const gm:Record<string,string>={};const out:string[]=[];
for(const q of c.es){const w=Math.max(16,Math.round(q.w*k));const e:El={...q,id:uid(),w,x:Math.max(0,Math.min(FW[dev]-w,Math.round(q.x*k)+o)),y:q.y+o};if(e.g)e.g=gm[e.g]??=uid();b.els[dev].push(e);out.push(e.id)}
grow(b,dev);s.multi=out;s.elId=out[out.length-1]??null;s.blockId=b.id}),
setBlock:id=>set(s=>{const tgt=s.editId&&!id?s.editId:id;if(s.editId&&tgt!==s.editId){s.editId=null;s.snap=null}s.blockId=tgt;s.elId=null}),
undo:()=>{const d=past.pop();if(!d)return;fut.push(get().data!);restore(d)},
redo:()=>{const d=fut.pop();if(!d)return;past.push(get().data!);restore(d)},
saveType:name=>mut((s,p)=>{if(!p)return;s.data!.siteTypes.push({id:uid(),name,pages:p.sheets.map(h=>({name:h.name,kind:h.kind,blocks:h.blocks.map(b=>b.title)}))})})}}));
