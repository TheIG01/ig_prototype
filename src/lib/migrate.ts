import {uid} from './uid';import {buildByName,emptyBuild,fresh} from './tpl';import {normalizeQuiz} from './quiz';import {defStyle} from './art';
import type {Data,Block,BlockTpl,El} from '../store';import type {Dev} from './dev';
export {uid};
export const noEls=():Record<Dev,El[]>=>({desktop:[],tablet:[],mobile:[]});
export const mkBlock=(title:string,text=''):Block=>{const b=buildByName(title)??emptyBuild();return{id:uid(),title,text,h:b.h,els:b.els,...(b.quiz?{quiz:b.quiz}:{})}};
export const mkFromTpl=(t:BlockTpl):Block=>({id:uid(),title:t.name,text:t.text,h:{...t.h},els:fresh(t.els),...(t.quiz?{quiz:normalizeQuiz(t.quiz)}:{})});
/** v1 string blocks -> v2 objects -> v3 sheet.els -> v4 blocks own wireframes. Idempotent. */
export function migrate(d:any):Data{
if(d.schemaVersion===1){for(const p of d.projects)for(const s of p.sheets)s.blocks=s.blocks.map((b:unknown)=>typeof b==='string'?{id:uid(),title:b,text:''}:b);d.schemaVersion=2}
if(d.schemaVersion===2){for(const p of d.projects)for(const s of p.sheets)s.els??=noEls();d.schemaVersion=3}
if(d.schemaVersion===3){for(const p of d.projects)for(const s of p.sheets){
for(const b of s.blocks){if(!b.els||!b.els.desktop||!b.els.tablet||!b.els.mobile||!b.h){const n=buildByName(b.title)??emptyBuild();b.h={...n.h,...(b.h??{})};b.els={...n.els,...(b.els??{})}}}
const old=s.els as Record<Dev,El[]>|undefined;const any=old&&(old.desktop.length||old.tablet.length||old.mobile.length);
if(any){const nb=mkBlock('Свободные элементы');for(const dv of ['desktop','tablet','mobile'] as Dev[]){nb.els[dv]=old![dv];nb.h[dv]=Math.max(400,Math.ceil((Math.max(0,...old![dv].map(e=>e.y+e.h))+40)/8)*8)}s.blocks.push(nb)}
delete s.els}
d.blockTpls??=[];d.schemaVersion=4}
if(d.schemaVersion===4){for(const p of d.projects)p.style??=defStyle();d.schemaVersion=5}
d.projects??=[];d.siteTypes??=[];d.blockTpls??=[];
for(const p of d.projects){p.style??=defStyle();p.sheets??=[];
for(const sh of p.sheets){sh.blocks??=[];for(const b of sh.blocks)fixBlock(b)}}
for(const t of d.blockTpls){const n=emptyBuild();t.h={...n.h,...(t.h??{})};t.els={...n.els,...(t.els??{})};for(const dv of DV)t.els[dv]??=[]}
return d as Data}
const DV:Dev[]=['desktop','tablet','mobile'];
/** Any block, any schema version: guarantee id, text, h and els for all three sizes. */
function fixBlock(b:any){const n=emptyBuild();b.id??=uid();b.title??='Блок';if(b.title==='Оффер')b.title='1 экран';b.text??='';if(b.quiz)b.quiz=normalizeQuiz(b.quiz);
b.h={...n.h,...(b.h??{})};b.els={...n.els,...(b.els??{})};
for(const dv of DV){if(!Array.isArray(b.els[dv]))b.els[dv]=[];if(typeof b.h[dv]!=='number')b.h[dv]=n.h[dv]}}
