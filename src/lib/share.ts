// One renderer for everything the client sees: in-app preview (iframe), downloadable HTML, PDF report (print).
import type {Project} from '../store';
import type {Dev} from './dev';import {artHtml,resolve,styleCss} from './art';import type {El} from '../store';
/** Runs inside the generated page, so it must not reference anything outside itself. */
function runtime(){
type E={id:string;t:string;x:number;y:number;w:number;h:number;text:string;fs?:number;b?:boolean;al?:string;acc?:boolean;go?:string;a?:string;k?:string};
type B={id:string;title:string;text:string;h:Record<string,number>;els:Record<string,E[]>};
type S={id:string;name:string;kind:string;blocks:B[]};
const P=JSON.parse(document.getElementById('d')!.textContent||'{}') as {name:string;sheets:S[]};
const app=document.getElementById('app') as HTMLElement;
const mode=document.body.getAttribute('data-mode');
const FW:Record<string,number>={desktop:1440,tablet:768,mobile:390};
const esc=(s:unknown)=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as Record<string,string>)[c]);
let dev=document.body.getAttribute('data-start')||(innerWidth<600?'mobile':innerWidth<1000?'tablet':'desktop');
const firstPage=P.sheets.find(s=>s.kind!=='popup')||P.sheets[0];
let sid=firstPage?firstPage.id:'';let hist:string[]=[];let pop='';let hint=true;
const ids:Record<string,boolean>={};for(const s of P.sheets)ids[s.id]=true;
const cur=()=>P.sheets.find(s=>s.id===sid)||P.sheets[0];
const el=(e:E,dy:number)=>{const go=!!(e.go&&ids[e.go]);
const st='left:'+e.x+'px;top:'+((e.t==='line'?e.y-6:e.y)+dy)+'px;width:'+e.w+'px;height:'+(e.t==='line'?12:e.h)+'px;'+(e.fs?'font-size:'+e.fs+'px;':'')+(e.b?'font-weight:700;':'')+(e.al==='c'?'text-align:center;justify-content:center;':e.al==='r'?'text-align:right;justify-content:flex-end;':'')+(e.k||'');
return '<div class="el '+e.t+(go?' go':'')+'" style="'+st+'"'+(go?' data-go="'+e.go+'"':'')+'>'+(e.t==='line'?'<i></i>':e.a?e.a:esc(e.text))+'</div>'};
const box=(blocks:B[])=>{let y=0,x0=1e9,x1=0,y0=1e9,y1=0;for(const b of blocks){for(const e of b.els[dev]){x0=Math.min(x0,e.x);x1=Math.max(x1,e.x+e.w);y0=Math.min(y0,y+e.y);y1=Math.max(y1,y+e.y+e.h)}y+=b.h[dev]}return x1>x0?{x0:x0-24,x1:x1+24,y0:y0-24,y1:y1+24}:{x0:0,x1:FW[dev],y0:0,y1:y}};
const frame=(blocks:B[],k:number,lines:boolean,c?:{x0:number;x1:number;y0:number;y1:number})=>{let y=0,inner='';
for(const b of blocks){const h=b.h[dev];inner+=b.els[dev].map(e=>el(e,y)).join('');y+=h;if(lines)inner+='<i class="bd" style="top:'+y+'px"></i>'}
const cx=c?c.x0:0,cy=c?c.y0:0,cw=c?c.x1-c.x0:FW[dev],ch=c?c.y1-c.y0:y;
return '<div class="fw" style="width:'+cw*k+'px;height:'+ch*k+'px"><div class="fi" style="width:'+FW[dev]+'px;height:'+y+'px;transform:translate('+(-cx*k)+'px,'+(-cy*k)+'px) scale('+k+')">'+inner+'</div></div>'};
const report=()=>{const k=dev==='desktop'?980/1440:dev==='tablet'?.85:1;const notes=document.body.getAttribute('data-notes')==='1';
app.innerHTML='<section class="cover"><h1>'+esc(P.name)+'</h1><p>Прототип · '+dev+' '+FW[dev]+' px · '+new Date().toLocaleDateString('ru-RU')+'</p></section>'+
P.sheets.map(s=>'<section><h2>'+(s.kind==='popup'?'Попап: ':'Страница: ')+esc(s.name)+'</h2>'+s.blocks.map((b,i)=>'<figure><figcaption>'+(i+1)+'. '+esc(b.title)+'</figcaption>'+frame([b],k,false)+(notes&&b.text.trim()?'<p class="nt">'+esc(b.text)+'</p>':'')+'</figure>').join('')+'</section>').join('')};
const bar=()=>'<header><button data-act="back"'+(hist.length||pop?'':' disabled')+'>‹ Назад</button><b>'+esc(P.name)+'</b><span>'+esc(cur().name)+'</span><i class="sp"></i><nav>'+
['desktop','tablet','mobile'].map(d=>'<button data-dev="'+d+'" class="'+(d===dev?'on':'')+'">'+(d==='desktop'?'Desktop':d==='tablet'?'Tablet':'Mobile')+'</button>').join('')+'</nav><button data-act="hint" class="'+(hint?'on':'')+'">Подсветка ссылок</button></header>';
const proto=()=>{const W=FW[dev];const w=Math.min(innerWidth-(innerWidth>700?48:0),W);const sh=cur();const ps=pop?P.sheets.find(s=>s.id===pop):undefined;
app.className=hint?'hint':'';
app.innerHTML=bar()+'<main>'+(sh?frame(sh.blocks,w/W,false):'')+'</main>'+(ps?'<div class="ov" data-act="close"><div class="pp">'+(()=>{const c=box(ps.blocks);return frame(ps.blocks,Math.min(Math.min(innerWidth*.92,720)/(c.x1-c.x0),1),false,c)})()+'<button class="x" data-act="close">×</button></div></div>':'')};
const render=()=>{if(mode==='report')report();else proto()};
const go=(id:string)=>{const s=P.sheets.find(x=>x.id===id);if(!s)return;if(s.kind==='popup')pop=id;else{if(sid!==id)hist.push(sid);sid=id;pop=''}scrollTo(0,0);render()};
document.addEventListener('click',e=>{if(mode==='report')return;const t=e.target as HTMLElement;
const g=t.closest('[data-go]');if(g){go(g.getAttribute('data-go')||'');return}
const d=t.closest('[data-dev]');if(d){dev=d.getAttribute('data-dev')||dev;render();return}
const a=t.closest('[data-act]');if(!a)return;const act=a.getAttribute('data-act');
if(act==='close'){if(t===a||t.classList.contains('x')){pop='';render()}}
else if(act==='back'){if(pop)pop='';else{const p=hist.pop();if(p)sid=p}render()}
else if(act==='hint'){hint=!hint;render()}});
addEventListener('keydown',e=>{if(e.key!=='Escape'||mode==='report')return;if(pop){pop='';render()}else if(parent!==window)parent.postMessage('igp-close','*')});
addEventListener('resize',render);
render()}
const CSS=`*{box-sizing:border-box}body{margin:0;font:14px/1.4 Inter,system-ui,sans-serif;background:#E8EAEE;color:#0F172A;-webkit-print-color-adjust:exact;print-color-adjust:exact}
header{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:10px;padding:0 14px;height:48px;background:#fff;border-bottom:1px solid rgba(15,23,42,.08);overflow-x:auto}
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
.el.go{cursor:pointer;overflow:visible}.el.go:hover{outline:2px solid #2F6BFF;outline-offset:2px}
.hint .el.go{outline:2px dashed #2F6BFF;outline-offset:3px;animation:pl 1.6s infinite}@keyframes pl{50%{outline-color:rgba(47,107,255,.25)}}
.ov{position:fixed;inset:0;background:rgba(15,23,42,.45);display:grid;place-items:center;z-index:10;padding:16px;overflow:auto}
.pp{position:relative;background:#fff;border-radius:16px;overflow:hidden}.pp .fw{box-shadow:none}
.pp .x{position:absolute;right:10px;top:10px;width:32px;height:32px;border-radius:50%;border:0;background:#0F172A;color:#fff;font-size:18px;cursor:pointer;z-index:2}
body[data-mode=report]{background:#fff;padding:0 4px}.cover{padding:36px 0 12px}.cover h1{margin:0 0 6px;font:800 30px Manrope,Inter,sans-serif}.cover p{margin:0;color:#64748B}
section h2{font:700 18px Inter,sans-serif;margin:28px 0 12px;break-after:avoid}figure{margin:0 0 20px;break-inside:avoid}figcaption{font:600 12px Inter,sans-serif;color:#64748B;margin-bottom:6px}
body[data-mode=report] .fw{margin:0;box-shadow:none;border:1px solid #CBD5E1}.nt{white-space:pre-wrap;font-size:12px;color:#334155;margin:8px 0 0}
@page{size:A4 landscape;margin:12mm}`;
export function buildHtml(p:Project,mode:'proto'|'report',o:{dev?:Dev;notes?:boolean}={}){
const ex=(a:El[])=>a.map(e=>({...resolve(e,p.style),a:artHtml(e),k:styleCss(e,p.style)}));
const data={name:p.name,sheets:p.sheets.map(s=>({id:s.id,name:s.name,kind:s.kind,blocks:s.blocks.map(b=>({id:b.id,title:b.title,text:mode==='report'&&o.notes?b.text:'',h:b.h,els:{desktop:ex(b.els.desktop),tablet:ex(b.els.tablet),mobile:ex(b.els.mobile)}}))}))};
const json=JSON.stringify(data).replace(/</g,'\\u003c');
const esc=p.name.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as Record<string,string>)[c]);
return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc} · прототип</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;700;800&family=Montserrat:wght@500;700&family=Playfair+Display:wght@500;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet"><style>${CSS}</style></head><body data-mode="${mode}" data-start="${o.dev??''}" data-notes="${o.notes?'1':''}"><div id="app"></div><script id="d" type="application/json">${json}</script><script>(${runtime.toString()})()</script></body></html>`}
export function printHtml(html:string){const f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:1100px;height:800px;border:0;opacity:0;pointer-events:none';document.body.appendChild(f);
const d=f.contentDocument!;d.open();d.write(html);d.close();
setTimeout(()=>{f.contentWindow!.focus();f.contentWindow!.print();setTimeout(()=>f.remove(),3000)},800)}
