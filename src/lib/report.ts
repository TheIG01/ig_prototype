/** PDF-отчёт для заказчика. Страницы фиксированного размера, поэтому номера в оглавлении точные.
 *  Разметка статическая (без скриптов): открывается в iframe для предпросмотра и печатается в PDF. */
import {isRich,richHtml,linkOf,linkInfo,RICH_CSS} from './rich';
import type {Project,Block,El} from '../store';
import {FW,DEVN} from './dev';import type {Dev} from './dev';
import {artHtml,resolve,styleCss,ROLES,lineAttr} from './art';import {quizFrame} from './quiz';import {typo} from './typo';import {getUi} from './ui';import {BASE_CSS} from './share';import {cmNums} from './comments';

export type PageSize='a4'|'letter';
export interface ReportOpts{size:PageSize;dev:Dev;notes:boolean;sheets?:string[];ver:string}
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
return{h:y*k,ys,html:'<div class="fw" style="width:'+w*k+'px;height:'+y*k+'px"><div class="fi" style="width:'+w+'px;height:'+y+'px;transform:scale('+k+')">'+inner+'</div></div>'}};

interface Atom{h:number;html:string;blk?:string;kw?:boolean;grp?:string}
const TBL_COLS='26px 64px 1fr 74px 74px 112px 78px';
const tblHead:Atom={h:24,html:'<div class="tr th" style="grid-template-columns:'+TBL_COLS+'"><span>№</span><span>Тип</span><span>Текст</span><span>X · Y</span><span>Ш × В</span><span>Шрифт, цвет</span><span>Переход</span></div>',grp:'tbl'};

