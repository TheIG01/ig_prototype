// Проверка макетов блоков: наложения, выход за границы, пустые тексты. Запуск: npx tsx scripts/checkBlocks.ts
import {TPLS,buildTpl} from '../src/lib/tpl';
const W:Record<string,number>={desktop:1440,tablet:768,mobile:390};
let blocks=0,bad=0;const rep:string[]=[];
for(const t of TPLS){blocks++;let b;try{b=buildTpl(t)}catch(e){bad++;rep.push(t.name+': ошибка сборки '+e);continue}
 for(const d of ['desktop','tablet','mobile'] as const){const els=b.els[d],h=b.h[d],w=W[d];const msg:string[]=[];
  if(!els.length)msg.push('пусто');
  for(const e of els as any[]){if(e.x<-1||e.y<-1||e.x+e.w>w+1||e.y+e.h>h+1)msg.push(`выход: ${e.k||e.t||e.id} x${e.x} y${e.y} w${e.w} h${e.h}`)}
  const txt=(els as any[]).filter(e=>e.k==='text'||e.t==='text');
  for(let i=0;i<txt.length;i++)for(let j=i+1;j<txt.length;j++){const a=txt[i],c=txt[j];
   const ox=Math.min(a.x+a.w,c.x+c.w)-Math.max(a.x,c.x),oy=Math.min(a.y+a.h,c.y+c.h)-Math.max(a.y,c.y);
   if(ox>4&&oy>4)msg.push(`наложение текстов ${i}/${j}`)}
  if(msg.length){bad++;rep.push(`${t.name} [${d}]: ${[...new Set(msg)].slice(0,3).join('; ')}`)}}}
console.log(`блоков: ${blocks}, с замечаниями: ${bad}`);console.log(rep.slice(0,40).join('\n'));
