/** PDF-отчёт для заказчика. Страницы фиксированного размера, поэтому номера в оглавлении точные.
 *  Разметка статическая (без скриптов): открывается в iframe для предпросмотра и печатается в PDF. */
import {isRich,richHtml,linkOf,linkInfo,RICH_CSS} from './rich';
import type {Project,Block,El} from '../store';
import {FW,DEVN} from './dev';import type {Dev} from './dev';
import {artHtml,resolve,styleCss,ROLES,lineAttr} from './art';import {quizFrame} from './quiz';import {typo} from './typo';import {getUi} from './ui';import {BASE_CSS} from './share';import {cmNums} from './comments';

export type PageSize='a4'|'letter';
export type ReportMode='full'|'pages';
export interface ReportOpts{size:PageSize;dev:Dev;notes:boolean;sheets?:string[];ver:string;mode?:ReportMode;toc?:boolean;style?:boolean;params?:boolean;texts?:boolean;table?:boolean;cfg?:Partial<RepCfg>}
/** настройки оформления отчёта: бренд, обложка, колонтитулы, содержимое. Всё необязательно, пустое = по умолчанию */
export interface RepCfg{accent:string;ink:string;font:string;headFont:string;cover:'classic'|'band'|'dark'|'center';title:string;sub:string;kick:string;client:string;author:string;role:string;contacts:string;agency:string;reqs:string;logo:string;logoPos:'left'|'center'|'right';logoH:number;logoHdr:boolean;conf:string;hdr:boolean;ftr:boolean;hdrL:string;hdrR:string;ftrL:string;ftrR:string;wm:string;stats:boolean;intro:string;introT:string;sign:boolean;signT:string;signTx:string;ov:boolean;behav:boolean;cmts:boolean;dens:'compact'|'normal'|'roomy';shot:number;rad:number;shadow:boolean;cols:string[];coverImg:string;coverOv:number}
export const RC0:RepCfg={accent:'#111827',ink:'#0F172A',font:'Inter',headFont:'Inter',cover:'classic',title:'',sub:'',kick:'Прототип сайта',client:'',author:'',role:'',contacts:'',agency:'',reqs:'',logo:'',logoPos:'left',logoH:52,logoHdr:false,conf:'',hdr:true,ftr:true,hdrL:'{name}',hdrR:'Версия {ver} · {date}',ftrL:'{agency}',ftrR:'Страница {page} из {total}',wm:'',stats:true,intro:'',introT:'О проекте',sign:false,signT:'Согласование',signTx:'Макеты и описание блоков рассмотрены и согласованы.',ov:true,behav:true,cmts:true,dens:'normal',shot:50,rad:6,shadow:true,cols:['n','type','text','xy','sz','f','go'],coverImg:'',coverOv:75};
export const FONTS:Record<string,string>={Inter:"Inter,'Segoe UI',Arial,sans-serif",Manrope:"Manrope,Inter,Arial,sans-serif",Montserrat:"Montserrat,Inter,Arial,sans-serif",'Playfair Display':"'Playfair Display',Georgia,'Times New Roman',serif",'Системный':"'Segoe UI',Roboto,Arial,sans-serif"};
const hx=(v:string,d:string)=>/^#[0-9a-fA-F]{3,8}$/.test(v)?v:d;
export const SIZES:Record<PageSize,{w:number;h:number;css:string;name:string}>={a4:{w:794,h:1122,css:'210mm 297mm',name:'A4'},letter:{w:816,h:1055,css:'8.5in 11in',name:'Letter'}};

const esc=(s:unknown)=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as Record<string,string>)[c]);
/** перенос по словам на строки не длиннее n знаков (длинное слово режется) */
export function wrapLines(t:string,n:number):string[]{const out:string[]=[];for(const raw of t.replace(/\r/g,'').split('\n')){let line='';for(let w of raw.split(/ +/)){while(w.length>n){if(line){out.push(line);line=''}out.push(w.slice(0,n));w=w.slice(n)}
if(!line)line=w;else if((line+' '+w).length<=n)line+=' '+w;else{out.push(line);line=w}}out.push(line)}return out}
const cut=(t:string,n:number)=>t.length>n?t.slice(0,n-1)+'…':t;
const TN:Record<string,string>={text:'Текст',rect:'Блок',btn:'Кнопка',input:'Поле',img:'Картинка',line:'Линия',shape:'Фигура',icon:'Иконка',mock:'Мокап',list:'Список',cmp:'Компон.'};
const RN:Record<string,string>=Object.fromEntries(ROLES);
const typeName=(e:El)=>e.t==='text'&&e.role&&RN[e.role]?RN[e.role]:TN[e.t]||e.t;
const reqTxt=(b:Block)=>b.req==='opt'?'опционально':'обязательно';

/** элементы блока на устройстве; квиз берётся из настроек квиза */
const geo=(b:Block,d:Dev):{h:number;els:El[]}=>{if(b.quiz){const o=quizFrame(b.quiz,{pos:0,ans:[],phone:'',consent:true,err:'',li:0},d);return{h:o.h,els:o.els}}return{h:b.h[d],els:b.els[d].filter(e=>!e.hid)}};

