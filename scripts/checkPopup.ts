import {POPUP} from '../src/lib/tplPopup';
const W:any={desktop:1440,tablet:768,mobile:390};let n=0,bad=0;
for(const t of POPUP){for(const d of ['desktop','tablet','mobile'] as const){n++;const o=t.spec(d),m:string[]=[];
 const els=o.els as any[];
 for(const e of els)if(e.x<-1||e.y<-1||e.x+e.w>W[d]+1||e.y+e.h>o.h+1)m.push('выход '+e.t+' '+e.text?.slice(0,15));
 const tx=els.filter(e=>e.t==='text'&&e.text);
 for(let i=0;i<tx.length;i++)for(let j=i+1;j<tx.length;j++){const a=tx[i],c=tx[j];if(Math.min(a.x+a.w,c.x+c.w)-Math.max(a.x,c.x)>4&&Math.min(a.y+a.h,c.y+c.h)-Math.max(a.y,c.y)>4)m.push('наложение «'+a.text.slice(0,15)+'»/«'+c.text.slice(0,15)+'»')}
 const card=els[1];for(const e of els.slice(2))if(e.x<card.x||e.x+e.w>card.x+card.w||e.y<card.y||e.y+e.h>card.y+card.h)m.push('вне окна '+e.t+' '+(e.text||'').slice(0,15));
 if(d==='mobile'&&o.h>780)m.push('высота '+o.h);
 if(m.length){bad++;console.log(t.name,d,[...new Set(m)].slice(0,4).join('; '))}}}
console.log(`проверено ${POPUP.length} блоков × 3 размера, замечаний ${bad}`);
