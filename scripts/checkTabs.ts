// Проверка табов и автогрупп: npx tsx scripts/checkTabs.ts
import {cmpHtml,cmpPatch,TAB_PRESETS,tabItems,tabSize} from '../src/lib/cmp';
import {autoGroupAll} from '../src/lib/autoGroup';
import {buildByName,TPLS} from '../src/lib/tpl';
import type {El} from '../src/store';
let bad=0;const ok=(c:boolean,m:string)=>{if(!c){bad++;console.log('ОШИБКА',m)}};
for(const p of TAB_PRESETS){const base=cmpPatch('tabs');const cp={...base.cp!,items:tabItems(4),...p.cp};const h=cmpHtml({id:'x',t:'cmp',x:0,y:0,w:440,h:170,text:'',cp} as El);
ok(h.includes(`cp-o-${p.cp.o}`)&&h.includes(`cp-s-${p.cp.s}`),p.id);ok((h.match(/class="cp-tb( on)?"/g)||[]).length===4,p.id+' число вкладок');ok((h.match(/cp-tb on/g)||[]).length===1,p.id+' активная')}
ok(tabSize(6,'v')[1]>=300,'высота вертикальных');
let g=0,n=0;for(const t of TPLS){const b=buildByName(t.name);if(!b)continue;const a=autoGroupAll(b.els);n++;for(const d of ['desktop','tablet','mobile'] as const){const ids=new Set(a[d].map(e=>e.id));ok(ids.size===a[d].length,t.name+' id');if(a[d].some(e=>e.g))g++}}
console.log(`блоков ${n}, устройств с группами ${g}, ошибок ${bad}`);process.exit(bad?1:0);