const elHtml=(e0:El,p:Project,ty:ReturnType<typeof getUi>['ty'])=>{const rich=isRich(e0);const e=e0.text?{...e0,text:typo(e0.text,ty)}:e0;const r=resolve(e,p.style);const a=e.t==='line'?'':artHtml(e);
const st='left:'+e.x+'px;top:'+(e.t==='line'?e.y-6:e.y)+'px;width:'+e.w+'px;height:'+(e.t==='line'?12:e.h)+'px;'+(r.fs?'font-size:'+r.fs+'px;':'')+(r.b?'font-weight:700;':'')+(e.al==='c'?'text-align:center;justify-content:center;':e.al==='r'?'text-align:right;justify-content:flex-end;':'')+styleCss(e0,p.style);
return'<div class="el '+e.t+'" style="'+st+'">'+(e.t==='line'?'<i'+lineAttr(e)+'></i>':rich?richHtml(e0,{tf:q=>typo(q,ty)}):a||esc(r.text))+'</div>'};
/** снимок блока или нескольких блоков подряд, масштаб k */
const shot=(bs:Block[],d:Dev,k:number,p:Project,w=FW[d])=>{const ty=getUi().ty;const nums=cmNums(p.sheets.flatMap(x=>x.blocks));let y=0;let inner='';const ys:number[]=[];for(const b of bs){const g=geo(b,d);ys.push(y);inner+=g.els.map(e=>elHtml({...e,y:e.y+y},p,ty)).join('')+(b.cmt??[]).filter(c=>c.dev===d).map(c=>'<i class="cmk'+(c.done?' dn':'')+'" style="left:'+c.x+'px;top:'+(y+c.y)+'px">'+(nums.get(c.id)??'')+'</i>').join('');y+=g.h}
return{h:y*k,ys,html:'<div class="fw" style="width:'+w*k+'px;height:'+y*k+'px"><div class="fi" style="width:'+w+'px;height:'+y+'px;zoom:'+k+'">'+inner+'</div></div>'}};

interface Atom{h:number;html:string;blk?:string;kw?:boolean;grp?:string}

