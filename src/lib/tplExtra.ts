// Единая точка подключения новых групп блоков из конвейера «скриншоты → блоки» (docs/prompts/BLOCKS.md).
// Новая группа = новый файл tplИмя.ts с экспортом ИМЯ и ИМЯ_TIPS. Здесь только добавить импорт и две строки ниже.
// tpl.ts и store.ts для этого трогать не нужно.
import type {Dev} from './dev';
import type {Out} from './tplFirst';
import {FIRST2,FIRST2_TIPS} from './tplFirst2';
import {DELIVERY,DELIVERY_TIPS} from './tplDelivery';
import {FAQ,FAQ_TIPS} from './tplFaq';
import {QUEST,QUEST_TIPS} from './tplQuest';
import {SCALE,SCALE_TIPS} from './tplScale';
import {CERTS,CERTS_TIPS} from './tplCerts';
import {FIRST3,FIRST3_TIPS} from './tplFirst3';
import {FIRST4,FIRST4_TIPS} from './tplFirst4';
import {FIRST5,FIRST5_TIPS} from './tplFirst5';
import {STYLE,STYLE_TIPS} from './tplStyle';
import {CATALOG,CATALOG_TIPS} from './tplCatalog';
import {INSTALL,INSTALL_TIPS} from './tplInstall';
import {ADDRESS,ADDRESS_TIPS} from './tplAddress';
import {FOUNDER,FOUNDER_TIPS} from './tplFounder';
import {PROD,PROD_TIPS} from './tplProd';
import {COMPARE,COMPARE_TIPS} from './tplCompare';
import {VIDEO,VIDEO_TIPS} from './tplVideo';
import {FORWHOM,FORWHOM_TIPS} from './tplForWhom';
import {TARIFFS,TARIFFS_TIPS} from './tplTariffs';
import {PROGRAM,PROGRAM_TIPS} from './tplProgram';
import {POPUP,POPUP_TIPS} from './tplPopup';
import {THANKS,THANKS_TIPS} from './tplThanks';

export interface ExtraTpl{name:string;cat:string;spec:(d:Dev)=>Out}
export const EXTRA:ExtraTpl[]=[...FIRST2,...FIRST3,...FIRST4,...FIRST5,...DELIVERY,...FAQ,...QUEST,...SCALE,...CERTS,...STYLE,...CATALOG,...INSTALL,...FOUNDER,...PROD,...COMPARE,...ADDRESS,...VIDEO,...FORWHOM,...TARIFFS,...PROGRAM,...POPUP,...THANKS];
export const EXTRA_TIPS:Record<string,string[]>={...FIRST2_TIPS,...FIRST3_TIPS,...FIRST4_TIPS,...FIRST5_TIPS,...DELIVERY_TIPS,...FAQ_TIPS,...QUEST_TIPS,...SCALE_TIPS,...CERTS_TIPS,...STYLE_TIPS,...CATALOG_TIPS,...INSTALL_TIPS,...FOUNDER_TIPS,...PROD_TIPS,...COMPARE_TIPS,...ADDRESS_TIPS,...VIDEO_TIPS,...FORWHOM_TIPS,...TARIFFS_TIPS,...PROGRAM_TIPS,...POPUP_TIPS,...THANKS_TIPS};
