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

export interface ExtraTpl{name:string;cat:string;spec:(d:Dev)=>Out}
export const EXTRA:ExtraTpl[]=[...FIRST2,...DELIVERY,...FAQ,...SCALE,...CERTS];
export const EXTRA_TIPS:Record<string,string[]>={...FIRST2_TIPS,...DELIVERY_TIPS,...FAQ_TIPS,...SCALE_TIPS,...CERTS_TIPS};
