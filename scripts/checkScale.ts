// Проверка новых блоков группы «Масштаб» на 3 размерах: выход за края, наложения, пересечение рамок, высота текста, шрифт < 13, правила текста (copywriting.md).
// Запуск: npx tsx scripts/checkScale.ts
import {SCALE} from '../src/lib/tplScale';
import {th} from '../src/lib/tplFirst';
const W:Record<string,number>={desktop:1440,tablet:768,mobile:390};
const NEG=/(^|[^а-яё])(не|нет|ни)(?![а-яё])/i,ANY=/(^|[^а-яё])люб(ой|ая|ое|ые|ую|ого|ому|ым|ыми|ых|ою)(?![а-яё])/i,YOU=/(^|[^а-яё])(вы|вас|вам|вами|ваш(а|е|у|ей|ем|и|им|ими|их|его|ему|ею|ые|ым|ыми|ого)?)(?![а-яё])/i;
let n=0,bad=0;const rep:string[]=[];
for(const t of SCALE)for(const d of ['desktop','tablet','mobile'] as const){n++;const o=t.spec(d),w=W[d],msg:string[]=[],E=o.els as any[];
 if(!E.length)msg.push('пусто');
 for(const e of E){if(e.x<0||e.y<0||e.x+e.w>w||e.y+e.h>o.h)msg.push(`выход ${e.t} «${(e.text||'').slice(0,14)}» x${e.x} y${e.y} w${e.w} h${e.h}`);
  if(e.fs&&e.fs<13&&e.text)msg.push(`шрифт ${e.fs}`);
  if(e.t==='text'&&e.text&&th(e.text,e.fs,e.w,!!e.b)>e.h+1)msg.push(`текст не влезает «${e.text.slice(0,16)}» нужно ${th(e.text,e.fs,e.w,!!e.b)} есть ${e.h}`);
  if(e.t==='btn'&&e.text&&th(e.text,e.fs||14,e.w-24,true)>e.h-8)msg.push(`кнопка не влезает «${e.text.slice(0,16)}»`);
  const tx=e.text||'';if(tx&&(e.t==='text'||e.t==='btn')){if(NEG.test(tx))msg.push('не/нет/ни «'+tx.slice(0,18)+'»');if(ANY.test(tx))msg.push('любой');if(YOU.test(tx))msg.push('вы/ваш «'+tx.slice(0,18)+'»');if(tx.includes('!'))msg.push('!');if(tx.length>140)msg.push('>140 символов')}}
 const solid=E.filter(e=>['text','btn','input','img'].includes(e.t)),rects=E.filter(e=>e.t==='rect');
 const ov=(a:any,b:any)=>({x:Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),y:Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)});
 for(let i=0;i<solid.length;i++)for(let j=i+1;j<solid.length;j++){const q=ov(solid[i],solid[j]);if(q.x>1&&q.y>1)msg.push(`наложение «${(solid[i].text||solid[i].t).slice(0,12)}» и «${(solid[j].text||solid[j].t).slice(0,12)}»`)}
 for(const e of solid)for(const r of rects){const q=ov(e,r);if(q.x>1&&q.y>1){const inside=e.x>=r.x-1&&e.y>=r.y-1&&e.x+e.w<=r.x+r.w+1&&e.y+e.h<=r.y+r.h+1;if(!inside)msg.push(`выходит за рамку «${(e.text||e.t).slice(0,14)}»`)}}
 if(msg.length){bad++;rep.push(`${t.name} [${d}] h${o.h}: ${[...new Set(msg)].slice(0,6).join('; ')}`)}
 else console.log(`ok  ${t.name} [${d}] высота ${o.h}, элементов ${E.length}`)}
console.log(rep.join('\n'));console.log(`проверено ${SCALE.length} блоков × 3 размера (${n}), ошибок ${bad}`);
