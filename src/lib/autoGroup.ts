// Автогруппы: карточка (фигура-подложка) и всё, что целиком лежит внутри неё, становятся одной группой.
// Так готовый блок двигается карточками: клик выделяет всю карточку, двойной клик заходит внутрь.
import type {El} from '../store';
import type {Dev} from './dev';
import {FW} from './dev';
import {uid} from './uid';

const inside=(a:El,c:El)=>a.x>=c.x-2&&a.y>=c.y-2&&a.x+a.w<=c.x+c.w+2&&a.y+(a.t==='line'?0:a.h)<=c.y+c.h+2;
/** группы для одного устройства; уже сгруппированные и вкладочные элементы не трогаем */
export function autoGroup(els:El[],dev:Dev):El[]{
if(els.some(e=>e.g))return els;
const maxW=FW[dev]*.9;
const cards=els.filter(e=>(e.t==='rect'||e.t==='shape')&&!e.hid&&e.w>=80&&e.h>=56&&e.w<=maxW).sort((a,b)=>a.w*a.h-b.w*b.h);
if(!cards.length)return els;
const gid=new Map<El,string>();
for(const c of cards){const kids=els.filter(e=>e!==c&&!e.tg&&!e.hid&&!gid.has(e)&&!cards.includes(e)&&inside(e,c));
const nested=els.filter(e=>e!==c&&!gid.has(e)&&cards.includes(e)&&e.w*e.h<c.w*c.h&&inside(e,c));
if(!kids.length&&!nested.length)continue;const g=uid();gid.set(c,g);for(const k of kids)gid.set(k,g)}
return els.map(e=>gid.has(e)?{...e,g:gid.get(e)}:e)}
export const autoGroupAll=(els:Record<Dev,El[]>):Record<Dev,El[]>=>({desktop:autoGroup(els.desktop,'desktop'),tablet:autoGroup(els.tablet,'tablet'),mobile:autoGroup(els.mobile,'mobile')});
