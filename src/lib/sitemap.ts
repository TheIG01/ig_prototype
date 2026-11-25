/** Карта сайта (1.63): собирается из ссылок кнопок и текстов. Листы это узлы, переходы между ними это рёбра. */
import type {Project} from '../store';
import {DEVS} from '../store';
import {linkOf,parseLink,spanLinks} from './rich';

export interface MapEdge{from:string;to:string;via:string[]}
export interface MapNode{id:string;name:string;popup:boolean;depth:number;reach:boolean;inn:number;out:number;blocks:number}
export interface MapWarn{kind:'orphan'|'broken'|'empty';sheetId:string;text:string}
export interface SiteMap{nodes:MapNode[];edges:MapEdge[];warns:MapWarn[];cols:number}

export function buildMap(pr:Project):SiteMap{
const sheets=pr.sheets;const byId=new Map(sheets.map(s=>[s.id,s]));const blockSheet=new Map<string,string>();
for(const s of sheets)for(const b of s.blocks)blockSheet.set(b.id,s.id);
const em=new Map<string,MapEdge>();const warns:MapWarn[]=[];const seen=new Set<string>();const empty=new Map<string,Set<string>>();
for(const s of sheets)for(const b of s.blocks)for(const d of DEVS){if(b.dv&&!b.dv.includes(d))continue;
for(const e of b.els[d]){if(e.hid)continue;
const ls:string[]=[];const own=linkOf(e);if(own!==undefined)ls.push(own);for(const x of spanLinks(e))ls.push(x.h);
const label=(e.text||'').trim().replace(/\s+/g,' ').slice(0,40)||'элемент';
for(const raw of ls){const l=parseLink(raw);if(!l||!l.v.trim())continue;
if(l.k!=='sheet'&&l.k!=='block')continue;
const to=l.k==='sheet'?(byId.has(l.v)?l.v:undefined):blockSheet.get(l.v);
const key=s.id+'|'+b.id+'|'+e.id.replace(/^.*?_/,'')+'|'+label+'|'+raw;
if(!to){const k='x|'+key;if(!seen.has(k)){seen.add(k);warns.push({kind:'broken',sheetId:s.id,text:'«'+label+'» в блоке «'+b.title+'» ведёт на удалённую '+(l.k==='sheet'?'страницу':'часть сайта')})}continue}
if(to===s.id&&l.k==='block')continue;
const k=s.id+'>'+to;let ed=em.get(k);if(!ed){ed={from:s.id,to,via:[]};em.set(k,ed)}
const v='«'+label+'» · '+b.title;if(!ed.via.includes(v))ed.via.push(v)}
if(e.t==='btn'&&!ls.some(r=>{const l=parseLink(r);return !!l&&!!l.v.trim()})){let set=empty.get(s.id);if(!set){set=new Set();empty.set(s.id,set)}set.add(label)}}}
const edges=[...em.values()];
const root=sheets.find(s=>s.kind!=='popup')??sheets[0];const depth=new Map<string,number>();
if(root){depth.set(root.id,0);const q=[root.id];while(q.length){const c=q.shift() as string;for(const e of edges)if(e.from===c&&!depth.has(e.to)){depth.set(e.to,(depth.get(c) as number)+1);q.push(e.to)}}}
const nodes:MapNode[]=sheets.map(s=>({id:s.id,name:s.name,popup:s.kind==='popup',depth:depth.get(s.id)??-1,reach:depth.has(s.id),inn:edges.filter(e=>e.to===s.id&&e.from!==s.id).length,out:edges.filter(e=>e.from===s.id&&e.to!==s.id).length,blocks:s.blocks.length}));
const mx=Math.max(0,...nodes.map(n=>n.depth));
for(const n of nodes)if(!n.reach)n.depth=mx+1;
for(const n of nodes)if(!n.reach)warns.unshift({kind:'orphan',sheetId:n.id,text:(n.popup?'Попап':'Страница')+' «'+n.name+'» недоступна: на неё не ведёт ни одна ссылка от первой страницы'});
for(const s of sheets){const set=empty.get(s.id);if(set&&set.size)warns.push({kind:'empty',sheetId:s.id,text:'Кнопки без ссылки на листе «'+s.name+'»: '+[...set].slice(0,4).map(x=>'«'+x+'»').join(', ')+(set.size>4?' и ещё '+(set.size-4):'')})}
const cols=nodes.some(n=>!n.reach)?mx+2:mx+1;
return{nodes,edges,warns,cols}}