export function buildReport(p:Project,o:ReportOpts):string{
const S=SIZES[o.size];const ui=getUi();const ty=ui.ty;const ag=ui.ag;const date=new Date().toLocaleDateString('ru-RU');
const lum=(h:string)=>{const m=/^#?([0-9a-f]{6})$/i.exec(h.trim());if(!m)return 1;const n=parseInt(m[1],16);return(.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255};
const ACC=(p.style.palette.find(c=>lum(c)<.62&&lum(c)>.08)||'#2F6BFF').trim();
const cw=S.w-96,ch=S.h-64-52;const dn=DEVN[o.dev];const T=(t:string)=>typo(t,ty);
const sheets=p.sheets.filter(s=>!o.sheets||o.sheets.includes(s.id));const sname:Record<string,string>={};for(const s of p.sheets){sname[s.id]=s.name;for(const b of s.blocks)sname[b.id]=b.title}
const lines=(t:string,n=Math.floor(cw/7.8))=>wrapLines(t,n);
/** ===== содержимое: атомы, каждый блок с новой страницы ===== */
const pages:{html:string;pre:string}[]=[];
const cap=(t:string)=>({h:28,kw:true,html:'<h4>'+esc(t)+'</h4>'});
const nums=cmNums(p.sheets.flatMap(x=>x.blocks));
const block=(b:Block,s:{name:string;kind:string},i:number):Atom[][]=>{
const a:Atom[]=[];const g=geo(b,o.dev);const els=g.els;const id=b.id;
const maxH=Math.min(ch*.5,520);const k=Math.min(cw/FW[o.dev],maxH/Math.max(1,g.h),1);const sh=shot([b],o.dev,k,p);
const sub=[(s.kind==='popup'?'Попап':'Страница')+' «'+s.name+'»',dn+' '+FW[o.dev]+' px',reqTxt(b)].concat(b.sv?.tab?['вкладка '+(b.sv.i+1)+' из '+b.sv.n]:[]).join(' · ');
a.push({h:58,blk:id,html:'<div class="bh"><span class="bn">'+(i+1)+'</span><div><h3>'+esc(T(b.title))+'</h3><p>'+esc(sub)+'</p></div><i class="st '+(b.req==='opt'?'opt':'req')+'">'+reqTxt(b)+'</i></div>'});
a.push({h:Math.ceil(sh.h)+16,blk:id,html:'<div class="shot">'+sh.html+'</div>'});
/* параметры блока */
const kv:[string,string][]=[['Высота блока',(['desktop','tablet','mobile'] as Dev[]).filter(d=>!b.dv||b.dv.includes(d)).map(d=>DEVN[d]+' '+geo(b,d).h+' px').join(' · ')],['Показывается на',b.dv?b.dv.map(d=>DEVN[d]).join(', '):'всех устройствах'],['Статус в ТЗ',reqTxt(b)]];
if(b.bg)kv.push(['Фон блока',b.bg]);if(b.pd)kv.push(['Отступы блока','сверху '+b.pd[0]+' px, снизу '+b.pd[1]+' px']);if(b.goal?.trim())kv.push(['Задача текста',T(b.goal.trim())]);
if(b.quiz)kv.push(['Тип блока','квиз: '+b.quiz.steps.length+' вопросов, шаги показаны в таблице элементов']);
a.push(cap('Параметры блока'));
for(const [kk,v] of kv){const L=lines(v,Math.floor((cw-170)/7.4));a.push({h:L.length*17+7,blk:id,html:'<div class="kv"><b>'+esc(kk)+'</b><span>'+L.map(esc).join('<br>')+'</span></div>'})}
/* поведение на устройствах */
a.push(cap('Поведение на устройствах'));
a.push({h:24,blk:id,kw:true,html:'<div class="tr th" style="grid-template-columns:1fr 90px 90px 90px"><span>Устройство</span><span>Ширина</span><span>Высота</span><span>Элементов</span></div>'});
for(const d of ['desktop','tablet','mobile'] as Dev[]){const on=!b.dv||b.dv.includes(d);const gd=geo(b,d);a.push({h:24,blk:id,html:'<div class="tr" style="grid-template-columns:1fr 90px 90px 90px"><span>'+DEVN[d]+(on?'':' · блок скрыт')+'</span><span>'+FW[d]+' px</span><span>'+(on?gd.h+' px':'—')+'</span><span>'+(on?gd.els.length:'—')+'</span></div>'})}
/* тексты */
const tx=els.filter(e=>e.text&&e.t!=='line'&&e.t!=='img').slice().sort((q,r)=>q.y-r.y||q.x-r.x);
if(tx.length){a.push(cap('Тексты блока'));for(const e of tx){const L=lines('['+typeName(e)+'] '+T(e.text),Math.floor(cw/7.2));L.forEach((l,j)=>a.push({h:17,blk:id,kw:j<L.length-1,html:'<div class="ln">'+(j?'&nbsp;&nbsp;&nbsp;':'')+esc(l)+'</div>'}))}}
if(o.notes&&b.text.trim()){a.push(cap('Заметки и пожелания'));for(const l of lines(b.text.trim()))a.push({h:17,blk:id,html:'<div class="ln nn">'+esc(l)+'</div>'})}
/* комментарии */
const cms=b.cmt??[];if(cms.length){a.push(cap('Комментарии'));for(const c of cms){const L=lines('№'+(nums.get(c.id)??'')+' · '+DEVN[c.dev]+' · '+(c.done?'решено':'открыто')+': '+c.msgs.map(m=>(m.by||'Автор')+': '+m.text).join(' → '),Math.floor(cw/7.2));L.forEach((l,j)=>a.push({h:17,blk:id,kw:j<L.length-1,html:'<div class="ln'+(c.done?' dn':'')+'">'+(j?'&nbsp;&nbsp;&nbsp;':'')+esc(l)+'</div>'}))}}
/* таблица характеристик */
if(els.length){a.push(cap('Таблица характеристик элементов'));a.push({...tblHead,blk:id});
els.slice().sort((q,r)=>q.y-r.y||q.x-r.x).forEach((e0,j)=>{const e=resolve(e0,p.style);const f=[e.fs?e.fs+' px':'',e.b?'жирный':'',e.al==='c'?'центр':e.al==='r'?'справа':'',e.c||e.fill||''].filter(Boolean).join(' · ')||'—';
const lki=linkInfo(linkOf(e0),sname);const go=lki?'→ '+cut(lki.short,9):e0.tg?'вкладка':'—';
a.push({h:24,blk:id,grp:'tbl',html:'<div class="tr" style="grid-template-columns:'+TBL_COLS+'"><span>'+(j+1)+'</span><span>'+esc(typeName(e0))+'</span><span>'+esc(cut(T(e0.text||''),44)||'—')+'</span><span>'+Math.round(e0.x)+' · '+Math.round(e0.y)+'</span><span>'+Math.round(e0.w)+' × '+Math.round(e0.h)+'</span><span>'+esc(cut(f,22))+'</span><span>'+esc(go)+'</span></div>'})})}
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
for(const s of sheets){const bs=s.blocks.filter(b=>!b.dv||b.dv.includes(o.dev));
/* обзор экрана */
const mapW=Math.min(300,cw*.42);const k=Math.min(mapW/FW[o.dev],(ch-90)/Math.max(1,bs.reduce((q,b)=>q+geo(b,o.dev).h,0)),.6);const sh=shot(bs,o.dev,k,p);
const badges=bs.map((_b,i)=>'<i class="mb" style="top:'+Math.round(sh.ys[i]*k)+'px">'+(i+1)+'</i>').join('');
const rows=bs.slice(0,Math.floor((ch-60)/30)).map((b,i)=>{titles[b.id]=b.title;return'<div class="orow"><span class="bn s">'+(i+1)+'</span><b>'+esc(T(b.title))+'</b><i class="st '+(b.req==='opt'?'opt':'req')+'">'+reqTxt(b)+'</i><em>стр. \u0001'+b.id+'\u0001</em></div>'}).join('');
const more=bs.length>Math.floor((ch-60)/30)?'<p class="muted">Ещё блоков: '+(bs.length-Math.floor((ch-60)/30))+'. Полный список в оглавлении.</p>':'';
for(const b of bs)titles[b.id]=b.title;
ovPages.push('<div class="sh"><h2>'+(s.kind==='popup'?'Попап':'Страница')+': '+esc(T(s.name))+'</h2><p class="muted">'+dn+' '+FW[o.dev]+' px · блоков: '+bs.length+'</p><div class="ovw"><div class="map" style="width:'+Math.round(FW[o.dev]*k)+'px;height:'+Math.round(sh.h)+'px">'+(bs.length?sh.html+badges:'')+'</div><div class="ovl">'+(bs.length?rows+more:'<p class="muted">На этом устройстве блоков нет.</p>')+'</div></div></div>');
bsMap.set(s.id,bs)}
/* оглавление и страница стиля идут перед экранами */
const entries:{l:string;t:string;id:string;sub?:boolean}[]=[{l:'Стиль проекта',t:'style',id:'style'}];
for(const s of sheets){entries.push({l:(s.kind==='popup'?'Попап: ':'')+s.name,t:'sheet',id:'sh:'+s.id});for(const b of bsMap.get(s.id)!)entries.push({l:b.title,t:'blk',id:b.id,sub:true})}
const per1=Math.floor((ch-64)/26),perN=Math.floor((ch-24)/26);let tocN=1;if(entries.length>per1)tocN+=Math.ceil((entries.length-per1)/perN);
const first=2+tocN; /* номер страницы «Стиль проекта» */
const num:Record<string,number>={style:first};let pg=first+1;
const body:string[]=[];
/* раскладка экранов: считаем страницы по очереди */
const all:{html:string}[]=[];
for(let i=0;i<sheets.length;i++){const s=sheets[i];num['sh:'+s.id]=pg;all.push({html:ovPages[i]});pg++;const bs=bsMap.get(s.id)!;
const atoms:Atom[]=[];bs.forEach((b,j)=>atoms.push(...block(b,s,j)[0]));
const before=pages.length;place(atoms,titles,0,tok);const made=pages.splice(before);
/* tok хранит индекс в pages; пересчитываем номера по порядку */
let q=0;for(const b of bs){const idx=tok[b.id]-before;num[b.id]=pg+idx;q++}
for(const m of made){all.push({html:m.html});pg++}}
const total=pg-1;void body;
/* style page */
const pal=p.style.palette.map(c=>'<div class="sw"><i style="background:'+esc(c)+'"></i><span>'+esc(c)+'</span></div>').join('');
const roles=(Object.keys(p.style.roles) as (keyof typeof p.style.roles)[]).map(r=>'<div class="tr" style="grid-template-columns:1fr 100px 100px"><span>'+esc(RN[r]||r)+'</span><span>'+p.style.roles[r].fs+' px</span><span>'+(p.style.roles[r].b?'жирный':'обычный')+'</span></div>').join('');
const stylePage='<div class="sh"><h2>Стиль проекта</h2><p class="muted">Единые значения для всех экранов. Дизайнер берёт их как основу.</p><h4>Палитра</h4><div class="pal">'+pal+'</div><h4>Шрифты</h4><div class="tr" style="grid-template-columns:1fr 1fr"><span>Заголовки: <b>'+esc(p.style.head)+'</b></span><span>Текст: <b>'+esc(p.style.body)+'</b></span></div><h4>Размеры текста</h4><div class="tr th" style="grid-template-columns:1fr 100px 100px"><span>Роль</span><span>Размер</span><span>Начертание</span></div>'+roles+'<h4>Ширина экрана</h4><div class="tr" style="grid-template-columns:1fr 1fr 1fr"><span>ПК: '+FW.desktop+' px</span><span>Планшет: '+FW.tablet+' px</span><span>Мобилка: '+FW.mobile+' px</span></div></div>';
/* оглавление */
const tocRow=(e:typeof entries[number])=>'<div class="toc'+(e.t==='sheet'?' top':e.sub?' sub':'')+'"><span>'+esc(T(e.l))+'</span><i></i><b>'+(num[e.id]??'')+'</b></div>';
const tocPages:string[]=[];for(let i=0,n=0;i<Math.max(entries.length,1);n++){const c=n?perN:per1;tocPages.push((n?'':'<h2>Оглавление</h2>')+entries.slice(i,i+c).map(tocRow).join(''));i+=c}
/* обложка */
const logo=ag.l?'<img class="lg" src="'+esc(ag.l)+'" alt="">':'';
const allBs=sheets.flatMap(x=>bsMap.get(x.id)!);const nEl=allBs.reduce((q,b)=>q+geo(b,o.dev).els.length,0);const nCm=allBs.reduce((q,b)=>q+(b.cmt??[]).filter(c=>!c.done).length,0);
const stat=(n:number|string,l:string)=>'<div class=\"stc\"><b>'+n+'</b><span>'+l+'</span></div>';
const swat=p.style.palette.slice(0,8).map(c=>'<i style=\"background:'+esc(c)+'\"></i>').join('');
const cover='<div class=\"cov\"><div class=\"hero\"><div class=\"ag\">'+logo+(ag.n?'<b>'+esc(ag.n)+'</b>':'')+'</div><div class=\"hc\"><p class=\"kick\">Прототип сайта · Для согласования</p><h1>'+esc(T(p.name))+'</h1><p class=\"vd\">Версия '+esc(o.ver)+' · '+date+' · '+dn+', '+FW[o.dev]+' px</p></div></div><div class=\"stats\">'+stat(sheets.length,'экранов')+stat(allBs.length,'блоков')+stat(nEl,'элементов')+stat(nCm,'открытых комментариев')+'</div><div class=\"cvs\"><div><span class=\"lb\">Палитра</span><div class=\"sws\">'+swat+'</div></div><div><span class=\"lb\">Шрифты</span><p>'+esc(p.style.head)+' · '+esc(p.style.body)+'</p></div></div><div class=\"rq\">'+esc(ag.r).replace(/\n/g,'<br>')+'</div></div>';
const header=`<div class="hd"><span>${esc(T(p.name))}</span><span>Версия ${esc(o.ver)} · ${date}</span></div>`;
const pgs:string[]=[];const wrap=(inner:string,n:number,cov?:boolean)=>'<div class="pg'+(cov?' cv':'')+'">'+(cov?'':header)+'<div class="in">'+inner+'</div>'+(cov?'':'<div class="ft"><span>'+esc(ag.n||'Прототип')+'</span><span>Страница '+n+' из '+total+'</span></div>')+'</div>';
pgs.push(wrap(cover,1,true));tocPages.forEach((t,i)=>pgs.push(wrap(t,2+i)));pgs.push(wrap(stylePage,first));all.forEach((a,i)=>pgs.push(wrap(a.html,first+1+i)));
let out=pgs.join('');out=out.replace(/\u0001([^\u0001]+)\u0001/g,(_m,id:string)=>String(num[id]??''));
const css=`@page{size:${S.css};margin:0}:root{--ac:${ACC}}html,body,body[data-mode=report]{background:#E8EAEE;padding:0}body{margin:0;font:12px/17px Inter,'Segoe UI',Arial,sans-serif;color:#1E293B;-webkit-print-color-adjust:exact;print-color-adjust:exact}.pg{position:relative;width:${S.w}px;height:${S.h}px;margin:0 auto 18px;background:#fff;overflow:hidden;page-break-after:always;break-after:page;box-shadow:0 6px 24px rgba(15,23,42,.14)}
.pg:not(.cv)::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--ac)}
.hd{position:absolute;left:48px;right:48px;top:24px;height:22px;display:flex;justify-content:space-between;font-size:10.5px;color:#64748B;border-bottom:1px solid #E2E8F0;line-height:18px}.hd span:first-child{font-weight:600;color:#0F172A}.ft{position:absolute;left:48px;right:48px;bottom:20px;height:22px;display:flex;justify-content:space-between;font-size:10.5px;color:#64748B;border-top:1px solid #E2E8F0;padding-top:4px}.ft span:last-child{font-weight:600;color:var(--ac)}
.in{position:absolute;left:48px;top:64px;width:${cw}px;height:${ch}px;overflow:hidden}.cv .in{left:0;top:0;width:${S.w}px;height:${S.h}px}
h1{font:700 44px/52px Inter,Arial,sans-serif;margin:8px 0 18px;color:#fff;letter-spacing:-.02em}h2{font:700 26px/32px Inter,Arial,sans-serif;margin:0 0 4px;color:#0F172A;letter-spacing:-.01em}h2::after{content:"";display:block;width:44px;height:4px;border-radius:4px;background:var(--ac);margin-top:6px}h3{font:700 18px/24px Inter,Arial,sans-serif;margin:0;color:#0F172A}h4{font:700 11px/28px Inter,Arial,sans-serif;margin:0;color:var(--ac);text-transform:uppercase;letter-spacing:.08em;height:28px}
.muted{color:#64748B;margin:0}.cov{position:relative;height:100%;box-sizing:border-box;background:#fff}.hero{position:relative;height:46%;padding:56px 64px;box-sizing:border-box;background:linear-gradient(135deg,var(--ac),#0F172A 135%);color:#fff;overflow:hidden}.hero::before{content:"";position:absolute;right:-120px;top:-120px;width:420px;height:420px;border-radius:50%;background:rgba(255,255,255,.08)}.hero::after{content:"";position:absolute;right:90px;bottom:-150px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,.06)}
.cov .ag{position:relative;z-index:1;display:flex;align-items:center;gap:16px;height:56px}.cov .ag b{font-size:18px;color:#fff}.lg{max-height:52px;max-width:220px;object-fit:contain;background:#fff;border-radius:10px;padding:6px 10px}.hc{position:absolute;z-index:1;left:64px;right:64px;bottom:56px}.kick{margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.78);font-weight:600}.vd{margin:0;font-size:14px;color:rgba(255,255,255,.85)}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:-34px 64px 0;position:relative;z-index:2}.stc{background:#fff;border-radius:14px;padding:16px 14px;box-shadow:0 10px 28px rgba(15,23,42,.14);border:1px solid #E2E8F0;border-top:3px solid var(--ac)}.stc b{display:block;font-size:30px;line-height:34px;color:#0F172A}.stc span{display:block;font-size:11px;color:#64748B;line-height:14px;margin-top:2px}
.cvs{display:flex;gap:48px;margin:40px 64px 0;align-items:flex-start}.cvs .lb{display:block;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#64748B;font-weight:700;margin-bottom:8px}.cvs p{margin:0;font-size:14px;font-weight:600;color:#0F172A}.sws{display:flex;gap:6px}.sws i{width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #CBD5E1}
.rq{position:absolute;left:64px;right:64px;bottom:48px;max-height:130px;overflow:hidden;color:#475569;font-size:11px;line-height:16px;border-top:2px solid var(--ac);padding-top:12px}
.toc{display:flex;align-items:baseline;gap:6px;height:26px;line-height:26px;overflow:hidden;white-space:nowrap}.toc i{flex:1;border-bottom:1px dotted #94A3B8;transform:translateY(-4px)}.toc b{color:var(--ac)}.toc.top{font-weight:700;color:#0F172A;border-top:1px solid #F1F5F9}.toc.sub{padding-left:22px;color:#475569}.toc span{overflow:hidden;text-overflow:ellipsis;max-width:80%}
.sh{height:100%}.pal{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px}.sw i{display:block;height:64px;border:1px solid #CBD5E1;border-radius:12px;box-shadow:0 2px 6px rgba(15,23,42,.08)}.sw span{font:600 11px/20px 'JetBrains Mono',monospace;color:#475569}
.tr{display:grid;gap:8px;height:24px;line-height:24px;border-bottom:1px solid #E2E8F0;font-size:11px;overflow:hidden;white-space:nowrap}.tr span{overflow:hidden;text-overflow:ellipsis}.tr.th{font-weight:700;color:#fff;background:#0F172A;padding:0 6px;font-size:10.5px;letter-spacing:.03em;border-radius:6px 6px 0 0;border-bottom:0}.tr:not(.th){padding:0 6px}.tr:not(.th):nth-child(even){background:#F8FAFC}
.bh{display:flex;align-items:center;gap:12px;height:50px;margin-bottom:8px}.bh>div{flex:1;min-width:0}.bh h3{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bh p{margin:0;color:#64748B;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bn{flex:none;width:34px;height:34px;border-radius:50%;background:var(--ac);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;box-shadow:0 4px 10px rgba(15,23,42,.2)}.bn.s{width:24px;height:24px;font-size:11px;box-shadow:none}
.st{flex:none;font-style:normal;font-size:10.5px;font-weight:600;padding:0 10px;height:22px;line-height:22px;border-radius:999px;border:1px solid #CBD5E1}.st.req{background:#0F172A;border-color:#0F172A;color:#fff}.st.opt{background:#F1F5F9;color:#64748B}
.shot{padding-bottom:16px;display:flex;justify-content:center}.shot .fw{margin:0;border:1px solid #CBD5E1;border-radius:6px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,.12)}.kv{display:grid;grid-template-columns:150px 1fr;gap:12px;border-bottom:1px solid #E2E8F0;padding:3px 6px;font-size:11.5px}.kv b{color:var(--ac)}
.ln{height:17px;white-space:nowrap;overflow:hidden;font-size:12px}.ln.nn{color:#334155}.ln.dn{color:#94A3B8;text-decoration:line-through}.cont{height:26px;line-height:22px;font-size:11px;color:#64748B}
.ovw{display:flex;gap:28px;margin-top:20px}.map{position:relative;flex:none;border:1px solid #CBD5E1;border-radius:6px;overflow:visible;box-shadow:0 10px 28px rgba(15,23,42,.14)}.map .fw{margin:0;box-shadow:none;border:0}.mb{position:absolute;left:-12px;width:22px;height:22px;border-radius:50%;background:var(--ac);color:#fff;font:700 10px/22px Inter,Arial,sans-serif;text-align:center;font-style:normal;box-shadow:0 2px 6px rgba(15,23,42,.25)}
.ovl{flex:1;min-width:0}.orow{display:flex;align-items:center;gap:10px;height:30px;overflow:hidden;border-bottom:1px solid #F1F5F9}.orow b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.orow em{font-style:normal;color:var(--ac);font-weight:600;font-size:11px;flex:none}
@media print{html,body,body[data-mode=report]{background:#fff}.pg{margin:0;box-shadow:none}}`;
return`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(p.name)} · отчёт</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;700&family=Montserrat:wght@500;700&family=Playfair+Display:wght@500;700&family=JetBrains+Mono:wght@500;700&display=swap&subset=cyrillic" rel="stylesheet"><style>${BASE_CSS}</style><style>${css}${RICH_CSS}</style></head><body data-mode="report">${out}</body></html>`}
