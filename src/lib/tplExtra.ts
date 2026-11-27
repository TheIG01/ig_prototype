// Единая точка подключения новых групп блоков из конвейера «скриншоты → блоки» (docs/prompts/BLOCKS.md).
// Новая группа = новый файл tplИмя.ts с экспортом ИМЯ и ИМЯ_TIPS. Здесь только добавить импорт и две строки ниже.
// tpl.ts и store.ts для этого трогать не нужно.
import type {Dev} from './dev';
import type {Out} from './tplFirst';
import {FIRST2,FIRST2_TIPS} from './tplFirst2';
import {DELIVERY,DELIVERY_TIPS} from './tplDelivery';
import {FAQ,FAQ_TIPS} from './tplFaq';
import {SCALE,SCALE_TIPS} from './tplScale';
import {CERTS,CERTS_TIPS} from './tplCerts';
import {FIRST3,FIRST3_TIPS} from './tplFirst3';
import {FIRST4,FIRST4_TIPS} from './tplFirst4';
import {FIRST5,FIRST5_TIPS} from './tplFirst5';

export interface ExtraTpl{name:string;cat:string;spec:(d:Dev)=>Out}
export const EXTRA:ExtraTpl[]=[...FIRST2,...FIRST3,...FIRST4,...FIRST5,...DELIVERY,...FAQ,...SCALE,...CERTS];
export const EXTRA_TIPS:Record<string,string[]>={...FIRST2_TIPS,...FIRST3_TIPS,...FIRST4_TIPS,...FIRST5_TIPS,...DELIVERY_TIPS,...FAQ_TIPS,...SCALE_TIPS,...CERTS_TIPS};
