import type {El,Block} from '../store';import type {Dev} from './dev';import type {PStyle} from './art';import {textLines} from './measure';
const NEG=/(^|[^а-яё])(не|нет|ни)(?![а-яё])/i,ANY=/(^|[^а-яё])люб(ой|ая|ое|ые|ую|ого|ому|ым|ыми|ых|ою)(?![а-яё])/i,YOU=/(^|[^а-яё])вы(?![а-яё])/i;
/** проверка текста по copywriting.md: до 140 символов, до 4 строк, без «не/нет/ни», «любой», «Вы», «!» */
export function checkText(e:El,st?:PStyle):string[]{
if(!['text','btn','list','rect','shape'].includes(e.t))return[];const t=e.text??'';if(!t.trim())return[];
const o:string[]=[];const parts=e.t==='list'?t.split('\n'):[t.replace(/\n/g,' ')];const mx=Math.max(...parts.map(p=>p.trim().length));
if(mx>140)o.push(`${mx} символов, нужно до 140`);
if(e.t==='text'){const n=textLines(e,st);if(n>4)o.push(`${n} строк, нужно до 4`)}
if(NEG.test(t.replace(/не знаю/gi,'')))o.push('есть «не/нет/ни»: напиши утверждением');
if(ANY.test(t))o.push('есть «любой»: назови конкретно');
if(YOU.test(t))o.push('есть «Вы»: пиши «Получите …»');
if(t.includes('!'))o.push('есть «!»: убери');
return o}
export const checkBlock=(b:Block,dev:Dev,st?:PStyle)=>b.els[dev].map(e=>({e,m:checkText(e,st)})).filter(x=>x.m.length);
