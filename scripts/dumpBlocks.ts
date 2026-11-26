// Выгрузка макетов всех блоков в JSON для проверки в браузере (scripts/checkRender.py). Запуск: npx tsx scripts/dumpBlocks.ts > /tmp/blocks.json
import {TPLS,buildTpl} from '../src/lib/tpl';
const out=TPLS.map(t=>{const b=buildTpl(t);return{name:t.name,h:b.h,els:b.els}});
console.log(JSON.stringify(out));
