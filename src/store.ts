import {create} from 'zustand';import {immer} from 'zustand/middleware/immer';
import {save} from './lib/vault';import {migrate,mkBlock,mkFromTpl} from './lib/migrate';import {uid} from './lib/uid';
import {fresh} from './lib/tpl';import {sheetsFromOutline} from './lib/outline';
import {FW,DEVS} from './lib/dev';import {defStyle} from './lib/art';import type {PStyle,Role} from './lib/art';import type {Dev} from './lib/dev';
export {FW,DEVS};export type {Dev};
export type Kind='page'|'popup';
export type ET='text'|'rect'|'btn'|'input'|'img'|'line'|'shape'|'icon'|'mock'|'list';
export interface El{id:string;t:ET;x:number;y:number;w:number;h:number;text:string;fs?:number;b?:boolean;al?:'l'|'c'|'r';acc?:boolean;go?:string;sh?:string;ic?:string;mk?:string;bu?:string;n?:number;fill?:string;stroke?:string;sw?:number;r?:number;op?:number;c?:string;role?:Role}
export interface Block{id:string;title:string;text:string;h:Record<Dev,number>;els:Record<Dev,El[]>}
export interface BlockTpl{id:string;name:string;cat?:string;text:string;h:Record<Dev,number>;els:Record<Dev,El[]>}
export interface Sheet{id:string;name:string;kind:Kind;blocks:Block[]}
export interface Project{id:string;name:string;typeId:string;style:PStyle;sheets:Sheet[];createdAt:number;updatedAt:number}
export interface SiteType{id:string;name:string;builtin?:boolean;pages:{name:string;kind:Kind;blocks:string[]}[]}
export interface Data{schemaVersion:5;projects:Project[];siteTypes:SiteType[];blockTpls:BlockTpl[]}
const P=(name:string,blocks:string[],kind:Kind='page')=>({name,kind,blocks});
export const PRESETS:SiteType[]=[
{id:'landing',name:'Лендинг',builtin:true,pages:[P('Главная',['Шапка','Оффер','Проблемы','Преимущества','Как работаем','Кейсы','Отзывы','Тарифы','FAQ','Форма заявки','Подвал']),P('Заявка',['Форма'],'popup'),P('Спасибо',['Подтверждение'])]},
{id:'multi',name:'Многостраничный',builtin:true,pages:[P('Главная',['Шапка','Оффер','Услуги','О компании','Отзывы','Подвал']),P('Услуги',['Шапка','Список услуг','Форма заявки','Подвал']),P('О нас',['Шапка','История','Команда','Подвал']),P('Контакты',['Шапка','Контакты','Карта','Подвал'])]},
{id:'shop',name:'Интернет-магазин',builtin:true,pages:[P('Главная',['Шапка','Баннер','Категории','Хиты','Преимущества','Подвал']),P('Каталог',['Шапка','Фильтры','Сетка товаров','Подвал']),P('Товар',['Шапка','Галерея','Описание','Похожие','Подвал']),P('Корзина',['Шапка','Список','Итого','Подвал'])]},
{id:'quiz',name:'Квиз',builtin:true,pages:[P('Старт',['Оффер','Кнопка старта']),P('Вопрос',['Прогресс','Вопрос','Варианты','Далее']),P('Контакты',['Бонус','Форма заявки']),P('Спасибо',['Подтверждение'])]}];
/** wires typical buttons: header/CTA -> popup, forms -> thanks page, quiz start -> first question */
const autoLink=(sheets:Sheet[])=>{const pop=sheets.find(x=>x.kind==='popup');const thx=sheets.find(x=>x.kind!=='popup'&&/спасибо/i.test(x.name));const q=sheets.find(x=>x.kind!=='popup'&&/вопрос/i.test(x.name));
for(const sh of sheets)for(const b of sh.blocks)for(const d of DEVS)for(const e of b.els[d]){if(e.t!=='btn')continue;let to:string|undefined;
if(sh.kind==='popup')to=thx?.id;else if(sh===thx)to=undefined;
else if(/^форма/i.test(b.title))to=thx?.id;
else if(/начать/i.test(e.text))to=q?.id;
else if(/(звонок|заявк|расч[её]т|подробн|выбрать|предложени)/i.test(e.text))to=pop?.id??thx?.id;
if(to)e.go=to}};
/** top (y) of every block for a device */
export const blockTops=(bs:Block[],dev:Dev)=>{let y=0;return bs.map(b=>{const t=y;y+=b.h[dev];return t})};
interface S{data:Data|null;projectId:string|null;sheetId:string|null;blockId:string|null;elId:string|null;status:'saved'|'saving';clip:{e:El;dev:Dev;n:number}|null;editId:string|null;snap:Block|null;
enterEdit:(id:string)=>void;exitEdit:(save:boolean)=>void;
load:(d:Data)=>void;addProject:(name:string,typeId:string)=>void;importOutline:(name:string,text:string)=>void;delProject:(id:string)=>void;openProject:(id:string)=>void;renameProject:(id:string,n:string)=>void;
addSheet:(name:string,kind:Kind)=>void;renameSheet:(id:string,n:string)=>void;delSheet:(id:string)=>void;setSheet:(id:string)=>void;
addBlock:(title:string,o?:{after?:string;tpl?:string})=>void;delBlock:(id:string)=>void;moveBlock:(id:string,dir:-1|1)=>void;dupBlock:(id:string)=>void;
editBlock:(id:string,patch:Partial<Pick<Block,'title'|'text'>>)=>void;setH:(dev:Dev,id:string,h:number)=>void;saveBlockTpl:(id:string,name:string,cat?:string)=>void;delBlockTpl:(id:string)=>void;
addEl:(dev:Dev,t:ET,x:number,y:number,bid?:string,extra?:Partial<El>)=>void;setStyle:(patch:Partial<PStyle>)=>void;setRole:(r:Role,p:Partial<PStyle['roles'][Role]>)=>void;updEl:(dev:Dev,id:string,patch:Partial<El>)=>void;dragEl:(dev:Dev,id:string,patch:Partial<El>)=>void;dropEl:(dev:Dev,id:string,stay?:boolean)=>void;
delEl:(dev:Dev,id:string)=>void;dupEl:(dev:Dev,id:string)=>void;moveEl:(dev:Dev,id:string,dir:number)=>void;copyEl:(dev:Dev,id:string)=>void;
clipSet:(dev:Dev,id:string)=>void;clipPaste:(dev:Dev)=>void;setEl:(id:string|null)=>void;setBlock:(id:string|null)=>void;
undo:()=>void;redo:()=>void;saveType:(name:string)=>void}
const EL_DEF:Record<ET,[number,number,string]>={text:[240,40,'Заголовок'],rect:[320,200,''],btn:[180,48,'Кнопка'],input:[280,44,'Поле ввода'],img:[320,220,'Изображение'],line:[300,0,''],shape:[200,140,''],icon:[48,48,''],mock:[260,420,''],list:[320,120,'Первый пункт\nВторой пункт\nТретий пункт']};
type Ctx={data:Data|null;projectId:string|null;sheetId:string|null};
const curSheet=(s:Ctx)=>s.data?.projects.find(p=>p.id===s.projectId)?.sheets.find(x=>x.id===s.sheetId);
const findEl=(sh:Sheet,dev:Dev,id:string)=>{for(const b of sh.blocks){const e=b.els[dev].find(x=>x.id===id);if(e)return{b,e}}return null};
const hasEl=(sh:Sheet|undefined,id:string|null)=>!!id&&!!sh&&sh.blocks.some(b=>DEVS.some(d=>b.els[d].some(e=>e.id===id)));
/** a block grows so that its elements always fit */
const grow=(b:Block,dev:Dev)=>{const bt=Math.max(0,...b.els[dev].map(e=>e.y+e.h));if(bt+24>b.h[dev])b.h[dev]=Math.ceil((bt+24)/8)*8};
const blockAt=(bs:Block[],dev:Dev,y:number)=>{const t=blockTops(bs,dev);for(let k=0;k<bs.length;k++)if(y<t[k]+bs[k].h[dev])return k;return bs.length-1};
let t:ReturnType<typeof setTimeout>;let past:Data[]=[],fut:Data[]=[],lastK='',lastT=0;
export const useStore=create<S>()(immer((set,get)=>{
const persist=()=>{clearTimeout(t);t=setTimeout(async()=>{await save(get().data);set({status:'saved'})},400)};
const restore=(d:Data)=>{set(s=>{s.data=d;const p=d.projects.find(x=>x.id===s.projectId)??d.projects[0];s.projectId=p?.id??null;const h=p?.sheets.find(x=>x.id===s.sheetId)??p?.sheets[0];s.sheetId=h?.id??null;if(!h?.blocks.some(b=>b.id===s.blockId))s.blockId=null;if(!h?.blocks.some(b=>b.id===s.editId)){s.editId=null;s.snap=null}if(!hasEl(h,s.elId))s.elId=null;s.status='saving'});persist()};
const mut=(f:(s:S,p?:Project)=>void,k='')=>{const now=Date.now();if(!(k&&k===lastK&&now-lastT<1200)){past.push(get().data!);if(past.length>60)past.shift();fut=[]}lastK=k;lastT=now;set(s=>{f(s,s.data?.projects.find(p=>p.id===s.projectId));const p=s.data?.projects.find(p=>p.id===s.projectId);if(p)p.updatedAt=Date.now();s.status='saving'});persist()};
return{data:null,projectId:null,sheetId:null,blockId:null,elId:null,status:'saved',clip:null,editId:null,snap:null,
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
addBlock:(title,o)=>mut(s=>{const sh=curSheet(s);if(!sh)return;const tp=o?.tpl?s.data!.blockTpls.find(x=>x.id===o.tpl):undefined;const b=tp?mkFromTpl(tp):mkBlock(title);const i=o?.after?sh.blocks.findIndex(x=>x.id===o.after):-1;if(i>=0)sh.blocks.splice(i+1,0,b);else sh.blocks.push(b);s.blockId=b.id;s.elId=null}),
delBlock:id=>mut(s=>{const sh=curSheet(s);if(sh)sh.blocks=sh.blocks.filter(b=>b.id!==id);if(s.blockId===id){s.blockId=null;s.elId=null}if(s.editId===id){s.editId=null;s.snap=null}}),
enterEdit:id=>set(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(!b)return;s.editId=id;s.blockId=id;s.elId=null;s.snap=JSON.parse(JSON.stringify(b))}),
exitEdit:save=>{if(save){set(s=>{s.editId=null;s.snap=null;s.elId=null});return}mut(s=>{if(s.snap&&s.editId){const sh=curSheet(s);const i=sh?sh.blocks.findIndex(b=>b.id===s.editId):-1;if(sh&&i>=0)sh.blocks[i]=s.snap}s.editId=null;s.snap=null;s.elId=null})},
moveBlock:(id,dir)=>mut(s=>{const a=curSheet(s)?.blocks;if(!a)return;const i=a.findIndex(b=>b.id===id),j=i+dir;if(i<0||j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]]}),
dupBlock:id=>mut(s=>{const a=curSheet(s)?.blocks;const i=a?a.findIndex(b=>b.id===id):-1;if(!a||i<0)return;const o=JSON.parse(JSON.stringify(a[i])) as Block;o.id=uid();o.els=fresh(o.els);a.splice(i+1,0,o);s.blockId=o.id;s.elId=null}),
editBlock:(id,patch)=>mut(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(b)Object.assign(b,patch)},'e'+id),
setH:(dev,id,h)=>mut(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(!b)return;const bt=Math.max(0,...b.els[dev].map(e=>e.y+e.h));b.h[dev]=Math.max(80,bt,Math.round(h))},'h'+id),
saveBlockTpl:(id,name,cat)=>mut(s=>{const b=curSheet(s)?.blocks.find(x=>x.id===id);if(!b)return;const c=JSON.parse(JSON.stringify(b)) as Block;s.data!.blockTpls.push({id:uid(),name,cat:cat||undefined,text:c.text,h:c.h,els:fresh(c.els)})}),
delBlockTpl:id=>mut(s=>{s.data!.blockTpls=s.data!.blockTpls.filter(x=>x.id!==id)}),
setStyle:(patch)=>mut(s=>{const p=s.data!.projects.find(x=>x.id===s.projectId);if(p)Object.assign(p.style,patch)},'pstyle'),
setRole:(r,patch)=>mut(s=>{const p=s.data!.projects.find(x=>x.id===s.projectId);if(p)Object.assign(p.style.roles[r],patch)},'prole'+r),
addEl:(dev,tp,x,y,bid,extra)=>mut(s=>{const sh=curSheet(s);if(!sh)return;if(!sh.blocks.length)sh.blocks.push(mkBlock('Блок'));let i:number,ry:number;if(bid){i=Math.max(0,sh.blocks.findIndex(q=>q.id===bid));ry=y}else{i=y<0?0:blockAt(sh.blocks,dev,y);ry=y-blockTops(sh.blocks,dev)[i]}const b=sh.blocks[i];const [w,h,text]=EL_DEF[tp];const e:El={id:uid(),t:tp,x:Math.max(0,x),y:Math.max(0,Math.round(ry)),w,h,text,...extra};b.els[dev].push(e);grow(b,dev);s.elId=e.id;s.blockId=b.id}),
updEl:(dev,id,patch)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(!f)return;Object.assign(f.e,patch);grow(f.b,dev)},'u'+id),
dragEl:(dev,id,patch)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(f)Object.assign(f.e,patch)},'u'+id),
dropEl:(dev,id,stay)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(!sh||!f)return;const tops=blockTops(sh.blocks,dev);const i0=sh.blocks.findIndex(b=>b.id===f.b.id);const absTop=tops[i0]+f.e.y;const j=stay?i0:blockAt(sh.blocks,dev,absTop+f.e.h/2);let tb=f.b;
if(j>=0&&j!==i0){tb=sh.blocks[j];f.b.els[dev]=f.b.els[dev].filter(x=>x.id!==id);f.e.y=Math.round(absTop-tops[j]);tb.els[dev].push(f.e);s.blockId=tb.id}
const el=tb.els[dev].find(x=>x.id===id);if(el){el.y=Math.max(0,el.y)}grow(tb,dev)},'u'+id),
delEl:(dev,id)=>mut(s=>{const sh=curSheet(s);if(!sh)return;for(const b of sh.blocks)b.els[dev]=b.els[dev].filter(e=>e.id!==id);if(s.elId===id)s.elId=null}),
dupEl:(dev,id)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(!f)return;const c:El={...f.e,id:uid(),x:f.e.x+16,y:f.e.y+16};f.b.els[dev].push(c);grow(f.b,dev);s.elId=c.id}),
moveEl:(dev,id,dir)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(!f)return;const a=f.b.els[dev];const i=a.findIndex(e=>e.id===id);const j=Math.max(0,Math.min(a.length-1,i+dir));if(j===i)return;const [x]=a.splice(i,1);a.splice(j,0,x)}),
copyEl:(dev,id)=>mut(s=>{const sh=curSheet(s);const f=sh&&findEl(sh,dev,id);if(!f)return;for(const d of DEVS){if(d===dev)continue;const k=FW[d]/FW[dev];f.b.els[d].push({...f.e,id:uid(),x:Math.round(f.e.x*k),w:Math.max(16,Math.round(f.e.w*k))});grow(f.b,d)}}),
clipSet:(dev,id)=>{const g=get();const sh=curSheet(g);const f=sh&&findEl(sh,dev,id);if(f)set({clip:{e:{...f.e},dev,n:0}})},
clipPaste:dev=>mut(s=>{const c=s.clip;const sh=curSheet(s);if(!c||!sh||!sh.blocks.length)return;const b=sh.blocks.find(x=>x.els[dev].some(e=>e.id===s.elId))??sh.blocks.find(x=>x.id===s.blockId)??sh.blocks[sh.blocks.length-1];const k=FW[dev]/FW[c.dev];c.n+=1;const o=16*c.n;const w=Math.max(16,Math.round(c.e.w*k));const e:El={...c.e,id:uid(),w,x:Math.max(0,Math.min(FW[dev]-w,Math.round(c.e.x*k)+o)),y:c.e.y+o};b.els[dev].push(e);grow(b,dev);s.elId=e.id;s.blockId=b.id}),
setEl:id=>set(s=>{s.elId=id;if(id){const sh=curSheet(s);const b=sh?.blocks.find(x=>DEVS.some(d=>x.els[d].some(e=>e.id===id)));if(b)s.blockId=b.id}}),
setBlock:id=>set(s=>{const tgt=s.editId&&!id?s.editId:id;if(s.editId&&tgt!==s.editId){s.editId=null;s.snap=null}s.blockId=tgt;s.elId=null}),
undo:()=>{const d=past.pop();if(!d)return;fut.push(get().data!);restore(d)},
redo:()=>{const d=fut.pop();if(!d)return;past.push(get().data!);restore(d)},
saveType:name=>mut((s,p)=>{if(!p)return;s.data!.siteTypes.push({id:uid(),name,pages:p.sheets.map(h=>({name:h.name,kind:h.kind,blocks:h.blocks.map(b=>b.title)}))})})}}));
