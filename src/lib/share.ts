// One renderer for everything the client sees: in-app preview (iframe), downloadable HTML, PDF report (print).
import type {Project} from '../store';
import type {Dev} from './dev';import {artHtml,resolve,styleCss} from './art';import type {El} from '../store';import {quizFrame} from './quiz';import {typo} from './typo';import {isRich,richHtml,parseLink,hrefOf,escH,RICH_CSS} from './rich';import {getUi} from './ui';
/** quizFrame вставляется в страницу как QF (см. buildHtml) */
declare const QF:(c:unknown,s:unknown,d:string)=>{h:number;els:{id:string;t:string;x:number;y:number;w:number;h:number;text:string;fs?:number;b?:boolean;al?:string;c?:string;fill?:string;stroke?:string;sw?:number;r?:number;op?:number;role?:string;qa?:string}[];kinds:string[]};
/** Runs inside the generated page, so it must not reference anything outside itself. */
function runtime(){
type E={id:string;t:string;x:number;y:number;w:number;h:number;text:string;fs?:number;b?:boolean;al?:string;acc?:boolean;go?:string;lk?:string;a?:string;k?:string;tg?:string;hid?:1};
type B={id:string;title:string;text:string;sv?:{g:string;i:number;tab:boolean};dv?:string[];h:Record<string,number>;els:Record<string,E[]>;quiz?:{auto:boolean;steps:{multi?:boolean;skip?:boolean}[];phone:{mins:number};load:{lines:string[]}}};
type QS={pos:number;ans:number[][];phone:string;consent:boolean;err:string;li:number;t0:number};
const qs:Record<string,QS>={};const qst=(b:B):QS=>qs[b.id]||(qs[b.id]={pos:0,ans:[],phone:'',consent:true,err:'',li:0,t0:0});
const geo=(b:B)=>{if(b.quiz){const o=QF(b.quiz,qst(b),dev);return{h:o.h,els:o.els as unknown as E[]}}return{h:b.h[dev],els:b.els[dev].filter(e=>!e.hid)}};
type S={id:string;name:string;kind:string;blocks:B[]};
const P=JSON.parse(document.getElementById('d')!.textContent||'{}') as {name:string;sheets:S[]};
const app=document.getElementById('app') as HTMLElement;
const mode=document.body.getAttribute('data-mode');
const FW:Record<string,number>={desktop:1440,tablet:768,mobile:390};
const esc=(s:unknown)=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as Record<string,string>)[c]);
let dev=document.body.getAttribute('data-start')||(innerWidth<600?'mobile':innerWidth<1000?'tablet':'desktop');
const firstPage=P.sheets.find(s=>s.kind!=='popup')||P.sheets[0];
let sid=firstPage?firstPage.id:'';let hist:string[]=[];let pop='';let hint=true;const tabs:Record<string,number>={};let fade=false;const sc:Record<string,number>={};let pins:{y0:number;y1:number;e:E}[]=[];let lastW=innerWidth;
const vis=(b:B)=>!b.sv||!b.sv.tab||(tabs[b.sv.g]||0)===b.sv.i;
const ids:Record<string,boolean>={};for(const s of P.sheets)ids[s.id]=true;
const cur=()=>P.sheets.find(s=>s.id===sid)||P.sheets[0];
const kq=(e:E&{fill?:string;stroke?:string;sw?:number;r?:number;op?:number;c?:string;role?:string})=>(e.fill?'background:'+(e.fill==='none'?'transparent':e.fill)+';':'')+(e.stroke?'border-color:'+(e.stroke==='none'?'transparent':e.stroke)+';':'')+(e.sw!==undefined?'border-width:'+e.sw+'px;border-style:'+(e.sw?'solid':'none')+';':'')+(e.r!==undefined?'border-radius:'+e.r+'px;':'')+(e.op!==undefined&&e.op<1?'opacity:'+e.op+';':'')+(e.c?'color:'+e.c+';':'')+'';
const qel=(e0:E,dy:number,bid:string)=>{const e=e0 as E&{qa?:string;fill?:string;stroke?:string;sw?:number;r?:number;op?:number;c?:string};const qa=e.qa||'';const clk=!!qa&&!/^(timer|load|phone)/.test(qa);
const st='left:'+e.x+'px;top:'+(e.y+dy)+'px;width:'+e.w+'px;height:'+e.h+'px;'+(e.fs?'font-size:'+e.fs+'px;':'')+(e.b?'font-weight:700;':'')+(e.al==='c'?'text-align:center;justify-content:center;':e.al==='r'?'text-align:right;justify-content:flex-end;':'')+kq(e);
const at=(qa?' data-qa="'+qa+'" data-qb="'+bid+'"':'');if(qa==='phone')return '<input class="el input qin" type="tel" inputmode="tel" autocomplete="tel" style="'+st+'"'+at+' placeholder="'+esc(e.text)+'" value="'+esc(qfind(bid)?qst(qfind(bid) as B).phone:'')+'">';
return '<div class="el '+e.t+(clk?' qk':'')+'" style="'+st+'"'+at+'>'+esc(e.text)+'</div>'};
const el=(e:E,dy:number)=>{const go=!!(e.go&&ids[e.go])||!!e.lk;const tp=e.tg?e.tg.split(':'):null;const on=!!tp&&(tabs[tp[0]]||0)===+tp[1];
const st='left:'+e.x+'px;top:'+((e.t==='line'?e.y-6:e.y)+dy)+'px;width:'+e.w+'px;height:'+(e.t==='line'?12:e.h)+'px;'+(e.fs?'font-size:'+e.fs+'px;':'')+(e.b?'font-weight:700;':'')+(e.al==='c'?'text-align:center;justify-content:center;':e.al==='r'?'text-align:right;justify-content:flex-end;':'')+(e.k||'');
const big=e.t==='btn'&&!tp&&e.w>=180&&e.h>=44;return '<div class="el '+e.t+(go?' go':'')+(big?' big':'')+(tp?' tg'+(on?' tgon':''):'')+'" style="'+st+'"'+(e.go&&ids[e.go]?' data-go="'+e.go+'"':'')+(e.lk||'')+(tp?' data-tg="'+esc(e.tg||'')+'"':'')+'>'+(e.t==='line'?'<i></i>':e.a?e.a:esc(e.text))+'</div>'};
const box=(blocks:B[])=>{let y=0,x0=1e9,x1=0,y0=1e9,y1=0;for(const b of blocks){if(b.dv&&b.dv.indexOf(dev)<0)continue;const g=geo(b);for(const e of g.els){x0=Math.min(x0,e.x);x1=Math.max(x1,e.x+e.w);y0=Math.min(y0,y+e.y);y1=Math.max(y1,y+e.y+e.h)}y+=g.h}return x1>x0?{x0:x0-24,x1:x1+24,y0:y0-24,y1:y1+24}:{x0:0,x1:FW[dev],y0:0,y1:y}};
const frame=(blocks:B[],k:number,lines:boolean,c?:{x0:number;x1:number;y0:number;y1:number})=>{let y=0,inner='';
for(const b of blocks){if(b.dv&&b.dv.indexOf(dev)<0)continue;const g=geo(b);const h=g.h;inner+=g.els.map(e=>b.quiz?qel(e,y,b.id):el(e,y)).join('');y+=h;if(lines)inner+='<i class="bd" style="top:'+y+'px"></i>'}
const cx=c?c.x0:0,cy=c?c.y0:0,cw=c?c.x1-c.x0:FW[dev],ch=c?c.y1-c.y0:y;
return '<div class="fw" style="width:'+cw*k+'px;height:'+ch*k+'px"><div class="fi" style="width:'+FW[dev]+'px;height:'+y+'px;transform:translate('+(-cx*k)+'px,'+(-cy*k)+'px) scale('+k+')">'+inner+'</div></div>'};
const report=()=>{const k=dev==='desktop'?980/1440:dev==='tablet'?.85:1;const notes=document.body.getAttribute('data-notes')==='1';
app.innerHTML='<section class="cover"><h1>'+esc(P.name)+'</h1><p>Прототип · '+dev+' '+FW[dev]+' px · '+new Date().toLocaleDateString('ru-RU')+'</p></section>'+
P.sheets.map(s=>'<section><h2>'+(s.kind==='popup'?'Попап: ':'Страница: ')+esc(s.name)+'</h2>'+s.blocks.filter(b=>!b.dv||b.dv.indexOf(dev)>=0).map((b,i)=>'<figure><figcaption>'+(i+1)+'. '+esc(b.title)+'</figcaption>'+frame([b],k,false)+(notes&&b.text.trim()?'<p class="nt">'+esc(b.text)+'</p>':'')+'</figure>').join('')+'</section>').join('')};
const bar=()=>'<header><button data-act="back"'+(hist.length||pop||parent!==window?'':' disabled')+'>‹ Назад</button><b>'+esc(P.name)+'</b><span>'+esc(cur().name)+'</span><i class="sp"></i><nav>'+
['desktop','tablet','mobile'].map(d=>'<button data-dev="'+d+'" class="'+(d===dev?'on':'')+'">'+(d==='desktop'?'Desktop':d==='tablet'?'Tablet':'Mobile')+'</button>').join('')+'</nav><button data-act="hint" class="'+(hint?'on':'')+'">Подсветка ссылок</button></header>';
const mainBtn=(b:B):E|undefined=>{if(b.quiz)return undefined;const a=b.els.mobile.filter(e=>e.t==='btn'&&!e.tg&&e.text);return a.find(e=>e.acc)||a.sort((p,q)=>q.w*q.h-p.w*p.h)[0]};
const proto=()=>{const W=FW[dev];const w=Math.min(innerWidth-(innerWidth>700?48:0),W);const sh=cur();const ps=pop?P.sheets.find(s=>s.id===pop):undefined;
pins=[];if(dev==='mobile'&&sh){let y=0;for(const b of sh.blocks.filter(vis)){if(b.dv&&b.dv.indexOf(dev)<0)continue;const g=geo(b);const e=mainBtn(b);if(e)pins.push({y0:y,y1:y+g.h,e});y+=g.h}}
app.className=hint?'hint':'';
app.innerHTML=bar()+'<main'+(fade?' class="fd"':'')+'>'+(sh?frame(sh.blocks.filter(vis),w/W,false):'')+'</main><div class="pin" id="pin"></div>'+(ps?'<div class="ov" data-act="close"><div class="pp">'+(()=>{const c=box(ps.blocks.filter(vis));return frame(ps.blocks.filter(vis),Math.min(Math.min(innerWidth*.92,720)/(c.x1-c.x0),1),false,c)})()+'<button class="x" data-act="close">×</button></div></div>':'')};
const pinUpd=()=>{const pn=document.getElementById('pin');if(!pn)return;const fi=document.querySelector('.fi') as HTMLElement|null;if(!fi||!pins.length||pop){if(pn)pn.className='pin';return}
const r=fi.getBoundingClientRect();const k=r.width/FW[dev];const vb=innerHeight;const mid=vb*.55;let hit:typeof pins[0]|undefined;
for(const p of pins){const t=r.top+p.y0*k,b=r.top+p.y1*k;if(t<mid&&b>mid){hit=p;break}}
if(!hit){pn.className='pin';return}
const bt=r.top+(hit.y0+hit.e.y)*k,bb=bt+hit.e.h*k;const seen=bt>=0&&bb<=vb-8;
const key=hit.e.text+'|'+(hit.e.go||'')+'|'+(hit.e.lk||'')+'|'+(hit.e.tg||'');if(pn.getAttribute('data-k')!==key){pn.setAttribute('data-k',key);pn.innerHTML='<button class="pb"'+(hit.e.go&&ids[hit.e.go]?' data-go="'+hit.e.go+'"':'')+(hit.e.lk||'')+(hit.e.tg?' data-tg="'+esc(hit.e.tg)+'"':'')+'>'+esc(hit.e.text)+'</button>'}
pn.className='pin'+(seen&&hit!==pins[0]?'':' on')};
const render=()=>{if(mode==='report')report();else{proto();fade=false;pinUpd()}};
let raf=0;const tick=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(mode!=='report')pinUpd()})};
let tt=0;const toast=(m:string)=>{let n=document.getElementById('tt');if(!n){n=document.createElement('div');n.id='tt';document.body.appendChild(n)}n.textContent=m;n.className='on';clearTimeout(tt);tt=window.setTimeout(()=>{n!.className=''},1800)};
/* квиз: шаги, ответы, телефон, загрузка и таймер работают по настройкам блока */
const qfind=(bid:string)=>{for(const s of P.sheets)for(const b of s.blocks)if(b.id===bid)return b;return undefined};
const qkinds=(b:B)=>QF(b.quiz,qst(b),dev).kinds;
const qload=(b:B)=>{const S=qst(b);let n=0;const lines=b.quiz?b.quiz.load.lines.length:1;const iv=setInterval(()=>{if(qkinds(b)[S.pos]!=='load'){clearInterval(iv);return}n++;if(n>=Math.max(2,lines)){clearInterval(iv);S.pos++;S.li=0}else S.li=n;render()},900)};
const qadv=(b:B)=>{const S=qst(b);S.pos++;S.err='';const k=qkinds(b)[S.pos];if(k==='phone'&&!S.t0)S.t0=Date.now();if(k==='load')qload(b);render()};
const qact=(bid:string,act:string)=>{const b=qfind(bid);if(!b||!b.quiz)return;const S=qst(b);const kinds=qkinds(b);const kind=kinds[S.pos];const nq=b.quiz.steps.length;
if(act.indexOf('o:')===0){const i=+act.slice(2);const multi=kind==='q'&&!!b.quiz.steps[S.pos].multi;const a=S.ans[S.pos]||[];S.ans[S.pos]=multi?(a.indexOf(i)>=0?a.filter(x=>x!==i):a.concat(i)):[i];S.err='';render();if(!multi&&b.quiz.auto)setTimeout(()=>{if(qst(b).pos===S.pos)qact(bid,'next')},320);return}
if(act==='next'){if(!(S.ans[S.pos]&&S.ans[S.pos].length)){S.err='sel';render();return}qadv(b);return}
if(act==='skip'){S.ans[S.pos]=[];qadv(b);return}
if(act==='back'){if(S.pos>0){S.pos--;S.err='';render()}return}
if(act.indexOf('tab:')===0){const i=+act.slice(4);if(i<=S.pos&&i<nq&&S.pos<nq){S.pos=i;S.err='';render()}return}
if(act==='consent'){S.consent=!S.consent;S.err='';render();return}
if(act==='submit'){if(S.phone.replace(/\D/g,'').length<10){S.err='phone';render();return}if(!S.consent){S.err='consent';render();return}qadv(b);return}
if(act==='restart'){delete qs[bid];render()}};
setInterval(()=>{document.querySelectorAll('[data-qa^="timer:"]').forEach(n=>{const b=qfind(n.getAttribute('data-qb')||'');if(!b||!b.quiz)return;const S=qst(b);if(!S.t0)S.t0=Date.now();const left=Math.max(0,b.quiz.phone.mins*60-Math.floor((Date.now()-S.t0)/1000));const v=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');n.textContent=(n.textContent||'').replace(/\d\d:\d\d/,v)})},1000);
document.addEventListener('input',e=>{const t=e.target as HTMLInputElement;if(t&&t.getAttribute&&t.getAttribute('data-qa')==='phone'){const b=qfind(t.getAttribute('data-qb')||'');if(b)qst(b).phone=t.value}});
const go=(id:string)=>{const s=P.sheets.find(x=>x.id===id);if(!s)return;fade=true;if(s.kind==='popup')pop=id;else{sc[sid]=scrollY;if(sid!==id)hist.push(sid);sid=id;pop='';scrollTo(0,0)}render()};
const goBlk=(bid:string)=>{const s=P.sheets.find(x=>x.blocks.some(b=>b.id===bid));if(!s)return;if(s.kind==='popup'){go(s.id);return}if(sid!==s.id||pop)go(s.id);
setTimeout(()=>{let y=0;for(const b of s.blocks){if(b.dv&&b.dv.indexOf(dev)<0)continue;if(!vis(b))continue;if(b.id===bid)break;y+=geo(b).h}
const fi=document.querySelector('.fi') as HTMLElement|null;if(!fi)return;const q=fi.getBoundingClientRect();const k=fi.offsetHeight?q.height/fi.offsetHeight:1;scrollTo({top:Math.max(0,scrollY+q.top+y*k-56),behavior:'smooth'})},60)};
const ext=(u:string)=>{if(parent!==window){toast('Адрес откроется в готовом сайте: '+u.replace(/^mailto:|^tel:/,''));return}if(/^(tel|mailto):/.test(u))location.href=u;else open(u,'_blank','noopener')};
const back=()=>{if(pop){pop='';render();return}const p=hist.pop();if(p){sc[sid]=scrollY;sid=p;fade=true;render();scrollTo(0,sc[p]||0);tick()}else if(parent!==window)parent.postMessage('igp-close','*')};
document.addEventListener('click',e=>{if(mode==='report')return;const t=e.target as HTMLElement;
const qa=t.closest('[data-qa]');if(qa&&qa.tagName!=='INPUT'){qact(qa.getAttribute('data-qb')||'',qa.getAttribute('data-qa')||'');return}if(qa)return;
const tb=t.closest('[data-tg]');if(tb){const q=(tb.getAttribute('data-tg')||'').split(':');tabs[q[0]]=+q[1];fade=true;render();return}
const bk=t.closest('[data-blk]');if(bk){goBlk(bk.getAttribute('data-blk')||'');return}
const xx=t.closest('[data-x]');if(xx){ext(xx.getAttribute('data-x')||'');return}
const g=t.closest('[data-go]');if(g){go(g.getAttribute('data-go')||'');return}
const ck=t.closest('.rtx.ck .rl');if(ck){ck.classList.toggle('on');return}
const bn=t.closest('.el.btn,.pb');if(bn&&!bn.hasAttribute('data-tg')){toast('Кнопка без перехода: ссылку задают в редакторе');return}
const d=t.closest('[data-dev]');if(d){dev=d.getAttribute('data-dev')||dev;render();return}
const a=t.closest('[data-act]');if(!a)return;const act=a.getAttribute('data-act');
if(act==='close'){if(t===a||t.classList.contains('x')){pop='';render()}}
else if(act==='back')back()
else if(act==='hint'){hint=!hint;render()}});
addEventListener('keydown',e=>{if(mode!=='report'&&e.altKey&&e.key==='ArrowLeft'){back();return}if(e.key!=='Escape'||mode==='report')return;if(pop){pop='';render()}else if(parent!==window)parent.postMessage('igp-close','*')});
addEventListener('resize',()=>{if(innerWidth!==lastW){lastW=innerWidth;render()}else tick()});addEventListener('scroll',tick,{passive:true});
render()}
export const BASE_CSS=`*{box-sizing:border-box}body{margin:0;font:14px/1.4 Inter,system-ui,sans-serif;background:#E8EAEE;color:#0F172A;-webkit-print-color-adjust:exact;print-color-adjust:exact}
header{position:sticky;top:0;z-index:12;display:flex;align-items:center;gap:10px;padding:0 14px;height:48px;background:#fff;border-bottom:1px solid rgba(15,23,42,.08);overflow-x:auto}
header b{white-space:nowrap}header span{color:#64748B;white-space:nowrap}header .sp{flex:1}header nav{display:flex;gap:4px}
header button{height:30px;padding:0 12px;border:1px solid rgba(15,23,42,.1);border-radius:999px;background:#fff;font:inherit;cursor:pointer;white-space:nowrap;flex:none}
header button.on{background:#EAF0FF;border-color:#2F6BFF;color:#2F6BFF}header button:disabled{opacity:.4;cursor:default}
main{padding:24px 0}@media(max-width:700px){main{padding:0}}
.fw{margin:0 auto;background:#fff;position:relative;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,.08)}.fi{position:relative;transform-origin:0 0}
.el{position:absolute;display:flex;align-items:center;white-space:pre-wrap;overflow:hidden;box-sizing:border-box;font:500 16px/1.3 Inter,system-ui,sans-serif;color:#0F172A}
.el.rect{border:1.5px solid #1E293B;background:rgba(255,255,255,.6);padding:10px;align-items:flex-start}
.el.btn{border-radius:10px;background:#0F172A;color:#fff;justify-content:center;font-weight:600}
.el.input{border:1.5px solid #94A3B8;border-radius:8px;padding:0 12px;color:#64748B;background:#fff}
.el.img{background:linear-gradient(to top right,transparent calc(50% - 1px),#94A3B8 50%,transparent calc(50% + 1px)),linear-gradient(to bottom right,transparent calc(50% - 1px),#94A3B8 50%,transparent calc(50% + 1px)),#F1F5F9;border:1.5px solid #CBD5E1;justify-content:center;color:#64748B}
.el.line i{position:absolute;left:0;right:0;top:50%;border-top:2px solid #0F172A}
.el.qk{cursor:pointer}.el.qk:hover{outline:2px solid #2F6BFF;outline-offset:1px}.qin{font:500 18px/1.3 Inter,system-ui,sans-serif;color:#0F172A;outline:none;width:100%}.qin:focus{border-color:#2F6BFF!important}
.el.go,.el.tg{cursor:pointer;overflow:visible}.el.btn.tg{background:#fff;color:#0F172A;border:1.5px solid #94A3B8;transition:background .18s,color .18s}.el.btn.tgon{background:#0F172A;color:#fff;border-color:#0F172A}.el.tg:hover{outline:2px solid #2F6BFF;outline-offset:2px}.fd .fw{animation:fd .24s ease}@keyframes fd{from{opacity:.2;transform:translateY(10px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){.fd .fw{animation:none}}header button{transition:background .15s,transform .12s}header button:active:not(:disabled){transform:scale(.95)}header button:hover:not(:disabled){background:#F1F5F9}.el.go:hover{outline:2px solid #2F6BFF;outline-offset:2px}
.el.btn:not(.tg){cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,filter .16s ease;-webkit-tap-highlight-color:transparent}
.el.btn:not(.tg):hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(15,23,42,.22);filter:brightness(1.12)}
.el.btn:not(.tg):active{transform:translateY(0) scale(.97);box-shadow:0 1px 4px rgba(15,23,42,.2);filter:brightness(.95)}
.el.btn.big::after{content:'';position:absolute;top:0;left:-70%;width:40%;height:100%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.38),transparent);transform:skewX(-20deg);animation:sh 3.4s ease-in-out infinite;pointer-events:none}
.el.btn.big:hover::after{animation-duration:1.2s}@keyframes sh{0%,55%{left:-70%}100%{left:140%}}
.pin{position:fixed;left:0;right:0;bottom:0;z-index:6;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:linear-gradient(to top,#fff 60%,rgba(255,255,255,0));transform:translateY(110%);transition:transform .24s ease;pointer-events:none}
.pin.on{transform:none}.pin.on .pb{pointer-events:auto}
.pb{position:relative;overflow:hidden;display:block;width:100%;height:52px;border:0;border-radius:12px;background:#0F172A;color:#fff;font:600 17px/1.2 Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 22px rgba(15,23,42,.28);transition:transform .16s ease,filter .16s ease}
.pb:active{transform:scale(.97);filter:brightness(.95)}
.pb::after{content:'';position:absolute;top:0;left:-70%;width:40%;height:100%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.38),transparent);transform:skewX(-20deg);animation:sh 3.4s ease-in-out infinite}
#tt{position:fixed;left:50%;bottom:84px;transform:translate(-50%,12px);max-width:calc(100% - 32px);padding:10px 16px;border-radius:999px;background:#0F172A;color:#fff;font:500 13px/1.3 Inter,system-ui,sans-serif;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:20;text-align:center}
#tt.on{opacity:1;transform:translate(-50%,0)}
.ov{animation:ovf .2s ease}.pp{animation:ppi .24s ease}@keyframes ovf{from{opacity:0}to{opacity:1}}@keyframes ppi{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.el.btn.big::after,.pb::after{animation:none;display:none}.ov,.pp{animation:none}.pin{transition:none}}
body[data-mode=report] .pin,body[data-mode=report] .el.btn::after{display:none}
.hint .el.tg{outline:2px dashed #2F6BFF;outline-offset:3px;animation:pl 1.6s infinite}.hint .el.go{outline:2px dashed #2F6BFF;outline-offset:3px;animation:pl 1.6s infinite}@keyframes pl{50%{outline-color:rgba(47,107,255,.25)}}
.ov{position:fixed;inset:0;background:rgba(15,23,42,.45);display:grid;place-items:center;z-index:10;padding:16px;overflow:auto}
.pp{position:relative;background:#fff;border-radius:16px;overflow:hidden}.pp .fw{box-shadow:none}
.pp .x{position:absolute;right:10px;top:10px;width:32px;height:32px;border-radius:50%;border:0;background:#0F172A;color:#fff;font-size:18px;cursor:pointer;z-index:2}
body[data-mode=report]{background:#fff;padding:0 4px}.cover{padding:36px 0 12px}.cover h1{margin:0 0 6px;font:700 30px Inter,system-ui,sans-serif}.cover p{margin:0;color:#64748B}
section h2{font:700 18px Inter,sans-serif;margin:28px 0 12px;break-after:avoid}figure{margin:0 0 20px;break-inside:avoid}figcaption{font:600 12px Inter,sans-serif;color:#64748B;margin-bottom:6px}
body[data-mode=report] .fw{margin:0;box-shadow:none;border:1px solid #CBD5E1}.nt{white-space:pre-wrap;font-size:12px;color:#334155;margin:8px 0 0}
@page{size:A4 landscape;margin:12mm}`+RICH_CSS+`.rtl{cursor:pointer}.hint .rtl{outline:2px dashed #2F6BFF;outline-offset:2px}`;
export function buildHtml(p:Project,mode:'proto'|'report',o:{dev?:Dev;notes?:boolean}={}){
const ty=getUi().ty;const sheetIds=new Set(p.sheets.map(x=>x.id));const blkIds=new Set(p.sheets.flatMap(x=>x.blocks.map(b=>b.id)));
const attr=(h:string):string=>{const l=parseLink(h);if(!l||!l.v.trim())return'';const v=l.v.trim();if(l.k==='sheet')return sheetIds.has(v)?' data-go="'+escH(v)+'"':'';if(l.k==='block')return blkIds.has(v)?' data-blk="'+escH(v)+'"':'';return' data-x="'+escH(hrefOf(l))+'"'};
const ex=(a:El[])=>a.map(e0=>{const e=e0.text?{...e0,text:typo(e0.text,ty)}:e0;const l=parseLink(e0.ln);const go=l?(l.k==='sheet'&&sheetIds.has(l.v)?l.v:undefined):e0.go;const lk=l&&l.k!=='sheet'?attr(e0.ln as string):'';
return{...resolve(e,p.style),go,...(lk?{lk}:{}),a:isRich(e0)?richHtml(e0,{tf:q=>typo(q,ty),link:attr}):artHtml(e),k:styleCss(e0,p.style)}});
const data={name:p.name,sheets:p.sheets.map(s=>({id:s.id,name:s.name,kind:s.kind,blocks:s.blocks.map(b=>({id:b.id,dv:b.dv,sv:b.sv?{g:b.sv.g,i:b.sv.i,tab:b.sv.tab}:undefined,title:b.title,quiz:b.quiz,text:mode==='report'&&o.notes?b.text:'',h:b.h,els:b.quiz?{desktop:[],tablet:[],mobile:[]}:{desktop:ex(b.els.desktop),tablet:ex(b.els.tablet),mobile:ex(b.els.mobile)}}))}))};
const json=JSON.stringify(data).replace(/</g,'\\u003c');
const esc=p.name.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as Record<string,string>)[c]);
return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc} · прототип</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;700&family=Montserrat:wght@500;700&family=Playfair+Display:wght@500;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet"><style>${BASE_CSS}</style></head><body data-mode="${mode}" data-start="${o.dev??''}" data-notes="${o.notes?'1':''}"><div id="app"></div><script id="d" type="application/json">${json}</script><script>const QF=(${quizFrame.toString()});(${runtime.toString()})()</script></body></html>`}
export function printHtml(html:string){const f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:1100px;height:800px;border:0;opacity:0;pointer-events:none';document.body.appendChild(f);
const d=f.contentDocument!;d.open();d.write(html);d.close();
setTimeout(()=>{f.contentWindow!.focus();f.contentWindow!.print();setTimeout(()=>f.remove(),3000)},800)}
