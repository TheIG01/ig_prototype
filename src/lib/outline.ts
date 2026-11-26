// Mind-map outline -> project structure. Accepts markdown headings (# page, ## block, rest = text)
// or indented / bulleted lists (level 0 = page, level 1 = block, deeper = block text).
import {TPLS,buildTpl} from './tpl';import {emptyBuild} from './tplCore';
import {uid} from './uid';
import type {Block,Kind,Sheet} from '../store';
const clean=(s:string)=>s.replace(/^\s*(?:[-*•+]|\d+[.)])\s+/,'').replace(/^#+\s*/,'').trim();
export function parseOutline(src:string):{name:string;kind:Kind;blocks:{title:string;text:string}[]}[]{
const raw=src.replace(/\r/g,'').split('\n').filter(l=>l.trim());
const md=raw.some(l=>/^#{1,6}\s/.test(l));
const out:{name:string;kind:Kind;blocks:{title:string;text:string}[]}[]=[];
let page:(typeof out)[number]|null=null,blk:{title:string;text:string}|null=null;
const unit=Math.min(...raw.map(l=>l.match(/^(\s*)/)![1].replace(/\t/g,'  ').length).filter(n=>n>0),99);
for(const l of raw){
let lvl:number;
if(md){const m=l.match(/^(#{1,6})\s/);lvl=m?m[1].length-1:99}
else{const ind=l.match(/^(\s*)/)![1].replace(/\t/g,'  ').length;lvl=ind===0?0:Math.round(ind/(unit===99?2:unit))}
const t=clean(l);if(!t)continue;
if(lvl===0){const popup=/попап|pop-?up|окно/i.test(t);page={name:t.replace(/\s*\((?:попап|pop-?up)\)\s*/i,'').replace(/^попап:?\s*/i,'')||t,kind:popup?'popup':'page',blocks:[]};out.push(page);blk=null}
else if(lvl===1){if(!page){page={name:'Страница',kind:'page',blocks:[]};out.push(page)}blk={title:t,text:''};page.blocks.push(blk)}
else if(blk){blk.text+=(blk.text?'\n':'')+(md||lvl<=2?'':'– ')+t}}
return out}
export function sheetsFromOutline(src:string):Sheet[]{
return parseOutline(src).map(p=>({id:uid(),name:p.name,kind:p.kind,blocks:p.blocks.map(b=>{
const tl=b.title.toLowerCase().replace(/^оффер/,'1 экран').replace(/^как работаем/,'этапы: карточки').replace(/^команда(?!:)/,'команда: все на виду').replace(/^(прогресс|вопрос|варианты|далее|бонус)/,'квиз-шаг: $1');const t=[...TPLS].sort((a,q)=>q.name.length-a.name.length).find(x=>tl.startsWith(x.name.toLowerCase()));const n=t?buildTpl(t):emptyBuild();
const bl:Block={id:uid(),title:b.title,text:b.text,h:n.h,els:n.els};return bl})}))}
