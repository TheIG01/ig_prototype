import {useMemo} from 'react';
import {AppWindow,FileText,TriangleAlert} from 'lucide-react';
import {useStore} from '../../store';
import type {Project} from '../../store';
import {buildMap} from '../../lib/sitemap';
const CW=190,CH=54,GX=64,GY=14,PAD=8;
/** окно «Карта сайта»: колонки по числу переходов от первой страницы, стрелки из ссылок кнопок */
export function SiteMapDialog({pr,onClose}:{pr:Project;onClose:()=>void}){
const m=useMemo(()=>buildMap(pr),[pr]);
const pos=new Map<string,{x:number;y:number}>();const rows:number[]=[];
for(const n of m.nodes){const r=rows[n.depth]??0;rows[n.depth]=r+1;pos.set(n.id,{x:PAD+n.depth*(CW+GX),y:PAD+r*(CH+GY)})}
const W=PAD*2+m.cols*CW+(m.cols-1)*GX;const H=PAD*2+Math.max(1,...rows.map(r=>r||0))*(CH+GY)-GY;
const go=(id:string)=>{useStore.getState().setSheet(id);onClose()};
const path=(a:{x:number;y:number},b:{x:number;y:number},self:boolean)=>{
if(self)return '';
const fwd=b.x>a.x;const x1=fwd?a.x+CW:a.x,y1=a.y+CH/2,x2=fwd?b.x:b.x+CW,y2=b.y+CH/2;
if(b.x===a.x){const o=28;return `M${a.x+CW},${y1} C${a.x+CW+o},${y1} ${b.x+CW+o},${y2} ${b.x+CW},${y2}`}
const dx=Math.max(36,Math.abs(x2-x1)/2)*(fwd?1:-1);return `M${x1},${y1} C${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}`};
return<div className="smp">
<p className="txt">Схема собирается сама из ссылок кнопок и текстов. Колонка показывает, сколько переходов от первой страницы. Нажми на лист, чтобы открыть его.</p>
{!m.edges.length&&<p className="hint">Пока ни одной ссылки между листами. Задай кнопке ссылку «Страница или попап» в панели элемента</p>}
<div className="smp-sc"><div className="smp-cv" style={{width:W,height:H}}>
<svg width={W} height={H} className="smp-svg" aria-hidden="true"><defs><marker id="smpA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" className="smp-ah"/></marker></defs>
{m.edges.map(e=>{const a=pos.get(e.from),b=pos.get(e.to);if(!a||!b||e.from===e.to)return null;return<path key={e.from+e.to} d={path(a,b,false)} className={'smp-e'+(b.x<=a.x?' back':'')} markerEnd="url(#smpA)"><title>{e.via.slice(0,6).join('\n')}</title></path>})}</svg>
{m.nodes.map(n=>{const p=pos.get(n.id) as {x:number;y:number};return<button key={n.id} className={'smp-n'+(n.popup?' pop':'')+(n.reach?'':' bad')} style={{left:p.x,top:p.y,width:CW,height:CH}} onClick={()=>go(n.id)} title={n.name}>
{n.popup?<AppWindow size={14}/>:<FileText size={14}/>}<b>{n.name}</b><small>блоков {n.blocks} · входит {n.inn} · выходит {n.out}</small></button>})}
{m.cols>1&&m.nodes.some(n=>!n.reach)&&<span className="smp-cap" style={{left:PAD+(m.cols-1)*(CW+GX),top:0}}>Недоступны</span>}
</div></div>
{!!m.warns.length&&<div className="smp-w"><h4><TriangleAlert size={14}/>Что поправить</h4>{m.warns.map((w,i)=><button key={i} className={'smp-wr '+w.kind} onClick={()=>go(w.sheetId)}>{w.text}</button>)}</div>}
{!m.warns.length&&<p className="hint">Висячих страниц и битых ссылок нет</p>}
<div className="btnrow"><button className="btn" onClick={onClose}>Закрыть</button></div></div>}