export function buildReport(p:Project,o:ReportOpts):string{
const S=SIZES[o.size];const ui=getUi();const ty=ui.ty;const ag=ui.ag;const date=new Date().toLocaleDateString('ru-RU');
const C:RepCfg={...RC0,...(o.cfg||{})};const ACC=hx(C.accent,RC0.accent),INK=hx(C.ink,RC0.ink);const M=C.dens==='compact'?36:C.dens==='roomy'?60:48;const agC=(C.agency||ag.n||'').trim();const agN=agC||'Прототип';const logoSrc=C.logo||ag.l||'';
const TCOL:[string,string,string][]=[['n','№','26px'],['type','Тип','64px'],['text','Текст','1fr'],['xy','X · Y','74px'],['sz','Ш × В','74px'],['f','Шрифт, цвет','112px'],['go','Переход','78px']];
const tcs=TCOL.filter(c=>c[0]==='text'||(Array.isArray(C.cols)?C.cols:RC0.cols).includes(c[0]));const TBL_COLS=tcs.map(c=>c[2]).join(' ');
const tblHead:Atom={h:24,html:'<div class="tr th" style="grid-template-columns:'+TBL_COLS+'">'+tcs.map(c=>'<span>'+c[1]+'</span>').join('')+'</div>',grp:'tbl'};
const cw=S.w-2*M,ch=S.h-64-52;const dn=DEVN[o.dev];const T=(t:string)=>typo(t,ty);
const sheets=p.sheets.filter(s=>!o.sheets||o.sheets.includes(s.id));const sname:Record<string,string>={};for(const s of p.sheets){sname[s.id]=s.name;for(const b of s.blocks)sname[b.id]=b.title}
const lines=(t:string,n=Math.floor(cw/7.8))=>wrapLines(t,n);
/** ===== содержимое: атомы, каждый блок с новой страницы ===== */
const pages:{html:string;pre:string}[]=[];
const cap=(t:string)=>({h:28,kw:true,html:'<h4>'+esc(t)+'</h4>'});
const nums=cmNums(p.sheets.flatMap(x=>x.blocks));
const block=(b:Block,s:{name:string;kind:string},i:number):Atom[][]=>{
const a:Atom[]=[];const g=geo(b,o.dev);const els=g.els;const id=b.id;
const maxH=Math.min(ch*Math.min(85,Math.max(25,C.shot))/100,ch-120);const k=Math.min(cw/FW[o.dev],maxH/Math.max(1,g.h),1);const sh=shot([b],o.dev,k,p);
const sub=[(s.kind==='popup'?'Попап':'Страница')+' «'+s.name+'»',dn+' '+FW[o.dev]+' px',reqTxt(b)].concat(b.sv?.tab?['вкладка '+(b.sv.i+1)+' из '+b.sv.n]:[]).join(' · ');
a.push({h:58,blk:id,html:'<div class="bh"><span class="bn">'+(i+1)+'</span><div><h3>'+esc(T(b.title))+'</h3><p>'+esc(sub)+'</p></div><i class="st '+(b.req==='opt'?'opt':'req')+'">'+reqTxt(b)+'</i></div>'});
a.push({h:Math.ceil(sh.h)+16,blk:id,html:'<div class="shot">'+sh.html+'</div>'});
/* параметры блока */
if(o.params!==false){const kv:[string,string][]=[['Высота блока',(['desktop','tablet','mobile'] as Dev[]).filter(d=>!b.dv||b.dv.includes(d)).map(d=>DEVN[d]+' '+geo(b,d).h+' px').join(' · ')],['Показывается на',b.dv?b.dv.map(d=>DEVN[d]).join(', '):'всех устройствах'],['Статус в ТЗ',reqTxt(b)]];
if(b.bg)kv.push(['Фон блока',b.bg]);if(b.pd)kv.push(['Отступы блока','сверху '+b.pd[0]+' px, снизу '+b.pd[1]+' px']);if(b.goal?.trim())kv.push(['Задача текста',T(b.goal.trim())]);
if(b.quiz)kv.push(['Тип блока','квиз: '+b.quiz.steps.length+' вопросов, шаги показаны в таблице элементов']);
a.push(cap('Параметры блока'));
for(const [kk,v] of kv){const L=lines(v,Math.floor((cw-170)/7.4));a.push({h:L.length*17+7,blk:id,html:'<div class="kv"><b>'+esc(kk)+'</b><span>'+L.map(esc).join('<br>')+'</span></div>'})}
/* поведение на устройствах */
if(C.behav){a.push(cap('Поведение на устройствах'));
a.push({h:24,blk:id,kw:true,html:'<div class="tr th" style="grid-template-columns:1fr 90px 90px 90px"><span>Устройство</span><span>Ширина</span><span>Высота</span><span>Элементов</span></div>'});
for(const d of ['desktop','tablet','mobile'] as Dev[]){const on=!b.dv||b.dv.includes(d);const gd=geo(b,d);a.push({h:24,blk:id,html:'<div class="tr" style="grid-template-columns:1fr 90px 90px 90px"><span>'+DEVN[d]+(on?'':' · блок скрыт')+'</span><span>'+FW[d]+' px</span><span>'+(on?gd.h+' px':'—')+'</span><span>'+(on?gd.els.length:'—')+'</span></div>'})}}
}
/* тексты */
const tx=els.filter(e=>e.text&&e.t!=='line'&&e.t!=='img').slice().sort((q,r)=>q.y-r.y||q.x-r.x);
if(o.texts!==false&&tx.length){a.push(cap('Тексты блока'));for(const e of tx){const L=lines('['+typeName(e)+'] '+T(e.text),Math.floor(cw/7.2));L.forEach((l,j)=>a.push({h:17,blk:id,kw:j<L.length-1,html:'<div class="ln">'+(j?'&nbsp;&nbsp;&nbsp;':'')+esc(l)+'</div>'}))}}
if(o.notes&&b.text.trim()){a.push(cap('Заметки и пожелания'));for(const l of lines(b.text.trim()))a.push({h:17,blk:id,html:'<div class="ln nn">'+esc(l)+'</div>'})}
/* комментарии */
const cms=C.cmts?(b.cmt??[]):[];if(cms.length){a.push(cap('Комментарии'));for(const c of cms){const L=lines('№'+(nums.get(c.id)??'')+' · '+DEVN[c.dev]+' · '+(c.done?'решено':'открыто')+': '+c.msgs.map(m=>(m.by||'Автор')+': '+m.text).join(' → '),Math.floor(cw/7.2));L.forEach((l,j)=>a.push({h:17,blk:id,kw:j<L.length-1,html:'<div class="ln'+(c.done?' dn':'')+'">'+(j?'&nbsp;&nbsp;&nbsp;':'')+esc(l)+'</div>'}))}}
/* таблица характеристик */
if(o.table!==false&&els.length){a.push(cap('Таблица характеристик элементов'));a.push({...tblHead,blk:id});
els.slice().sort((q,r)=>q.y-r.y||q.x-r.x).forEach((e0,j)=>{const e=resolve(e0,p.style);const f=[e.fs?e.fs+' px':'',e.b?'жирный':'',e.al==='c'?'центр':e.al==='r'?'справа':'',e.c||e.fill||''].filter(Boolean).join(' · ')||'—';
const lki=linkInfo(linkOf(e0),sname);const go=lki?'→ '+cut(lki.short,9):e0.tg?'вкладка':'—';
a.push({h:24,blk:id,grp:'tbl',html:'<div class="tr" style="grid-template-columns:'+TBL_COLS+'">'+tcs.map(c=>'<span>'+({n:String(j+1),type:esc(typeName(e0)),text:esc(cut(T(e0.text||''),44)||'—'),xy:Math.round(e0.x)+' · '+Math.round(e0.y),sz:Math.round(e0.w)+' × '+Math.round(e0.h),f:esc(cut(f,22)),go:esc(go)} as Record<string,string>)[c[0]]+'</span>').join('')+'</div>'})})}
return[a]};
/** раскладка атомов по страницам */
const place=(atoms:Atom[],titles:Record<string,string>,start:number,tok:Record<string,number>)=>{let cur:string[]=[];let used=0;let prevBlk='';const flush=()=>{if(cur.length)pages.push({html:cur.join(''),pre:''});cur=[];used=0};
for(let n=0;n<atoms.length;n++){const at=atoms[n];const nx=at.kw?atoms[n+1]:undefined;const need=at.h+(nx?nx.h:0);
const newBlk=at.blk!==prevBlk&&!!at.blk&&!!(n===0||atoms[n-1].blk!==at.blk);
if(newBlk){flush();if(at.blk)tok[at.blk]=pages.length+start}
else if(used+need>ch&&cur.length){flush();if(at.blk){cur.push('<div class="cont">'+esc(T(titles[at.blk]||''))+' · продолжение</div>');used+=26}if(at.grp==='tbl'&&at.html!==tblHead.html){cur.push(tblHead.html);used+=24}}
cur.push(at.html);used+=at.h;if(at.blk)prevBlk=at.blk}
flush()};
const tok:Record<string,number>={};const titles:Record<string,string>={};
const sheetStart:Record<string,number>={};
/** сначала экраны, их номера страниц нужны оглавлению: считаем смещение позже */
const ovPages:string[]=[];const bsMap=new Map<string,Block[]>();
const pagesFor=(s:{name:string;kind:string},bs:Block[]):string[]=>{const avail=ch-84;const k0=Math.min(1,(cw-40)/FW[o.dev]);const hs=bs.map(b=>geo(b,o.dev).h);const groups:number[][]=[];let cur:number[]=[];let used=0;
bs.forEach((_b,i)=>{const h=hs[i]*k0;if(cur.length&&used+h>avail){groups.push(cur);cur=[];used=0}cur.push(i);used+=h});if(cur.length)groups.push(cur);
const head=(n:number,m:number)=>'<div class="sh"><h2>'+(s.kind==='popup'?'Попап':'Страница')+': '+esc(T(s.name))+'</h2><p class="muted">'+dn+' '+FW[o.dev]+' px · блоков: '+bs.length+(m>1?' · часть '+n+' из '+m:'')+'</p>';
if(!groups.length)return[head(1,1)+'<p class="muted" style="margin-top:24px">На этом устройстве блоков нет.</p></div>'];
return groups.map((g,gi)=>{const sub=g.map(i=>bs[i]);const sum=g.reduce((q,i)=>q+hs[i],0);const k=Math.min(k0,avail/Math.max(1,sum));const sh=shot(sub,o.dev,k,p);
const badges=sub.map((_b,j)=>'<i class="mb" style="top:'+Math.round(sh.ys[j]*k)+'px">'+(g[j]+1)+'</i>').join('');
const leg=sub.map((b,j)=>'<span><b>'+(g[j]+1)+'</b> '+esc(cut(T(b.title),34))+'</span>').join('');
return head(gi+1,groups.length)+'<div class="pgw"><div class="map" style="width:'+Math.round(FW[o.dev]*k)+'px;height:'+Math.round(sh.h)+'px">'+sh.html+badges+'</div></div><div class="leg">'+leg+'</div></div>'})};

for(const s of sheets){const bs=s.blocks.filter(b=>!b.dv||b.dv.includes(o.dev));
/* обзор экрана */
const mapW=Math.min(360,cw*.5);const k=Math.min(mapW/FW[o.dev],(ch-90)/Math.max(1,bs.reduce((q,b)=>q+geo(b,o.dev).h,0)),.6);const sh=shot(bs,o.dev,k,p);
const badges=bs.map((_b,i)=>'<i class="mb" style="top:'+Math.round(sh.ys[i]*k)+'px">'+(i+1)+'</i>').join('');
const rows=bs.slice(0,Math.floor((ch-60)/30)).map((b,i)=>{titles[b.id]=b.title;return'<div class="orow"><span class="bn s">'+(i+1)+'</span><b>'+esc(T(b.title))+'</b><i class="st '+(b.req==='opt'?'opt':'req')+'">'+reqTxt(b)+'</i><em>стр. \u0001'+b.id+'\u0001</em></div>'}).join('');
const more=bs.length>Math.floor((ch-60)/30)?'<p class="muted">Ещё блоков: '+(bs.length-Math.floor((ch-60)/30))+'. Полный список в оглавлении.</p>':'';
for(const b of bs)titles[b.id]=b.title;
if(o.mode!=='pages'&&C.ov)ovPages.push('<div class="sh"><h2>'+(s.kind==='popup'?'Попап':'Страница')+': '+esc(T(s.name))+'</h2><p class="muted">'+dn+' '+FW[o.dev]+' px · блоков: '+bs.length+'</p><div class="ovw"><div class="map" style="width:'+Math.round(FW[o.dev]*k)+'px;height:'+Math.round(sh.h)+'px">'+(bs.length?sh.html+badges:'')+'</div><div class="ovl">'+(bs.length?rows+more:'<p class="muted">На этом устройстве блоков нет.</p>')+'</div></div></div>');
bsMap.set(s.id,bs)}
/* оглавление и страница стиля идут перед экранами */
const entries:{l:string;t:string;id:string;sub?:boolean}[]=o.style===false?[]:[{l:'Стиль проекта',t:'style',id:'style'}];
const introL=C.intro.trim()?wrapLines(T(C.intro.trim()),Math.floor(cw/8.2)):[];const iPer=Math.floor((ch-80)/21);const introPg=introL.length?Math.ceil(introL.length/iPer):0;
if(introL.length)entries.unshift({l:C.introT||'О проекте',t:'style',id:'intro'});
for(const s of sheets){entries.push({l:(s.kind==='popup'?'Попап: ':'')+s.name,t:'sheet',id:'sh:'+s.id});if(o.mode!=='pages')for(const b of bsMap.get(s.id)!)entries.push({l:b.title,t:'blk',id:b.id,sub:true})}
if(C.sign)entries.push({l:C.signT||'Согласование',t:'style',id:'sign'});
const per1=Math.floor((ch-64)/26),perN=Math.floor((ch-24)/26);let tocN=1;if(entries.length>per1)tocN+=Math.ceil((entries.length-per1)/perN);
const t0=2+(o.toc===false?0:tocN);const first=t0+introPg; /* номер страницы «Стиль проекта» */
const num:Record<string,number>={style:first,intro:t0};let pg=first+(o.style===false?0:1);
const body:string[]=[];
/* раскладка экранов: считаем страницы по очереди */
const all:{html:string}[]=[];
for(let i=0;i<sheets.length;i++){const s=sheets[i];num['sh:'+s.id]=pg;const bs=bsMap.get(s.id)!;
if(o.mode==='pages'){for(const h of pagesFor(s,bs)){all.push({html:h});pg++}continue}
if(C.ov){all.push({html:ovPages[i]});pg++}
const atoms:Atom[]=[];bs.forEach((b,j)=>atoms.push(...block(b,s,j)[0]));
const before=pages.length;place(atoms,titles,0,tok);const made=pages.splice(before);
/* tok хранит индекс в pages; пересчитываем номера по порядку */
let q=0;for(const b of bs){const idx=tok[b.id]-before;num[b.id]=pg+idx;q++}
for(const m of made){all.push({html:m.html});pg++}}
if(C.sign){num.sign=pg;pg++}const total=pg-1;void body;
/* style page */
const pal=p.style.palette.map(c=>'<div class="sw"><i style="background:'+esc(c)+'"></i><span>'+esc(c)+'</span></div>').join('');
const roles=(Object.keys(p.style.roles) as (keyof typeof p.style.roles)[]).map(r=>'<div class="tr" style="grid-template-columns:1fr 100px 100px"><span>'+esc(RN[r]||r)+'</span><span>'+p.style.roles[r].fs+' px</span><span>'+(p.style.roles[r].b?'жирный':'обычный')+'</span></div>').join('');
const stylePage='<div class="sh"><h2>Стиль проекта</h2><p class="muted">Шрифты и размеры текста, единые для всех экранов. Прототип чёрно-белый: цвета и оформление появятся на этапе дизайна.</p><h4>Шрифты</h4><div class="tr" style="grid-template-columns:1fr 1fr"><span>Заголовки: <b>'+esc(p.style.head)+'</b></span><span>Текст: <b>'+esc(p.style.body)+'</b></span></div><h4>Размеры текста</h4><div class="tr th" style="grid-template-columns:1fr 100px 100px"><span>Роль</span><span>Размер</span><span>Начертание</span></div>'+roles+'<h4>Ширина экрана</h4><div class="tr" style="grid-template-columns:1fr 1fr 1fr"><span>ПК: '+FW.desktop+' px</span><span>Планшет: '+FW.tablet+' px</span><span>Мобилка: '+FW.mobile+' px</span></div></div>';
/* оглавление */
const tocRow=(e:typeof entries[number])=>'<div class="toc'+(e.t==='sheet'?' top':e.sub?' sub':'')+'"><span>'+esc(T(e.l))+'</span><i></i><b>'+(num[e.id]??'')+'</b></div>';
const tocPages:string[]=[];for(let i=0,n=0;i<Math.max(entries.length,1);n++){const c=n?perN:per1;tocPages.push((n?'':'<h2>Оглавление</h2>')+entries.slice(i,i+c).map(tocRow).join(''));i+=c}
/* обложка */
const logo=logoSrc?'<img class="lg" src="'+esc(logoSrc)+'" alt="">':'';
const allBs=sheets.flatMap(x=>bsMap.get(x.id)!);const nEl=allBs.reduce((q,b)=>q+geo(b,o.dev).els.length,0);const nCm=allBs.reduce((q,b)=>q+(b.cmt??[]).filter(c=>!c.done).length,0);
const stat=(n:number|string,l:string)=>'<div class="stc"><b>'+n+'</b><span>'+l+'</span></div>';
const rqT=(C.reqs.trim()||ag.r||'').trim();
const ttl=T(C.title.trim()||p.name);const tcls=ttl.length>70?'t3':ttl.length>38?'t2':'';
const col=(l:string,v:string)=>v.trim()?'<div class="rc"><em>'+l+'</em>'+esc(v.trim()).replace(/\n/g,'<br>')+'</div>':'';
const bot=col('Заказчик',C.client)+col('Исполнитель',[C.author,C.role,C.contacts].filter(x=>x.trim()).join('\n'))+col('Реквизиты',rqT);
const cover='<div class="cov c-'+C.cover+'">'+(C.cover==='band'?'<div class="cvb"></div>':'')+(C.coverImg?'<img class="cvi" src="'+esc(C.coverImg)+'" alt=""><div class="cvo" style="opacity:'+Math.min(100,Math.max(0,C.coverOv))/100+';background:'+(C.cover==='dark'||C.cover==='band'?'var(--ac)':'#fff')+'"></div>':'')+(C.conf.trim()?'<i class="cf">'+esc(C.conf.trim())+'</i>':'')+'<div class="ag lp-'+C.logoPos+'">'+logo+(agC?'<b>'+esc(agC)+'</b>':'')+'</div><div class="hc"><p class="kick">'+esc(C.kick)+'</p><h1 class="'+tcls+'">'+esc(ttl)+'</h1>'+(C.sub.trim()?'<p class="sb">'+esc(T(C.sub.trim()))+'</p>':'')+'<div class="rule"></div><p class="vd">Версия '+esc(o.ver)+' · '+date+' · '+dn+', '+FW[o.dev]+' px</p></div>'+(C.stats?'<div class="stats">'+stat(sheets.length,sheets.length===1?'экран':'экранов')+stat(allBs.length,'блоков')+(o.mode==='pages'?'':stat(nEl,'элементов')+stat(nCm,'открытых комментариев'))+'</div>':'')+(bot?'<div class="rq">'+bot+'</div>':'')+'</div>';
const introPages=introL.length?Array.from({length:introPg},(_,i)=>(i?'':'<h2>'+esc(C.introT||'О проекте')+'</h2>')+'<div class="ip">'+introL.slice(i*iPer,(i+1)*iPer).map(l=>'<p>'+(esc(l)||'&nbsp;')+'</p>').join('')+'</div>'):[];
const sg=(t:string,n:string)=>'<div class="sg"><h4>'+t+'</h4><b>'+esc(n||'—')+'</b><div class="sl"><span>Подпись</span></div><div class="sl"><span>ФИО</span></div><div class="sl"><span>Дата</span></div></div>';
const signPage='<h2>'+esc(C.signT||'Согласование')+'</h2><p class="muted" style="margin-top:14px;max-height:90px;overflow:hidden">'+esc(C.signTx)+'</p><div class="sgs">'+sg('Исполнитель',C.author||agC)+sg('Заказчик',C.client)+'</div>';
const tk=(t:string,n:number)=>esc(t.replace(/\{(\w+)\}/g,(_m,k:string)=>({name:ttl,ver:o.ver,date,author:C.author,client:C.client,agency:agN,page:String(n),total:String(total)} as Record<string,string>)[k]??''));
const hlg=C.logoHdr&&logoSrc?'<img class="hl" src="'+esc(logoSrc)+'" alt="">':'';
const pgs:string[]=[];const wrap=(inner:string,n:number,cov?:boolean)=>'<div class="pg'+(cov?' pcv':'')+'">'+(cov||!C.hdr?'':'<div class="hd"><span>'+hlg+tk(C.hdrL,n)+'</span><span>'+tk(C.hdrR,n)+'</span></div>')+(cov||!C.wm.trim()?'':'<div class="wm">'+esc(C.wm.trim())+'</div>')+'<div class="in">'+inner+'</div>'+(cov||!C.ftr?'':'<div class="ft"><span>'+tk(C.ftrL,n)+'</span><span>'+tk(C.ftrR,n)+'</span></div>')+'</div>';
let pn=2;pgs.push(wrap(cover,1,true));if(o.toc!==false)tocPages.forEach(t=>pgs.push(wrap(t,pn++)));introPages.forEach(h=>pgs.push(wrap(h,pn++)));if(o.style!==false)pgs.push(wrap(stylePage,pn++));all.forEach(a=>pgs.push(wrap(a.html,pn++)));if(C.sign)pgs.push(wrap(signPage,pn++));
let out=pgs.join('');out=out.replace(/\u0001([^\u0001]+)\u0001/g,(_m,id:string)=>String(num[id]??''));
const css=`@page{size:${S.css};margin:0}:root{--ac:${ACC};--ink:${INK};--fb:${FONTS[C.font]||FONTS.Inter};--fh:${FONTS[C.headFont]||FONTS.Inter};--rd:${Math.min(20,Math.max(0,C.rad))}px;--shd:${C.shadow?'0 8px 24px rgba(15,23,42,.14)':'none'}}html,body,body[data-mode=report]{background:#E8EAEE;padding:0}body{margin:0;font:12px/17px var(--fb);color:#1E293B;-webkit-print-color-adjust:exact;print-color-adjust:exact}.pg{position:relative;width:${S.w}px;height:${S.h}px;margin:0 auto 18px;background:#fff;overflow:hidden;contain:layout paint;page-break-after:always;break-after:page;box-shadow:0 6px 24px rgba(15,23,42,.14)}.fw{position:relative;overflow:hidden}.fi{transform:none}
.hd{position:absolute;left:${M}px;right:${M}px;top:24px;height:22px;display:flex;justify-content:space-between;font-size:10.5px;color:#64748B;border-bottom:1px solid #E2E8F0;line-height:18px}.hd span:first-child{font-weight:600;color:var(--ink)}.ft{position:absolute;left:${M}px;right:${M}px;bottom:20px;height:22px;display:flex;justify-content:space-between;font-size:10.5px;color:#64748B;border-top:1px solid #E2E8F0;padding-top:4px}.ft span:last-child{font-weight:600;color:var(--ac)}
.in{position:absolute;left:${M}px;top:64px;width:${cw}px;height:${ch}px;overflow:hidden}.pcv .in{left:0;top:0;width:${S.w}px;height:${S.h}px}
h1{font:700 44px/52px var(--fh);margin:8px 0 18px;color:var(--ac);letter-spacing:-.02em}h2{font:700 26px/32px var(--fh);margin:0 0 4px;color:var(--ink);letter-spacing:-.01em}h2::after{content:"";display:block;width:44px;height:4px;border-radius:4px;background:var(--ac);margin-top:6px}h3{font:700 18px/24px var(--fh);margin:0;color:var(--ink)}h4{font:700 11px/28px var(--fh);margin:0;color:var(--ac);text-transform:uppercase;letter-spacing:.08em;height:28px}
.muted{color:#64748B;margin:0}.cov{position:relative;height:100%;box-sizing:border-box;background:#fff;padding:64px;border-top:14px solid var(--ac)}.cov .ag{display:flex;align-items:center;gap:16px;height:${Math.min(120,Math.max(20,C.logoH))+4}px}.cov .ag b{font-size:18px}.lg{max-height:${Math.min(120,Math.max(20,C.logoH))}px;max-width:220px;object-fit:contain}.hc{position:absolute;left:64px;right:64px;top:28%}.kick{margin:0;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#64748B;font-weight:600}.hc h1{margin:10px 0 22px}.rule{width:88px;height:6px;background:var(--ac);margin-bottom:20px}.vd{margin:0;font-size:14px;color:#475569}
.stats{position:absolute;left:64px;right:64px;top:58%;display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:14px}.stc{border:1.5px solid var(--ac);border-radius:calc(var(--rd)*1.5);padding:14px}.stc b{display:block;font-size:30px;line-height:34px;color:var(--ac)}.stc span{display:block;font-size:11px;color:#64748B;line-height:14px;margin-top:2px}
.rq{position:absolute;left:64px;right:64px;bottom:48px;max-height:130px;overflow:hidden;color:#475569;font-size:11px;line-height:16px;border-top:1.5px solid var(--ac);padding-top:12px}
.pgw{display:flex;justify-content:center;padding:22px 0 0}.leg{display:flex;flex-wrap:wrap;gap:4px 18px;margin-top:14px;padding-top:10px;border-top:1px solid #E2E8F0;font-size:10.5px;line-height:15px;color:#475569;max-height:44px;overflow:hidden}.leg b{display:inline-block;min-width:16px;height:16px;line-height:16px;text-align:center;border-radius:50%;background:var(--ac);color:#fff;font-size:9.5px}
.toc{display:flex;align-items:baseline;gap:6px;height:26px;line-height:26px;overflow:hidden;white-space:nowrap}.toc i{flex:1;border-bottom:1px dotted #94A3B8;transform:translateY(-4px)}.toc b{color:var(--ac)}.toc.top{font-weight:700;color:var(--ink);border-top:1px solid #F1F5F9}.toc.sub{padding-left:22px;color:#475569}.toc span{overflow:hidden;text-overflow:ellipsis;max-width:80%}
.sh{height:100%}.pal{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px}.sw i{display:block;height:64px;border:1px solid #CBD5E1;border-radius:12px;box-shadow:0 2px 6px rgba(15,23,42,.08)}.sw span{font:600 11px/20px 'JetBrains Mono',monospace;color:#475569}
.tr{display:grid;gap:8px;height:24px;line-height:24px;border-bottom:1px solid #E2E8F0;font-size:11px;overflow:hidden;white-space:nowrap}.tr span{overflow:hidden;text-overflow:ellipsis}.tr.th{font-weight:700;color:#fff;background:var(--ac);padding:0 6px;font-size:10.5px;letter-spacing:.03em;border-radius:6px 6px 0 0;border-bottom:0}.tr:not(.th){padding:0 6px}.tr:not(.th):nth-child(even){background:#F8FAFC}
.bh{display:flex;align-items:center;gap:12px;height:50px;margin-bottom:8px}.bh>div{flex:1;min-width:0}.bh h3{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bh p{margin:0;color:#64748B;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bn{flex:none;width:34px;height:34px;border-radius:50%;background:var(--ac);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;box-shadow:0 4px 10px rgba(15,23,42,.2)}.bn.s{width:24px;height:24px;font-size:11px;box-shadow:none}
.st{flex:none;font-style:normal;font-size:10.5px;font-weight:600;padding:0 10px;height:22px;line-height:22px;border-radius:999px;border:1px solid #CBD5E1}.st.req{background:var(--ac);border-color:var(--ac);color:#fff}.st.opt{background:#F1F5F9;color:#64748B}
.shot{padding-bottom:16px;display:flex;justify-content:center}.shot .fw{margin:0;border:1px solid #CBD5E1;border-radius:var(--rd);overflow:hidden;box-shadow:var(--shd)}.kv{display:grid;grid-template-columns:150px 1fr;gap:12px;border-bottom:1px solid #E2E8F0;padding:3px 6px;font-size:11.5px}.kv b{color:var(--ac)}
.ln{height:17px;white-space:nowrap;overflow:hidden;font-size:12px}.ln.nn{color:#334155}.ln.dn{color:#94A3B8;text-decoration:line-through}.cont{height:26px;line-height:22px;font-size:11px;color:#64748B}
.ovw{display:flex;gap:28px;margin-top:20px}.map{position:relative;flex:none;border:1px solid #CBD5E1;border-radius:var(--rd);overflow:visible;box-shadow:var(--shd)}.map .fw{margin:0;box-shadow:none;border:0}.mb{position:absolute;left:-12px;width:22px;height:22px;border-radius:50%;background:var(--ac);color:#fff;font:700 10px/22px var(--fh);text-align:center;font-style:normal;box-shadow:0 2px 6px rgba(15,23,42,.25)}
.ovl{flex:1;min-width:0}.orow{display:flex;align-items:center;gap:10px;height:30px;overflow:hidden;border-bottom:1px solid #F1F5F9}.orow b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.orow em{font-style:normal;color:var(--ac);font-weight:600;font-size:11px;flex:none}

.ag{position:relative;z-index:1}.ag.lp-center{justify-content:center}.ag.lp-right{justify-content:flex-end}.hl{height:16px;max-width:90px;object-fit:contain;vertical-align:middle;margin-right:8px}.hd span,.ft span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:62%}
.hc h1{max-height:170px;overflow:hidden;word-break:break-word}.hc h1.t2{font-size:36px;line-height:42px}.hc h1.t3{font-size:28px;line-height:34px}.sb{margin:-8px 0 18px;font-size:16px;line-height:22px;color:#475569;max-height:66px;overflow:hidden}.hc,.stats,.rq{z-index:1}
.rq{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px 24px;max-height:150px}.rc{min-width:0;overflow:hidden;word-break:break-word}.rc em{display:block;font-style:normal;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ac);font-weight:700}
.cf{position:absolute;z-index:1;right:64px;top:30px;font-style:normal;font-size:10px;letter-spacing:.12em;text-transform:uppercase;border:1.5px solid currentColor;padding:2px 10px;border-radius:999px;color:var(--ac);max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.c-center .hc{text-align:center}.c-center .rule{margin-left:auto;margin-right:auto}.c-center .ag{justify-content:center}.c-center .stc{text-align:center}
.cvb{position:absolute;left:0;right:0;top:0;height:46%;background:var(--ac)}.c-band .hc *,.c-band .ag b,.c-band .cf{color:#fff}.c-band .rule{background:#fff}.c-band .cov,.c-band{border-top-width:0}
.c-dark{background:var(--ac);color:#fff;border-top-width:0}.c-dark .hc *,.c-dark .ag b,.c-dark .cf,.c-dark .rc{color:#fff}.c-dark .rule{background:#fff}.c-dark .stc{border-color:rgba(255,255,255,.7)}.c-dark .stc b{color:#fff}.c-dark .stc span,.c-dark .rc em{color:rgba(255,255,255,.75)}.c-dark .rq{border-top-color:rgba(255,255,255,.6)}
.c-dark .lg,.c-band .lg{background:#fff;padding:8px 12px;border-radius:8px;box-sizing:content-box}
.wm{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%) rotate(-30deg);text-align:center;font:700 96px/1 var(--fh);color:var(--ink);opacity:.055;letter-spacing:.05em;white-space:nowrap;pointer-events:none;text-transform:uppercase}
.ip{margin-top:22px}.ip p{margin:0;height:21px;line-height:21px;font-size:13px;white-space:nowrap;overflow:hidden;color:#1E293B}
.sgs{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}.sg b{display:block;height:24px;line-height:24px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:14px}.sl{margin-top:36px;border-bottom:1px solid #64748B}.sl span{display:block;font-size:10px;color:#64748B;margin-top:30px}
.cvi,.cvo{position:absolute;left:0;top:0;width:100%;height:100%}.cvi{object-fit:cover}.c-band .cvi,.c-band .cvo{height:46%}
.pg,.shot,.bh,.kv,.tr{break-inside:avoid}img{max-width:100%}
@media print{html,body,body[data-mode=report]{background:#fff}.pg{margin:0;box-shadow:none}}`;
return`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(p.name)} · отчёт</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;700&family=Montserrat:wght@500;700&family=Playfair+Display:wght@500;700&family=JetBrains+Mono:wght@500;700&display=swap&subset=cyrillic" rel="stylesheet"><style>${BASE_CSS}</style><style>${css}${RICH_CSS}</style></head><body data-mode="report">${out}</body></html>`}
